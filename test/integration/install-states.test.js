const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// Os testes nunca consultam o npm (o doctor e o update fariam isso).
process.env.CORTEX_NO_UPDATE_CHECK = '1';
const { mkTmpDir } = require('../support/tmp');
const cli = require('../../bin/cli.js');

// "Instalado" (o init rodou) não é o mesmo que "montado" (a conversa de
// montagem aconteceu e existe um cérebro). Estes testes cobrem a diferença, o
// .gitignore do usuário e o comportamento quando não há terminal para responder.

const ROOT = path.join(__dirname, '..', '..');
const CLI = path.join(ROOT, 'bin', 'cli.js');
const run = (args, cwd) => spawnSync(process.execPath, [CLI, ...args], { cwd, encoding: 'utf8' });
const read = (dir, f) => fs.readFileSync(path.join(dir, f), 'utf8');

function installed() {
  const dir = mkTmpDir();
  assert.equal(run(['init', '.', '--force'], dir).status, 0);
  return dir;
}

function mount(dir) {
  fs.copyFileSync(
    path.join(dir, '.agents', 'skills', 'cortex-onboarding', 'resources', 'CORTEX_TEMPLATE.md'),
    path.join(dir, 'Frameworks', 'CEREBRO.md')
  );
}

function setVersion(dir, version) {
  fs.writeFileSync(path.join(dir, '.cortex', 'version.json'), JSON.stringify({ version, updatedAt: '2026-01-01T00:00:00.000Z' }) + '\n');
}

// ── Instalado × montado ───────────────────────────────────────────

test('a dica do init funciona: init e depois init --targets=GEMINI.md acrescenta o arquivo', () => {
  const dir = installed();
  const agentsBefore = read(dir, 'AGENTS.md');

  // Sem --force de propósito: em pasta só instalada não há nada a confirmar.
  const r = run(['init', '.', '--targets=GEMINI.md'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.ok(r.stdout.includes('já está instalado'), r.stdout);
  assert.ok(read(dir, 'GEMINI.md').includes('cortex-onboarding'), 'GEMINI.md deve receber o texto de inicialização');
  assert.equal(read(dir, 'AGENTS.md'), agentsBefore, 'arquivos que já existiam não são reescritos');
});

test('init repetido em pasta só instalada recria o que falta e não sobrescreve nada', () => {
  const dir = installed();
  fs.writeFileSync(path.join(dir, 'AGENTS.md'), 'ANOTAÇÕES MINHAS');
  fs.rmSync(path.join(dir, 'CLAUDE.md'));

  const r = run(['init', '.'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.equal(read(dir, 'AGENTS.md'), 'ANOTAÇÕES MINHAS');
  assert.equal(read(dir, 'CLAUDE.md').trim(), cli.CLAUDE_IMPORT_LINE);
  assert.ok(r.stdout.includes('Quero montar meu Córtex'), 'deve dizer o próximo passo');
});

test('init --targets em Córtex montado é recusado, e seguir a dica mantém as ferramentas que já estavam em uso', () => {
  const dir = installed();
  mount(dir);

  const r = run(['init', '.', '--force', '--targets=GEMINI.md'], dir);
  assert.equal(r.status, 1);
  assert.equal(fs.existsSync(path.join(dir, 'GEMINI.md')), false);

  // No sync, --targets substitui a lista: a dica tem de levar as ferramentas atuais junto.
  const hint = r.stdout.match(/npx @aksp\/cortex sync (--targets=\S+)/);
  assert.ok(hint, r.stdout);
  assert.equal(hint[1], '--targets=AGENTS.md,CLAUDE.md,GEMINI.md');

  assert.equal(run(['sync', '.', '--force', hint[1]], dir).status, 0);
  assert.deepEqual(
    JSON.parse(read(dir, path.join('.cortex', 'targets.json'))).targets,
    ['AGENTS.md', 'CLAUDE.md', 'GEMINI.md']
  );
  assert.ok(read(dir, 'GEMINI.md').includes('ARQUIVO GERADO PELO CÓRTEX'));
});

test('sync avisa quando --targets tira da lista uma ferramenta que estava em uso', () => {
  const dir = installed();
  mount(dir);
  assert.equal(run(['sync', '.', '--force'], dir).status, 0);

  const r = run(['sync', '.', '--force', '--targets=GEMINI.md'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.ok(/Atenção:.*AGENTS\.md, CLAUDE\.md/.test(r.stdout), r.stdout);
  assert.ok(r.stdout.includes('--targets=AGENTS.md,CLAUDE.md,GEMINI.md'), 'deve mostrar o comando que mantém todas');
});

test('init --targets em pasta instalada: arquivo do usuário com o mesmo nome é mantido, com aviso', () => {
  const dir = installed();
  fs.writeFileSync(path.join(dir, 'GEMINI.md'), 'MEU GEMINI');

  const r = run(['init', '.', '--targets=GEMINI.md'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.equal(read(dir, 'GEMINI.md'), 'MEU GEMINI');
  assert.ok(r.stdout.includes('GEMINI.md já existia e foi mantido'), r.stdout);
  assert.ok(!r.stdout.includes('Nenhum arquivo novo era necessário'), 'não pode dizer que estava tudo certo');
});

test('CLAUDE.md do usuário que já importa o AGENTS.md não gera aviso', () => {
  const dir = installed();
  fs.writeFileSync(path.join(dir, 'CLAUDE.md'), '# Minhas regras\n\n@AGENTS.md\n');

  const r = run(['init', '.'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.ok(!r.stdout.includes('já existia e foi mantido'), r.stdout);
  assert.ok(r.stdout.includes('Nenhum arquivo novo era necessário'));
});

test('pasta instalada que perdeu a .agents/: o doctor explica e o init repõe', () => {
  const dir = installed();
  fs.rmSync(path.join(dir, '.agents'), { recursive: true, force: true });
  setVersion(dir, '1.3.0');

  let r = run(['doctor', '.'], dir);
  assert.notEqual(r.status, 0);
  assert.ok(r.stdout.includes('incompleta'), r.stdout);
  assert.ok(!r.stdout.includes('Falta só a conversa'), 'sem o framework, a conversa não teria como começar');

  r = run(['init', '.'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.ok(fs.existsSync(path.join(dir, '.agents', 'skills', 'cortex-onboarding', 'SKILL.md')));
  assert.ok(r.stdout.includes('estava faltando'), r.stdout);
  assert.equal(cli.readVersionFile(dir).version, cli.VERSION, 'o framework reposto é o desta versão');
});

test('a dica do init leva a pasta quando o Córtex foi instalado numa subpasta', () => {
  const parent = mkTmpDir();
  fs.writeFileSync(path.join(parent, 'outro-arquivo.txt'), 'x');

  let r = run(['init', 'Minha Empresa', '--force'], parent);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.ok(r.stdout.includes('init "Minha Empresa" --targets='), r.stdout);

  // Seguir a dica a partir da pasta de cima prepara a subpasta, não a pasta de cima.
  r = run(['init', 'Minha Empresa', '--targets=GEMINI.md'], parent);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.ok(fs.existsSync(path.join(parent, 'Minha Empresa', 'GEMINI.md')));
  assert.deepEqual(fs.readdirSync(parent).sort(), ['Minha Empresa', 'outro-arquivo.txt']);

  assert.equal(cli.folderHint('.'), '');
  assert.equal(cli.folderHint('negocio'), ' negocio');
  assert.equal(cli.folderHint('Minha Empresa'), ' "Minha Empresa"');
});

test('Córtex antigo (tem Memoria/META.md, não tem cérebro nem version.json) conta como montado', () => {
  const dir = mkTmpDir();
  fs.mkdirSync(path.join(dir, 'Memoria'));
  fs.writeFileSync(path.join(dir, 'Memoria', 'META.md'), '# META\n');
  fs.writeFileSync(path.join(dir, 'AGENTS.md'), 'CÉREBRO ANTIGO ESCRITO À MÃO');

  const r = run(['init', '.', '--force'], dir);
  assert.equal(r.status, 1, 'o init não pode passar por cima de um Córtex antigo');
  assert.equal(read(dir, 'AGENTS.md'), 'CÉREBRO ANTIGO ESCRITO À MÃO');
  assert.equal(cli.isCortexMounted(dir), true);
  assert.equal(cli.isCortexInstalled(dir), false);
});

test('doctor distingue pasta sem Córtex de pasta instalada à espera da conversa', () => {
  const empty = mkTmpDir();
  let r = run(['doctor', '.'], empty);
  assert.notEqual(r.status, 0);
  assert.ok(r.stdout.includes('Não encontrei um Córtex'), r.stdout);
  assert.ok(r.stdout.includes('npx @aksp/cortex init'), 'pasta sem Córtex: o próximo passo é instalar');

  const dir = installed();
  r = run(['doctor', '.'], dir);
  assert.notEqual(r.status, 0);
  assert.ok(r.stdout.includes('ainda não foi montado'), r.stdout);
  assert.ok(r.stdout.includes('Quero montar meu Córtex'), 'pasta instalada: o próximo passo é a conversa');
  assert.ok(!r.stdout.includes('npx @aksp/cortex init'), 'não pode mandar instalar de novo o que já está instalado');
});

test('doctor não manda refazer a montagem quando o cérebro existe e só falta o índice', () => {
  const dir = installed();
  mount(dir);

  const r = run(['doctor', '.'], dir);
  assert.notEqual(r.status, 0);
  assert.ok(r.stdout.includes('Memoria/META.md'), r.stdout);
  assert.ok(!r.stdout.includes('ainda não foi montado'), 'há um cérebro: a pasta foi montada');
  assert.ok(!r.stdout.includes('Quero montar meu Córtex'), 'refazer a conversa passaria por cima do cérebro');
});

test('doctor não confunde a pasta .agents/ de outra ferramenta com um Córtex', () => {
  const dir = mkTmpDir();
  fs.mkdirSync(path.join(dir, '.agents', 'skills', 'outra-ferramenta'), { recursive: true });

  const r = run(['doctor', '.'], dir);
  assert.notEqual(r.status, 0);
  assert.ok(r.stdout.includes('Não encontrei um Córtex'), r.stdout);
});

// ── .gitignore do usuário ─────────────────────────────────────────

test('init grava o .gitignore do usuário, sem as regras internas do repositório', () => {
  const dir = installed();
  const content = read(dir, '.gitignore');
  assert.equal(content, cli.USER_GITIGNORE);
  for (const rule of ['/Pilares/*', '/Memoria/*', '/Ativos/*', '/.cortex/backups/']) {
    assert.ok(content.includes(rule), `faltou a regra ${rule}`);
  }
  assert.ok(!/AUDITORIA|IDEIAS|graphify/.test(content), 'regras de desenvolvimento não vão para o usuário');
});

test('update cria o .gitignore que faltava (instalações pelo npm até a 1.3.0 nunca o receberam)', () => {
  const dir = installed();
  fs.rmSync(path.join(dir, '.gitignore'));
  // Uma skill desatualizada leva o update pelo caminho completo, o de um usuário real da 1.3.0.
  fs.writeFileSync(path.join(dir, '.agents', 'skills', 'radar', 'SKILL.md'), '# versão antiga');
  setVersion(dir, '1.3.0');

  const r = run(['update', '.', '--force'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.ok(r.stdout.includes('Framework atualizado'), r.stdout);
  assert.equal(read(dir, '.gitignore'), cli.USER_GITIGNORE);
  assert.ok(r.stdout.includes('.gitignore criado'), r.stdout);
});

test('update cria o .gitignore também quando não havia mais nada para atualizar', () => {
  const dir = installed();
  fs.rmSync(path.join(dir, '.gitignore'));
  setVersion(dir, '1.3.0');

  const r = run(['update', '.', '--force'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.ok(r.stdout.includes('Nada para atualizar'), r.stdout);
  assert.equal(read(dir, '.gitignore'), cli.USER_GITIGNORE);
});

test('update em repositório Git sem .gitignore só avisa: não passa a esconder os dados que o usuário versiona', () => {
  const dir = installed();
  fs.rmSync(path.join(dir, '.gitignore'));
  fs.mkdirSync(path.join(dir, '.git'));
  setVersion(dir, '1.3.0');

  const r = run(['update', '.', '--force'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.equal(fs.existsSync(path.join(dir, '.gitignore')), false);
  // Uma regra por linha: coladas numa linha só elas não protegeriam nada.
  for (const rule of ['/Pilares/*', '/Memoria/*', '/Ativos/*']) {
    assert.ok(r.stdout.split('\n').some((l) => l.trim() === rule), `faltou a linha "${rule}" no aviso`);
  }
});

test('um .gitignore que não pode ser lido não derruba o update no fim', () => {
  const dir = installed();
  fs.rmSync(path.join(dir, '.gitignore'));
  fs.mkdirSync(path.join(dir, '.gitignore')); // pasta no lugar do arquivo: a leitura falha
  fs.writeFileSync(path.join(dir, '.agents', 'skills', 'radar', 'SKILL.md'), '# versão antiga');
  setVersion(dir, '1.3.0');

  const r = run(['update', '.', '--force'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.ok(r.stdout.includes('Não consegui conferir o .gitignore'), r.stdout);
  assert.equal(cli.readVersionFile(dir).version, cli.VERSION, 'a versão tem de ser gravada mesmo assim');
});

test('update não mexe num .gitignore que o usuário escreveu', () => {
  const dir = installed();
  fs.writeFileSync(path.join(dir, '.gitignore'), 'node_modules/\n');
  setVersion(dir, '1.3.0');

  assert.equal(run(['update', '.', '--force'], dir).status, 0);
  assert.equal(read(dir, '.gitignore'), 'node_modules/\n');
});

test('ensureGitignore: cria, acrescenta só quando autorizado e reconhece o que já tem', () => {
  const dir = mkTmpDir();
  assert.equal(cli.ensureGitignore(dir, { appendToExisting: false }), 'created');
  assert.equal(cli.ensureGitignore(dir, { appendToExisting: true }), 'present');

  fs.writeFileSync(path.join(dir, '.gitignore'), 'meu-segredo.txt\n');
  assert.equal(cli.ensureGitignore(dir, { appendToExisting: false }), 'missing-rules');
  assert.equal(read(dir, '.gitignore'), 'meu-segredo.txt\n');
  assert.equal(cli.ensureGitignore(dir, { appendToExisting: true }), 'appended');
  assert.ok(read(dir, '.gitignore').startsWith('meu-segredo.txt\n'), 'as regras do usuário vêm primeiro e são mantidas');
});

test('ensureGitignore só reconhece a regra quando ela é uma linha inteira', () => {
  const dir = mkTmpDir();
  const file = path.join(dir, '.gitignore');
  const status = (content) => {
    fs.writeFileSync(file, content);
    return cli.ensureGitignore(dir, { appendToExisting: false });
  };

  // As três regras coladas numa linha só não protegem nada: o aviso tem de continuar.
  assert.equal(status('node_modules/\n/Pilares/*   /Memoria/*   /Ativos/*\n'), 'missing-rules');
  assert.equal(status('# veja /Pilares/* na documentação\n'), 'missing-rules');
  assert.equal(status('node_modules/\n/Pilares/*\n'), 'present');
  assert.equal(status('node_modules/\r\n/Pilares/*\r\n/Memoria/*\r\n'), 'present');
  // Quem comentou a regra decidiu versionar os próprios dados: não é avisado a cada update.
  assert.equal(status('# /Pilares/*\n'), 'present');
});

// ── Update repetível ──────────────────────────────────────────────

test('update interrompido: rodar de novo recompila os arquivos de raiz e registra as novidades', () => {
  const dir = installed();
  mount(dir);
  assert.equal(run(['sync', '.', '--force'], dir).status, 0);
  assert.deepEqual(cli.findStaleTargets(dir, cli.VERSION), []);

  // Estado de uma rodada que parou no meio: .agents/ e o cérebro em dia, o
  // arquivo que a IA lê ainda antigo e a versão antiga gravada.
  fs.writeFileSync(path.join(dir, 'AGENTS.md'), 'REGRAS ANTIGAS');
  setVersion(dir, '1.3.0');
  assert.deepEqual(cli.findStaleTargets(dir, cli.VERSION), ['AGENTS.md']);

  const r = run(['update', '.', '--force'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.ok(!r.stdout.includes('Nada para atualizar'), r.stdout);
  assert.ok(read(dir, 'AGENTS.md').includes('ARQUIVO GERADO PELO CÓRTEX'), 'o arquivo que a IA lê tem de ser recompilado');
  assert.equal(cli.readVersionFile(dir).version, cli.VERSION);
  assert.ok(fs.existsSync(path.join(dir, '.cortex', 'novidades.md')), 'as novidades da versão não podem se perder');
});

test('findStaleTargets: sem cérebro não há o que comparar', () => {
  assert.deepEqual(cli.findStaleTargets(installed(), cli.VERSION), []);
});

// ── Sem terminal para responder (é assim que uma IA roda o CLI) ────

test('sem terminal e sem --force, update mostra o plano, não altera nada e sai com código 2', () => {
  const dir = installed();
  const radar = path.join(dir, '.agents', 'skills', 'radar', 'SKILL.md');
  fs.writeFileSync(radar, '# versão antiga');
  setVersion(dir, '1.3.0');

  const r = run(['update', '.'], dir);
  assert.equal(r.status, cli.EXIT_NEEDS_CONFIRMATION, r.stdout + r.stderr);
  assert.ok(r.stdout.includes('Nada foi alterado'), r.stdout);
  assert.ok(r.stdout.includes('--force'), 'deve dizer como aplicar');
  assert.ok(r.stdout.includes('radar/SKILL.md'), 'o plano do que mudaria continua visível');
  assert.equal(fs.readFileSync(radar, 'utf8'), '# versão antiga');
  assert.equal(cli.readVersionFile(dir).version, '1.3.0');
});

test('sem terminal e sem --force, sync não grava e sai com código 2', () => {
  const dir = installed();
  mount(dir);
  const before = read(dir, 'AGENTS.md');

  const r = run(['sync', '.'], dir);
  assert.equal(r.status, cli.EXIT_NEEDS_CONFIRMATION, r.stdout + r.stderr);
  assert.ok(r.stdout.includes('Nada foi alterado'));
  assert.equal(read(dir, 'AGENTS.md'), before);
});

test('sem terminal e sem --force, init numa pasta com arquivos não instala', () => {
  const dir = mkTmpDir();
  fs.writeFileSync(path.join(dir, 'notas.txt'), 'coisas minhas');

  const r = run(['init', '.'], dir);
  assert.equal(r.status, cli.EXIT_NEEDS_CONFIRMATION, r.stdout + r.stderr);
  assert.deepEqual(fs.readdirSync(dir), ['notas.txt']);
});

test('saída sem terminal não leva códigos de cor', () => {
  const dir = installed();
  for (const args of [['--help'], ['doctor', '.'], ['update', '.', '--force']]) {
    const r = run(args, dir);
    assert.ok(!/\x1b\[/.test(r.stdout + r.stderr), `códigos ANSI em: cortex ${args.join(' ')}`);
  }
});

// ── Erro inesperado ───────────────────────────────────────────────

test('erro inesperado sai em português, dizendo que os dados não foram alterados', () => {
  const dir = mkTmpDir();
  // Uma pasta no lugar de um arquivo faz a leitura falhar no meio do init.
  fs.mkdirSync(path.join(dir, 'AGENTS.md'));

  const r = run(['init', '.', '--force'], dir);
  assert.equal(r.status, 1);
  assert.ok(r.stderr.includes('O Córtex encontrou um erro e parou'), r.stderr);
  assert.ok(r.stderr.includes('não foram alterados'), r.stderr);
  assert.ok(r.stderr.includes('Detalhe técnico'), 'o detalhe técnico continua disponível para quem for ajudar');
});

test('describeError: arquivo bloqueado vira orientação prática', () => {
  for (const code of ['EPERM', 'EBUSY', 'EACCES']) {
    const { lines } = cli.describeError(Object.assign(new Error('x'), { code }));
    assert.ok(lines.join(' ').includes('em uso ou bloqueado'), code);
  }
  assert.ok(cli.describeError(Object.assign(new Error('x'), { code: 'ENOSPC' })).lines.join(' ').includes('sem espaço'));
  const generic = cli.describeError(new Error('qualquer'));
  assert.ok(generic.lines.join(' ').includes('issues'));
  assert.ok(generic.detail.includes('qualquer'));
  assert.ok(cli.describeError('texto solto').detail.includes('texto solto'));
});
