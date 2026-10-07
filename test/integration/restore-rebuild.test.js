const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// Os testes nunca consultam o npm (o doctor e o update fariam isso).
process.env.CORTEX_NO_UPDATE_CHECK = '1';
const { mkTmpDir } = require('../support/tmp');
const cli = require('../../bin/cli.js');

// Dois caminhos de volta: `restore` (trazer os dados de uma cópia dados-…) e o
// `update` numa pasta que só tem os dados (reconstruir o cérebro a partir deles).

const ROOT = path.join(__dirname, '..', '..');
const CLI = path.join(ROOT, 'bin', 'cli.js');
const EXAMPLE = path.join(ROOT, 'examples', 'estudio-lumen');
const run = (args, cwd) => spawnSync(process.execPath, [CLI, ...args], { cwd, encoding: 'utf8' });
const read = (dir, f) => fs.readFileSync(path.join(dir, f), 'utf8');
const write = (dir, f, text) => {
  fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true });
  fs.writeFileSync(path.join(dir, f), text);
};
const backupsOf = (dir, label) => {
  const base = path.join(dir, cli.BACKUPS_REL);
  return fs.existsSync(base) ? fs.readdirSync(base).filter((n) => n.startsWith(`${label}-`)).sort() : [];
};

// Todos os arquivos de uma pasta com o conteúdo, para comparar "antes × depois".
function snapshot(dir, prefix) {
  const out = {};
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isSymbolicLink()) out[rel] = '(atalho)';
    else if (entry.isDirectory()) Object.assign(out, snapshot(path.join(dir, entry.name), rel));
    else out[rel] = fs.readFileSync(path.join(dir, entry.name)).toString('base64');
  }
  return out;
}

// O exemplo montado, com o framework: um Córtex de verdade para restaurar.
function mounted(parent, name) {
  const dir = path.join(parent || mkTmpDir(), name || 'negocio');
  cli.copyRecursiveSync(EXAMPLE, dir);
  cli.copyRecursiveSync(path.join(ROOT, '.agents'), path.join(dir, '.agents'));
  cli.writeVersionFile(dir, cli.VERSION);
  write(dir, 'Ativos/logo.png', Buffer.from([0, 1, 2, 255]));
  return dir;
}

// Uma cópia dados-… com nome escolhido (a data vem do nome), feita do estado atual.
function copyAs(dir, name) {
  const dest = path.join(dir, cli.BACKUPS_REL, name);
  for (const item of ['Pilares', 'Memoria', 'Ativos', cli.CEREBRO_PATH]) {
    if (fs.existsSync(path.join(dir, item))) cli.copyRecursiveSync(path.join(dir, item), path.join(dest, item));
  }
  return dest;
}

// ── restore ───────────────────────────────────────────────────────

test('restore --list: mostra as cópias dos dados, a mais recente primeiro, com a data por extenso, e não altera nada', () => {
  const dir = mounted();

  // Sem nenhuma cópia: diz isso, ensina a fazer uma e não cria nada.
  let before = snapshot(dir);
  let r = run(['restore', '.', '--list'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.ok(r.stdout.includes('Ainda não há nenhuma cópia dos dados') && r.stdout.includes('npx @aksp/cortex@latest backup'), r.stdout);
  assert.deepEqual(snapshot(dir), before);
  // Sem --list e sem cópia não há o que restaurar: código 1, e nada muda.
  r = run(['restore', '.', '--force'], dir);
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.ok(r.stdout.includes('Nada foi alterado'), r.stdout);
  assert.deepEqual(snapshot(dir), before);

  copyAs(dir, 'dados-2026-03-05'); // feita à mão pela IA: só o dia
  write(path.join(dir, cli.BACKUPS_REL, 'dados-2026-03-05'), 'solto.txt', 'não é dado do negócio');
  copyAs(dir, 'dados-2026-03-06T15-00-00-000Z'); // feita pelo `backup`
  fs.mkdirSync(path.join(dir, cli.BACKUPS_REL, 'dados-2026-03-07T10-00-00-000Z-incompleta', 'Memoria'), { recursive: true });
  fs.mkdirSync(path.join(dir, cli.BACKUPS_REL, 'update-2026-03-08T10-00-00-000Z', 'agents'), { recursive: true });

  before = snapshot(dir);
  r = run(['restore', '--list'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const lines = r.stdout.split('\n').filter((l) => /^\s+\d+\. /.test(l));
  assert.equal(lines.length, 2, r.stdout);
  assert.ok(/1\. dados-2026-03-06T15-00-00-000Z — 6 de março de 2026, às \d{1,2}h\d{2} — 15 arquivo\(s\)/.test(lines[0]), lines[0]);
  assert.ok(/2\. dados-2026-03-05 — 5 de março de 2026 — 15 arquivo\(s\)/.test(lines[1]), 'só os dados do negócio contam: ' + lines[1]);
  assert.ok(r.stdout.includes('dados-2026-03-07T10-00-00-000Z-incompleta') && r.stdout.includes('não terminou'), 'a cópia pela metade é citada à parte: ' + r.stdout);
  assert.ok(r.stdout.includes('este comando não mexe com elas'), 'diz que update-… não é cópia dos dados: ' + r.stdout);
  assert.ok(r.stdout.includes('Nada foi alterado'), r.stdout);
  assert.deepEqual(snapshot(dir), before, '--list só lê');

  assert.equal(cli.describeCopyDate('dados-2026-12-01-2'), '1 de dezembro de 2026');
  assert.equal(cli.describeCopyDate('dados-qualquer'), 'data não identificada');
});

test('restore: usa a cópia mais recente, guarda antes o estado atual, não apaga nada e diz como desfazer', () => {
  // Pasta com espaço e acento, e o comando rodado de fora dela (com o nome da pasta).
  const parent = mkTmpDir();
  const dir = mounted(parent, 'Estúdio da Ana');
  const original = snapshot(dir);

  assert.equal(run(['backup', 'Estúdio da Ana'], parent).status, 0);
  const [copy] = backupsOf(dir, 'dados');

  // Depois da cópia: um arquivo estragado, um apagado, o cérebro mexido e um arquivo novo.
  write(dir, 'Memoria/01_Decisoes.md', 'ESTRAGUEI TUDO\n');
  fs.rmSync(path.join(dir, 'Pilares', '02_Cultura.md'));
  write(dir, cli.CEREBRO_PATH, read(dir, cli.CEREBRO_PATH).replace('**Estúdio Lumen**', '**Nome Errado**'));
  write(dir, 'Memoria/06_Escrito_Depois.md', 'escrevi depois da cópia\n');
  const broken = snapshot(dir);

  // Sem terminal e sem --force: mostra o plano, não mexe em nada e sai com 2.
  let r = run(['restore', 'Estúdio da Ana'], parent);
  assert.equal(r.status, cli.EXIT_NEEDS_CONFIRMATION, r.stdout + r.stderr);
  assert.ok(r.stdout.includes(copy) && r.stdout.includes('(a mais recente)'), 'diz qual cópia vai usar: ' + r.stdout);
  assert.ok(r.stdout.includes('~ Memoria/01_Decisoes.md') && r.stdout.includes('+ Pilares/02_Cultura.md'), r.stdout);
  assert.ok(r.stdout.includes('Nada foi alterado') && r.stdout.includes('--force'), r.stdout);
  assert.deepEqual(snapshot(dir), broken, 'sem confirmação, nem a cópia de "antes" é criada');

  r = run(['restore', 'Estúdio da Ana', '--force'], parent);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  for (const rel of ['Memoria/01_Decisoes.md', 'Pilares/02_Cultura.md', 'Frameworks/CEREBRO.md', 'Ativos/logo.png']) {
    assert.equal(snapshot(dir)[rel], original[rel], `${rel} voltou a ser como na cópia`);
  }
  // O que foi escrito depois da cópia fica, e é dito.
  assert.equal(read(dir, 'Memoria/06_Escrito_Depois.md'), 'escrevi depois da cópia\n');
  assert.ok(/1 arquivo\(s\) que existem hoje e não estão na cópia ficam como estão[\s\S]*• Memoria\/06_Escrito_Depois\.md/.test(r.stdout), r.stdout);
  // O cérebro voltou: os arquivos de instrução são recompilados, como no sync.
  assert.ok(read(dir, 'AGENTS.md').includes('**Estúdio Lumen**') && !read(dir, 'AGENTS.md').includes('Nome Errado'));
  assert.ok(r.stdout.includes('Cérebro recompilado para: AGENTS.md, CLAUDE.md'), r.stdout);

  // A cópia de "antes" é uma dados-… nova, com o estado estragado, e a saída a nomeia.
  const copies = backupsOf(dir, 'dados');
  assert.equal(copies.length, 2);
  const beforeCopy = copies.find((n) => n !== copy);
  assert.equal(read(path.join(dir, cli.BACKUPS_REL, beforeCopy), 'Memoria/01_Decisoes.md'), 'ESTRAGUEI TUDO\n');
  assert.equal(fs.existsSync(path.join(dir, cli.BACKUPS_REL, beforeCopy, 'Pilares', '02_Cultura.md')), false);
  assert.ok(r.stdout.includes(path.join(dir, cli.BACKUPS_REL, beforeCopy)), 'diz onde ficou o "antes": ' + r.stdout);
  const undo = r.stdout.match(/^\s+npx @aksp\/cortex@latest restore "Estúdio da Ana" --from=(dados-\S+)$/m);
  assert.ok(undo && undo[1] === beforeCopy, 'mostra o comando que desfaz, numa linha só dele: ' + r.stdout);

  // Desfazer é outro restore: o texto de antes volta; o arquivo que tinha voltado não é apagado.
  r = run(['restore', 'Estúdio da Ana', `--from=${beforeCopy}`, '--force'], parent);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.equal(read(dir, 'Memoria/01_Decisoes.md'), 'ESTRAGUEI TUDO\n');
  assert.ok(read(dir, 'AGENTS.md').includes('Nome Errado'), 'o cérebro de antes volta a ser o compilado');
  assert.ok(fs.existsSync(path.join(dir, 'Pilares', '02_Cultura.md')), 'restaurar nunca apaga');
  assert.equal(backupsOf(dir, 'dados').length, 3, 'desfazer também guarda o seu "antes"');

  // Dados já iguais aos da cópia: nada é gravado, nem uma cópia nova.
  const same = snapshot(dir);
  r = run(['restore', 'Estúdio da Ana', `--from=${beforeCopy}`, '--force'], parent);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.ok(r.stdout.includes('já estão iguais aos da cópia'), r.stdout);
  assert.deepEqual(snapshot(dir), same);
});

test('restore --from: aceita o nome como o --list mostra; nome desconhecido, cópia pela metade e update-… são recusados', () => {
  const dir = mounted();
  write(dir, 'Memoria/01_Decisoes.md', 'VERSÃO DE MARÇO\n');
  copyAs(dir, 'dados-2026-03-05');
  write(dir, 'Memoria/01_Decisoes.md', 'VERSÃO DE ABRIL\n');
  copyAs(dir, 'dados-2026-04-10T15-00-00-000Z');
  write(dir, 'Memoria/01_Decisoes.md', 'VERSÃO DE HOJE\n');
  fs.mkdirSync(path.join(dir, cli.BACKUPS_REL, 'dados-2026-05-01T10-00-00-000Z-incompleta', 'Memoria'), { recursive: true });
  write(dir, path.join(cli.BACKUPS_REL, 'update-2026-05-02T10-00-00-000Z', 'CEREBRO.md'), 'cérebro de antes do update');
  const before = snapshot(dir);

  for (const [name, expected] of [
    ['dados-2026-01-01', 'Não encontrei a cópia "dados-2026-01-01"'],
    ['dados-2026-05-01T10-00-00-000Z-incompleta', 'é de uma cópia que não terminou'],
    ['update-2026-05-02T10-00-00-000Z', 'só restaura as pastas "dados-…"'],
  ]) {
    const r = run(['restore', '.', `--from=${name}`, '--force'], dir);
    assert.equal(r.status, 1, r.stdout + r.stderr);
    assert.ok(r.stdout.includes(expected), r.stdout);
    assert.ok(r.stdout.includes('1. dados-2026-04-10T15-00-00-000Z') && r.stdout.includes('2. dados-2026-03-05'), 'lista as válidas: ' + r.stdout);
    assert.ok(r.stdout.includes('Nada foi alterado'), r.stdout);
    assert.deepEqual(snapshot(dir), before, `--from=${name} não pode alterar nada`);
  }

  // A mais antiga, pedida pelo nome (aqui com o caminho inteiro, como alguém colaria).
  const r = run(['restore', '.', `--from=${cli.toPosix(cli.BACKUPS_REL)}/dados-2026-03-05/`, '--force'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.equal(read(dir, 'Memoria/01_Decisoes.md'), 'VERSÃO DE MARÇO\n');
  assert.ok(!r.stdout.includes('(a mais recente)'), r.stdout);
  const made = backupsOf(dir, 'dados').filter((n) => !before[`${cli.toPosix(cli.BACKUPS_REL)}/${n}/Memoria/META.md`] && !n.endsWith('-incompleta'));
  assert.equal(made.length, 1);
  assert.equal(read(path.join(dir, cli.BACKUPS_REL, made[0]), 'Memoria/01_Decisoes.md'), 'VERSÃO DE HOJE\n');

  // "--from nome", com espaço no lugar do "=", e o alias em português: o nome não é tomado pela pasta.
  write(dir, 'Memoria/01_Decisoes.md', 'OUTRA VEZ\n');
  const spaced = run(['restaurar', '--from', 'dados-2026-04-10T15-00-00-000Z', '--force'], dir);
  assert.equal(spaced.status, 0, spaced.stdout + spaced.stderr);
  assert.equal(read(dir, 'Memoria/01_Decisoes.md'), 'VERSÃO DE ABRIL\n');
  write(dir, 'Memoria/01_Decisoes.md', 'VERSÃO DE MARÇO\n');

  // Uma cópia parcial (a IA copiou à mão só o arquivo que ia alterar) restaura só esse arquivo.
  write(dir, path.join(cli.BACKUPS_REL, 'dados-2026-06-01', 'Memoria', '02_Licoes.md'), 'LIÇÕES DE JUNHO\n');
  const pillar = read(dir, 'Pilares/01_Estrategia.md');
  const partial = run(['restore', '.', '--from=dados-2026-06-01', '--force'], dir);
  assert.equal(partial.status, 0, partial.stdout + partial.stderr);
  assert.equal(read(dir, 'Memoria/02_Licoes.md'), 'LIÇÕES DE JUNHO\n');
  assert.equal(read(dir, 'Memoria/01_Decisoes.md'), 'VERSÃO DE MARÇO\n');
  assert.equal(read(dir, 'Pilares/01_Estrategia.md'), pillar);
});

test('restore: se a cópia de "antes" falha, nada é restaurado', () => {
  const dir = mounted();
  copyAs(dir, 'dados-2026-03-05');
  write(dir, 'Memoria/01_Decisoes.md', 'VERSÃO DE HOJE\n');
  const before = snapshot(dir);

  // Um arquivo preso por outro programa justamente na hora de guardar o estado atual.
  const preload = path.join(mkTmpDir(), 'preso.js');
  fs.writeFileSync(preload, `const fs = require('fs');
const copy = fs.copyFileSync;
fs.copyFileSync = (src, dest) => {
  if (/backups[\\\\/]dados-/.test(String(dest)) && String(src).endsWith('logo.png')) throw Object.assign(new Error('EBUSY: arquivo em uso'), { code: 'EBUSY' });
  return copy(src, dest);
};
`);
  const r = spawnSync(process.execPath, ['-r', preload, CLI, 'restore', '.', '--force'], { cwd: dir, encoding: 'utf8' });
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.ok(r.stdout.includes('Sem essa cópia eu não restauro'), r.stdout);
  assert.ok(!r.stdout.includes('Dados restaurados'), r.stdout);
  assert.deepEqual(snapshot(dir), before, 'nem os dados mudam, nem sobra uma cópia pela metade');
});

test('restore não atravessa atalhos: nem os que estão dentro da cópia, nem os que estão no lugar do arquivo', () => {
  const dir = mounted();
  write(dir, 'Ativos/contratos/modelo.md', 'MODELO DA CÓPIA\n');
  const copy = copyAs(dir, 'dados-2026-03-05');

  // Dentro da cópia, um atalho para uma pasta de fora: o conteúdo dela não é restaurado.
  const outside = mkTmpDir();
  write(outside, 'segredo.md', 'DE FORA\n');
  // 'junction' não pede privilégio no Windows; nos outros sistemas vira link simbólico comum.
  fs.symlinkSync(outside, path.join(copy, 'Ativos', 'atalho'), 'junction');

  // Na pasta do negócio, Ativos/contratos virou um atalho para outra pasta.
  const elsewhere = mkTmpDir();
  fs.rmSync(path.join(dir, 'Ativos', 'contratos'), { recursive: true });
  fs.symlinkSync(elsewhere, path.join(dir, 'Ativos', 'contratos'), 'junction');
  write(dir, 'Memoria/01_Decisoes.md', 'VERSÃO DE HOJE\n');

  const r = spawnSync(process.execPath, [CLI, 'restore', '.', '--force'], { cwd: dir, encoding: 'utf8', timeout: 60000 });
  assert.equal(r.status, 0, `${r.signal || ''} ${r.stdout}${r.stderr}`);
  assert.notEqual(read(dir, 'Memoria/01_Decisoes.md'), 'VERSÃO DE HOJE\n', 'o resto é restaurado');
  assert.deepEqual(fs.readdirSync(elsewhere), [], 'nada é gravado através do atalho');
  assert.equal(fs.existsSync(path.join(dir, 'Ativos', 'atalho')), false, 'o atalho da cópia não é seguido nem recriado');
  assert.ok(/NÃO serão restaurados[\s\S]*Ativos\/contratos\/modelo\.md/.test(r.stdout), r.stdout);
  assert.equal(fs.readFileSync(path.join(outside, 'segredo.md'), 'utf8'), 'DE FORA\n');
});

test('restore: pasta sem Córtex, pasta só instalada e pasta que perdeu os dados mas ainda tem as cópias', () => {
  // Sem Córtex: não cria nada.
  const empty = mkTmpDir();
  let r = run(['restore', '.'], empty);
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.ok(r.stdout.includes('Não encontrei um Córtex nesta pasta'), r.stdout);
  assert.deepEqual(fs.readdirSync(empty), []);
  r = run(['restore', 'pasta-que-nao-existe'], empty);
  assert.equal(r.status, 1);
  assert.ok(r.stdout.includes('Pasta não encontrada'), r.stdout);

  // Só instalada (a conversa de montagem não aconteceu): não há o que restaurar.
  const fresh = mkTmpDir();
  assert.equal(run(['init', '.', '--force'], fresh).status, 0);
  r = run(['restore', '.', '--force'], fresh);
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.ok(r.stdout.includes('a conversa de montagem ainda não aconteceu'), r.stdout);
  assert.equal(backupsOf(fresh, 'dados').length, 0);

  // Os dados e os arquivos da raiz sumiram, mas as cópias ficaram: é para isso que o restore serve.
  const dir = mounted();
  const original = snapshot(dir);
  assert.equal(run(['backup', '.'], dir).status, 0);
  for (const gone of ['Pilares', 'Memoria', 'Ativos', 'Frameworks', 'AGENTS.md', 'CLAUDE.md']) {
    fs.rmSync(path.join(dir, gone), { recursive: true, force: true });
  }
  r = run(['restore', '.', '--force'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const after = snapshot(dir);
  for (const rel of Object.keys(original).filter((f) => /^(Pilares|Memoria|Ativos|Frameworks)\//.test(f))) {
    assert.equal(after[rel], original[rel], `${rel} voltou`);
  }
  assert.ok(read(dir, 'AGENTS.md').includes('ARQUIVO GERADO PELO CÓRTEX') && read(dir, 'AGENTS.md').includes('Estúdio Lumen'));
  assert.equal(backupsOf(dir, 'dados').length, 1, 'não havia "antes" para guardar');
  assert.ok(r.stdout.includes('não há um "antes" para guardar nem para desfazer'), r.stdout);
  assert.equal(run(['doctor', '.', '--offline'], dir).status, 0);
});

test('restore: as regras do Córtex dentro do cérebro não vêm da cópia — continuam as da versão instalada', () => {
  const dir = mounted();
  const installedRules = `\n${read(dir, cli.BRAIN_FRAMEWORK_REL_PATH).replace(/\r\n/g, '\n').trim()}\n`;
  // Uma cópia feita com uma versão anterior: o cérebro dela traz as regras daquela versão.
  const copy = copyAs(dir, 'dados-2026-03-05T10-00-00-000Z');
  write(copy, cli.CEREBRO_PATH, cli.replaceRegion(read(copy, cli.CEREBRO_PATH), cli.FRAMEWORK_START, cli.FRAMEWORK_END, '\nREGRAS ANTIGAS DA VERSAO 1.0\n'));
  const copyBusiness = cli.extractRegion(read(copy, cli.CEREBRO_PATH), cli.BUSINESS_START, cli.BUSINESS_END);

  // Só as regras diferem: para o dono, o cérebro está igual ao da cópia. Nada a restaurar.
  const same = snapshot(dir);
  let r = run(['restore', '.', '--force'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.ok(r.stdout.includes('já estão iguais aos da cópia') && !r.stdout.includes('~ Frameworks/CEREBRO.md'), r.stdout);
  assert.deepEqual(snapshot(dir), same);

  // A parte do negócio mudou depois da cópia: ela volta; as regras ficam as instaladas.
  write(dir, cli.CEREBRO_PATH, read(dir, cli.CEREBRO_PATH).replace('**Estúdio Lumen**', '**Nome Errado**'));
  r = run(['restore', '.', '--force'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const cerebro = read(dir, cli.CEREBRO_PATH);
  assert.equal(cli.extractRegion(cerebro, cli.BUSINESS_START, cli.BUSINESS_END), copyBusiness, 'a parte do negócio é a da cópia, byte a byte');
  assert.equal(cli.extractRegion(cerebro, cli.FRAMEWORK_START, cli.FRAMEWORK_END), installedRules, 'as regras são as instaladas');
  for (const f of [cli.CEREBRO_PATH, 'AGENTS.md']) assert.ok(!read(dir, f).includes('REGRAS ANTIGAS'), `${f} não pode ficar com as regras da cópia`);
  assert.ok(read(dir, 'AGENTS.md').includes('**Estúdio Lumen**'));
  assert.ok(r.stdout.includes('As regras do Córtex dentro do cérebro continuam as da versão instalada'), r.stdout);
  assert.equal(run(['doctor', '.', '--offline'], dir).status, 0);
});

test('restore sem --from não escolhe a cópia que um restore tirou antes de mexer: ela é marcada e só vale com --from', () => {
  const dir = mounted();
  write(dir, 'Memoria/01_Decisoes.md', 'VERSÃO BOA\n');
  assert.equal(run(['backup', '.'], dir).status, 0);
  const [good] = backupsOf(dir, 'dados');

  write(dir, 'Memoria/01_Decisoes.md', 'ESTRAGUEI\n');
  assert.equal(run(['restore', '.', '--force'], dir).status, 0);
  const before = backupsOf(dir, 'dados').find((n) => n !== good);
  assert.equal(read(path.join(dir, cli.BACKUPS_REL, before), '.antes-de-restaurar'), `${good}\n`, 'a cópia de "antes" leva a marca, com o nome da cópia restaurada');

  // Na lista ela não parece um backup comum.
  let r = run(['restore', '.', '--list'], dir);
  const lines = r.stdout.split('\n').filter((l) => /^\s+\d+\. /.test(l));
  assert.ok(lines[0].includes(before) && lines[0].includes(`como estava antes de uma restauração (a da cópia ${good})`), r.stdout);
  assert.ok(lines[1].includes(good) && !lines[1].includes('antes de uma restauração'), r.stdout);

  // Estragou de novo: o restore volta ao backup de verdade, não ao estado abandonado.
  write(dir, 'Memoria/01_Decisoes.md', 'ESTRAGUEI DE NOVO\n');
  r = run(['restore', '.'], dir);
  assert.equal(r.status, cli.EXIT_NEEDS_CONFIRMATION, r.stdout + r.stderr);
  assert.ok(new RegExp(`Cópia escolhida: ${good} .*\\(o backup mais recente\\)`).test(r.stdout), r.stdout);
  assert.ok(r.stdout.includes(`restore --from=${before}`), 'diz como desfazer a última restauração: ' + r.stdout);
  r = run(['restore', '.', '--force'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.equal(read(dir, 'Memoria/01_Decisoes.md'), 'VERSÃO BOA\n');

  // Só sobraram cópias de "antes": não escolhe sozinho; com --from, restaura.
  fs.rmSync(path.join(dir, cli.BACKUPS_REL, good), { recursive: true });
  write(dir, 'Memoria/01_Decisoes.md', 'TERCEIRA VEZ\n');
  const state = snapshot(dir);
  r = run(['restore', '.', '--force'], dir);
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.ok(r.stdout.includes('não escolho uma delas sozinho') && r.stdout.includes('--from=<nome da cópia>') && r.stdout.includes('Nada foi alterado'), r.stdout);
  assert.deepEqual(snapshot(dir), state);
  r = run(['restore', '.', `--from=${before}`, '--force'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.equal(read(dir, 'Memoria/01_Decisoes.md'), 'ESTRAGUEI\n');
});

test('restore: "a mais recente" é pelo momento da cópia, não pelo nome — cópias do backup (UTC) e feitas à mão (só o dia) juntas', () => {
  const dir = mounted();
  // O nome que o `backup` daria a uma cópia feita nesse horário do computador.
  const stamped = (...when) => `dados-${new Date(...when).toISOString().replace(/[:.]/g, '-')}`;
  const manual = (name, ...when) => {
    const made = copyAs(dir, name);
    if (when.length > 0) fs.utimesSync(made, new Date(...when), new Date(...when));
  };
  const night = stamped(2026, 2, 6, 22, 0); // 22h do dia 6: em Brasília, o nome já diz dia 7
  const morning = stamped(2026, 2, 7, 9, 0);
  copyAs(dir, night);
  copyAs(dir, morning);
  manual('dados-2026-03-07', 2026, 2, 7, 15, 0);
  manual('dados-2026-03-07-2', 2026, 2, 7, 16, 0);
  // Sem uma hora de criação que caia no dia do nome, vale o fim do dia; o -N desempata como número.
  manual('dados-2026-03-05-9');
  manual('dados-2026-03-05-10');

  let r = run(['restore', '.', '--list'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const names = r.stdout.split('\n').filter((l) => /^\s+\d+\. /.test(l)).map((l) => l.trim().split(/\s+/)[1]);
  assert.deepEqual(names, ['dados-2026-03-07-2', 'dados-2026-03-07', morning, night, 'dados-2026-03-05-10', 'dados-2026-03-05-9']);

  write(dir, 'Memoria/01_Decisoes.md', 'VERSÃO DE HOJE\n');
  r = run(['restore', '.'], dir);
  assert.equal(r.status, cli.EXIT_NEEDS_CONFIRMATION, r.stdout + r.stderr);
  assert.ok(/Cópia escolhida: dados-2026-03-07-2 .*\(a mais recente\)/.test(r.stdout), r.stdout);
});

test('restore está na ajuda, no README, nos contratos, no bilhete e nas skills que tiram a cópia', () => {
  const help = run(['--help'], ROOT).stdout;
  for (const needed of ['restore [pasta]', '--list', '--from=<nome>']) assert.ok(help.includes(needed), `faltou na ajuda: ${needed}`);
  assert.ok(read(ROOT, 'README.md').includes('| `npx @aksp/cortex@latest restore` |'), 'a tabela de comandos do README lista o restore');
  const contracts = read(ROOT, 'CONTRACTS.md');
  assert.ok(contracts.includes('`cortex restore [pasta]`') && !contracts.includes('não existe comando de restauração'));
  assert.ok(read(ROOT, path.join('.agents', 'cortex', 'COMECE-AQUI.txt')).includes('npx @aksp/cortex@latest restore'));
  for (const skill of ['consolidar', 'cortex-revisao']) {
    assert.ok(read(ROOT, path.join('.agents', 'skills', skill, 'SKILL.md')).includes('npx @aksp/cortex@latest restore --from=dados-…'), `${skill} diz como voltar à cópia`);
  }
});

// ── update numa pasta que só tem os dados ─────────────────────────

// Só os dados do exemplo: Memoria/, Pilares/ e um arquivo em Ativos/.
function dataOnly() {
  const dir = mkTmpDir();
  cli.copyRecursiveSync(path.join(EXAMPLE, 'Memoria'), path.join(dir, 'Memoria'));
  cli.copyRecursiveSync(path.join(EXAMPLE, 'Pilares'), path.join(dir, 'Pilares'));
  write(dir, 'Ativos/logo.png', Buffer.from([0, 1, 2, 255]));
  return dir;
}

test('update numa pasta que só tem os dados: reconstrói o cérebro com o que está escrito nela, sem alterar um byte dos dados', () => {
  const dir = dataOnly();
  const data = snapshot(dir);

  // Sem terminal e sem --force: mostra o plano, não grava nada e sai com 2.
  let r = run(['update', '.'], dir);
  assert.equal(r.status, cli.EXIT_NEEDS_CONFIRMATION, r.stdout + r.stderr);
  assert.ok(r.stdout.includes('nome do negócio: Estúdio Lumen') && r.stdout.includes('Nada foi alterado'), r.stdout);
  assert.deepEqual(snapshot(dir), data);

  r = run(['update', '.', '--force'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const after = snapshot(dir);
  for (const rel of Object.keys(data)) assert.equal(after[rel], data[rel], `${rel} não pode mudar`);
  assert.deepEqual(Object.keys(after).filter((f) => /^(Pilares|Memoria|Ativos)\//.test(f)).sort(), Object.keys(data).sort(), 'nada é criado dentro das pastas de dados');

  // O cérebro: as duas camadas, os fatos lidos do META.md e os pilares que existem.
  const cerebro = read(dir, cli.CEREBRO_PATH);
  assert.ok(cli.hasBrainLayers(cerebro));
  const business = cli.extractRegion(cerebro, cli.BUSINESS_START, cli.BUSINESS_END);
  assert.ok(business.includes('**Estúdio Lumen — Fotografia e Vídeo Corporativo** (Fotografia e produção audiovisual corporativa)'), business);
  assert.ok(business.includes('- **Onboarding realizado em:** 2026-01-15') && business.includes('- **Próxima revisão sugerida:** 2027-01-15'), business);
  const listed = [...business.matchAll(/^- `([^`]+)`/gm)].map((m) => m[1]);
  assert.deepEqual(listed, fs.readdirSync(path.join(dir, 'Pilares')).sort(), 'a lista de pilares é a dos arquivos que existem');
  assert.ok(business.includes('- `02_Cultura.md` — Cultura, valores, equipe'), 'com os tópicos do mapa do META.md: ' + business);
  assert.ok(!business.includes('REVISAR'), 'nada foi marcado: tudo estava escrito na pasta');
  const framework = fs.readFileSync(path.join(ROOT, cli.BRAIN_FRAMEWORK_REL_PATH), 'utf8').trim();
  assert.equal(cli.extractRegion(cerebro, cli.FRAMEWORK_START, cli.FRAMEWORK_END).trim(), framework, 'as regras são as desta versão');

  // O resto do Córtex: habilidades, arquivos que a IA lê (sem variável por preencher), bilhete e versão.
  assert.ok(fs.existsSync(path.join(dir, '.agents', 'skills', 'radar', 'SKILL.md')));
  assert.deepEqual(cli.findMissingFrameworkFiles(dir, ROOT), { wholeFolder: false, missing: [] });
  for (const f of [cli.CEREBRO_PATH, 'AGENTS.md', 'GEMINI.md', 'CLAUDE.md']) {
    assert.ok(!/\{\{|\}\}/.test(read(dir, f)), `${f} não pode ter variável do molde`);
  }
  assert.ok(read(dir, 'AGENTS.md').includes('ARQUIVO GERADO PELO CÓRTEX') && read(dir, 'AGENTS.md').includes('Estúdio Lumen'));
  assert.ok(/^@AGENTS\.md$/m.test(read(dir, 'CLAUDE.md')));
  assert.ok(fs.existsSync(path.join(dir, 'COMECE-AQUI.txt')) && read(dir, '.gitignore').includes('/Pilares/*'));
  assert.equal(cli.readVersionFile(dir).version, cli.VERSION);

  // Termina dizendo, em duas linhas, o que fazer na ferramenta de IA.
  const tail = r.stdout.trimEnd().split('\n').slice(-2).join('\n');
  assert.ok(tail.includes('abra esta pasta no seu aplicativo de IA') && tail.includes('"revisar córtex"'), tail);

  // Daí em diante é um Córtex comum: o doctor passa e o update seguinte não refaz o cérebro.
  const doctor = run(['doctor', '.', '--offline'], dir);
  assert.equal(doctor.status, 0, doctor.stdout);
  assert.ok(!doctor.stdout.includes('Instalação incompleta') && doctor.stdout.includes('com camadas'), doctor.stdout);
  r = run(['update', '.', '--force'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.ok(!r.stdout.includes('reconstruído'), r.stdout);
  assert.equal(read(dir, cli.CEREBRO_PATH), cerebro);
});

test('update numa pasta que só tem os dados: o que não está escrito vira <!-- REVISAR -->, nunca um nome ou uma data inventados', () => {
  // O índice existe, mas sem cabeçalho preenchido (aqui, o molde ainda com os colchetes) e sem pilares.
  const dir = mkTmpDir();
  const metaTemplate = read(ROOT, path.join('.agents', 'skills', 'cortex-onboarding', 'templates', 'Memoria', 'META.md'));
  write(dir, 'Memoria/META.md', metaTemplate);

  const r = run(['update', '.', '--force'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.equal(read(dir, 'Memoria/META.md'), metaTemplate);
  const business = cli.extractRegion(read(dir, cli.CEREBRO_PATH), cli.BUSINESS_START, cli.BUSINESS_END);
  assert.ok(business.includes('**Agente Sócio** de **<!-- REVISAR -->** (<!-- REVISAR -->).'), business);
  assert.ok(business.includes('- **Onboarding realizado em:** <!-- REVISAR -->\n- **Próxima revisão sugerida:** <!-- REVISAR -->'), business);
  assert.ok(/## Pilares deste negócio\n\n<!-- REVISAR -->\n/.test(business), business);
  assert.ok(!/\[Nome do negócio\]|\[Setor|\d{4}-\d{2}-\d{2}/.test(business), 'nem o texto do molde, nem uma data qualquer: ' + business);
  for (const f of [cli.CEREBRO_PATH, 'AGENTS.md', 'GEMINI.md']) {
    assert.ok(!/\{\{|\}\}/.test(read(dir, f)), `${f} não pode ter variável do molde`);
    assert.equal((read(dir, f).match(/<!-- REVISAR -->/g) || []).length, 5, `${f}: um marcador exato por fato que faltou`);
  }
  assert.ok(r.stdout.includes('5 itens: nome do negócio, setor, data da montagem, data da próxima revisão, lista de pilares'), r.stdout);
  assert.ok(r.stdout.trimEnd().split('\n').slice(-2).join('\n').includes('"revisar córtex"'), r.stdout);

  // O que o .cortex/meta.json sabe vale antes do META.md; uma data fora do formato não é aproveitada.
  const withMeta = mkTmpDir();
  write(withMeta, 'Memoria/META.md', '# META\n\n**Negócio:** Nome do índice\n**Setor:** Padaria\n**Onboarding realizado em:** mês passado\n');
  write(withMeta, '.cortex/meta.json', JSON.stringify({ businessName: 'Padaria da Vila', nextReview: '2027-05-10' }));
  const built = cli.buildBrainFromData(withMeta, ROOT);
  const region = cli.extractRegion(built.content, cli.BUSINESS_START, cli.BUSINESS_END);
  assert.ok(region.includes('**Padaria da Vila** (Padaria)') && region.includes('**Próxima revisão sugerida:** 2027-05-10'), region);
  assert.ok(region.includes('**Onboarding realizado em:** <!-- REVISAR -->'), region);
  assert.deepEqual(built.missing, ['data da montagem', 'lista de pilares']);

  // O nome de um arquivo entra na lista como é: o que parece variável dentro dele não é trocado.
  write(withMeta, 'Pilares/nota {{SETOR}} {{OUTRA}}.md', '# Nota\n');
  const listed = cli.extractRegion(cli.buildBrainFromData(withMeta, ROOT).content, cli.BUSINESS_START, cli.BUSINESS_END);
  assert.ok(listed.includes('- `nota {{SETOR}} {{OUTRA}}.md`') && listed.includes('**Padaria da Vila** (Padaria)'), listed);

  // A skill de revisão sabe o que fazer com esses marcadores.
  const revisao = read(ROOT, path.join('.agents', 'skills', 'cortex-revisao', 'SKILL.md'));
  assert.ok(/If that region holds `<!-- REVISAR -->` markers[^\n]*ask the user for each missing fact[^\n]*never a guess[^\n]*`Memoria\/META\.md`/.test(revisao), 'a revisão completa o que o update marcou no cérebro');
});

test('update numa pasta com os dados e uma .agents/ antiga, mas sem cérebro: reconstrói, guarda a .agents/ de antes e mantém a skill do dono', () => {
  const dir = dataOnly();
  cli.copyRecursiveSync(path.join(ROOT, '.agents'), path.join(dir, '.agents'));
  write(dir, '.agents/skills/radar/SKILL.md', 'radar editado por mim\n');
  write(dir, '.agents/skills/minha/SKILL.md', '# minha skill\n');
  write(dir, 'COMECE-AQUI.txt', 'minhas anotações\n');
  assert.equal(cli.needsBrainRebuild(dir), true);
  assert.ok(run(['doctor', '.', '--offline'], dir).stdout.includes('npx @aksp/cortex@latest update --force'), 'o doctor aponta o comando mesmo com a .agents/ inteira');

  const r = run(['update', '.', '--force'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.ok(fs.existsSync(path.join(dir, cli.CEREBRO_PATH)) && read(dir, 'AGENTS.md').includes('Estúdio Lumen'));
  assert.equal(read(dir, '.agents/skills/minha/SKILL.md'), '# minha skill\n');
  assert.notEqual(read(dir, '.agents/skills/radar/SKILL.md'), 'radar editado por mim\n');
  const [kept] = backupsOf(dir, 'update');
  assert.ok(kept, 'a .agents/ de antes ganha cópia');
  assert.equal(read(path.join(dir, cli.BACKUPS_REL, kept), 'agents/skills/radar/SKILL.md'), 'radar editado por mim\n');
  assert.equal(read(dir, 'COMECE-AQUI.txt'), 'minhas anotações\n', 'um COMECE-AQUI.txt do dono não é trocado');

  // Sem cérebro e sem Memoria/META.md não é um Córtex: o update continua recusando.
  const other = mkTmpDir();
  write(other, 'Pilares/01_Estrategia.md', '# Estratégia\n');
  const refused = run(['update', '.', '--force'], other);
  assert.equal(refused.status, 1, refused.stdout + refused.stderr);
  assert.deepEqual(fs.readdirSync(other), ['Pilares']);
});
