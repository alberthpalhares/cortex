const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { spawnSync } = require('child_process');

test('.agents/manifest.json commitado está em dia com a árvore de arquivos (rode "npm run build:manifest" se falhar)', () => {
  const script = path.join(__dirname, '..', '..', 'scripts', 'build-manifest.js');
  const result = spawnSync(process.execPath, [script, '--check'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stdout + result.stderr);
});
