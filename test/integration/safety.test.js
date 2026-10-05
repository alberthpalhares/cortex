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

test('backups: guarda só os 3 mais recentes', () => {
  const dir = mkTmpDir();
  const base = path.join(dir, cli.BACKUPS_REL);
  for (const d of ['update-2026-01-01T00-00-00-000Z', 'update-2026-02-01T00-00-00-000Z', 'init-2026-03-01T00-00-00-000Z',
    'update-2026-04-01T00-00-00-000Z', 'update-2026-05-01T00-00-00-000Z']) {
    fs.mkdirSync(path.join(base, d), { recursive: true });
  }
  const removidos = cli.pruneBackups(dir, 3);
  assert.equal(removidos, 2);
  assert.deepEqual(fs.readdirSync(base).sort(), [
    'init-2026-03-01T00-00-00-000Z', 'update-2026-04-01T00-00-00-000Z', 'update-2026-05-01T00-00-00-000Z'
  ]);
});

test('compareVersions', () => {
  assert.equal(cli.compareVersions('1.3.0', '1.2.9'), 1);
  assert.equal(cli.compareVersions('1.2.0', '1.10.0'), -1);
  assert.equal(cli.compareVersions('1.3.0', '1.3.0'), 0);
});
