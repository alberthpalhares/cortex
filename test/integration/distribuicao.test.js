const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { spawnSync } = require('child_process');

// Os testes nunca consultam o npm (o doctor e o update fariam isso).
process.env.CORTEX_NO_UPDATE_CHECK = '1';
const { mkTmpDir } = require('../support/tmp');
const zip = require('../../scripts/build-zip.js');
const { extractNotes } = require('../../scripts/release-notes.js');

// Distribuição: o bilhete COMECE-AQUI.txt, as pastas prontas para baixar (ZIPs)
// e o workflow que publica uma versão a partir da tag.

const ROOT = path.join(__dirname, '..', '..');
const CLI = path.join(ROOT, 'bin', 'cli.js');
const PKG = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const run = (args, cwd) => spawnSync(process.execPath, [CLI, ...args], { cwd, encoding: 'utf8' });
const read = (dir, f) => fs.readFileSync(path.join(dir, f), 'utf8');

const START_HERE = 'COMECE-AQUI.txt';
const START_HERE_SRC = path.join('.agents', 'cortex', START_HERE);
const BOM = '﻿';

function installed() {
  const dir = mkTmpDir();
  const r = run(['init', '.', '--force'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  return dir;
}

// ── COMECE-AQUI.txt ───────────────────────────────────────────────

test('init deixa o COMECE-AQUI.txt na raiz, com os acentos legíveis em qualquer Bloco de Notas', () => {
  const dir = mkTmpDir();
  const r = run(['init', '.', '--force'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const root = read(dir, START_HERE);
  assert.ok(root.startsWith(BOM), 'a cópia da raiz leva a marca UTF-8 (BOM)');
  assert.equal(root.slice(1), read(dir, START_HERE_SRC), 'a cópia da raiz é o texto que vem com o framework');
  assert.ok(r.stdout.includes(START_HERE), 'o init avisa que o arquivo existe');
});

test('init nunca troca um COMECE-AQUI.txt que já era do usuário', () => {
  const dir = mkTmpDir();
  fs.writeFileSync(path.join(dir, START_HERE), 'minhas anotações\n');
  const r = run(['init', '.', '--force'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.equal(read(dir, START_HERE), 'minhas anotações\n');
  assert.ok(r.stdout.includes(`${START_HERE} já existia e foi mantido`), r.stdout);
});

test('update renova o COMECE-AQUI.txt intacto, cria em instalação antiga e respeita o editado e o apagado', () => {
  const fresh = fs.readFileSync(path.join(ROOT, START_HERE_SRC), 'utf8');
  const old = 'CÓRTEX — COMECE AQUI (texto da versão anterior)\n';

  // Intacto (igual ao da versão anterior, aqui em CRLF como o Bloco de Notas salvaria): é renovado.
  let dir = installed();
  fs.writeFileSync(path.join(dir, START_HERE_SRC), old);
  fs.writeFileSync(path.join(dir, START_HERE), BOM + old.replace(/\n/g, '\r\n'));
  let r = run(['update', '.', '--force'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.equal(read(dir, START_HERE), BOM + fresh);

  // Editado pelo dono: fica como está, e o update diz isso.
  dir = installed();
  fs.writeFileSync(path.join(dir, START_HERE_SRC), old);
  fs.writeFileSync(path.join(dir, START_HERE), BOM + old + 'Telefone do contador: ramal 12\n');
  r = run(['update', '.', '--force'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.ok(read(dir, START_HERE).includes('ramal 12'), 'o texto do dono não pode ser trocado');
  assert.ok(r.stdout.includes(`${START_HERE}: o seu foi mantido`), r.stdout);
  assert.equal(read(dir, START_HERE_SRC), fresh, 'a versão nova fica disponível em .agents/cortex/');

  // Apagado pelo dono: não volta.
  dir = installed();
  fs.writeFileSync(path.join(dir, START_HERE_SRC), old);
  fs.rmSync(path.join(dir, START_HERE));
  r = run(['update', '.', '--force'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.ok(!fs.existsSync(path.join(dir, START_HERE)));

  // Instalação anterior à v1.6.0 (o framework não trazia o arquivo): ganha a folha.
  dir = installed();
  fs.rmSync(path.join(dir, START_HERE_SRC));
  fs.rmSync(path.join(dir, START_HERE));
  r = run(['update', '.', '--force'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.equal(read(dir, START_HERE), BOM + fresh);
});

test('COMECE-AQUI.txt: texto simples, e toda frase do dia a dia existe na skill ajuda', () => {
  const text = fs.readFileSync(path.join(ROOT, START_HERE_SRC), 'utf8');
  assert.ok(!text.includes('\r') && !text.startsWith(BOM), 'a fonte fica em LF e sem BOM (o BOM entra só na cópia da raiz)');
  const long = text.split('\n').filter((line) => line.length > 76);
  assert.deepEqual(long, [], 'linhas curtas, para ler sem quebra automática e imprimir');
  for (const needed of ['Quero montar meu Córtex', 'npx @aksp/cortex@latest update', 'fornecedor da ferramenta de IA']) {
    assert.ok(text.includes(needed), `faltou no ${START_HERE}: ${needed}`);
  }

  // As frases são as linhas com exatamente dois espaços de recuo, na seção própria.
  const section = text.split('FRASES DO DIA A DIA')[1].split('PARA ATUALIZAR')[0];
  const phrases = section.split('\n').filter((line) => /^ {2}\S/.test(line)).map((line) => line.trim());
  for (const expected of ['radar', 'registra que...', 'me lembra de...', 'quanto cobrar por...', 'fechar a semana', 'ajuda', 'novidades']) {
    assert.ok(phrases.includes(expected), `faltou a frase "${expected}"`);
  }
  const ajuda = fs.readFileSync(path.join(ROOT, '.agents', 'skills', 'ajuda', 'SKILL.md'), 'utf8');
  const unknown = phrases.filter((p) => !ajuda.includes(p));
  assert.deepEqual(unknown, [], `frases do ${START_HERE} que a skill ajuda não conhece`);
});

// ── ZIP ───────────────────────────────────────────────────────────

// CRC-32 escrito à parte (sem tabela), para não conferir o script com ele mesmo.
function crc32(buf) {
  let crc = 0xffffffff;
  for (const byte of buf) {
    crc ^= byte;
    for (let k = 0; k < 8; k++) crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Lê um ZIP do jeito que um descompactador lê: fim do arquivo → diretório
// central → cabeçalho local de cada entrada → conteúdo, conferindo o CRC.
function readZip(buf) {
  const eocd = buf.length - 22;
  assert.equal(buf.readUInt32LE(eocd), 0x06054b50, 'registro de fim do diretório central');
  const total = buf.readUInt16LE(eocd + 10);
  assert.equal(buf.readUInt16LE(eocd + 8), total);
  const cdSize = buf.readUInt32LE(eocd + 12);
  const cdOffset = buf.readUInt32LE(eocd + 16);
  assert.equal(cdOffset + cdSize, eocd, 'o diretório central termina onde começa o registro de fim');

  const entries = [];
  let p = cdOffset;
  for (let i = 0; i < total; i++) {
    assert.equal(buf.readUInt32LE(p), 0x02014b50, 'entrada do diretório central');
    const flags = buf.readUInt16LE(p + 8);
    const method = buf.readUInt16LE(p + 10);
    const crc = buf.readUInt32LE(p + 16);
    const csize = buf.readUInt32LE(p + 20);
    const usize = buf.readUInt32LE(p + 24);
    const nlen = buf.readUInt16LE(p + 28);
    const offset = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nlen);
    p += 46 + nlen + buf.readUInt16LE(p + 30) + buf.readUInt16LE(p + 32);

    assert.equal(buf.readUInt32LE(offset), 0x04034b50, `cabeçalho local de ${name}`);
    assert.equal(buf.readUInt16LE(offset + 6), flags);
    assert.equal(buf.readUInt16LE(offset + 8), method);
    assert.equal(buf.readUInt32LE(offset + 14), crc);
    assert.equal(buf.readUInt32LE(offset + 18), csize);
    assert.equal(buf.readUInt32LE(offset + 22), usize);
    const lnlen = buf.readUInt16LE(offset + 26);
    assert.equal(buf.toString('utf8', offset + 30, offset + 30 + lnlen), name);
    const start = offset + 30 + lnlen + buf.readUInt16LE(offset + 28);
    const raw = buf.subarray(start, start + csize);
    assert.ok(method === 0 || method === 8, `método de compressão de ${name}`);
    const data = method === 8 ? zlib.inflateRawSync(raw) : Buffer.from(raw);
    assert.equal(data.length, usize, `tamanho de ${name}`);
    assert.equal(crc32(data), crc, `CRC de ${name}`);
    assert.ok(flags & 0x0800, `${name}: nome marcado como UTF-8`);
    entries.push({ name, data, method });
  }
  assert.equal(p, eocd);
  return entries;
}

test('createZip grava um ZIP que se lê de volta: ordem fixa, UTF-8, CRC e conteúdo', () => {
  const noise = Buffer.alloc(4096);
  for (let i = 0; i < noise.length; i++) noise[i] = (i * 7919 + (i >> 3) * 104729) % 251 ^ (i % 13);
  const source = [
    { name: 'pasta/sub/texto.md', data: Buffer.from('linha\n'.repeat(500)) },
    { name: 'Memória/ação.md', data: Buffer.from('decisão de preço: R$ 1.500\n') },
    { name: 'Pilares/.gitkeep', data: Buffer.alloc(0) },
    { name: 'ruido.bin', data: zlib.deflateRawSync(noise) },
    { name: '.agents/a.md', data: Buffer.from('a') },
  ];
  const buf = zip.createZip(source);
  const entries = readZip(buf);

  const names = source.map((e) => e.name).sort((a, b) => (a < b ? -1 : 1));
  assert.deepEqual(entries.map((e) => e.name), names, 'entradas em ordem alfabética, seja qual for a ordem de entrada');
  for (const e of source) {
    assert.deepEqual(entries.find((x) => x.name === e.name).data, e.data, e.name);
  }
  assert.equal(entries.find((e) => e.name === 'pasta/sub/texto.md').method, 8, 'texto é comprimido');
  assert.equal(entries.find((e) => e.name === 'Pilares/.gitkeep').method, 0, 'arquivo vazio é só guardado');
  assert.equal(entries.find((e) => e.name === 'ruido.bin').method, 0, 'o que não encolhe é só guardado');
  assert.equal(zip.crc32(Buffer.from('123456789')), 0xcbf43926, 'valor de conferência conhecido do CRC-32');
  assert.deepEqual(zip.createZip(source.slice().reverse(), new Date(0)), zip.createZip(source, new Date(0)));
});

test('createZip grava a data no horário de Brasília, para o arquivo extraído não aparecer no futuro', () => {
  // O campo de data do ZIP não tem fuso: quem extrai lê como hora local.
  const stamp = (iso) => {
    const buf = zip.createZip([{ name: 'a.txt', data: Buffer.from('oi') }], new Date(iso));
    const time = buf.readUInt16LE(10);
    const date = buf.readUInt16LE(12);
    return [(date >> 9) + 1980, (date >> 5) & 15, date & 31, time >> 11, (time >> 5) & 63, (time & 31) * 2];
  };
  assert.deepEqual(stamp('2026-01-02T12:30:10Z'), [2026, 1, 2, 9, 30, 10]);
  assert.deepEqual(stamp('2026-03-01T01:15:00Z'), [2026, 2, 28, 22, 15, 0], 'antes das 3h UTC ainda é o dia anterior no Brasil');
});

// Gera os dois ZIPs uma única vez, no primeiro teste que precisa deles; os
// testes abaixo leem os mesmos arquivos. Fora do carregamento do arquivo, para
// uma falha aqui não levar junto os testes que não usam os ZIPs.
const outDir = mkTmpDir('cortex-dist-');
const installZip = path.join(outDir, `cortex-${PKG.version}.zip`);
const exampleZip = path.join(outDir, `cortex-exemplo-estudio-lumen-${PKG.version}.zip`);
let builtZips = null;
function zips() {
  if (!builtZips) builtZips = zip.buildZips(outDir);
  return builtZips;
}

// Lista os arquivos de uma pasta sem usar o script que está sendo testado.
function walk(dir, prefix) {
  let out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out = out.concat(walk(path.join(dir, entry.name), rel));
    else out.push(rel);
  }
  return out.sort((a, b) => (a < b ? -1 : 1));
}

test('build-zip recusa montar a pasta pronta com dados de um negócio dentro', () => {
  const clean = mkTmpDir();
  fs.mkdirSync(path.join(clean, 'Pilares'));
  fs.writeFileSync(path.join(clean, 'Pilares', '.gitkeep'), '');
  fs.writeFileSync(path.join(clean, 'AGENTS.md'), '# Córtex — Inicialização\n');
  assert.doesNotThrow(() => zip.assertNoBusinessData(clean), 'só o .gitkeep não é dado de negócio');

  fs.writeFileSync(path.join(clean, 'Pilares', '01_Estrategia.md'), '# Estratégia\n');
  assert.throws(() => zip.assertNoBusinessData(clean), /dados de um negócio[\s\S]*Pilares\/01_Estrategia\.md/);

  const compiled = mkTmpDir();
  fs.writeFileSync(path.join(compiled, 'AGENTS.md'), '<!-- ARQUIVO GERADO PELO CÓRTEX -->\n');
  assert.throws(() => zip.assertNoBusinessData(compiled), /dados de um negócio/, 'cérebro já compilado = Córtex montado');

  // A trava continua ligada ao caminho que gera o ZIP.
  const src = read(ROOT, path.join('scripts', 'build-zip.js'));
  const stage = src.slice(src.indexOf('function stageInstall'), src.indexOf('const EXAMPLE_ZIP_README'));
  assert.ok(stage.includes('assertNoBusinessData(dir)'), 'o stageInstall precisa chamar a trava');
});

test('build-zip gera os dois arquivos com a versão no nome, e dist/ fica fora do git e do npm', () => {
  assert.deepEqual(zips().map((b) => path.basename(b.file)), [path.basename(installZip), path.basename(exampleZip)]);
  assert.ok(/^\/dist\/$/m.test(read(ROOT, '.gitignore')), 'dist/ precisa estar no .gitignore');
  assert.ok(!PKG.files.some((f) => f.startsWith('dist')), 'dist/ não pode entrar no pacote do npm');
  assert.equal(PKG.scripts['build:zip'], 'node scripts/build-zip.js');
});

test('o ZIP de instalação tem exatamente o que o init grava numa pasta vazia', () => {
  zips();
  const dir = installed();
  const expected = walk(dir);
  const entries = readZip(fs.readFileSync(installZip));

  assert.deepEqual(entries.map((e) => e.name), expected);
  assert.ok(expected.includes(START_HERE) && expected.includes('.cortex/version.json') && expected.includes('.gitignore'));
  // O ZIP não guarda pastas vazias: são os .gitkeep que fazem as pastas de dados existirem depois de extrair.
  for (const folder of ['Pilares', 'Memoria', 'Ativos', 'Frameworks']) {
    assert.ok(entries.some((e) => e.name.startsWith(`${folder}/`)), `${folder}/ precisa existir na pasta extraída`);
  }
  assert.ok(entries.every((e) => !e.name.includes('\\') && !e.name.startsWith('/')), 'caminhos com "/" e sem pasta por cima');
  for (const e of entries) {
    if (e.name === '.cortex/version.json') {
      // Com a marca de versão, o `update` reconhece a pasta baixada como uma instalação normal.
      // Sem as datas do dia em que o ZIP foi gerado: senão, meses depois, o radar
      // diria a quem acabou de baixar que faz tempo que o Córtex não é atualizado.
      assert.deepEqual(JSON.parse(e.data.toString('utf8')), { version: PKG.version });
      continue;
    }
    assert.deepEqual(e.data, fs.readFileSync(path.join(dir, e.name)), e.name);
  }
});

// Extrai com a ferramenta do sistema, quando existe uma: é ela (e não o leitor
// acima) que o usuário vai usar.
function systemUnzip(file, dest) {
  let r = spawnSync('unzip', ['-q', file, '-d', dest], { encoding: 'utf8' });
  if (r.error && process.platform === 'win32') {
    // O tar que vem com o Windows 10+ (bsdtar) lê ZIP.
    r = spawnSync('tar', ['-xf', file, '-C', dest], { encoding: 'utf8' });
  }
  return r.error ? null : r;
}

test('o ZIP de instalação abre no descompactador do sistema e a pasta extraída é um Córtex instalado', (t) => {
  zips();
  const dest = mkTmpDir('cortex-unzip-');
  const entries = readZip(fs.readFileSync(installZip));
  const r = systemUnzip(installZip, dest);
  if (r) {
    assert.equal(r.status, 0, r.stdout + r.stderr);
  } else {
    // Sem descompactador, só a extração pelo sistema deixa de ser conferida.
    t.diagnostic('nenhum descompactador (unzip/tar) neste sistema: extraído pelo leitor do teste');
    for (const e of entries) {
      fs.mkdirSync(path.dirname(path.join(dest, e.name)), { recursive: true });
      fs.writeFileSync(path.join(dest, e.name), e.data);
    }
  }
  assert.deepEqual(walk(dest), entries.map((e) => e.name));
  assert.ok(read(dest, 'AGENTS.md').includes('cortex-onboarding'), 'o texto de inicialização chega inteiro');

  // Pasta baixada → montada à mão → update: o caminho de quem começou sem Node e instalou depois.
  fs.copyFileSync(
    path.join(dest, '.agents', 'skills', 'cortex-onboarding', 'resources', 'CORTEX_TEMPLATE.md'),
    path.join(dest, 'Frameworks', 'CEREBRO.md')
  );
  const up = run(['update', '.', '--force'], dest);
  assert.equal(up.status, 0, up.stdout + up.stderr);
  assert.ok(!up.stdout.includes('instalado antes do comando update existir'), up.stdout);
  // É a partir do primeiro update que o radar passa a contar o tempo sem atualizar.
  const stamp = JSON.parse(read(dest, path.join('.cortex', 'version.json')));
  assert.equal(stamp.version, PKG.version);
  assert.ok(stamp.checkedAt, 'o update registra a data da conferência');
});

test('radar: pasta pronta sem data na marca de versão não recebe o lembrete de atualizar', () => {
  const radar = read(ROOT, path.join('.agents', 'skills', 'radar', 'SKILL.md'));
  const rule = radar.split('\n').find((line) => line.includes('`checkedAt`') && line.includes('.cortex/version.json'));
  assert.ok(rule, 'esperava a regra do lembrete de atualizar no radar');
  assert.ok(/has neither date/.test(rule), rule);
});

// ── Exemplo (Estúdio Lumen) ───────────────────────────────────────

test('o ZIP do exemplo abre pronto para dizer "radar": dados + framework + toda skill que o cérebro cita', () => {
  assert.ok(!fs.existsSync(path.join(ROOT, 'examples', 'estudio-lumen', '.agents')), 'o framework não é duplicado dentro do repositório');

  zips();
  const entries = readZip(fs.readFileSync(exampleZip));
  const names = new Set(entries.map((e) => e.name));
  for (const needed of ['AGENTS.md', 'CLAUDE.md', 'GEMINI.md', 'Frameworks/CEREBRO.md', 'Memoria/META.md',
    'Memoria/04_Pessoas_Pendencias.md', '.agents/manifest.json', '.agents/cortex/PROTOCOLO_AUTONOMIA.md', '.cortex/version.json']) {
    assert.ok(names.has(needed), `faltou no ZIP do exemplo: ${needed}`);
  }
  const text = (name) => entries.find((e) => e.name === name).data.toString('utf8');
  assert.deepEqual(JSON.parse(text('.cortex/version.json')), { version: PKG.version }, 'a versão do exemplo é a do pacote, sem data');

  // O README de dentro do ZIP fala com quem já baixou: não manda baixar de novo,
  // não diz que a pasta está incompleta e não promete ferramenta que a pasta não prepara.
  const inside = text('README.md');
  assert.ok(inside.includes('já está completa') && inside.includes('`radar`'), inside);
  for (const wrong of ['Baixe o', 'pasta do repositório', 'npm run', 'Cursor']) {
    assert.ok(!inside.includes(wrong), `o README de dentro do ZIP não pode dizer "${wrong}"`);
  }
  assert.ok(!inside.includes('\r'));
  assert.ok(!names.has('.cursorrules') && !names.has(START_HERE), 'o exemplo não leva o bilhete de quem vai montar do zero');
  assert.deepEqual([...names].filter((n) => n.startsWith('.cortex/backups/')), [], 'montar o exemplo não pode gerar backup');

  const brain = entries.find((e) => e.name === 'AGENTS.md').data.toString('utf8');
  assert.ok(brain.includes('Estúdio Lumen') && brain.includes('ARQUIVO GERADO PELO CÓRTEX'));
  const routed = [...brain.matchAll(/\| `([a-z-]+)`/g)].map((m) => m[1]);
  assert.ok(routed.includes('radar') && routed.length >= 10, 'esperava ler a tabela de skills do cérebro');
  const missing = routed.filter((skill) => !names.has(`.agents/skills/${skill}/SKILL.md`));
  assert.deepEqual(missing, [], 'skills que o cérebro do exemplo manda abrir e não estão no ZIP');

  // Extraído, o exemplo passa no doctor como um Córtex de verdade.
  const dest = mkTmpDir('cortex-exemplo-');
  for (const e of entries) {
    fs.mkdirSync(path.dirname(path.join(dest, e.name)), { recursive: true });
    fs.writeFileSync(path.join(dest, e.name), e.data);
  }
  const r = run(['doctor', '.', '--offline'], dest);
  assert.equal(r.status, 0, r.stdout + r.stderr);
});

test('o README do exemplo não promete "radar" numa pasta sem habilidades', () => {
  const readme = read(ROOT, path.join('examples', 'estudio-lumen', 'README.md'));
  assert.ok(readme.includes('releases/latest/download/cortex-exemplo-estudio-lumen.zip'), 'aponta para o ZIP pronto');
  assert.ok(!readme.includes('copie também a pasta `.agents/`'), 'a montagem à mão deixou de ser o caminho indicado');
});

test('as pastas prontas não citam o Cursor: elas não trazem o arquivo que ele lê', () => {
  // O .cursorrules só nasce com `init --targets=.cursorrules` (pede Node.js) ou na conversa de montagem.
  zips();
  assert.ok(!readZip(fs.readFileSync(installZip)).some((e) => e.name === '.cursorrules'));
  assert.ok(!read(ROOT, START_HERE_SRC).includes('Cursor'), `${START_HERE} vai dentro da pasta pronta`);
  assert.ok(!read(ROOT, path.join('examples', 'estudio-lumen', 'README.md')).includes('Cursor'));
});

// ── Publicação pela tag ───────────────────────────────────────────

test('release-notes: separa a seção da versão e recusa tag diferente do package.json', () => {
  const changelog = '# Changelog\r\n\r\n## [Unreleased]\r\n\r\n## [2.0.0] - 2027-01-01\r\n\r\nResumo.\r\n\r\n### Corrigido\r\n- Item\r\n\r\n## [1.9.0] - 2026-12-01\r\n\r\n- Antigo\r\n';
  assert.equal(extractNotes(changelog, '2.0.0'), 'Resumo.\n\n### Corrigido\n- Item');
  assert.equal(extractNotes(changelog, '1.9.0'), '- Antigo');
  assert.equal(extractNotes(changelog, '3.0.0'), null);

  const script = path.join(ROOT, 'scripts', 'release-notes.js');
  const wrong = spawnSync(process.execPath, [script, 'v0.0.1'], { encoding: 'utf8' });
  assert.equal(wrong.status, 1);
  assert.equal(wrong.stdout, '', 'nada de nota quando a tag está errada');
  assert.ok(wrong.stderr.includes(`v${PKG.version}`), wrong.stderr);

  // O CHANGELOG de verdade: sem a seção da versão do package.json, a tag só
  // falharia lá no workflow, depois da matriz de testes inteira.
  const notes = extractNotes(read(ROOT, 'CHANGELOG.md'), PKG.version);
  assert.ok(notes, `o CHANGELOG.md precisa da seção "## [${PKG.version}]" (não vazia) antes da tag`);
  const right = spawnSync(process.execPath, [script, `v${PKG.version}`], { encoding: 'utf8' });
  assert.equal(right.status, 0, right.stderr);
  assert.equal(right.stdout, notes + '\n');
});

test('release.yml: confere a tag antes de publicar, npm antes da Release, e a Release nasce com os ZIPs', () => {
  const release = read(path.join(ROOT, '.github', 'workflows'), 'release.yml');
  // Só as linhas que rodam: um comando citado num comentário não conta.
  const live = release.split('\n').filter((line) => !/^\s*#/.test(line)).join('\n');
  const job = (name) => {
    const m = new RegExp(`^ {2}${name}:\\n([\\s\\S]*?)(?=^ {2}\\S|(?![\\s\\S]))`, 'm').exec(live);
    assert.ok(m, `o job ${name} existe`);
    return m[1];
  };
  const publish = job('publish');
  const rel = job('release');
  const CHECK = 'node scripts/release-notes.js "$GITHUB_REF_NAME"';

  // Ordem: testes → npm → Release. A pasta pronta nunca fica à frente do `npx @aksp/cortex@latest`.
  assert.ok(/^ {4}needs: test$/m.test(publish), 'o npm só publica depois dos testes');
  assert.ok(/^ {4}needs: \[test, publish\]$/m.test(rel), 'a Release (com os ZIPs) só sai depois do npm');

  // npm: tag conferida antes, publicação com atestado, e rodar de novo não falha.
  const publishAt = publish.indexOf('npm publish');
  assert.ok(publish.indexOf(CHECK) !== -1 && publish.indexOf(CHECK) < publishAt, 'a tag é conferida antes do "npm publish"');
  assert.ok(/npm publish .*--provenance/.test(publish), 'publicação com atestado de procedência');
  const already = publish.indexOf('npm view "$NAME@$VERSION" version');
  assert.ok(already !== -1 && already < publishAt && /já está no npm[\s\S]*?exit 0/.test(publish), 'versão já publicada: avisa e termina sem erro');

  // Release: notas do CHANGELOG, tag existente e os dois ZIPs no próprio comando
  // que cria (o gh só publica depois de enviar os anexos).
  assert.ok(rel.includes(`${CHECK} > "$RUNNER_TEMP/notas.md"`), 'as notas da Release vêm do CHANGELOG');
  const create = rel.split('\n').find((line) => line.includes('gh release create'));
  assert.ok(create && rel.indexOf(CHECK) < rel.indexOf('gh release create'), 'a tag é conferida antes de criar a Release');
  for (const needed of ['"$GITHUB_REF_NAME"', 'dist/cortex.zip', 'dist/cortex-exemplo-estudio-lumen.zip', '--verify-tag', '--notes-file "$RUNNER_TEMP/notas.md"']) {
    assert.ok(create.includes(needed), `"gh release create" precisa de ${needed}`);
  }
  assert.ok(!/--draft|--prerelease/.test(create), 'a Release criada é a publicada');

  // Rodar de novo: a Release que já existe (ou o rascunho que ficou pela metade)
  // recebe os anexos e é publicada; nunca se cria uma segunda.
  const step = rel.slice(rel.indexOf('if gh release view "$GITHUB_REF_NAME"'));
  const order = ['if gh release view "$GITHUB_REF_NAME"', 'gh release upload "$GITHUB_REF_NAME" dist/cortex.zip dist/cortex-exemplo-estudio-lumen.zip --clobber',
    'gh release edit "$GITHUB_REF_NAME" --draft=false', 'else', 'gh release create', 'fi'].map((part) => step.indexOf(part));
  assert.ok(order.every((at, i) => at !== -1 && (i === 0 || at > order[i - 1])), `ordem do passo da Release: ${order}`);
  assert.ok(/^ {6}contents: write$/m.test(rel) && !/contents: write/.test(publish), 'só o job da Release escreve no repositório');
});

test('os workflows só chamam scripts, comandos e arquivos que existem', () => {
  const dir = path.join(ROOT, '.github', 'workflows');
  const files = fs.readdirSync(dir).filter((f) => /\.ya?ml$/.test(f));
  assert.ok(files.includes('ci.yml') && files.includes('release.yml'));

  for (const file of files) {
    const text = read(dir, file);
    assert.ok(!text.includes('\t') && !text.includes('\r'), `${file}: sem tabulação e em LF`);
    for (const m of text.matchAll(/node (scripts\/[\w.-]+\.js)/g)) {
      assert.ok(fs.existsSync(path.join(ROOT, m[1])), `${file} chama ${m[1]}, que não existe`);
    }
    for (const m of text.matchAll(/npm run ([\w:-]+)/g)) {
      assert.ok(PKG.scripts[m[1]], `${file} chama "npm run ${m[1]}", que não está no package.json`);
    }
    for (const m of text.matchAll(/uses: \.\/(\S+)/g)) {
      assert.ok(fs.existsSync(path.join(ROOT, m[1])), `${file} usa ${m[1]}, que não existe`);
    }
  }

  assert.ok(/^ {2}workflow_call:/m.test(read(dir, 'ci.yml')), 'o ci.yml precisa aceitar ser chamado pelo release.yml');
  assert.ok(/^ {2}push:\n {4}branches:/m.test(read(dir, 'ci.yml')), 'o CI de push/PR continua existindo');

  const release = read(dir, 'release.yml');
  assert.ok(/^ {2}push:\n {4}tags: \['v\*'\]/m.test(release), 'dispara em tags v*');
  assert.ok(release.includes('id-token: write'), 'publicação por OIDC (Trusted Publishing)');
  assert.ok(!/NPM_TOKEN|NODE_AUTH_TOKEN/.test(release), 'nenhum token de longa duração');

  // Os nomes que o workflow copia são os que o build-zip gera; os anexos de nome
  // fixo são os que o README e o exemplo divulgam.
  const produced = zips().map((b) => path.basename(b.file));
  const copied = [...release.matchAll(/cp "dist\/([^"]+)" dist\/(\S+)/g)];
  assert.equal(copied.length, 2);
  for (const [, from, to] of copied) {
    assert.ok(produced.includes(from.replace('${GITHUB_REF_NAME#v}', PKG.version)), `o build-zip não gera ${from}`);
    assert.ok(release.includes(`dist/${to}`) && release.split(`dist/${to}`).length > 2, `${to} precisa ser anexado à Release`);
    const doc = to.includes('exemplo') ? path.join('examples', 'estudio-lumen', 'README.md') : 'README.md';
    assert.ok(read(ROOT, doc).includes(`releases/latest/download/${to}`), `${doc} deveria apontar para ${to}`);
  }
  const guide = read(ROOT, 'CONTRIBUTING.md');
  assert.ok(guide.includes('release.yml'), 'o checklist de release explica a publicação pela tag');
  // O README novo aponta para anexos que só existem depois da Release: a tag vai antes do master.
  const tagPush = guide.indexOf('git push origin v');
  assert.ok(tagPush !== -1 && guide.indexOf('git push origin master', tagPush) > tagPush, 'o master só é enviado depois da tag');
  assert.ok(/README\.md` novo e a tag saem juntos/.test(guide), 'o checklist avisa que o README e a tag saem juntos');
});

test('os testes apagam as pastas temporárias que criam', () => {
  const helper = path.join(ROOT, 'test', 'support', 'tmp.js');
  const code = `const d = require(${JSON.stringify(helper)}).mkTmpDir('cortex-limpeza-'); require('fs').writeFileSync(require('path').join(d, 'a.txt'), 'x'); console.log(d);`;
  const script = path.join(mkTmpDir(), 'filho.js');
  fs.writeFileSync(script, code);
  const env = { ...process.env };
  delete env.CORTEX_KEEP_TMP;
  const r = spawnSync(process.execPath, [script], { encoding: 'utf8', env });
  assert.equal(r.status, 0, r.stderr);
  const made = r.stdout.trim();
  assert.ok(path.basename(made).startsWith('cortex-limpeza-'), made);
  assert.ok(!fs.existsSync(made), 'a pasta criada pelo processo de teste deveria ter sido apagada na saída');

  const kept = spawnSync(process.execPath, [script], { encoding: 'utf8', env: { ...env, CORTEX_KEEP_TMP: '1' } });
  assert.ok(fs.existsSync(kept.stdout.trim()), 'CORTEX_KEEP_TMP=1 deixa a pasta para investigar');
  fs.rmSync(kept.stdout.trim(), { recursive: true, force: true });
});
