const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { mkTmpDir } = require('../support/tmp');
const cli = require('../../bin/cli.js');

const REPO_ROOT = path.join(__dirname, '..', '..');

function montarCerebro({ negocio, framework }) {
  return [
    '# Instruções do Sistema',
    '',
    cli.BUSINESS_START,
    negocio,
    cli.BUSINESS_END,
    '',
    cli.FRAMEWORK_START,
    framework,
    cli.FRAMEWORK_END,
    ''
  ].join('\n');
}

function escreverCerebro(dir, conteudo) {
  fs.mkdirSync(path.join(dir, 'Frameworks'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'Frameworks', 'CEREBRO.md'), conteudo);
}

function escreverTemplateFramework(dir, conteudo) {
  const p = path.join(dir, '.agents', 'cortex', 'brain.framework.md');
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, conteudo);
}

test('extractRegion e replaceRegion preservam tudo fora da região', () => {
  const content = 'antes\n' + cli.FRAMEWORK_START + '\nmiolo\n' + cli.FRAMEWORK_END + '\ndepois';

  assert.equal(cli.extractRegion(content, cli.FRAMEWORK_START, cli.FRAMEWORK_END), '\nmiolo\n');

  const novo = cli.replaceRegion(content, cli.FRAMEWORK_START, cli.FRAMEWORK_END, '\noutro\n');
  assert.ok(novo.startsWith('antes\n'), 'conteúdo antes da região deve ser preservado');
  assert.ok(novo.endsWith('\ndepois'), 'conteúdo depois da região deve ser preservado');
  assert.ok(novo.includes('outro'));
  assert.ok(!novo.includes('miolo'));
});

test('extractRegion retorna null quando os marcadores não existem (cérebro legado)', () => {
  assert.equal(cli.extractRegion('sem marcador nenhum', cli.FRAMEWORK_START, cli.FRAMEWORK_END), null);
  assert.equal(cli.replaceRegion('sem marcador nenhum', cli.FRAMEWORK_START, cli.FRAMEWORK_END, 'x'), null);
});

test('compileBrain gera o conteúdo completo com cabeçalho de artefato gerado', () => {
  const cerebro = '# Cérebro\n\nregra secreta do negócio\n';
  const out = cli.compileBrain(cerebro, '9.9.9');

  assert.ok(out.includes('regra secreta do negócio'), 'o compilado precisa levar o conteúdo real');
  assert.ok(out.includes('ARQUIVO GERADO PELO CÓRTEX'), 'precisa avisar que é gerado');
  assert.ok(out.includes('v9.9.9'), 'precisa registrar a versão que gerou');
});

test('refreshBrainFramework troca a área do framework e preserva a do negócio byte a byte', () => {
  const targetDir = mkTmpDir();
  const templateDir = mkTmpDir();

  const negocio = '\n## Identidade\n\nPadaria do Zé — dados que são só do usuário.\n';
  escreverCerebro(targetDir, montarCerebro({ negocio: negocio.trim(), framework: 'REGRAS ANTIGAS' }));
  escreverTemplateFramework(templateDir, 'REGRAS NOVAS COM SKILL NOVA');

  const r = cli.refreshBrainFramework(targetDir, templateDir);
  assert.equal(r.status, 'updated');

  const depois = fs.readFileSync(path.join(targetDir, 'Frameworks', 'CEREBRO.md'), 'utf8');
  assert.ok(depois.includes('REGRAS NOVAS COM SKILL NOVA'), 'a área de framework deveria ter sido atualizada');
  assert.ok(!depois.includes('REGRAS ANTIGAS'), 'as regras antigas deveriam ter saído');
  assert.ok(
    depois.includes('Padaria do Zé — dados que são só do usuário.'),
    'a área de negócio NÃO pode ser alterada por uma atualização de framework'
  );
});

test('refreshBrainFramework é idempotente (segunda execução não muda nada)', () => {
  const targetDir = mkTmpDir();
  const templateDir = mkTmpDir();

  escreverCerebro(targetDir, montarCerebro({ negocio: 'meu negócio', framework: 'antigo' }));
  escreverTemplateFramework(templateDir, 'novo');

  assert.equal(cli.refreshBrainFramework(targetDir, templateDir).status, 'updated');
  assert.equal(cli.refreshBrainFramework(targetDir, templateDir).status, 'unchanged');
});

test('refreshBrainFramework NÃO toca um cérebro legado sem marcadores', () => {
  const targetDir = mkTmpDir();
  const templateDir = mkTmpDir();

  const legado = '# Cérebro antigo, sem camadas\n\nregras de operação escritas à mão\n';
  escreverCerebro(targetDir, legado);
  escreverTemplateFramework(templateDir, 'regras novas');

  const r = cli.refreshBrainFramework(targetDir, templateDir);
  assert.equal(r.status, 'no-markers');
  assert.equal(r.changed, false);

  const depois = fs.readFileSync(path.join(targetDir, 'Frameworks', 'CEREBRO.md'), 'utf8');
  assert.equal(depois, legado, 'um cérebro sem marcadores deve ser deixado exatamente como estava');
});

test('refreshBrainFramework preserva o estilo de quebra de linha do arquivo (CRLF continua CRLF)', () => {
  const targetDir = mkTmpDir();
  const templateDir = mkTmpDir();

  const crlf = montarCerebro({ negocio: 'negócio', framework: 'antigo' }).replace(/\n/g, '\r\n');
  escreverCerebro(targetDir, crlf);
  escreverTemplateFramework(templateDir, 'novo');

  cli.refreshBrainFramework(targetDir, templateDir);

  const depois = fs.readFileSync(path.join(targetDir, 'Frameworks', 'CEREBRO.md'), 'utf8');
  const lfSoltos = (depois.match(/\n/g) || []).length - (depois.match(/\r\n/g) || []).length;
  assert.equal(lfSoltos, 0, 'não deve introduzir LF solto num arquivo que era CRLF');
});

test('readTargets: targets.json tem precedência, senão detecta os arquivos existentes, senão usa o padrão', () => {
  const semNada = mkTmpDir();
  assert.deepEqual(cli.readTargets(semNada), cli.DEFAULT_TARGETS);

  const comArquivos = mkTmpDir();
  fs.writeFileSync(path.join(comArquivos, 'CLAUDE.md'), 'x');
  fs.writeFileSync(path.join(comArquivos, 'GEMINI.md'), 'x');
  assert.deepEqual(cli.readTargets(comArquivos).sort(), ['CLAUDE.md', 'GEMINI.md']);

  cli.writeTargets(comArquivos, ['AGENTS.md']);
  assert.deepEqual(cli.readTargets(comArquivos), ['AGENTS.md'], 'targets.json deve vencer a detecção');
});

test('parseTargetsFlag entende lista, "all" e ignora alvo desconhecido', () => {
  assert.deepEqual(cli.parseTargetsFlag(['--targets=CLAUDE.md,GEMINI.md']), ['CLAUDE.md', 'GEMINI.md']);
  assert.deepEqual(cli.parseTargetsFlag(['--targets=all']), Object.keys(cli.KNOWN_TARGETS));
  assert.equal(cli.parseTargetsFlag(['--targets=NAO_EXISTE.md']), null);
  assert.equal(cli.parseTargetsFlag(['--force']), null);
});

test('o framework do cérebro instrui a IA a sempre responder em português (independente do idioma das instruções)', () => {
  const framework = fs.readFileSync(path.join(REPO_ROOT, '.agents', 'cortex', 'brain.framework.md'), 'utf8');
  assert.ok(
    /reply.*Brazilian Portuguese/i.test(framework) || /Portuguese \(pt-BR\)/i.test(framework),
    'as regras do framework (em inglês, por economia de tokens) precisam deixar explícito que a IA responde ao usuário em português'
  );
});

test('os gatilhos das skills continuam em português mesmo com as instruções em inglês', () => {
  const skillsDir = path.join(REPO_ROOT, '.agents', 'skills');
  const gatilhosEsperados = {
    'radar/SKILL.md': 'radar',
    'registrar/SKILL.md': 'registra',
    'ajuda/SKILL.md': 'ajuda',
    'saude/SKILL.md': 'saúde do córtex',
    'consolidar/SKILL.md': 'consolidar memória'
  };
  for (const [rel, gatilho] of Object.entries(gatilhosEsperados)) {
    const conteudo = fs.readFileSync(path.join(skillsDir, rel), 'utf8');
    const fm = conteudo.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    assert.ok(fm, `${rel} deveria ter frontmatter`);
    assert.ok(
      fm[1].includes(gatilho),
      `${rel}: a description precisa manter o gatilho em português "${gatilho}" para o usuário conseguir acionar a skill`
    );
  }
});

test('a área CORTEX:FRAMEWORK do CORTEX_TEMPLATE.md é idêntica ao brain.framework.md shippado', () => {
  const tpl = cli.normalizeEol(
    fs.readFileSync(
      path.join(REPO_ROOT, '.agents', 'skills', 'cortex-onboarding', 'resources', 'CORTEX_TEMPLATE.md'),
      'utf8'
    )
  );
  const framework = cli.normalizeEol(
    fs.readFileSync(path.join(REPO_ROOT, '.agents', 'cortex', 'brain.framework.md'), 'utf8')
  );

  assert.ok(cli.hasBrainLayers(tpl), 'o template do cérebro precisa ter as duas camadas marcadas');

  const region = cli.extractRegion(tpl, cli.FRAMEWORK_START, cli.FRAMEWORK_END);
  assert.equal(
    region.trim(),
    framework.trim(),
    'as regras no template do onboarding e no template atualizável divergiram — um Córtex novo nasceria diferente de um atualizado'
  );
});
