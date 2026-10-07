const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// Os testes nunca consultam o npm (o doctor e o update fariam isso).
process.env.CORTEX_NO_UPDATE_CHECK = '1';
const { mkTmpDir } = require('../support/tmp');
const cli = require('../../bin/cli.js');

const CLI = path.join(__dirname, '..', '..', 'bin', 'cli.js');
const run = (args, cwd) => spawnSync(process.execPath, [CLI, ...args], { cwd, encoding: 'utf8' });

test('init recusa uma pasta onde o Córtex já está montado e não toca em nada', () => {
  const dir = mkTmpDir();
  assert.equal(run(['init', '.', '--force'], dir).status, 0);
  fs.mkdirSync(path.join(dir, 'Frameworks'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'Frameworks', 'CEREBRO.md'), 'MEU CÉREBRO');
  fs.writeFileSync(path.join(dir, 'AGENTS.md'), 'MEU CÉREBRO COMPILADO');

  const r = run(['init', '.', '--force'], dir);
  assert.equal(r.status, 1, 'deve falhar para proteger os dados');
  assert.ok(r.stdout.includes('update'), 'deve mandar o usuário para o update');
  assert.equal(fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf8'), 'MEU CÉREBRO COMPILADO');
  assert.equal(fs.readFileSync(path.join(dir, 'Frameworks', 'CEREBRO.md'), 'utf8'), 'MEU CÉREBRO');
});

test('init em pasta com arquivos do usuário: guarda cópia, mantém o .gitignore e o CLAUDE.md dele', () => {
  const dir = mkTmpDir();
  fs.writeFileSync(path.join(dir, '.gitignore'), 'node_modules/\nmeu-segredo.txt\n');
  fs.writeFileSync(path.join(dir, 'CLAUDE.md'), '# Minhas regras\nSempre use tabs.\n');
  fs.writeFileSync(path.join(dir, 'AGENTS.md'), '# Instruções minhas\n');

  const r = run(['init', '.', '--force'], dir);
  assert.equal(r.status, 0, r.stderr);

  const gi = fs.readFileSync(path.join(dir, '.gitignore'), 'utf8');
  assert.ok(gi.includes('meu-segredo.txt'), '.gitignore do usuário deve ser mantido');
  assert.ok(gi.includes('/Pilares/*'), 'regras do Córtex devem ser acrescentadas');

  const claude = fs.readFileSync(path.join(dir, 'CLAUDE.md'), 'utf8');
  assert.ok(claude.includes('Sempre use tabs.'), 'CLAUDE.md do usuário deve ser preservado');
  assert.ok(/^@AGENTS\.md$/m.test(claude), 'e o import do AGENTS.md deve ser acrescentado');

  const backups = path.join(dir, '.cortex', 'backups');
  const sub = fs.readdirSync(backups).find((n) => n.startsWith('init-'));
  assert.ok(sub, 'deve existir um backup do init');
  const salvos = fs.readdirSync(path.join(backups, sub));
  assert.ok(salvos.length >= 3, 'deve ter copiado .gitignore, CLAUDE.md e AGENTS.md do usuário');
});

test('update de uma instalação anterior à 1.3.0 cria o CLAUDE.md que faltava', () => {
  const dir = mkTmpDir();
  assert.equal(run(['init', '.', '--force'], dir).status, 0);
  fs.rmSync(path.join(dir, 'CLAUDE.md'));
  fs.writeFileSync(path.join(dir, 'Frameworks', 'CEREBRO.md'),
    '<!-- CORTEX:BUSINESS:START -->\nx\n<!-- CORTEX:BUSINESS:END -->\n<!-- CORTEX:FRAMEWORK:START -->\nvelho\n<!-- CORTEX:FRAMEWORK:END -->\n');
  fs.writeFileSync(path.join(dir, '.cortex', 'version.json'), JSON.stringify({ version: '1.2.0' }));
  fs.writeFileSync(path.join(dir, '.cortex', 'targets.json'), JSON.stringify({ targets: ['AGENTS.md'] }));

  const r = run(['update', '.', '--force'], dir);
  assert.equal(r.status, 0, r.stderr);
  assert.equal(fs.readFileSync(path.join(dir, 'CLAUDE.md'), 'utf8').includes('@AGENTS.md'), true);
});

test('update não cria CLAUDE.md por cima de um CLAUDE.md que o usuário já tem', () => {
  const dir = mkTmpDir();
  assert.equal(run(['init', '.', '--force'], dir).status, 0);
  fs.writeFileSync(path.join(dir, 'CLAUDE.md'), 'REGRAS DO USUÁRIO');
  fs.writeFileSync(path.join(dir, 'Frameworks', 'CEREBRO.md'),
    '<!-- CORTEX:BUSINESS:START -->\nx\n<!-- CORTEX:BUSINESS:END -->\n<!-- CORTEX:FRAMEWORK:START -->\nvelho\n<!-- CORTEX:FRAMEWORK:END -->\n');
  fs.writeFileSync(path.join(dir, '.cortex', 'version.json'), JSON.stringify({ version: '1.2.0' }));
  fs.writeFileSync(path.join(dir, '.cortex', 'targets.json'), JSON.stringify({ targets: ['AGENTS.md'] }));

  assert.equal(run(['update', '.', '--force'], dir).status, 0);
  assert.equal(fs.readFileSync(path.join(dir, 'CLAUDE.md'), 'utf8'), 'REGRAS DO USUÁRIO');
});

test('update recusa voltar no tempo (projeto mais novo que o comando)', () => {
  const dir = mkTmpDir();
  assert.equal(run(['init', '.', '--force'], dir).status, 0);
  fs.writeFileSync(path.join(dir, '.cortex', 'version.json'), JSON.stringify({ version: '99.0.0' }));
  const r = run(['update', '.'], dir);
  assert.equal(r.status, 1);
  assert.ok(r.stdout.includes('@latest'));
});

test('backups: guarda só os 3 mais recentes de atualização e nunca apaga os outros', () => {
  const dir = mkTmpDir();
  const base = path.join(dir, cli.BACKUPS_REL);
  // O do init, o dos arquivos do usuário e o dos dados são os mais antigos: é
  // justamente aí que a limpeza não pode chegar, porque não há como refazê-los.
  for (const d of ['init-2026-01-01T00-00-00-000Z', 'originais-2026-01-02T00-00-00-000Z', 'dados-2026-01-03T00-00-00-000Z',
    'update-2026-02-01T00-00-00-000Z', 'update-2026-03-01T00-00-00-000Z',
    'update-2026-04-01T00-00-00-000Z', 'update-2026-05-01T00-00-00-000Z']) {
    fs.mkdirSync(path.join(base, d), { recursive: true });
  }
  const removidos = cli.pruneBackups(dir, 3);
  assert.equal(removidos, 1);
  assert.deepEqual(fs.readdirSync(base).sort(), [
    'dados-2026-01-03T00-00-00-000Z', 'init-2026-01-01T00-00-00-000Z', 'originais-2026-01-02T00-00-00-000Z',
    'update-2026-03-01T00-00-00-000Z', 'update-2026-04-01T00-00-00-000Z', 'update-2026-05-01T00-00-00-000Z'
  ]);
});

// ── Arquivos de raiz que o usuário escreveu ───────────────────────

const read = (dir, f) => fs.readFileSync(path.join(dir, f), 'utf8');
const backupsOf = (dir, label) => {
  const base = path.join(dir, cli.BACKUPS_REL);
  return fs.existsSync(base) ? fs.readdirSync(base).filter((n) => n.startsWith(`${label}-`)) : [];
};

function mount(dir) {
  fs.copyFileSync(
    path.join(dir, '.agents', 'skills', 'cortex-onboarding', 'resources', 'CORTEX_TEMPLATE.md'),
    path.join(dir, 'Frameworks', 'CEREBRO.md')
  );
}

test('sync mantém o CLAUDE.md que o usuário escreveu, e o update depois não o vê como pendência', () => {
  const dir = mkTmpDir();
  fs.writeFileSync(path.join(dir, 'CLAUDE.md'), '# Minhas regras\nSempre use tabs.\n');
  assert.equal(run(['init', '.', '--force'], dir).status, 0);
  mount(dir);

  // É o que a conversa de montagem roda no fim, minutos depois do init.
  const r = run(['sync', '.', '--force'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const claude = read(dir, 'CLAUDE.md');
  assert.ok(claude.includes('Sempre use tabs.'), 'o texto do usuário não pode sumir');
  assert.equal(claude.match(/^@AGENTS\.md$/gm).length, 1, 'o import aparece uma vez só');
  assert.ok(r.stdout.includes('mantive o seu texto'), r.stdout);
  assert.ok(read(dir, 'AGENTS.md').includes('ARQUIVO GERADO PELO CÓRTEX'));

  assert.deepEqual(cli.findStaleTargets(dir, cli.VERSION), []);
  assert.equal(run(['update', '.', '--force'], dir).status, 0);
  assert.equal(read(dir, 'CLAUDE.md'), claude);
});

test('sync acrescenta o import a um CLAUDE.md do usuário que ainda não o tem', () => {
  const dir = mkTmpDir();
  assert.equal(run(['init', '.', '--force'], dir).status, 0);
  mount(dir);
  fs.writeFileSync(path.join(dir, 'CLAUDE.md'), 'REGRAS DO USUÁRIO');

  assert.equal(run(['sync', '.', '--force'], dir).status, 0);
  assert.equal(read(dir, 'CLAUDE.md'), 'REGRAS DO USUÁRIO\n\n@AGENTS.md\n');
});

test('outro arquivo de raiz escrito pelo usuário ganha cópia antes de ser substituído, com aviso', () => {
  const dir = mkTmpDir();
  assert.equal(run(['init', '.', '--force'], dir).status, 0);
  mount(dir);
  fs.writeFileSync(path.join(dir, 'GEMINI.md'), 'MINHAS INSTRUÇÕES DO GEMINI');
  fs.writeFileSync(path.join(dir, '.cursorrules'), 'MINHAS REGRAS DO CURSOR');

  const r = run(['sync', '.', '--force', '--targets=all'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.ok(read(dir, 'GEMINI.md').includes('ARQUIVO GERADO PELO CÓRTEX'));

  const [sub] = backupsOf(dir, 'originais');
  assert.ok(sub, 'deve existir a cópia dos arquivos do usuário');
  assert.equal(read(dir, path.join(cli.BACKUPS_REL, sub, 'GEMINI.md')), 'MINHAS INSTRUÇÕES DO GEMINI');
  assert.equal(read(dir, path.join(cli.BACKUPS_REL, sub, '_cursorrules')), 'MINHAS REGRAS DO CURSOR');
  assert.ok(r.stdout.includes(`.cortex/backups/${sub}`), 'o aviso diz onde a cópia ficou');

  // Na segunda vez os arquivos já são do Córtex: nada de cópia nova.
  assert.equal(run(['sync', '.', '--force'], dir).status, 0);
  assert.equal(backupsOf(dir, 'originais').length, 1);
});

test('o ponteiro das versões antigas é do Córtex: é recompilado, sem cópia nem aviso', () => {
  const dir = mkTmpDir();
  assert.equal(run(['init', '.', '--force'], dir).status, 0);
  mount(dir);
  fs.writeFileSync(path.join(dir, 'CLAUDE.md'), '# Córtex\n\n> Este arquivo é um **ponteiro**. A fonte única de instruções está em `Frameworks/CEREBRO.md`.\n\n**INSTRUÇÃO PARA A IA:** Leia agora o arquivo `Frameworks/CEREBRO.md`.\n');

  assert.equal(run(['sync', '.', '--force'], dir).status, 0);
  assert.ok(read(dir, 'CLAUDE.md').includes('ARQUIVO GERADO PELO CÓRTEX'));
  assert.equal(backupsOf(dir, 'originais').length, 0);
});

test('o backup do init sobrevive a várias atualizações', () => {
  const dir = mkTmpDir();
  fs.writeFileSync(path.join(dir, 'AGENTS.md'), '# Instruções minhas\n');
  assert.equal(run(['init', '.', '--force'], dir).status, 0);
  mount(dir);

  for (let i = 0; i < 4; i++) {
    fs.writeFileSync(path.join(dir, '.agents', 'skills', 'radar', 'SKILL.md'), `versão antiga ${i}`);
    assert.equal(run(['update', '.', '--force'], dir).status, 0);
  }
  const [sub] = backupsOf(dir, 'init');
  assert.ok(sub, 'a cópia dos arquivos originais do usuário não pode ser apagada');
  assert.equal(read(dir, path.join(cli.BACKUPS_REL, sub, 'AGENTS.md')), '# Instruções minhas\n');
  assert.equal(backupsOf(dir, 'update').length, 3);
});

// ── Update repetível e caminho de volta ───────────────────────────

test('update que falha antes do fim não marca a versão nova: rodar de novo termina o serviço', () => {
  const dir = mkTmpDir();
  assert.equal(run(['init', '.', '--force'], dir).status, 0);
  mount(dir);
  fs.writeFileSync(path.join(dir, '.cortex', 'version.json'), JSON.stringify({ version: '1.3.0' }));
  // Uma pasta no lugar do arquivo de novidades faz a gravação falhar, como um
  // arquivo preso pelo OneDrive ou pelo antivírus.
  fs.mkdirSync(path.join(dir, '.cortex', 'novidades.md'));

  const falhou = run(['update', '.', '--force'], dir);
  assert.equal(falhou.status, 1);
  assert.equal(cli.readVersionFile(dir).version, '1.3.0', 'a versão só pode ser gravada quando tudo terminou');

  // Segunda tentativa ainda com o arquivo preso: agora cai no caminho "Nada para atualizar".
  const falhouDeNovo = run(['update', '.', '--force'], dir);
  assert.equal(falhouDeNovo.status, 1);
  assert.ok(falhouDeNovo.stdout.includes('Nada para atualizar'), 'esta rodada tem de exercitar o retorno antecipado');
  assert.equal(cli.readVersionFile(dir).version, '1.3.0', 'no retorno antecipado a versão também é a última coisa gravada');

  fs.rmSync(path.join(dir, '.cortex', 'novidades.md'), { recursive: true });
  const r = run(['update', '.', '--force'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.equal(cli.readVersionFile(dir).version, cli.VERSION);
  assert.ok(fs.statSync(path.join(dir, '.cortex', 'novidades.md')).isFile(), 'as novidades não podem se perder');
});

test('update termina dizendo onde está o backup e como voltar à versão anterior', () => {
  const parent = mkTmpDir();
  assert.equal(run(['init', 'Minha Empresa', '--force'], parent).status, 0);
  const dir = path.join(parent, 'Minha Empresa');
  mount(dir);
  fs.writeFileSync(path.join(dir, '.cortex', 'version.json'), JSON.stringify({ version: '1.3.0' }));
  const cerebroAntes = read(dir, 'Frameworks/CEREBRO.md');

  const r = run(['update', 'Minha Empresa', '--force'], parent);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const [sub] = backupsOf(dir, 'update');
  assert.ok(r.stdout.includes(`ficou guardado em .cortex/backups/${sub}`), r.stdout);
  assert.equal(read(dir, path.join(cli.BACKUPS_REL, sub, 'CEREBRO.md')), cerebroAntes, 'o cérebro de antes está no backup, como a mensagem diz');
  assert.deepEqual(fs.readdirSync(path.join(dir, cli.BACKUPS_REL, sub)).sort(), ['CEREBRO.md', 'agents'], 'terminada a atualização, o backup não fica marcado como pendente');
  // A 1.3.0 não conhece as proteções da 1.6.0: o comando dela não é oferecido
  // como caminho de volta (ele regravaria o CLAUDE.md e apagaria cópias).
  assert.ok(!/@1\.3\.0 update/.test(r.stdout), r.stdout);
  assert.ok(r.stdout.includes('Dá para voltar à v1.3.0'), r.stdout);
  assert.ok(r.stdout.includes(`Abra a pasta .cortex/backups/${sub}`), r.stdout);
  assert.ok(r.stdout.includes('npx @aksp/cortex@latest sync "Minha Empresa"'), r.stdout);
  assert.ok(r.stdout.includes('Não use o comando da versão antiga'), r.stdout);

  // Mesma versão (só conferindo os arquivos): não há versão anterior para oferecer.
  fs.writeFileSync(path.join(dir, '.agents', 'skills', 'radar', 'SKILL.md'), 'mexido');
  const again = run(['update', 'Minha Empresa', '--force'], parent);
  assert.equal(again.status, 0);
  assert.ok(!again.stdout.includes('voltar à v'), again.stdout);
});

test('o caminho de volta funciona: update --force de um comando mais antigo conclui sem tocar os dados', () => {
  const dir = mkTmpDir();
  assert.equal(run(['init', '.', '--force'], dir).status, 0);
  mount(dir);
  fs.writeFileSync(path.join(dir, 'Pilares', '01_Estrategia.md'), 'MEU PILAR');
  fs.writeFileSync(path.join(dir, '.agents', 'skills', 'radar', 'SKILL.md'), 'radar de uma versão futura');
  fs.writeFileSync(path.join(dir, '.cortex', 'version.json'), JSON.stringify({ version: '99.0.0' }));
  const business = cli.extractRegion(read(dir, 'Frameworks/CEREBRO.md'), cli.BUSINESS_START, cli.BUSINESS_END);

  const r = run(['update', '.', '--force'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.equal(cli.readVersionFile(dir).version, cli.VERSION);
  assert.equal(read(dir, 'Pilares/01_Estrategia.md'), 'MEU PILAR');
  assert.equal(read(dir, '.agents/skills/radar/SKILL.md'),
    fs.readFileSync(path.join(__dirname, '..', '..', '.agents', 'skills', 'radar', 'SKILL.md'), 'utf8'),
    'o framework da versão do comando tem que voltar');
  assert.equal(cli.extractRegion(read(dir, 'Frameworks/CEREBRO.md'), cli.BUSINESS_START, cli.BUSINESS_END), business);
  assert.ok(!r.stdout.includes('voltar à v'), 'voltar não oferece "voltar" de novo');
});

test('rollbackAdvice: o comando da versão antiga só é oferecido se ela já protege os arquivos do usuário', () => {
  assert.equal(cli.rollbackAdvice('1.5.0', '1.6.0'), 'manual');
  assert.equal(cli.rollbackAdvice('1.3.0', '2.0.0'), 'manual');
  assert.equal(cli.rollbackAdvice('1.6.0', '1.7.0'), 'comando');
  assert.equal(cli.rollbackAdvice('1.6.0', '1.6.0'), null);
  assert.equal(cli.rollbackAdvice('99.0.0', '1.6.0'), null);
  assert.equal(cli.rollbackAdvice('', '1.6.0'), null);
  assert.equal(cli.rollbackAdvice('1.5.0; rm -rf', '1.6.0'), null, 'só uma versão bem formada entra numa linha de comando');
});

test('a volta manual que o update imprime funciona de ponta a ponta e não apaga nada do usuário', () => {
  const dir = mkTmpDir();
  assert.equal(run(['init', '.', '--force'], dir).status, 0);
  mount(dir);
  // O estado "de antes": uma habilidade e regras de operação diferentes das atuais.
  const cerebroAntes = cli.replaceRegion(read(dir, 'Frameworks/CEREBRO.md'), cli.FRAMEWORK_START, cli.FRAMEWORK_END, '\nREGRAS DA VERSÃO ANTIGA\n');
  fs.writeFileSync(path.join(dir, 'Frameworks', 'CEREBRO.md'), cerebroAntes);
  fs.writeFileSync(path.join(dir, '.agents', 'skills', 'radar', 'SKILL.md'), 'RADAR DA VERSÃO ANTIGA');
  const meuClaude = '# Minhas regras\n- Nunca dar desconto acima de 10%\n\n@AGENTS.md\n';
  fs.writeFileSync(path.join(dir, 'CLAUDE.md'), meuClaude);
  fs.writeFileSync(path.join(dir, '.cortex', 'version.json'), JSON.stringify({ version: '1.5.0' }));

  const r = run(['update', '.', '--force'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.ok(r.stdout.includes('Dá para voltar à v1.5.0'), r.stdout);
  assert.ok(!read(dir, 'AGENTS.md').includes('REGRAS DA VERSÃO ANTIGA'));

  // Cópias que o comando da versão antiga apagaria.
  for (let i = 0; i < 4; i++) assert.equal(run(['backup', '.'], dir).status, 0);
  fs.mkdirSync(path.join(dir, cli.BACKUPS_REL, 'originais-2026-01-01T00-00-00-000Z'));
  const copiasAntes = fs.readdirSync(path.join(dir, cli.BACKUPS_REL)).sort();

  // Os passos impressos: 1) abrir o backup; 2) agents → .agents; 3) CEREBRO.md → Frameworks; 4) sync.
  const [sub] = backupsOf(dir, 'update');
  const backup = path.join(dir, cli.BACKUPS_REL, sub);
  cli.copyRecursiveSync(path.join(backup, 'agents'), path.join(dir, '.agents'));
  fs.copyFileSync(path.join(backup, 'CEREBRO.md'), path.join(dir, 'Frameworks', 'CEREBRO.md'));
  const s = run(['sync', '.', '--force'], dir);
  assert.equal(s.status, 0, s.stdout + s.stderr);

  assert.equal(read(dir, '.agents/skills/radar/SKILL.md'), 'RADAR DA VERSÃO ANTIGA');
  assert.equal(read(dir, 'Frameworks/CEREBRO.md'), cerebroAntes);
  assert.ok(read(dir, 'AGENTS.md').includes('REGRAS DA VERSÃO ANTIGA'), 'a IA volta a receber as regras antigas');
  assert.equal(read(dir, 'CLAUDE.md'), meuClaude, 'o CLAUDE.md do usuário sobrevive à volta');
  assert.deepEqual(fs.readdirSync(path.join(dir, cli.BACKUPS_REL)).sort(), copiasAntes, 'nenhuma cópia é apagada na volta');
  assert.deepEqual(cli.findStaleTargets(dir, cli.VERSION), []);
});

test('update interrompido no meio: a repetição reaproveita o backup que guarda a versão personalizada', () => {
  const dir = mkTmpDir();
  assert.equal(run(['init', '.', '--force'], dir).status, 0);
  mount(dir);
  fs.writeFileSync(path.join(dir, '.cortex', 'version.json'), JSON.stringify({ version: '1.3.0' }));
  fs.writeFileSync(path.join(dir, '.agents', 'skills', 'radar', 'SKILL.md'), 'MINHA VERSÃO PERSONALIZADA');
  // Uma pasta no lugar do GEMINI.md faz a recompilação falhar depois de .agents/ já ter sido trocada.
  fs.rmSync(path.join(dir, 'GEMINI.md'));
  fs.mkdirSync(path.join(dir, 'GEMINI.md'));

  for (let i = 0; i < 4; i++) {
    assert.equal(run(['update', '.', '--force'], dir).status, 1, 'enquanto o arquivo estiver preso, a atualização falha');
  }
  assert.notEqual(read(dir, '.agents/skills/radar/SKILL.md'), 'MINHA VERSÃO PERSONALIZADA', 'a habilidade já foi trocada na primeira rodada');
  assert.equal(cli.readVersionFile(dir).version, '1.3.0');

  fs.rmSync(path.join(dir, 'GEMINI.md'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'GEMINI.md'), '# Córtex\n\n> Este arquivo é um **ponteiro**. A fonte única de instruções está em `Frameworks/CEREBRO.md`.\n\n**INSTRUÇÃO PARA A IA:** Leia agora o arquivo `Frameworks/CEREBRO.md`.\n');
  const r = run(['update', '.', '--force'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);

  const subs = backupsOf(dir, 'update');
  assert.equal(subs.length, 1, 'as repetições não criam backups novos (que expulsariam o primeiro)');
  assert.equal(read(dir, path.join(cli.BACKUPS_REL, subs[0], 'agents', 'skills', 'radar', 'SKILL.md')), 'MINHA VERSÃO PERSONALIZADA');
  assert.ok(r.stdout.includes(`ficou guardado em .cortex/backups/${subs[0]}`), r.stdout);
  assert.deepEqual(fs.readdirSync(path.join(dir, cli.BACKUPS_REL, subs[0])).sort(), ['CEREBRO.md', 'agents']);

  // Atualização concluída: a próxima cria o seu próprio backup.
  fs.writeFileSync(path.join(dir, '.agents', 'skills', 'radar', 'SKILL.md'), 'mexido');
  assert.equal(run(['update', '.', '--force'], dir).status, 0);
  assert.equal(backupsOf(dir, 'update').length, 2);
});

test('update interrompido no meio: a folha COMECE-AQUI.txt da raiz é renovada mesmo assim', (t) => {
  if (process.getuid && process.getuid() === 0) return t.skip('como root, um arquivo somente leitura não bloqueia a gravação');
  const dir = mkTmpDir();
  assert.equal(run(['init', '.', '--force'], dir).status, 0);
  mount(dir);
  const fonteNova = read(dir, '.agents/cortex/COMECE-AQUI.txt');
  fs.writeFileSync(path.join(dir, '.agents', 'cortex', 'COMECE-AQUI.txt'), 'TEXTO ANTIGO\n');
  fs.writeFileSync(path.join(dir, 'COMECE-AQUI.txt'), '﻿TEXTO ANTIGO\r\n');
  fs.writeFileSync(path.join(dir, '.cortex', 'version.json'), JSON.stringify({ version: '1.5.0' }));
  // Um arquivo de habilidade preso (OneDrive, antivírus): a troca de .agents/ para no meio.
  const preso = path.join(dir, '.agents', 'skills', 'radar', 'SKILL.md');
  fs.writeFileSync(preso, 'versão antiga');
  fs.chmodSync(preso, 0o444);

  const falhou = run(['update', '.', '--force'], dir);
  fs.chmodSync(preso, 0o666);
  assert.equal(falhou.status, 1, falhou.stdout);
  assert.equal(cli.readVersionFile(dir).version, '1.5.0');

  const r = run(['update', '.', '--force'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.equal(cli.normalizeEol(read(dir, 'COMECE-AQUI.txt').replace(/^﻿/, '')), cli.normalizeEol(fonteNova), 'a folha que o dono nunca editou tem de receber o texto novo');
  assert.ok(!(falhou.stdout + r.stdout).includes('o seu foi mantido'), 'ela não pode ser tratada como editada pelo dono');
});

test('update também guarda cópia e avisa quando substitui um arquivo de raiz do usuário', () => {
  const dir = mkTmpDir();
  assert.equal(run(['init', '.', '--force'], dir).status, 0);
  mount(dir);
  fs.writeFileSync(path.join(dir, 'GEMINI.md'), 'MINHAS INSTRUÇÕES DO GEMINI');

  const r = run(['update', '.', '--force'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.ok(read(dir, 'GEMINI.md').includes('ARQUIVO GERADO PELO CÓRTEX'));
  const subs = backupsOf(dir, 'originais');
  assert.equal(subs.length, 1);
  assert.equal(read(dir, path.join(cli.BACKUPS_REL, subs[0], 'GEMINI.md')), 'MINHAS INSTRUÇÕES DO GEMINI');
  assert.ok(r.stdout.includes(`.cortex/backups/${subs[0]}`), 'o aviso do update diz onde a cópia ficou');
});

// ── De quem é o arquivo: pela forma, não por uma palavra solta ────

test('um arquivo do usuário que só cita as expressões do Córtex continua sendo dele', () => {
  const dir = mkTmpDir();
  assert.equal(run(['init', '.', '--force'], dir).status, 0);
  mount(dir);
  const claude = '# Minhas regras\nNão confundir com o "ARQUIVO GERADO PELO CÓRTEX" nem com a skill cortex-onboarding.\n';
  const gemini = 'Minhas notas: a skill cortex-onboarding monta o cérebro. ARQUIVO GERADO PELO CÓRTEX é outro.\n';
  fs.writeFileSync(path.join(dir, 'CLAUDE.md'), claude);
  fs.writeFileSync(path.join(dir, 'GEMINI.md'), gemini);
  assert.equal(cli.isCortexOwnedFile(claude), false);
  assert.equal(cli.isCortexOwnedFile(gemini), false);
  assert.equal(cli.isCortexOwnedFile('# Regras da empresa\nAntes de tudo, leia agora o Frameworks/CEREBRO.md.\nNunca dê desconto acima de 10%.\n'), false,
    'citar o cérebro não faz do arquivo um ponteiro antigo do Córtex');

  const r = run(['sync', '.', '--force'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.equal(read(dir, 'CLAUDE.md'), claude + '\n@AGENTS.md\n', 'o CLAUDE.md do usuário é mantido e só ganha o import');
  const [sub] = backupsOf(dir, 'originais');
  assert.ok(sub, 'o GEMINI.md do usuário ganha cópia antes de ser substituído');
  assert.equal(read(dir, path.join(cli.BACKUPS_REL, sub, 'GEMINI.md')), gemini);
  assert.ok(r.stdout.includes(`.cortex/backups/${sub}`), r.stdout);

  // O que o próprio Córtex grava continua reconhecido, com BOM ou CRLF na frente.
  assert.equal(cli.isCortexOwnedFile('﻿' + read(dir, 'AGENTS.md').replace(/\n/g, '\r\n')), true);
  assert.equal(cli.isCortexOwnedFile(fs.readFileSync(path.join(__dirname, '..', '..', 'AGENTS.md'), 'utf8')), true);
  assert.equal(cli.isCortexOwnedFile('@AGENTS.md\n'), true);
});

test('CLAUDE.md gerado em que alguém escreveu depois do import ganha cópia antes de ser regravado', () => {
  const dir = mkTmpDir();
  assert.equal(run(['init', '.', '--force'], dir).status, 0);
  mount(dir);
  assert.equal(run(['sync', '.', '--force'], dir).status, 0);
  assert.equal(backupsOf(dir, 'originais').length, 0, 'o arquivo gerado, intacto, não gera cópia');
  const editado = read(dir, 'CLAUDE.md') + '\n- Lembrar: o cliente Souza paga sempre no dia 10\n';
  fs.writeFileSync(path.join(dir, 'CLAUDE.md'), editado);

  const r = run(['sync', '.', '--force'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const [sub] = backupsOf(dir, 'originais');
  assert.ok(sub, 'o que foi escrito não pode sumir sem cópia');
  assert.equal(read(dir, path.join(cli.BACKUPS_REL, sub, 'CLAUDE.md')), editado);
  assert.ok(r.stdout.includes(`.cortex/backups/${sub}`), r.stdout);
  assert.ok(!read(dir, 'CLAUDE.md').includes('Souza'));

  assert.equal(run(['sync', '.', '--force'], dir).status, 0);
  assert.equal(backupsOf(dir, 'originais').length, 1);
});

test('CLAUDE.md que é um atalho para o AGENTS.md não faz o import ser gravado por cima do cérebro', (t) => {
  const dir = mkTmpDir();
  assert.equal(run(['init', '.', '--force'], dir).status, 0);
  mount(dir);
  assert.equal(run(['sync', '.', '--force'], dir).status, 0);
  fs.rmSync(path.join(dir, 'CLAUDE.md'));
  try {
    fs.symlinkSync('AGENTS.md', path.join(dir, 'CLAUDE.md'));
  } catch (e) {
    return t.skip(`este computador não deixa criar link simbólico (${e.code})`);
  }

  const r = run(['sync', '.', '--force'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.ok(read(dir, 'AGENTS.md').includes(cli.FRAMEWORK_START), 'o AGENTS.md continua com o cérebro completo');
  assert.equal(fs.lstatSync(path.join(dir, 'CLAUDE.md')).isSymbolicLink(), false);
  assert.ok(/^@AGENTS\.md$/m.test(read(dir, 'CLAUDE.md')));
  assert.ok(r.stdout.includes('era um atalho'), r.stdout);
});

// ── O texto do CLAUDE.md do usuário, byte a byte ──────────────────

test('acrescentar o import não regrava o texto do usuário: BOM, CRLF e acentos ficam como estavam', () => {
  const dir = mkTmpDir();
  assert.equal(run(['init', '.', '--force'], dir).status, 0);
  mount(dir);
  const original = Buffer.from('﻿Dono: João\r\nRegra: não dar desconto\r\n', 'utf8');
  fs.writeFileSync(path.join(dir, 'CLAUDE.md'), original);

  assert.equal(run(['sync', '.', '--force'], dir).status, 0);
  const depois = fs.readFileSync(path.join(dir, 'CLAUDE.md'));
  assert.ok(depois.subarray(0, original.length).equals(original), 'os bytes do usuário não mudam');
  assert.equal(depois.subarray(original.length).toString('utf8'), '\r\n@AGENTS.md\r\n');
});

test('CLAUDE.md do usuário que não está em UTF-8 não tem os acentos destruídos: vai inteiro para a cópia', () => {
  for (const original of [Buffer.from('Dono: João\nRegra: não dar desconto\n', 'latin1'), Buffer.from('﻿Dono: João\n', 'utf16le')]) {
    const dir = mkTmpDir();
    assert.equal(run(['init', '.', '--force'], dir).status, 0);
    mount(dir);
    fs.writeFileSync(path.join(dir, 'CLAUDE.md'), original);

    const r = run(['sync', '.', '--force'], dir);
    assert.equal(r.status, 0, r.stdout + r.stderr);
    const [sub] = backupsOf(dir, 'originais');
    assert.ok(sub, 'sem cópia, o texto original estaria perdido');
    assert.ok(fs.readFileSync(path.join(dir, cli.BACKUPS_REL, sub, 'CLAUDE.md')).equals(original), 'a cópia guarda os bytes originais');
    assert.ok(r.stdout.includes('não era UTF-8') && r.stdout.includes(`.cortex/backups/${sub}`), r.stdout);
    assert.ok(!r.stdout.includes('mantive o seu texto'), 'não pode dizer que manteve o que trocou');
    const vivo = read(dir, 'CLAUDE.md');
    assert.ok(!vivo.includes('�'), 'nenhuma letra estragada no arquivo vivo');
    assert.ok(/^@AGENTS\.md$/m.test(vivo));

    // No init, a cópia íntegra fica em init-… e o arquivo vivo também não é estragado.
    const novo = mkTmpDir();
    fs.writeFileSync(path.join(novo, 'CLAUDE.md'), original);
    const i = run(['init', '.', '--force'], novo);
    assert.equal(i.status, 0, i.stdout + i.stderr);
    const [ini] = backupsOf(novo, 'init');
    assert.ok(fs.readFileSync(path.join(novo, cli.BACKUPS_REL, ini, 'CLAUDE.md')).equals(original));
    assert.equal(read(novo, 'CLAUDE.md'), '@AGENTS.md\n');
    assert.ok(i.stdout.includes('não era UTF-8'), i.stdout);
  }
});

test('init: citar "@AGENTS.md" no meio de um texto não conta como a linha do import', () => {
  const dir = mkTmpDir();
  const meu = 'Meu claude, veja `@AGENTS.md.bak` para o histórico\n';
  fs.writeFileSync(path.join(dir, 'CLAUDE.md'), meu);

  assert.equal(run(['init', '.', '--force'], dir).status, 0);
  assert.equal(read(dir, 'CLAUDE.md'), meu + '\n@AGENTS.md\n');

  // No init repetido, a citação também não conta: o CLAUDE.md do usuário ganha a linha, e isso é dito às claras.
  fs.writeFileSync(path.join(dir, 'CLAUDE.md'), meu);
  const again = run(['init', '.', '--force'], dir);
  assert.equal(again.status, 0);
  assert.equal(read(dir, 'CLAUDE.md'), meu + '\n@AGENTS.md\n');
  assert.ok(again.stdout.includes('CLAUDE.md — é um arquivo seu: mantive o seu texto'), again.stdout);
});

// ── Cópia dos dados do negócio ────────────────────────────────────

test('backup copia os dados do negócio para .cortex/backups/dados-<data>/ sem alterar os originais', () => {
  const dir = mkTmpDir();
  assert.equal(run(['init', '.', '--force'], dir).status, 0);
  mount(dir);
  fs.writeFileSync(path.join(dir, 'Pilares', '01_Estrategia.md'), 'MEU PILAR');
  fs.writeFileSync(path.join(dir, 'Memoria', '01_Decisoes.md'), 'MINHAS DECISÕES');
  fs.mkdirSync(path.join(dir, 'Memoria', '_Arquivo'));
  fs.writeFileSync(path.join(dir, 'Memoria', '_Arquivo', '2025.md'), 'ARQUIVADO');
  fs.writeFileSync(path.join(dir, 'Ativos', 'logo.png'), Buffer.from([0, 1, 2, 255]));

  const r = run(['backup', '.'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const [sub] = backupsOf(dir, 'dados');
  assert.ok(sub, 'deve existir a pasta dados-<data>');
  const saved = path.join(dir, cli.BACKUPS_REL, sub);
  for (const rel of ['Pilares/01_Estrategia.md', 'Memoria/01_Decisoes.md', 'Memoria/_Arquivo/2025.md', 'Ativos/logo.png', 'Frameworks/CEREBRO.md']) {
    assert.ok(fs.readFileSync(path.join(saved, rel)).equals(fs.readFileSync(path.join(dir, rel))), `${rel} deveria estar na cópia, igual ao original`);
  }
  assert.equal(fs.existsSync(path.join(saved, '.agents')), false, 'o framework não entra na cópia dos dados');
  assert.ok(r.stdout.includes(sub), 'diz onde a cópia ficou');
  assert.ok(r.stdout.includes('Para restaurar') && r.stdout.includes(`restore --from=${sub}`), 'diz o comando que restaura esta cópia: ' + r.stdout);
  assert.equal(read(dir, 'Pilares/01_Estrategia.md'), 'MEU PILAR');

  // As atualizações seguintes não apagam a cópia dos dados.
  for (let i = 0; i < 4; i++) {
    fs.writeFileSync(path.join(dir, '.agents', 'skills', 'radar', 'SKILL.md'), `versão antiga ${i}`);
    assert.equal(run(['update', '.', '--force'], dir).status, 0);
  }
  assert.deepEqual(backupsOf(dir, 'dados'), [sub]);
});

test('backup não atravessa atalhos: um atalho para a própria pasta não trava a cópia nem entra nela', () => {
  const dir = mkTmpDir();
  assert.equal(run(['init', '.', '--force'], dir).status, 0);
  mount(dir);
  fs.writeFileSync(path.join(dir, 'Ativos', 'a.md'), 'ATIVO');
  // 'junction' não pede privilégio no Windows; nos outros sistemas vira link simbólico comum.
  fs.symlinkSync(dir, path.join(dir, 'Ativos', 'atalho'), 'junction');

  const r = spawnSync(process.execPath, [CLI, 'backup', '.'], { cwd: dir, encoding: 'utf8', timeout: 60000 });
  assert.equal(r.status, 0, `a cópia tem de terminar (${r.signal || ''}) ${r.stdout}${r.stderr}`);
  const [sub] = backupsOf(dir, 'dados');
  const saved = path.join(dir, cli.BACKUPS_REL, sub);
  assert.equal(read(saved, 'Ativos/a.md'), 'ATIVO');
  assert.equal(fs.existsSync(path.join(saved, 'Ativos', 'atalho')), false, 'o atalho não é seguido');
  assert.ok(r.stdout.includes('Ativos/atalho') && r.stdout.includes('NÃO entraram na cópia'), r.stdout);
});

test('backup que falha no meio não deixa uma pasta dados-… pela metade com cara de cópia boa', () => {
  const dir = mkTmpDir();
  assert.equal(run(['init', '.', '--force'], dir).status, 0);
  mount(dir);
  fs.writeFileSync(path.join(dir, 'Pilares', '01_Estrategia.md'), 'MEU PILAR');
  fs.writeFileSync(path.join(dir, 'Ativos', 'logo.png'), 'x');

  // Um arquivo de Ativos/ preso por outro programa, depois de Pilares/ e Memoria/ já copiados.
  const copyFileSync = fs.copyFileSync;
  const log = console.log;
  const lines = [];
  fs.copyFileSync = (src, dest) => {
    if (String(src).endsWith('logo.png')) throw Object.assign(new Error('EBUSY: arquivo em uso'), { code: 'EBUSY' });
    return copyFileSync(src, dest);
  };
  console.log = (line) => lines.push(String(line));
  try {
    assert.throws(() => cli.copyBusinessData(dir), { code: 'EBUSY' }, 'o erro continua subindo: o comando sai com código 1');
  } finally {
    fs.copyFileSync = copyFileSync;
    console.log = log;
  }
  assert.deepEqual(backupsOf(dir, 'dados'), [], 'a pasta desta tentativa é removida');
  assert.ok(lines.join('\n').includes('nenhuma cópia foi guardada'), lines.join('\n'));
  assert.equal(read(dir, 'Pilares/01_Estrategia.md'), 'MEU PILAR');
});

test('backup numa pasta sem Córtex montado não finge sucesso', () => {
  const dir = mkTmpDir();
  let r = run(['backup', '.'], dir);
  assert.equal(r.status, 1);
  assert.equal(fs.existsSync(path.join(dir, '.cortex')), false, 'não cria nada numa pasta que não é um Córtex');

  assert.equal(run(['init', '.', '--force'], dir).status, 0);
  r = run(['backup', '.'], dir);
  assert.equal(r.status, 1);
  assert.ok(r.stdout.includes('Nenhuma cópia foi feita'), r.stdout);
  assert.equal(backupsOf(dir, 'dados').length, 0);
});

test('compareVersions', () => {
  assert.equal(cli.compareVersions('1.3.0', '1.2.9'), 1);
  assert.equal(cli.compareVersions('1.2.0', '1.10.0'), -1);
  assert.equal(cli.compareVersions('1.3.0', '1.3.0'), 0);
});
