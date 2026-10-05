const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { mkTmpDir } = require('../support/tmp');

// Os testes nunca consultam o npm: o aviso de versão nova é exercitado só offline.
process.env.CORTEX_NO_UPDATE_CHECK = '1';
const cli = require('../../bin/cli.js');

const ROOT = path.join(__dirname, '..', '..');
const CLI = path.join(ROOT, 'bin', 'cli.js');
const run = (args, cwd) => spawnSync(process.execPath, [CLI, ...args], { cwd, encoding: 'utf8' });
const novidadesPath = (dir) => path.join(dir, '.cortex', 'novidades.md');

function setVersion(dir, version) {
  fs.writeFileSync(
    path.join(dir, '.cortex', 'version.json'),
    JSON.stringify({ version, updatedAt: '2026-01-01T00:00:00.000Z' }, null, 2) + '\n'
  );
}

test('novidades.json é válido e toda entrada tem versão, texto e frase', () => {
  const entries = JSON.parse(fs.readFileSync(path.join(ROOT, cli.NOVIDADES_SRC_REL_PATH), 'utf8'));
  assert.ok(Array.isArray(entries) && entries.length > 0);
  for (const e of entries) {
    assert.match(e.version, /^\d+\.\d+\.\d+$/);
    assert.ok(e.texto && e.diga, `entrada incompleta: ${JSON.stringify(e)}`);
    assert.ok(cli.compareVersions(e.version, cli.VERSION) <= 0, `novidade de versão futura: ${e.version}`);
  }
});

test('selectNovidades pega só o que é mais novo que a versão instalada', () => {
  const entries = [
    { version: '1.3.0', texto: 'a' },
    { version: '1.4.0', texto: 'b' },
    { version: '1.5.0', texto: 'c' },
    { version: '1.4.0' }
  ];
  assert.deepEqual(cli.selectNovidades(entries, '1.3.0', '1.4.0').map((e) => e.texto), ['b']);
  assert.deepEqual(cli.selectNovidades(entries, '0.0.0', '1.4.0').map((e) => e.texto), ['a', 'b']);
  assert.deepEqual(cli.selectNovidades(entries, '1.4.0', '1.4.0'), []);
  assert.deepEqual(cli.selectNovidades(null, '1.0.0', '2.0.0'), []);
});

test('update vindo de versão antiga grava .cortex/novidades.md e mostra no terminal', () => {
  const dir = mkTmpDir();
  assert.equal(run(['init', '.', '--force'], dir).status, 0);
  setVersion(dir, '1.3.0');
  fs.rmSync(path.join(dir, '.agents', 'skills', 'novidades'), { recursive: true, force: true });

  const r = run(['update', '.', '--force'], dir);
  assert.equal(r.status, 0, r.stderr);
  assert.ok(r.stdout.includes('O que há de novo'), r.stdout);

  const content = fs.readFileSync(novidadesPath(dir), 'utf8');
  assert.ok(content.includes('descobrir minha margem'), 'novidade da 1.4.0 deve aparecer');
  assert.ok(!content.includes('fechar a semana'), 'novidade da 1.3.0 já era conhecida');
  assert.ok(fs.existsSync(path.join(dir, '.agents', 'skills', 'novidades', 'SKILL.md')));
});

test('novidades ainda não vistas de um update anterior são mantidas, sem duplicar', () => {
  const dir = mkTmpDir();
  fs.mkdirSync(path.join(dir, '.cortex'), { recursive: true });
  const antiga = '- Uma novidade antiga que o usuário ainda não viu';
  fs.writeFileSync(novidadesPath(dir), `# Novidades\n\n${antiga}\n`);

  cli.writeNovidades(dir, ROOT, '1.3.0', cli.VERSION);
  cli.writeNovidades(dir, ROOT, '1.3.0', cli.VERSION);

  const lines = fs.readFileSync(novidadesPath(dir), 'utf8').split('\n').filter((l) => l.startsWith('- '));
  assert.ok(lines.includes(antiga));
  assert.equal(new Set(lines).size, lines.length, 'não pode haver linha repetida');
});

test('update sem nada de novo para contar não cria o arquivo de novidades', () => {
  const dir = mkTmpDir();
  assert.deepEqual(cli.writeNovidades(dir, ROOT, cli.VERSION, cli.VERSION), []);
  assert.ok(!fs.existsSync(novidadesPath(dir)));
});

test('update na mesma versão registra checkedAt sem mexer em updatedAt', () => {
  const dir = mkTmpDir();
  assert.equal(run(['init', '.', '--force'], dir).status, 0);
  setVersion(dir, cli.VERSION);

  assert.equal(run(['update', '.'], dir).status, 0);
  const v = cli.readVersionFile(dir);
  assert.equal(v.updatedAt, '2026-01-01T00:00:00.000Z');
  assert.ok(v.checkedAt && v.checkedAt > v.updatedAt);
});

test('fetchLatestVersion devolve null quando a consulta está desligada', async () => {
  assert.equal(await cli.fetchLatestVersion(), null);
});

test('doctor mostra a versão instalada mesmo sem consultar o npm', () => {
  const r = run(['doctor', path.join(ROOT, 'examples', 'estudio-lumen')], ROOT);
  assert.equal(r.status, 0, r.stderr);
  assert.ok(!r.stdout.includes('já existe a v'), 'offline não pode anunciar versão nova');
});
