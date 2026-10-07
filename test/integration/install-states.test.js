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

test('a dica do init funciona: init e depois init --targets=.cursorrules acrescenta o arquivo', () => {
  const dir = mkTmpDir();
  const first = run(['init', '.', '--force'], dir);
  assert.equal(first.status, 0);
  const hint = first.stdout.match(/Rode: npx @aksp\/cortex init (--targets=\S+)/);
  assert.ok(hint, first.stdout);
  assert.equal(hint[1], '--targets=.cursorrules', 'a dica só oferece o que o init simples não criou');
  const agentsBefore = read(dir, 'AGENTS.md');

  // Sem --force de propósito: em pasta só instalada não há nada a confirmar.
  const r = run(['init', '.', hint[1]], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.ok(r.stdout.includes('já está instalado'), r.stdout);
  assert.ok(read(dir, '.cursorrules').includes('cortex-onboarding'), '.cursorrules deve receber o texto de inicialização');
  // Antes da montagem, "deu problema no Córtex" precisa ter para onde ir: a seção citada veio junto.
  for (const f of ['AGENTS.md', 'GEMINI.md', '.cursorrules']) assert.ok(read(dir, f).includes('"deu problema no Córtex"'), f);
  assert.ok(read(dir, '.agents/skills/ajuda/SKILL.md').includes('## A Note to the Maker'));
  assert.ok(cli.isCortexOwnedFile(read(dir, 'AGENTS.md')), 'o texto de inicialização continua reconhecido como do Córtex');
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

  const r = run(['init', '.', '--force', '--targets=.cursorrules'], dir);
  assert.equal(r.status, 1);
  assert.equal(fs.existsSync(path.join(dir, '.cursorrules')), false);

  // No sync, --targets substitui a lista: a dica tem de levar as ferramentas atuais junto.
  const hint = r.stdout.match(/npx @aksp\/cortex sync (--targets=\S+)/);
  assert.ok(hint, r.stdout);
  assert.equal(hint[1], '--targets=AGENTS.md,CLAUDE.md,GEMINI.md,.cursorrules');

  assert.equal(run(['sync', '.', '--force', hint[1]], dir).status, 0);
  assert.deepEqual(
    JSON.parse(read(dir, path.join('.cortex', 'targets.json'))).targets,
    ['AGENTS.md', 'CLAUDE.md', 'GEMINI.md', '.cursorrules']
  );
  assert.ok(read(dir, '.cursorrules').includes('ARQUIVO GERADO PELO CÓRTEX'));
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

test('init em pasta instalada: o CLAUDE.md do usuário é mantido e só ganha a linha @AGENTS.md, sem mandar renomear', () => {
  const dir = installed();
  fs.writeFileSync(path.join(dir, 'CLAUDE.md'), 'minhas regras do claude\n');

  const r = run(['init', '.', '--targets=.cursorrules'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.equal(read(dir, 'CLAUDE.md'), 'minhas regras do claude\n\n@AGENTS.md\n');
  assert.ok(!/renomeie/i.test(r.stdout), r.stdout);
  assert.ok(r.stdout.includes('mantive o seu texto'), r.stdout);

  // Rodar de novo não acrescenta a linha outra vez.
  const again = run(['init', '.'], dir);
  assert.equal(read(dir, 'CLAUDE.md'), 'minhas regras do claude\n\n@AGENTS.md\n');
  assert.ok(again.stdout.includes('Nenhum arquivo novo era necessário'), again.stdout);
});

test('a ajuda não promete que o init sem terminal nunca grava sem --force', () => {
  const r = run(['--help'], mkTmpDir());
  assert.equal(r.status, 0);
  const help = r.stdout.replace(/\s+/g, ' ');
  assert.ok(!help.includes('nada é alterado sem --force'), r.stdout);
  assert.ok(help.includes('precisaria de confirmação não é feito sem --force'), r.stdout);
  assert.ok(help.includes('instala direto'), r.stdout);
});

test('o README diz quando o init pergunta e que os arquivos de instrução já vêm na instalação', () => {
  const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
  const pergunta = readme.split('\n').find((l) => l.includes('Ele só pergunta antes de continuar'));
  assert.ok(pergunta, 'a frase sobre quando o init pergunta deve existir');
  // O init também pergunta quando um AGENTS.md ou GEMINI.md do usuário seria substituído.
  assert.ok(/um `AGENTS\.md` ou `GEMINI\.md` seu/.test(pergunta), pergunta);
  assert.ok(pergunta.includes('pasta do sistema'), pergunta);

  const depois = readme.split('\n').find((l) => l.includes('só aparecem **depois** da conversa de montagem'));
  assert.ok(depois, 'a frase sobre o que só aparece depois da montagem deve existir');
  assert.ok(!/AGENTS\.md[^.]*só aparecem \*\*depois\*\*/.test(depois), 'AGENTS/CLAUDE/GEMINI já vêm no init: ' + depois);
  assert.ok(depois.includes('já vêm na instalação'), depois);
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

// ── O doctor confere a instalação (.agents/) ──────────────────────

// O exemplo do repositório com o framework atual: um Córtex montado e completo.
function mountedExample() {
  const dir = mkTmpDir();
  cli.copyRecursiveSync(path.join(ROOT, 'examples', 'estudio-lumen'), dir);
  cli.copyRecursiveSync(path.join(ROOT, '.agents'), path.join(dir, '.agents'));
  cli.writeVersionFile(dir, cli.VERSION);
  return dir;
}

// O comando que o doctor manda rodar, do jeito que ele imprime (sem o "npx @aksp/cortex@latest").
function fixCommand(stdout) {
  const m = stdout.match(/^\s+npx @aksp\/cortex@latest (update.*--force)$/m);
  assert.ok(m, 'o doctor deve mostrar o comando que repõe, numa linha só dele:\n' + stdout);
  return m[1].split(' ').map((a) => a.replace(/^"|"$/g, ''));
}

test('doctor: instalação inteira não acusa nada, nem skill editada, nem skill criada pelo dono', () => {
  const dir = mountedExample();
  fs.appendFileSync(path.join(dir, '.agents', 'skills', 'ajuda', 'SKILL.md'), '\nUma regra minha.\n');
  fs.mkdirSync(path.join(dir, '.agents', 'skills', 'minha-skill'));
  fs.writeFileSync(path.join(dir, '.agents', 'skills', 'minha-skill', 'SKILL.md'), '# minha\n');

  const r = run(['doctor', '.'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.ok(r.stdout.includes('Instalação: nenhum arquivo do Córtex faltando'), r.stdout);
  assert.ok(!r.stdout.includes('Instalação incompleta'), r.stdout);
  assert.ok(r.stdout.includes('Está tudo em dia'), 'ponto de partida do teste seguinte: ' + r.stdout);
  assert.deepEqual(cli.findMissingFrameworkFiles(dir, ROOT), { wholeFolder: false, missing: [] });
});

test('doctor acusa skill apagada ou vazia, não diz "tudo em dia", e o comando que ele mostra repõe', () => {
  const dir = mountedExample();
  const ajuda = path.join(dir, '.agents', 'skills', 'ajuda', 'SKILL.md');
  fs.appendFileSync(ajuda, '\nUma regra minha.\n');
  fs.rmSync(path.join(dir, '.agents', 'skills', 'radar'), { recursive: true });
  fs.writeFileSync(path.join(dir, '.agents', 'skills', 'semana', 'SKILL.md'), ''); // a nuvem deixou o arquivo vazio
  const decisoes = read(dir, path.join('Memoria', '01_Decisoes.md'));

  let r = run(['doctor', '.'], dir);
  assert.equal(r.status, 0, 'achado num Córtex montado é relatório, como as outras seções: ' + r.stderr);
  assert.ok(r.stdout.includes('Instalação incompleta'), r.stdout);
  assert.ok(r.stdout.includes('faltam 2 arquivos'), r.stdout);
  assert.ok(r.stdout.includes('.agents/skills/radar/SKILL.md') && r.stdout.includes('a habilidade "radar"'), r.stdout);
  assert.ok(r.stdout.includes('.agents/skills/semana/SKILL.md'), 'arquivo vazio conta como faltando');
  assert.ok(!r.stdout.includes('skills/ajuda/SKILL.md'), 'skill editada pelo dono não é problema');
  assert.ok(!r.stdout.includes('Está tudo em dia'), r.stdout);
  assert.ok(/Sugestão:.*Primeiro reponha o que falta na instalação.*update --force/.test(r.stdout), r.stdout);
  assert.ok(r.stdout.includes('.cortex/backups'), 'avisa onde fica a versão editada: ' + r.stdout);

  // O update simples, na mesma versão, não repõe: por isso o doctor manda o --force.
  r = run(['update', '.'], dir);
  assert.equal(fs.existsSync(path.join(dir, '.agents', 'skills', 'radar', 'SKILL.md')), false);

  r = run(fixCommand(run(['doctor', '.'], dir).stdout), dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.equal(read(dir, path.join('.agents', 'skills', 'radar', 'SKILL.md')), read(ROOT, path.join('.agents', 'skills', 'radar', 'SKILL.md')));
  assert.ok(read(dir, path.join('.agents', 'skills', 'semana', 'SKILL.md')).length > 0);
  assert.equal(read(dir, path.join('Memoria', '01_Decisoes.md')), decisoes, 'os dados não são tocados');
  // A versão editada pelo dono ficou na cópia, como o doctor avisou.
  const backups = path.join(dir, '.cortex', 'backups');
  const kept = fs.readdirSync(backups).map((b) => path.join(backups, b, 'agents', 'skills', 'ajuda', 'SKILL.md')).filter((f) => fs.existsSync(f));
  assert.ok(kept.some((f) => fs.readFileSync(f, 'utf8').includes('Uma regra minha.')));

  r = run(['doctor', '.'], dir);
  assert.ok(r.stdout.includes('Instalação: nenhum arquivo do Córtex faltando'), r.stdout);
  assert.ok(r.stdout.includes('Está tudo em dia'), r.stdout);
});

test('Córtex montado que perdeu a pasta .agents/ inteira: o doctor acusa e o update --force repõe (o init se recusa)', () => {
  const dir = mountedExample();
  fs.rmSync(path.join(dir, '.agents'), { recursive: true });
  const cerebro = read(dir, path.join('Frameworks', 'CEREBRO.md'));

  let r = run(['doctor', '.'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.ok(r.stdout.includes('falta a pasta .agents/ inteira'), r.stdout);
  assert.ok(!r.stdout.includes('Está tudo em dia'), r.stdout);
  const fix = fixCommand(r.stdout);

  assert.equal(run(['init', '.'], dir).status, 1, 'o init não roda por cima de um Córtex montado');
  assert.equal(fs.existsSync(path.join(dir, '.agents')), false);

  // Sem --force e sem terminal: mostra o que vai repor e não grava nada.
  r = run(['update', '.'], dir);
  assert.equal(r.status, cli.EXIT_NEEDS_CONFIRMATION, r.stdout + r.stderr);
  assert.ok(!r.stdout.includes('Nada a fazer'), r.stdout);
  assert.equal(fs.existsSync(path.join(dir, '.agents')), false);

  r = run(fix, dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.deepEqual(cli.findMissingFrameworkFiles(dir, ROOT), { wholeFolder: false, missing: [] });
  assert.equal(read(dir, path.join('Frameworks', 'CEREBRO.md')), cerebro, 'o cérebro já estava em dia e fica como estava');
  assert.ok(run(['doctor', '.'], dir).stdout.includes('Está tudo em dia'));
});

test('pasta só instalada com .agents/ pela metade: o doctor manda o update --force (o init não mexe numa pasta que existe)', () => {
  const dir = installed();
  const molde = path.join(dir, '.agents', 'skills', 'cortex-onboarding', 'templates', 'Pilares', '01_Estrategia.md');
  fs.rmSync(molde);

  let r = run(['doctor', '.'], dir);
  assert.notEqual(r.status, 0, 'pasta ainda não montada continua saindo com erro');
  assert.ok(r.stdout.includes('ainda não foi montado'), r.stdout);
  assert.ok(r.stdout.includes('falta 1 arquivo') && r.stdout.includes('templates/Pilares/01_Estrategia.md'), r.stdout);
  assert.equal(run(['init', '.'], dir).status, 0);
  assert.equal(fs.existsSync(molde), false, 'o init não repõe arquivo dentro de uma .agents/ que existe');
  assert.equal(run(fixCommand(r.stdout), dir).status, 0);
  assert.ok(fs.existsSync(molde));
  assert.ok(!run(['doctor', '.'], dir).stdout.includes('Instalação incompleta'));

  // Sem a própria habilidade de montagem: antes o doctor mandava rodar o init, que não resolvia.
  fs.rmSync(path.join(dir, '.agents', 'skills', 'cortex-onboarding'), { recursive: true });
  r = run(['doctor', '.'], dir);
  assert.notEqual(r.status, 0);
  assert.ok(r.stdout.includes('Instalação incompleta') && !r.stdout.includes('cortex init'), r.stdout);
  assert.equal(run(fixCommand(r.stdout), dir).status, 0);
  assert.ok(run(['doctor', '.'], dir).stdout.includes('Falta só a conversa'));
});

test('doctor: o comando de conserto leva a pasta quando o diagnóstico foi pedido de fora dela', () => {
  const parent = mkTmpDir();
  cli.copyRecursiveSync(mountedExample(), path.join(parent, 'Minha Empresa'));
  fs.rmSync(path.join(parent, 'Minha Empresa', '.agents', 'skills', 'radar', 'SKILL.md'));

  const r = run(['doctor', 'Minha Empresa'], parent);
  assert.ok(r.stdout.includes('npx @aksp/cortex@latest update "Minha Empresa" --force'), r.stdout);
  assert.ok(r.stdout.includes('falta 1 arquivo'), r.stdout);
});

test('findMissingFrameworkFiles: compara com o manifesto instalado e não inventa lista quando não há uma', () => {
  // Instalado numa versão anterior com menos arquivos: o que a versão do comando trouxe de novo não é "faltando".
  const dir = mountedExample();
  const manifestPath = path.join(dir, '.agents', 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const semRadar = manifest.files.filter((f) => !f.startsWith('.agents/skills/radar/'));
  fs.writeFileSync(manifestPath, JSON.stringify({ version: '1.0.0', files: semRadar.concat('.agents/../Memoria/META.md') }));
  fs.rmSync(path.join(dir, '.agents', 'skills', 'radar'), { recursive: true });
  assert.deepEqual(cli.findMissingFrameworkFiles(dir, ROOT).missing, []);

  // Sem manifesto, na mesma versão do comando: o manifesto falta, e a lista do pacote serve de referência.
  fs.rmSync(manifestPath);
  assert.deepEqual(cli.findMissingFrameworkFiles(dir, ROOT).missing, ['.agents/manifest.json', '.agents/skills/radar/SKILL.md']);

  // Sem manifesto, noutra versão: só dá para afirmar que o manifesto falta.
  setVersion(dir, '1.2.0');
  assert.deepEqual(cli.findMissingFrameworkFiles(dir, ROOT).missing, ['.agents/manifest.json']);

  // Instalação de antes do manifesto existir (ou sem registro de versão): nada a comparar, nada a acusar
  // — e o resultado diz que não houve conferência, para ninguém ler isso como "nada faltando".
  setVersion(dir, '0.9.0');
  assert.deepEqual(cli.findMissingFrameworkFiles(dir, ROOT), { wholeFolder: false, missing: [], unverified: true });
  fs.rmSync(path.join(dir, '.cortex', 'version.json'));
  assert.deepEqual(cli.findMissingFrameworkFiles(dir, ROOT), { wholeFolder: false, missing: [], unverified: true });

  fs.rmSync(path.join(dir, '.agents'), { recursive: true });
  assert.deepEqual(cli.findMissingFrameworkFiles(dir, ROOT), { wholeFolder: true, missing: [] });
});

test('doctor sem manifesto e sem registro de versão legível: diz que não conferiu, nunca "nada faltando" nem "tudo em dia"', () => {
  for (const versionFile of [null, '', '{']) {
    const dir = mountedExample();
    fs.rmSync(path.join(dir, '.agents', 'manifest.json'));
    fs.rmSync(path.join(dir, '.agents', 'skills', 'radar'), { recursive: true });
    const versionPath = path.join(dir, '.cortex', 'version.json');
    if (versionFile === null) fs.rmSync(versionPath); else fs.writeFileSync(versionPath, versionFile);

    let r = run(['doctor', '.'], dir);
    assert.equal(r.status, 0, r.stdout + r.stderr);
    assert.ok(r.stdout.includes('Instalação: não consegui conferir'), r.stdout);
    assert.ok(!r.stdout.includes('nenhum arquivo do Córtex faltando'), r.stdout);
    assert.ok(!r.stdout.includes('Está tudo em dia'), r.stdout);
    assert.ok(/Sugestão:.*não deu para conferir.*update --force/.test(r.stdout), r.stdout);

    // O comando indicado repõe a habilidade e o manifesto; aí o doctor volta a conferir de verdade.
    assert.equal(run(fixCommand(r.stdout), dir).status, 0);
    assert.ok(fs.existsSync(path.join(dir, '.agents', 'skills', 'radar', 'SKILL.md')));
    r = run(['doctor', '.'], dir);
    assert.ok(r.stdout.includes('Instalação: nenhum arquivo do Córtex faltando'), r.stdout);
  }
});

test('update que repõe a .agents/ inteira não afirma que guardou uma cópia dela nem ensina a copiar uma pasta que não existe', () => {
  // De uma versão anterior à 1.6.0 — a que, com .agents/ presente, receberia os passos manuais de volta.
  const dir = mountedExample();
  fs.rmSync(path.join(dir, '.agents'), { recursive: true });
  setVersion(dir, '1.5.0');

  const r = run(['update', '.', '--force'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const backups = path.join(dir, '.cortex', 'backups');
  const backup = path.join(backups, fs.readdirSync(backups).filter((n) => n.startsWith('update-'))[0]);
  assert.equal(fs.existsSync(path.join(backup, 'agents')), false, 'não havia .agents/ para copiar');
  assert.ok(fs.existsSync(path.join(backup, 'CEREBRO.md')));

  assert.ok(r.stdout.includes('A pasta .agents/ não estava aqui e foi reposta do zero; o seu cérebro como estava ficou guardado em .cortex/backups/update-'), r.stdout);
  assert.ok(!r.stdout.includes('a sua versão está lá'), r.stdout);
  assert.ok(!r.stdout.includes('a pasta .agents/ e o cérebro'), r.stdout);
  assert.ok(!r.stdout.includes('Copie tudo o que há dentro da pasta'), 'o passo manual pede uma pasta que o backup não tem: ' + r.stdout);
  assert.ok(!r.stdout.includes('Algo ficou estranho'), r.stdout);
  assert.deepEqual(cli.findMissingFrameworkFiles(dir, ROOT), { wholeFolder: false, missing: [] });

  // A pergunta de confirmação também não promete o backup de uma pasta que não existe.
  const source = read(ROOT, path.join('bin', 'cli.js'));
  assert.ok(source.includes('A pasta .agents/ será reposta; o cérebro, se existir, é guardado antes. (s/N): '));

  // Com a .agents/ no lugar, a frase e os passos de sempre continuam (o backup tem a pasta agents).
  const full = mountedExample();
  setVersion(full, '1.5.0');
  fs.appendFileSync(path.join(full, '.agents', 'skills', 'ajuda', 'SKILL.md'), '\nUma regra minha.\n');
  const r2 = run(['update', '.', '--force'], full);
  assert.equal(r2.status, 0, r2.stdout + r2.stderr);
  assert.ok(r2.stdout.includes('a sua versão está lá') && r2.stdout.includes('Copie tudo o que há dentro da pasta'), r2.stdout);
});

test('pasta que só tem Memoria/META.md: o update não instala meio Córtex e o doctor não manda um comando que não resolve', () => {
  const dir = mkTmpDir();
  fs.mkdirSync(path.join(dir, 'Memoria'));
  fs.writeFileSync(path.join(dir, 'Memoria', 'META.md'), '# META\n');
  assert.equal(cli.hasBrainEntry(dir), false);

  let r = run(['doctor', '.'], dir);
  assert.ok(r.stdout.includes('Instalação incompleta'), r.stdout);
  assert.ok(!r.stdout.includes('update'), 'o update recusa esta pasta: ' + r.stdout);
  assert.ok(r.stdout.includes('Traga a pasta do negócio inteira'), r.stdout);
  assert.ok(/Sugestão:.*traga de volta a pasta do negócio inteira/.test(r.stdout), r.stdout);
  assert.ok(!r.stdout.includes('Está tudo em dia'), r.stdout);

  r = run(['update', '.', '--force'], dir);
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.ok(r.stdout.includes('Nenhum arquivo foi alterado') && r.stdout.includes('Traga a pasta do negócio inteira'), r.stdout);
  assert.ok(!r.stdout.includes('Framework atualizado'), r.stdout);
  assert.deepEqual(fs.readdirSync(dir), ['Memoria'], 'nada é gravado');

  // Córtex antigo: o arquivo de instrução na raiz é por onde a IA começa — aí a reposição vale.
  fs.writeFileSync(path.join(dir, 'AGENTS.md'), 'CÉREBRO ANTIGO ESCRITO À MÃO');
  assert.equal(cli.hasBrainEntry(dir), true);
  r = run(fixCommand(run(['doctor', '.'], dir).stdout), dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.ok(fs.existsSync(path.join(dir, '.agents', 'skills', 'radar', 'SKILL.md')));
  assert.equal(read(dir, 'AGENTS.md'), 'CÉREBRO ANTIGO ESCRITO À MÃO');
  assert.ok(r.stdout.includes('A pasta .agents/ não estava aqui e foi reposta do zero.'), r.stdout);
  assert.ok(!r.stdout.includes('ficou guardado em'), 'sem .agents/ e sem cérebro não havia o que guardar: ' + r.stdout);
  assert.ok(!r.stdout.includes('Backup salvo em'), r.stdout);
});

test('pasta só instalada sem a .agents/: o doctor e o update mandam o init com @latest e com a pasta', () => {
  const parent = mkTmpDir();
  const dir = path.join(parent, 'Minha Empresa');
  cli.copyRecursiveSync(installed(), dir);
  fs.rmSync(path.join(dir, '.agents'), { recursive: true });

  let r = run(['doctor', 'Minha Empresa'], parent);
  assert.ok(r.stdout.includes('npx @aksp/cortex@latest init "Minha Empresa"'), r.stdout);
  r = run(['update', 'Minha Empresa', '--force'], parent);
  assert.equal(r.status, 1);
  assert.ok(r.stdout.includes('npx @aksp/cortex@latest init "Minha Empresa"'), r.stdout);
  assert.equal(run(['init', 'Minha Empresa'], parent).status, 0);
  assert.ok(fs.existsSync(path.join(dir, '.agents', 'skills', 'radar', 'SKILL.md')));
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

test('sem terminal e sem --force, init não instala quando algo seu tem o mesmo nome do que o Córtex cria', () => {
  const dir = mkTmpDir();
  fs.mkdirSync(path.join(dir, 'Pilares'));
  fs.writeFileSync(path.join(dir, 'Pilares', 'obra.txt'), 'coisas minhas');

  const r = run(['init', '.'], dir);
  assert.equal(r.status, cli.EXIT_NEEDS_CONFIRMATION, r.stdout + r.stderr);
  assert.ok(r.stdout.includes('mesmo nome') && r.stdout.includes('Pilares'), r.stdout);
  assert.ok(r.stdout.includes('Nada foi alterado'), r.stdout);
  assert.deepEqual(fs.readdirSync(dir), ['Pilares']);

  // Outra caixa no nome (no Windows e no macOS é a mesma pasta): também pergunta.
  const minuscula = mkTmpDir();
  fs.mkdirSync(path.join(minuscula, 'pilares'));
  const r3 = run(['init', '.'], minuscula);
  assert.equal(r3.status, cli.EXIT_NEEDS_CONFIRMATION, r3.stdout + r3.stderr);
  assert.ok(r3.stdout.includes('mesmo nome') && r3.stdout.includes('pilares'), r3.stdout);
  assert.deepEqual(fs.readdirSync(minuscula), ['pilares']);

  // Um arquivo de instrução do usuário que seria substituído também pede confirmação.
  const outra = mkTmpDir();
  fs.writeFileSync(path.join(outra, 'AGENTS.md'), 'MINHAS REGRAS');
  const r2 = run(['init', '.'], outra);
  assert.equal(r2.status, cli.EXIT_NEEDS_CONFIRMATION, r2.stdout + r2.stderr);
  assert.ok(r2.stdout.includes('guardo uma cópia'), r2.stdout);
  assert.deepEqual(fs.readdirSync(outra), ['AGENTS.md']);
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

// ── Primeira instalação (v1.6.0) ──────────────────────────────────

test('init numa pasta com arquivos do usuário, sem nome coincidente, instala sem alarme e sem pergunta', () => {
  const dir = mkTmpDir();
  fs.writeFileSync(path.join(dir, 'notas.txt'), 'coisas minhas');
  fs.mkdirSync(path.join(dir, 'Contratos'));
  fs.writeFileSync(path.join(dir, 'Contratos', 'cliente.txt'), 'contrato');

  // Sem --force e sem terminal: não há nada a confirmar, então instala.
  const r = run(['init', '.'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.ok(r.stdout.includes('nada seu é apagado'), r.stdout);
  assert.ok(!/não está vazia|⚠️|cancelad/i.test(r.stdout), 'o caminho normal não pode parecer um erro');
  assert.equal(read(dir, 'notas.txt'), 'coisas minhas');
  assert.equal(read(dir, path.join('Contratos', 'cliente.txt')), 'contrato');
  assert.ok(cli.isCortexInstalled(dir));
});

test('init na pasta pessoal, na Área de Trabalho ou em Documentos sugere uma subpasta e não instala sem confirmação', () => {
  const home = mkTmpDir('cortex-home-');
  const env = Object.assign({}, process.env, { HOME: home, USERPROFILE: home });
  const runAt = (args, cwd) => spawnSync(process.execPath, [CLI, ...args], { cwd, encoding: 'utf8', env });
  const desktop = path.join(home, 'OneDrive', 'Área de Trabalho');
  const docs = path.join(home, 'Documents');
  fs.mkdirSync(desktop, { recursive: true });
  fs.mkdirSync(docs);

  for (const dir of [home, desktop, docs]) {
    const before = fs.readdirSync(dir);
    const r = runAt(['init', '.'], dir);
    assert.equal(r.status, cli.EXIT_NEEDS_CONFIRMATION, dir + '\n' + r.stdout + r.stderr);
    assert.ok(r.stdout.includes('npx @aksp/cortex init "Meu Negocio"'), r.stdout);
    assert.deepEqual(fs.readdirSync(dir), before, 'nada pode ser criado em ' + dir);
  }

  // A subpasta sugerida instala normalmente, e --force continua valendo para quem quer a pasta pessoal mesmo.
  assert.equal(runAt(['init', 'Meu Negocio'], docs).status, 0);
  assert.ok(cli.isCortexInstalled(path.join(docs, 'Meu Negocio')));
  assert.equal(runAt(['init', '.', '--force'], desktop).status, 0);
  assert.ok(cli.isCortexInstalled(desktop));
});

test('isPersonalRootFolder: só a pasta pessoal, as pastas padrão dela e a raiz do disco', () => {
  const home = mkTmpDir('cortex-home-');
  for (const p of ['Desktop', 'Downloads', 'Documentos', path.join('OneDrive', 'Documents'), path.join('Documents', 'Padaria'), 'Padaria', path.join('Padaria', 'Documents')]) {
    fs.mkdirSync(path.join(home, p), { recursive: true });
  }
  for (const p of ['', 'Desktop', 'Downloads', 'Documentos', path.join('OneDrive', 'Documents')]) {
    assert.equal(cli.isPersonalRootFolder(path.join(home, p), home), true, p);
  }
  for (const p of [path.join('Documents', 'Padaria'), 'Padaria', path.join('Padaria', 'Documents'), 'OneDrive']) {
    assert.equal(cli.isPersonalRootFolder(path.join(home, p), home), false, p);
  }
  assert.equal(cli.isPersonalRootFolder(path.parse(home).root, home), true, 'raiz do disco');

  // Pastas do sistema (Windows): um terminal aberto como administrador começa em System32.
  if (process.platform === 'win32' && process.env.SystemRoot) {
    assert.equal(cli.isPersonalRootFolder(path.join(process.env.SystemRoot, 'System32'), home), true, 'System32');
    assert.equal(cli.isPersonalRootFolder(process.env.SystemRoot, home), true, 'pasta do Windows');
  }
  assert.equal(cli.isPersonalRootFolder(mkTmpDir(), home), false, 'a pasta temporária nunca conta como pasta do sistema');
});

test('init com CLAUDE.md e .gitignore do usuário, sem --force: instala sem perguntar, guarda cópia e só acrescenta', () => {
  const dir = mkTmpDir();
  const claude = '# Minhas regras\nSempre use tabs.\n';
  fs.writeFileSync(path.join(dir, 'CLAUDE.md'), claude);
  fs.writeFileSync(path.join(dir, '.gitignore'), 'meu-segredo.txt\n');

  const r = run(['init', '.'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.ok(r.stdout.includes('nada seu é apagado'), r.stdout);
  assert.ok(!r.stdout.includes('mesmo nome'), r.stdout);

  const mine = read(dir, 'CLAUDE.md');
  assert.ok(mine.startsWith(claude), mine);
  assert.equal(mine.split('\n').filter((l) => l === '@AGENTS.md').length, 1, mine);
  assert.ok(read(dir, '.gitignore').startsWith('meu-segredo.txt\n'));

  const backups = fs.readdirSync(path.join(dir, '.cortex', 'backups')).filter((n) => n.startsWith('init-'));
  assert.equal(backups.length, 1, backups.join(', '));
  const backup = path.join('.cortex', 'backups', backups[0]);
  assert.equal(read(dir, path.join(backup, 'CLAUDE.md')), claude);
  assert.equal(read(dir, path.join(backup, '_gitignore')), 'meu-segredo.txt\n');
});

test('init com um ARQUIVO no lugar de uma pasta do Córtex para antes de gravar e diz o que renomear', () => {
  for (const args of [['init', '.'], ['init', '.', '--force']]) {
    const dir = mkTmpDir();
    fs.writeFileSync(path.join(dir, 'Pilares'), 'anotações minhas');

    const r = run(args, dir);
    assert.equal(r.status, 1, r.stdout + r.stderr);
    assert.ok(r.stdout.includes('arquivo chamado Pilares') && r.stdout.includes('Renomeie'), r.stdout);
    assert.ok(r.stdout.includes('Nada foi alterado'), r.stdout);
    assert.ok(!r.stdout.includes('Dentro de Pilares'), 'não pode falar em "dentro" de um arquivo');
    assert.ok(!(r.stdout + r.stderr).includes('ENOENT'), r.stdout + r.stderr);
    assert.deepEqual(fs.readdirSync(dir), ['Pilares'], 'nada pode ficar instalado pela metade');
    assert.equal(read(dir, 'Pilares'), 'anotações minhas');

    // Depois de renomear, o mesmo comando instala.
    fs.renameSync(path.join(dir, 'Pilares'), path.join(dir, 'Pilares-antigo'));
    assert.equal(run(args, dir).status, 0);
    assert.ok(cli.isCortexInstalled(dir));
  }
});

test('a mensagem final do init manda abrir a pasta no aplicativo de IA antes de falar em terminal', () => {
  const dir = mkTmpDir();
  const r = run(['init', '.', '--force'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);

  const out = r.stdout.slice(r.stdout.indexOf('Córtex instalado'));
  const app = out.indexOf('Abrir pasta');
  const frase = out.indexOf('Quero montar meu Córtex');
  // Âncora na frase fixa: a palavra solta "terminal" pode aparecer no caminho da pasta temporária.
  const terminal = out.indexOf('Prefere o terminal');
  assert.ok(app > 0 && frase > app, out);
  assert.ok(terminal > frase, 'o terminal só aparece depois da frase da conversa: ' + out);
  assert.ok(/terminal\? É opcional/.test(out), out);
});

test('GEMINI.md por padrão vale para instalação nova; quem já escolheu as ferramentas não ganha arquivo novo', () => {
  // Instalação nova, montada sem targets.json: o padrão entra pelos arquivos que o init criou.
  const nova = installed();
  mount(nova);
  assert.equal(run(['sync', '.', '--force'], nova).status, 0);
  assert.ok(read(nova, 'GEMINI.md').includes('ARQUIVO GERADO PELO CÓRTEX'));
  assert.deepEqual(JSON.parse(read(nova, path.join('.cortex', 'targets.json'))).targets, ['AGENTS.md', 'CLAUDE.md', 'GEMINI.md']);

  // Córtex anterior à v1.6.0 com a escolha gravada em targets.json.
  const comEscolha = installed();
  mount(comEscolha);
  fs.rmSync(path.join(comEscolha, 'GEMINI.md'));
  cli.writeTargets(comEscolha, ['AGENTS.md', 'CLAUDE.md']);
  setVersion(comEscolha, '1.5.0');
  // Córtex anterior à v1.6.0 sem targets.json: valem os arquivos que já estão na raiz.
  const semEscolha = installed();
  mount(semEscolha);
  fs.rmSync(path.join(semEscolha, 'GEMINI.md'));
  setVersion(semEscolha, '1.5.0');

  for (const dir of [comEscolha, semEscolha]) {
    for (const cmd of ['update', 'sync']) {
      const r = run([cmd, '.', '--force'], dir);
      assert.equal(r.status, 0, r.stdout + r.stderr);
      assert.equal(fs.existsSync(path.join(dir, 'GEMINI.md')), false, `${cmd} não pode criar GEMINI.md em quem não pediu`);
    }
    assert.deepEqual(JSON.parse(read(dir, path.join('.cortex', 'targets.json'))).targets, ['AGENTS.md', 'CLAUDE.md']);
  }
});

test('pasta só com a Memória: o init não manda rodar o update, que a recusaria', () => {
  const dir = mkTmpDir();
  fs.mkdirSync(path.join(dir, 'Memoria'));
  fs.writeFileSync(path.join(dir, 'Memoria', 'META.md'), '# META\n');
  const r = run(['init', '.', '--force'], dir);
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.ok(r.stdout.includes('Achei a Memória do negócio'), r.stdout);
  assert.ok(r.stdout.includes('Nenhum arquivo foi alterado'), r.stdout);
  assert.ok(!/cortex@latest update/.test(r.stdout), 'não pode indicar um comando que recusa esta pasta');
  assert.deepEqual(fs.readdirSync(dir), ['Memoria']);
});
