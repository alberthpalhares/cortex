const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { mkTmpDir } = require('../support/tmp');

const cli = require('../../bin/cli.js');

// ── parseSimpleFrontmatter ──────────────────────────────────────────

test('parseSimpleFrontmatter — frontmatter vazio', () => {
  assert.deepEqual(cli.parseSimpleFrontmatter(''), {});
  assert.deepEqual(cli.parseSimpleFrontmatter('sem frontmatter aqui'), {});
});

test('parseSimpleFrontmatter — valores numéricos, null e string', () => {
  const result = cli.parseSimpleFrontmatter('---\nmargem_alvo: 35\nmargem_minima: 20\n---\n# Conteúdo');
  assert.equal(result.margem_alvo, 35);
  assert.equal(result.margem_minima, 20);
});

test('parseSimpleFrontmatter — null vira null (não string)', () => {
  const result = cli.parseSimpleFrontmatter('---\ncampo: null\n---\n');
  assert.equal(result.campo, null);
});

test('parseSimpleFrontmatter — {} vira objeto vazio', () => {
  const result = cli.parseSimpleFrontmatter('---\ncustos_variaveis: {}\n---\n');
  assert.deepEqual(result.custos_variaveis, {});
});

test('parseSimpleFrontmatter — ignora comentários inline', () => {
  const result = cli.parseSimpleFrontmatter('---\nmargem_alvo: 35  # % de lucro\n---\n');
  assert.equal(result.margem_alvo, 35);
});

test('parseSimpleFrontmatter — string com valor textual', () => {
  const result = cli.parseSimpleFrontmatter('---\nnome: "valor com espaços"\n---\n');
  assert.equal(result.nome, '"valor com espaços"');
});

test('parseSimpleFrontmatter — valor vazio é null', () => {
  const result = cli.parseSimpleFrontmatter('---\ncampo:\n---\n');
  assert.equal(result.campo, null);
});

test('parseSimpleFrontmatter — frontmatter sem fechamento', () => {
  const result = cli.parseSimpleFrontmatter('---\ncampo: 42\n');
  assert.deepEqual(result, {});
});

test('parseSimpleFrontmatter — número negativo', () => {
  const result = cli.parseSimpleFrontmatter('---\ndesconto_max: -10\n---\n');
  assert.equal(result.desconto_max, -10);
});

// ── countRevisarAndBlanks ───────────────────────────────────────────

test('countRevisarAndBlanks — sem REVISAR e sem seções vazias', () => {
  const content = '# Pilar\n\nConteúdo real aqui.\n\n## Seção 1\nTexto preenchido.\n';
  const result = cli.countRevisarAndBlanks(content);
  assert.equal(result.revisarCount, 0);
  assert.equal(result.blankSections, 0);
});

test('countRevisarAndBlanks — conta REVISAR corretamente', () => {
  const content = '# Pilar\n\n<!-- REVISAR -->\n## Valores\n<!-- REVISAR -->\n## Missão\nConteúdo real.\n';
  const result = cli.countRevisarAndBlanks(content);
  assert.equal(result.revisarCount, 2);
});

test('countRevisarAndBlanks — REVISAR com espaços extras também conta', () => {
  const content = '<!--  REVISAR  -->\n<!-- REVISAR-->\n';
  const result = cli.countRevisarAndBlanks(content);
  assert.equal(result.revisarCount, 2); // regex com \s* captura espaços extras
});

test('countRevisarAndBlanks — detecta seção em branco (heading + só comentário)', () => {
  const content = '# Pilar\n\n## Seção Vazia\n<!-- Apenas comentário -->\n\n## Seção Preenchida\nTexto real.\n';
  const result = cli.countRevisarAndBlanks(content);
  assert.equal(result.blankSections, 1);
});

test('countRevisarAndBlanks — heading sem conteúdo nenhum', () => {
  const content = '# Pilar\n\n## Seção Vazia\n\n## Outra Seção\nTexto.\n';
  const result = cli.countRevisarAndBlanks(content);
  assert.equal(result.blankSections, 1);
});

test('countRevisarAndBlanks — heading nível 1 não conta como seção em branco', () => {
  const content = '# Pilar\n\n## Seção Com Conteúdo\n- item 1\n- item 2\n';
  const result = cli.countRevisarAndBlanks(content);
  assert.equal(result.blankSections, 0);
});

test('countRevisarAndBlanks — múltiplas seções vazias', () => {
  const content = '# Pilar\n\n## Vazia 1\n\n## Vazia 2\n<!-- -->\n\n## Cheia\nok\n## Vazia 3\n\n';
  const result = cli.countRevisarAndBlanks(content);
  assert.equal(result.blankSections, 3);
});

// ── calculateCompleteness ────────────────────────────────────────────

test('calculateCompleteness — 100% quando todos os 4 obrigatórios sem pendências', () => {
  const pillars = [
    { file: 'Pilares/01_Estrategia.md', exists: true, revisarCount: 0, blankSections: 0, nullFields: [] },
    { file: 'Pilares/02_Cultura.md', exists: true, revisarCount: 0, blankSections: 0, nullFields: [] },
    { file: 'Pilares/05_Comunicacao.md', exists: true, revisarCount: 0, blankSections: 0, nullFields: [] },
    { file: 'Pilares/06_Operacao.md', exists: true, revisarCount: 0, blankSections: 0, nullFields: [] },
  ];
  assert.equal(cli.calculateCompleteness(pillars), 100);
});

test('calculateCompleteness — 0% quando nenhum obrigatório existe', () => {
  assert.equal(cli.calculateCompleteness([]), 0);
});

test('calculateCompleteness — 50% com metade dos obrigatórios limpos', () => {
  const pillars = [
    { file: 'Pilares/01_Estrategia.md', exists: true, revisarCount: 0, blankSections: 0, nullFields: [] },
    { file: 'Pilares/02_Cultura.md', exists: true, revisarCount: 3, blankSections: 1, nullFields: [] },
    { file: 'Pilares/05_Comunicacao.md', exists: true, revisarCount: 0, blankSections: 0, nullFields: [] },
    { file: 'Pilares/06_Operacao.md', exists: false, revisarCount: 0, blankSections: 0, nullFields: [] },
  ];
  assert.equal(cli.calculateCompleteness(pillars), 70); // 2/3 existentes limpos → 66% → 70
});

test('calculateCompleteness — pilares opcionais não afetam o índice', () => {
  const pillars = [
    { file: 'Pilares/01_Estrategia.md', exists: true, revisarCount: 0, blankSections: 0, nullFields: [] },
    { file: 'Pilares/02_Cultura.md', exists: true, revisarCount: 0, blankSections: 0, nullFields: [] },
    { file: 'Pilares/03_Financeiro.md', exists: true, revisarCount: 5, blankSections: 3, nullFields: ['margem_alvo', 'margem_minima'] },
    { file: 'Pilares/04_Comercial.md', exists: true, revisarCount: 2, blankSections: 1, nullFields: ['preco_piso'] },
    { file: 'Pilares/05_Comunicacao.md', exists: true, revisarCount: 0, blankSections: 0, nullFields: [] },
    { file: 'Pilares/06_Operacao.md', exists: true, revisarCount: 0, blankSections: 0, nullFields: [] },
  ];
  // 4/4 mandatory clean → 100%, independente do estado dos opcionais
  assert.equal(cli.calculateCompleteness(pillars), 100);
});

test('calculateCompleteness — arredonda para dezena mais próxima', () => {
  const pillars = [
    { file: 'Pilares/01_Estrategia.md', exists: true, revisarCount: 0, blankSections: 0, nullFields: [] },
    { file: 'Pilares/02_Cultura.md', exists: true, revisarCount: 1, blankSections: 0, nullFields: [] },
    { file: 'Pilares/05_Comunicacao.md', exists: true, revisarCount: 0, blankSections: 0, nullFields: [] },
    { file: 'Pilares/06_Operacao.md', exists: false, revisarCount: 0, blankSections: 0, nullFields: [] },
  ];
  // 2/3 existentes limpos = 66.67% → 67 → round(67/10)*10 = 70
  assert.equal(cli.calculateCompleteness(pillars), 70);
});

// ── parseMetaHeaders ──────────────────────────────────────────────────

test('parseMetaHeaders — extrai todos os campos', () => {
  const meta = cli.parseMetaHeaders(
    '**Negócio:** Empresa Teste\n**Setor:** Tecnologia\n**Tipo:** Eu-presa\n' +
    '**Onboarding realizado em:** 2025-01-15\n**Última revisão:** 2025-07-15\n' +
    '**Próxima revisão sugerida:** 2026-01-15\n'
  );
  assert.equal(meta.businessName, 'Empresa Teste');
  assert.equal(meta.sector, 'Tecnologia');
  assert.equal(meta.type, 'Eu-presa');
  assert.equal(meta.onboardedAt, '2025-01-15');
  assert.equal(meta.lastReview, '2025-07-15');
  assert.equal(meta.nextReview, '2026-01-15');
});

test('parseMetaHeaders — ignora placeholder [Nome do negócio]', () => {
  const meta = cli.parseMetaHeaders('**Negócio:** [Nome do negócio]\n**Setor:** [Setor de atuação]\n');
  assert.equal(meta.businessName, undefined);
  assert.equal(meta.sector, undefined);
});

test('parseMetaHeaders — campos parciais', () => {
  const meta = cli.parseMetaHeaders('**Negócio:** Só Nome\n');
  assert.equal(meta.businessName, 'Só Nome');
  assert.equal(meta.type, undefined);
});

// ── parseFileMapFromMeta ─────────────────────────────────────────────

test('parseFileMapFromMeta — extrai arquivos únicos da tabela', () => {
  const content = '## Mapa de Arquivos\n\n' +
    '| Tópico | Arquivo | Seção (âncora) |\n' +
    '|--------|---------|----------------|\n' +
    '| Estratégia | `Pilares/01_Estrategia.md` | — |\n' +
    '| Cultura | `Pilares/02_Cultura.md` | — |\n' +
    '| Decisões | `Memoria/01_Decisoes.md` | — |\n' +
    '## Pilares Customizados\n';
  const files = cli.parseFileMapFromMeta(content);
  assert.equal(files.size, 3);
  assert.ok(files.has('Pilares/01_Estrategia.md'));
  assert.ok(files.has('Pilares/02_Cultura.md'));
  assert.ok(files.has('Memoria/01_Decisoes.md'));
});

test('parseFileMapFromMeta — ignora linhas sem tabela', () => {
  const content = '## Mapa de Arquivos\n\nAlgum texto solto\n\n' +
    '| Tópico | Arquivo | Seção |\n|--------|---------|-------|\n' +
    '| Teste | `Pilares/01_Estrategia.md` | — |\n' +
    '## Pilares Customizados\n';
  const files = cli.parseFileMapFromMeta(content);
  assert.equal(files.size, 1);
});

test('parseFileMapFromMeta — sem mapa retorna vazio', () => {
  const files = cli.parseFileMapFromMeta('Sem mapa de arquivos aqui');
  assert.equal(files.size, 0);
});

// ── checkBrainHealth ──────────────────────────────────────────────────

test('checkBrainHealth — cérebro com camadas e targets compilados', () => {
  const dir = mkTmpDir();
  fs.mkdirSync(path.join(dir, 'Frameworks'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'Frameworks', 'CEREBRO.md'),
    '<!-- CORTEX:BUSINESS:START -->\nnegócio\n<!-- CORTEX:BUSINESS:END -->\n' +
    '<!-- CORTEX:FRAMEWORK:START -->\nregras\n<!-- CORTEX:FRAMEWORK:END -->\n');
  fs.writeFileSync(path.join(dir, 'AGENTS.md'),
    '<!-- ============================================================\n     ARQUIVO GERADO PELO CÓRTEX\n     ============================================================ -->\nconteúdo');

  const result = cli.checkBrainHealth(dir);
  assert.equal(result.hasCerebro, true);
  assert.equal(result.hasLayers, true);
  assert.ok(result.compiledTargets.includes('AGENTS.md'));
});

test('checkBrainHealth — cérebro legado sem camadas', () => {
  const dir = mkTmpDir();
  fs.mkdirSync(path.join(dir, 'Frameworks'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'Frameworks', 'CEREBRO.md'), '# Cérebro antigo\n');

  const result = cli.checkBrainHealth(dir);
  assert.equal(result.hasCerebro, true);
  assert.equal(result.hasLayers, false);
  assert.equal(result.isLegacy, true);
});

test('checkBrainHealth — sem CEREBRO.md', () => {
  const dir = mkTmpDir();
  const result = cli.checkBrainHealth(dir);
  assert.equal(result.hasCerebro, false);
});

test('checkBrainHealth — arquivo ponteiro NÃO conta como compilado', () => {
  const dir = mkTmpDir();
  fs.mkdirSync(path.join(dir, 'Frameworks'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'Frameworks', 'CEREBRO.md'),
    '<!-- CORTEX:BUSINESS:START -->\nx\n<!-- CORTEX:BUSINESS:END -->\n' +
    '<!-- CORTEX:FRAMEWORK:START -->\nx\n<!-- CORTEX:FRAMEWORK:END -->\n');
  // Arquivo ponteiro: sem cabeçalho GERADO, conteúdo diz "leia CEREBRO.md"
  fs.writeFileSync(path.join(dir, 'AGENTS.md'), 'leia agora Frameworks/CEREBRO.md');

  const result = cli.checkBrainHealth(dir);
  assert.equal(result.compiledTargets.length, 0, 'arquivo ponteiro não deve aparecer como compilado');
  assert.equal(result.isPointer, true);
});

// ── readCortexMeta / writeCortexMeta ──────────────────────────────────

test('readCortexMeta retorna null se o arquivo não existe', () => {
  const dir = mkTmpDir();
  assert.equal(cli.readCortexMeta(dir), null);
});

test('writeCortexMeta + readCortexMeta roundtrip', () => {
  const dir = mkTmpDir();
  cli.writeCortexMeta(dir, { businessName: 'Teste', type: 'Eu-presa' });
  const meta = cli.readCortexMeta(dir);
  assert.equal(meta.businessName, 'Teste');
  assert.equal(meta.type, 'Eu-presa');
  assert.ok(meta.updatedAt, 'deve incluir updatedAt automático');
});

test('writeCortexMeta faz merge com dados existentes', () => {
  const dir = mkTmpDir();
  cli.writeCortexMeta(dir, { businessName: 'V1', onboardedAt: '2025-01-01' });
  cli.writeCortexMeta(dir, { businessName: 'V2', nextReview: '2026-01-01' });
  const meta = cli.readCortexMeta(dir);
  assert.equal(meta.businessName, 'V2'); // sobrescrito
  assert.equal(meta.onboardedAt, '2025-01-01'); // preservado
  assert.equal(meta.nextReview, '2026-01-01'); // novo
});

// ── readBusinessName ──────────────────────────────────────────────────

test('readBusinessName — prefere .cortex/meta.json', () => {
  const dir = mkTmpDir();
  fs.mkdirSync(path.join(dir, 'Memoria'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'Memoria', 'META.md'),
    '**Negócio:** Nome do META\n');
  cli.writeCortexMeta(dir, { businessName: 'Nome do .cortex' });

  assert.equal(cli.readBusinessName(dir), 'Nome do .cortex');
});

test('readBusinessName — fallback para regex no META.md', () => {
  const dir = mkTmpDir();
  fs.mkdirSync(path.join(dir, 'Memoria'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'Memoria', 'META.md'),
    '**Negócio:** Nome do META\n');

  assert.equal(cli.readBusinessName(dir), 'Nome do META');
});

test('readBusinessName — ignora placeholder [Nome do negócio]', () => {
  const dir = mkTmpDir();
  fs.mkdirSync(path.join(dir, 'Memoria'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'Memoria', 'META.md'),
    '**Negócio:** [Nome do negócio]\n');

  assert.equal(cli.readBusinessName(dir), null);
});

test('readBusinessName — retorna null se nada existe', () => {
  const dir = mkTmpDir();
  assert.equal(cli.readBusinessName(dir), null);
});
