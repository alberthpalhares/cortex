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

test('findNumberIssues: formatos brasileiros nos campos que o Guardião de Margem lê', () => {
  const issues = (fm) => cli.findNumberIssues(`---\n${fm}\n---\n# Pilar\n`);
  assert.deepEqual(issues('margem_alvo: 35\nmargem_minima: 12.5\npreco_piso: 700  # R$\ndesconto_max: null\ncustos_variaveis: {}\nimposto_pct:\nnome: R$ 1.500'), []);
  assert.deepEqual(issues('preco_piso: 1.500'), ['preco_piso está escrito "1.500", que é lido como 1,5. Se o valor é 1500, escreva 1500 (sem o ponto).']);
  assert.deepEqual(issues('preco_piso: 1.500,00'), ['preco_piso está escrito "1.500,00". Deixe só o número: 1500']);
  assert.deepEqual(issues('preco_piso: "R$ 700"'), ['preco_piso está escrito "R$ 700". Deixe só o número: 700']);
  assert.deepEqual(issues('desconto_max: 10 %'), ['desconto_max está escrito "10 %". Deixe só o número: 10']);
  assert.deepEqual(issues('taxas_pct: 3,5'), ['taxas_pct está escrito "3,5". Deixe só o número: 3.5 (com ponto no lugar da vírgula)']);
  assert.deepEqual(issues('imposto_pct: 6.5%'), ['imposto_pct está escrito "6.5%". Deixe só o número: 6.5']);
  assert.deepEqual(issues('margem_alvo: uns trinta'), ['margem_alvo está escrito "uns trinta". Deixe só o número, sem letras nem símbolos (por exemplo: 30).']);
  assert.deepEqual(
    issues('custos_variaveis: {"Ensaio, simples": "R$ 150", "Vídeo": 1.400, "Evento": 350}'),
    ['"Ensaio, simples" (em custos_variaveis) está escrito "R$ 150". Deixe só o número: 150',
      '"Vídeo" (em custos_variaveis) está escrito "1.400", que é lido como 1,4. Se o valor é 1400, escreva 1400 (sem o ponto).']
  );
});

test('findNumberIssues: comentário e nome com ":" ou "#" em custos_variaveis não viram alarme falso nem escondem o erro', () => {
  const issues = (fm) => cli.findNumberIssues(`---\n${fm}\n---\n# Pilar\n`);
  assert.deepEqual(issues('custos_variaveis:\n  # custo por unidade: em reais\n  "Ensaio": 150   # fonte: planilha de março\n  "Pacote: Ouro": 150\n  avulso: 20 # a: b'), []);
  assert.deepEqual(issues('custos_variaveis:\n  "Ensaio": R$ 150 # obs: x'), ['"Ensaio" (em custos_variaveis) está escrito "R$ 150". Deixe só o número: 150']);
  assert.equal(issues('custos_variaveis:\n  "Pacote #2": 1.500').length, 1);
  assert.deepEqual(
    issues('custos_variaveis: {"Pacote #1": 150, "Pacote #2": 1.500}   # R$ por item'),
    ['"Pacote #2" (em custos_variaveis) está escrito "1.500", que é lido como 1,5. Se o valor é 1500, escreva 1500 (sem o ponto).']
  );
  const fm = cli.parseSimpleFrontmatter('---\ncustos_variaveis: {"Pacote #1": 150, "Pacote #2": 1.5}  # c\nbloco:\n  # obs: estimado\n  a: 1\n---\n');
  assert.deepEqual(fm.custos_variaveis, { 'Pacote #1': 150, 'Pacote #2': 1.5 });
  assert.deepEqual(fm.bloco, { a: 1 }, 'linha só de comentário não vira item');
});

test('findNumberIssues: vírgula decimal dentro de custos_variaveis em linha é avisada com o valor inteiro', () => {
  const issues = (fm) => cli.findNumberIssues(`---\n${fm}\n---\n# Pilar\n`);
  assert.deepEqual(issues('custos_variaveis: {"frete": 12,50, "b": 3}'), ['"frete" (em custos_variaveis) está escrito "12,50". Deixe só o número: 12.5 (com ponto no lugar da vírgula)']);
  assert.deepEqual(issues('custos_variaveis: {"video": 1.200,50}'), ['"video" (em custos_variaveis) está escrito "1.200,50". Deixe só o número: 1200.5 (com ponto no lugar da vírgula)']);
  assert.deepEqual(issues('custos_variaveis: {"a": R$ 12,5 }'), ['"a" (em custos_variaveis) está escrito "R$ 12,5". Deixe só o número: 12.5 (com ponto no lugar da vírgula)']);
  assert.deepEqual(issues('custos_variaveis: {"a": 12, "b": 50, "c": 10,"d": 20}'), []);
});

test('findNumberIssues: percentual com três casas está certo; margem escrita como fração não', () => {
  const issues = (fm) => cli.findNumberIssues(`---\n${fm}\n---\n# Pilar\n`);
  assert.deepEqual(issues('imposto_pct: 6.125\ntaxas_pct: 3.499\ndesconto_max: 7.125\ntaxas_pct: 0.99\nimposto_pct: 0.5\nmargem_alvo: 0\nmargem_minima: 1.5'), []);
  assert.equal(issues('preco_piso: 6.125').length, 1, 'em R$ o ponto de milhar continua suspeito');
  assert.deepEqual(issues('margem_alvo: 0.35'), ['margem_alvo está escrito "0.35", que é lido como 0,35% (menos de 1%). Este campo é a porcentagem inteira: se a sua margem é 35%, escreva 35.']);
  assert.deepEqual(issues('margem_minima: 0,125'), ['margem_minima está escrito "0,125", que é lido como 0,125% (menos de 1%). Este campo é a porcentagem inteira: se a sua margem é 12,5%, escreva 12.5.']);
});

test('frontmatter: ~, Null e aspas vazias são campo por preencher, não número errado', () => {
  for (const v of ['~', 'Null', 'NULL', '""', "''", '""   # depois']) {
    const content = `---\nmargem_alvo: ${v}\n---\n# Financeiro\n`;
    assert.equal(cli.parseSimpleFrontmatter(content).margem_alvo, null, v);
    assert.deepEqual(cli.findNumberIssues(content), [], v);
  }
});

test('findNumberIssues: cabeçalho sem a linha de fechamento é avisado; arquivo sem cabeçalho não', () => {
  assert.equal(cli.findNumberIssues('---\npreco_piso: 700\n\n# Comercial\n').length, 1);
  assert.ok(cli.findNumberIssues('﻿---\r\npreco_piso: 700\r\n\r\n# Comercial\r\n')[0].includes('falta a linha ---'));
  assert.deepEqual(cli.findNumberIssues('# Estratégia\n\ntexto\n'), []);
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
