const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { mkTmpDir } = require('../support/tmp');
const cli = require('../../bin/cli.js');

function writeManifest(rootDir, version, files) {
  const dir = path.join(rootDir, '.agents');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify({ version, files }, null, 2));
}

test('classifyPreserved separa arquivos descontinuados pelo framework de customizações do usuário', () => {
  const templateDir = mkTmpDir();
  const targetDir = mkTmpDir();

  // O manifesto instalado (versão antiga) listava "old" como skill do framework.
  writeManifest(targetDir, '0.9.0', [
    '.agents/skills/old/SKILL.md',
    '.agents/skills/kept/SKILL.md'
  ]);

  // O manifesto atual (template/CLI instalado agora) já não lista "old" —
  // o framework a descontinuou nesta versão.
  writeManifest(templateDir, '0.10.0', ['.agents/skills/kept/SKILL.md']);

  const preservados = [
    '.agents/skills/old/SKILL.md',  // era do framework, foi descontinuada
    '.agents/skills/mine/SKILL.md'  // nunca esteve em nenhum manifesto — é do usuário
  ];

  const { removidosPeloFramework, personalizados } = cli.classifyPreserved(preservados, targetDir, templateDir);

  assert.deepEqual(removidosPeloFramework, ['.agents/skills/old/SKILL.md']);
  assert.deepEqual(personalizados, ['.agents/skills/mine/SKILL.md']);
});

test('classifyPreserved trata tudo como customização quando não há manifesto instalado (instalação legada)', () => {
  const templateDir = mkTmpDir();
  const targetDir = mkTmpDir(); // sem manifesto em nenhum dos dois lados

  const preservados = ['.agents/skills/qualquer/SKILL.md'];
  const { removidosPeloFramework, personalizados } = cli.classifyPreserved(preservados, targetDir, templateDir);

  assert.deepEqual(removidosPeloFramework, []);
  assert.deepEqual(personalizados, preservados);
});

test('pruneDeprecatedFiles remove apenas os arquivos indicados', () => {
  const targetDir = mkTmpDir();
  const filePath = path.join(targetDir, '.agents', 'skills', 'old', 'SKILL.md');
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, 'skill antiga');

  cli.pruneDeprecatedFiles(targetDir, ['.agents/skills/old/SKILL.md']);

  assert.equal(fs.existsSync(filePath), false);
});
