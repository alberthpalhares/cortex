const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { mkTmpDir } = require('../support/tmp');
const cli = require('../../bin/cli.js');

// diffFrameworkLayer/classifyPreserved são funções puras — testadas aqui com
// pastas .agents/ fabricadas em diretórios temporários isolados, sem depender
// do template real do projeto (isso é coberto pelos testes de integração).

test('diffFrameworkLayer classifica novos, alterados, sem-mudança e preservados', () => {
  const templateDir = mkTmpDir();
  const targetDir = mkTmpDir();

  // Template (pacote instalado) só conhece as skills "a" e "b".
  fs.mkdirSync(path.join(templateDir, '.agents', 'skills', 'a'), { recursive: true });
  fs.writeFileSync(path.join(templateDir, '.agents', 'skills', 'a', 'SKILL.md'), 'v2 do template');
  fs.mkdirSync(path.join(templateDir, '.agents', 'skills', 'b'), { recursive: true });
  fs.writeFileSync(path.join(templateDir, '.agents', 'skills', 'b', 'SKILL.md'), 'sem mudança');

  // Projeto do usuário: "a" está desatualizada, "b" idêntica, "c" é uma
  // customização própria do usuário que não existe no template, e "d" é
  // um arquivo que o template ainda não conhece (skill nova a instalar).
  fs.mkdirSync(path.join(targetDir, '.agents', 'skills', 'a'), { recursive: true });
  fs.writeFileSync(path.join(targetDir, '.agents', 'skills', 'a', 'SKILL.md'), 'v1 antiga do usuário');
  fs.mkdirSync(path.join(targetDir, '.agents', 'skills', 'b'), { recursive: true });
  fs.writeFileSync(path.join(targetDir, '.agents', 'skills', 'b', 'SKILL.md'), 'sem mudança');
  fs.mkdirSync(path.join(targetDir, '.agents', 'skills', 'c'), { recursive: true });
  fs.writeFileSync(path.join(targetDir, '.agents', 'skills', 'c', 'SKILL.md'), 'minha skill própria');

  fs.mkdirSync(path.join(templateDir, '.agents', 'skills', 'd'), { recursive: true });
  fs.writeFileSync(path.join(templateDir, '.agents', 'skills', 'd', 'SKILL.md'), 'skill nova no template');

  const { novos, alterados, semMudanca, preservados } = cli.diffFrameworkLayer(templateDir, targetDir);

  assert.deepEqual(novos, ['.agents/skills/d/SKILL.md']);
  assert.deepEqual(alterados, ['.agents/skills/a/SKILL.md']);
  assert.deepEqual(semMudanca, ['.agents/skills/b/SKILL.md']);
  assert.deepEqual(preservados, ['.agents/skills/c/SKILL.md']);
});

test('applyFrameworkUpdate copia apenas os arquivos novos e alterados', () => {
  const templateDir = mkTmpDir();
  const targetDir = mkTmpDir();

  fs.mkdirSync(path.join(templateDir, '.agents', 'skills', 'a'), { recursive: true });
  fs.writeFileSync(path.join(templateDir, '.agents', 'skills', 'a', 'SKILL.md'), 'conteúdo novo');
  fs.mkdirSync(path.join(targetDir, '.agents', 'skills', 'a'), { recursive: true });
  fs.writeFileSync(path.join(targetDir, '.agents', 'skills', 'a', 'SKILL.md'), 'conteúdo antigo');

  cli.applyFrameworkUpdate(templateDir, targetDir, [], ['.agents/skills/a/SKILL.md']);

  const result = fs.readFileSync(path.join(targetDir, '.agents', 'skills', 'a', 'SKILL.md'), 'utf8');
  assert.equal(result, 'conteúdo novo');
});
