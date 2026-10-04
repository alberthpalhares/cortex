const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { mkTmpDir } = require('../support/tmp');
const cli = require('../../bin/cli.js');

test('frontmatter: objeto em bloco YAML é lido como objeto (não como null)', () => {
  const fm = cli.parseSimpleFrontmatter('---\nmargem_alvo: 30\ncustos_variaveis:\n  fotografia: 150\n  "video": 800\ncusto_variavel_padrao: null\n---\n# Financeiro\n');
  assert.deepEqual(fm.custos_variaveis, { fotografia: 150, video: 800 });
  assert.equal(fm.margem_alvo, 30);
  assert.equal(fm.custo_variavel_padrao, null);
});

test('frontmatter: objeto em linha (JSON) é lido como objeto; {} continua vazio', () => {
  assert.deepEqual(cli.parseSimpleFrontmatter('---\ncustos_variaveis: {"a": 10}\n---\n').custos_variaveis, { a: 10 });
  assert.deepEqual(cli.parseSimpleFrontmatter('---\ncustos_variaveis: {}   # comentário\n---\n').custos_variaveis, {});
});

test('frontmatter: BOM do Bloco de Notas e # dentro de valor não quebram a leitura', () => {
  const fm = cli.parseSimpleFrontmatter('﻿---\nmargem_alvo: null\nnome: Loja#1\n---\n');
  assert.equal(fm.margem_alvo, null);
  assert.equal(fm.nome, 'Loja#1');
});

test('frontmatter: um --- no meio do texto não é tomado como fechamento', () => {
  const fm = cli.parseSimpleFrontmatter('---\nmargem_alvo: 20\n---\n\ntexto\n\n---\n\nmais texto\n');
  assert.deepEqual(fm, { margem_alvo: 20 });
});

test('listRealFiles não lista o próprio Memoria/META.md (ele é o índice)', () => {
  const dir = mkTmpDir();
  fs.mkdirSync(path.join(dir, 'Memoria'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'Pilares'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'Memoria', 'META.md'), '# META');
  fs.writeFileSync(path.join(dir, 'Memoria', '01_Decisoes.md'), '# D');
  fs.writeFileSync(path.join(dir, 'Pilares', '01_Estrategia.md'), '# E');
  assert.deepEqual(cli.listRealFiles(dir).sort(), ['Memoria/01_Decisoes.md', 'Pilares/01_Estrategia.md']);
});
