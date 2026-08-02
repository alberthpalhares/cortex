const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { mkTmpDir } = require('../support/tmp');

// Testes de ponta a ponta: rodam o CLI real (bin/cli.js) como um subprocesso,
// exatamente como um usuário rodaria `npx cortex ...`, contra pastas
// temporárias isoladas. Sempre com --force para nunca depender de stdin.

const REPO_ROOT = path.join(__dirname, '..', '..');
const CLI = path.join(REPO_ROOT, 'bin', 'cli.js');

function runCli(argsList, cwd) {
  const result = spawnSync(process.execPath, [CLI, ...argsList], { cwd, encoding: 'utf8' });
  return result;
}

test('init cria a estrutura completa esperada', () => {
  const dir = mkTmpDir();
  const result = runCli(['init', '.', '--force'], dir);
  assert.equal(result.status, 0, result.stderr);

  // init só cria AGENTS.md por padrão (cross-tool standard).
  // Os demais targets são gerados sob demanda: onboarding Step 7 ou --targets= no init.
  for (const entry of ['.agents', 'Frameworks', 'Memoria', 'Pilares', 'Ativos', 'AGENTS.md', '.gitignore']) {
    assert.ok(fs.existsSync(path.join(dir, entry)), `esperava "${entry}" depois do init`);
  }
  // Os outros targets NÃO devem ser criados sem --targets=
  for (const f of ['CLAUDE.md', 'GEMINI.md', 'CODEX.md', '.cursorrules']) {
    assert.equal(fs.existsSync(path.join(dir, f)), false, `${f} não deveria ser criado sem --targets=`);
  }
  assert.ok(fs.existsSync(path.join(dir, '.cortex', 'version.json')), 'esperava .cortex/version.json depois do init');
  assert.ok(fs.existsSync(path.join(dir, '.agents', 'manifest.json')), 'esperava .agents/manifest.json depois do init');
});

test('init --targets=all cria todos os targets', () => {
  const dir = mkTmpDir();
  const result = runCli(['init', '.', '--force', '--targets=all'], dir);
  assert.equal(result.status, 0, result.stderr);

  for (const entry of ['AGENTS.md', 'CLAUDE.md', 'GEMINI.md', 'CODEX.md', '.cursorrules']) {
    assert.ok(fs.existsSync(path.join(dir, entry)), `esperava "${entry}" com --targets=all`);
  }
});

test('init --targets=CLAUDE.md,.cursorrules cria só os targets pedidos', () => {
  const dir = mkTmpDir();
  const result = runCli(['init', '.', '--force', '--targets=CLAUDE.md,.cursorrules'], dir);
  assert.equal(result.status, 0, result.stderr);

  assert.ok(fs.existsSync(path.join(dir, 'AGENTS.md')), 'AGENTS.md sempre é criado (padrão cross-tool)');
  assert.ok(fs.existsSync(path.join(dir, 'CLAUDE.md')), 'CLAUDE.md deveria existir com --targets=CLAUDE.md,.cursorrules');
  assert.ok(fs.existsSync(path.join(dir, '.cursorrules')), '.cursorrules deveria existir com --targets=CLAUDE.md,.cursorrules');
  assert.equal(fs.existsSync(path.join(dir, 'GEMINI.md')), false, 'GEMINI.md não deveria existir sem ser pedido');
  assert.equal(fs.existsSync(path.join(dir, 'CODEX.md')), false, 'CODEX.md não deveria existir sem ser pedido');
});

test('update nunca altera os dados do usuário (Pilares, Memoria, Ativos)', () => {
  const dir = mkTmpDir();
  let result = runCli(['init', '.', '--force'], dir);
  assert.equal(result.status, 0, result.stderr);

  // Simula um usuário que já rodou o onboarding, preencheu o negócio e criou
  // uma skill própria. init() só cria Pilares/Memoria com .gitkeep — o
  // conteúdo real (META.md incluso) nasce na conversa de onboarding, não no CLI.
  fs.writeFileSync(
    path.join(dir, 'Pilares', '01_Estrategia.md'),
    '# Minha Estratégia Real\nConteúdo confidencial do negócio do usuário.'
  );
  fs.writeFileSync(
    path.join(dir, 'Memoria', 'META.md'),
    '# META — Índice do Córtex\n\n**Negócio:** Negócio de Teste\n'
  );
  const customSkillDir = path.join(dir, '.agents', 'skills', 'minha-skill-custom');
  fs.mkdirSync(customSkillDir, { recursive: true });
  fs.writeFileSync(path.join(customSkillDir, 'SKILL.md'), '# Minha skill própria, não faz parte do framework');

  // Simula uma skill do framework desatualizada em relação ao template atual —
  // é isso que "update" deve corrigir.
  const radarSkillPath = path.join(dir, '.agents', 'skills', 'radar', 'SKILL.md');
  fs.writeFileSync(radarSkillPath, '# versão antiga da skill radar, anterior à atualização');

  // Os arquivos de raiz (AGENTS.md etc.) NÃO entram aqui: a partir do modelo de
  // cérebro compilado eles são artefatos gerados, e ser regenerado é o
  // comportamento correto. O que é intocável são os dados do negócio.
  const userDataSnapshot = new Map();
  for (const rel of ['Pilares/01_Estrategia.md', 'Memoria/META.md', '.gitignore']) {
    userDataSnapshot.set(rel, fs.readFileSync(path.join(dir, rel)));
  }

  result = runCli(['update', '.', '--force'], dir);
  assert.equal(result.status, 0, result.stderr);

  for (const [rel, before] of userDataSnapshot) {
    const after = fs.readFileSync(path.join(dir, rel));
    assert.ok(before.equals(after), `${rel} foi alterado por "cortex update", mas não deveria`);
  }

  assert.ok(fs.existsSync(path.join(customSkillDir, 'SKILL.md')), 'skill customizada do usuário foi removida por update');

  const templateRadarContent = fs.readFileSync(path.join(REPO_ROOT, '.agents', 'skills', 'radar', 'SKILL.md'), 'utf8');
  const updatedRadarContent = fs.readFileSync(radarSkillPath, 'utf8');
  assert.equal(updatedRadarContent, templateRadarContent, 'update deveria ter trazido a skill radar para a versão atual do framework');

  const backups = fs.readdirSync(dir).filter((f) => f.startsWith('.agents.backup-'));
  assert.ok(backups.length > 0, 'update deveria criar um backup de .agents/ antes de aplicar mudanças');
});

test('update mantém arquivos descontinuados pelo framework por padrão, e só remove com --prune', () => {
  const dir = mkTmpDir();
  let result = runCli(['init', '.', '--force'], dir);
  assert.equal(result.status, 0, result.stderr);

  // Simula uma release anterior em que o framework possuía uma skill que a
  // versão atual não possui mais (deprecada/renomeada), registrando-a no
  // manifesto "instalado" e criando o arquivo correspondente no disco.
  const deprecatedPath = path.join(dir, '.agents', 'skills', 'skill-descontinuada', 'SKILL.md');
  fs.mkdirSync(path.dirname(deprecatedPath), { recursive: true });
  fs.writeFileSync(deprecatedPath, '# Skill que o framework descontinuou');

  const manifestPath = path.join(dir, '.agents', 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.version = '0.0.1';
  manifest.files.push('.agents/skills/skill-descontinuada/SKILL.md');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  fs.writeFileSync(
    path.join(dir, '.cortex', 'version.json'),
    JSON.stringify({ version: '0.0.1', updatedAt: new Date().toISOString() }, null, 2)
  );

  result = runCli(['update', '.', '--force'], dir);
  assert.equal(result.status, 0, result.stderr);
  assert.ok(fs.existsSync(deprecatedPath), 'sem --prune, o arquivo descontinuado deveria ser mantido');

  // Recria o cenário (o update anterior já reescreveu o manifesto) para testar o --prune isoladamente.
  fs.mkdirSync(path.dirname(deprecatedPath), { recursive: true });
  fs.writeFileSync(deprecatedPath, '# Skill que o framework descontinuou');
  const manifestAfter = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifestAfter.files.push('.agents/skills/skill-descontinuada/SKILL.md');
  fs.writeFileSync(manifestPath, JSON.stringify(manifestAfter, null, 2));
  fs.writeFileSync(
    path.join(dir, '.cortex', 'version.json'),
    JSON.stringify({ version: '0.0.2', updatedAt: new Date().toISOString() }, null, 2)
  );

  result = runCli(['update', '.', '--force', '--prune'], dir);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.existsSync(deprecatedPath), false, 'com --prune, o arquivo descontinuado deveria ser removido');
});

test('update propaga as regras novas para o cérebro e para o arquivo que a IA lê', () => {
  // Este é o ponto central do modelo de cérebro compilado: antes dele, um
  // "cortex update" instalava a skill nova no disco, mas nada ensinava a IA a
  // acioná-la — a skill chegava e ficava invisível.
  const dir = mkTmpDir();
  let result = runCli(['init', '.', '--force'], dir);
  assert.equal(result.status, 0, result.stderr);

  const regraDoFrameworkAtual = fs.readFileSync(
    path.join(REPO_ROOT, '.agents', 'cortex', 'brain.framework.md'),
    'utf8'
  );
  const trechoEsperado = regraDoFrameworkAtual.split('\n').find((l) => l.includes('proposta-comercial'));
  assert.ok(trechoEsperado, 'pré-condição do teste: o framework atual precisa citar alguma skill');

  // Um Córtex montado numa versão anterior: tem as duas camadas, mas a área de
  // framework está velha e não conhece as skills que vieram depois.
  const dadosDoNegocio = '## Identidade\n\nNegócio de Teste — informação que só o usuário tem.';
  fs.mkdirSync(path.join(dir, 'Frameworks'), { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'Frameworks', 'CEREBRO.md'),
    `# Instruções do Sistema\n\n<!-- CORTEX:BUSINESS:START -->\n${dadosDoNegocio}\n<!-- CORTEX:BUSINESS:END -->\n\n<!-- CORTEX:FRAMEWORK:START -->\nRegras antigas, de uma versão que não conhecia as skills novas.\n<!-- CORTEX:FRAMEWORK:END -->\n`
  );
  fs.writeFileSync(
    path.join(dir, '.cortex', 'version.json'),
    JSON.stringify({ version: '0.7.0', updatedAt: new Date().toISOString() }, null, 2)
  );

  result = runCli(['update', '.', '--force'], dir);
  assert.equal(result.status, 0, result.stderr);

  const cerebroDepois = fs.readFileSync(path.join(dir, 'Frameworks', 'CEREBRO.md'), 'utf8');
  assert.ok(
    cerebroDepois.includes('proposta-comercial'),
    'depois do update, o cérebro precisa conhecer as skills da versão atual'
  );
  assert.ok(
    cerebroDepois.includes('Negócio de Teste — informação que só o usuário tem.'),
    'o update NUNCA pode alterar a área de negócio do cérebro'
  );

  const agentsDepois = fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf8');
  assert.ok(
    agentsDepois.includes('proposta-comercial'),
    'o arquivo que a IA lê precisa ter sido recompilado com as regras novas'
  );
});

test('sync compila o cérebro COMPLETO no arquivo de instrução (não um ponteiro)', () => {
  const dir = mkTmpDir();
  let result = runCli(['init', '.', '--force'], dir);
  assert.equal(result.status, 0, result.stderr);

  const marcaExclusiva = 'REGRA-DE-TESTE-QUE-SO-EXISTE-NO-CEREBRO';
  fs.mkdirSync(path.join(dir, 'Frameworks'), { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'Frameworks', 'CEREBRO.md'),
    `# Cérebro de teste\n\n${marcaExclusiva}\n`
  );
  fs.writeFileSync(path.join(dir, 'CLAUDE.md'), 'conteúdo corrompido, precisa ser regenerado');

  result = runCli(['sync', '.', '--force', '--targets=CLAUDE.md'], dir);
  assert.equal(result.status, 0, result.stderr);

  const claudeContent = fs.readFileSync(path.join(dir, 'CLAUDE.md'), 'utf8');
  assert.ok(
    claudeContent.includes(marcaExclusiva),
    'o arquivo compilado precisa conter o conteúdo real do cérebro, não uma referência a ele'
  );
  assert.ok(
    claudeContent.includes('ARQUIVO GERADO PELO CÓRTEX'),
    'o arquivo compilado precisa avisar que é gerado e não deve ser editado à mão'
  );
});

test('sync gera apenas AGENTS.md por padrão e os demais alvos só sob demanda', () => {
  const dir = mkTmpDir();
  let result = runCli(['init', '.', '--force'], dir);
  assert.equal(result.status, 0, result.stderr);

  // Um projeto onde só AGENTS.md existe na raiz: os outros alvos não devem
  // ser criados sem o usuário pedir.
  for (const f of ['CLAUDE.md', 'GEMINI.md', 'CODEX.md', '.cursorrules']) {
    fs.rmSync(path.join(dir, f), { force: true });
  }
  fs.mkdirSync(path.join(dir, 'Frameworks'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'Frameworks', 'CEREBRO.md'), '# Cérebro de teste\n');

  result = runCli(['sync', '.', '--force'], dir);
  assert.equal(result.status, 0, result.stderr);

  assert.ok(fs.existsSync(path.join(dir, 'AGENTS.md')), 'AGENTS.md é o alvo padrão e deveria existir');
  for (const f of ['CLAUDE.md', 'GEMINI.md', 'CODEX.md', '.cursorrules']) {
    assert.equal(fs.existsSync(path.join(dir, f)), false, `${f} não deveria ser gerado sem --targets`);
  }

  const targetsPath = path.join(dir, '.cortex', 'targets.json');
  assert.ok(fs.existsSync(targetsPath), 'sync deveria registrar os alvos escolhidos em .cortex/targets.json');
  assert.deepEqual(JSON.parse(fs.readFileSync(targetsPath, 'utf8')).targets, ['AGENTS.md']);
});

test('doctor detecta córtex não montado', () => {
  const dir = mkTmpDir();
  let result = runCli(['init', '.', '--force'], dir);
  assert.equal(result.status, 0, result.stderr);

  // Sem Memoria/META.md, o doctor deve reportar que o Córtex não foi montado
  result = runCli(['doctor', '.'], dir);
  assert.notEqual(result.status, 0, 'doctor deve sair com erro quando não há META.md');
  assert.ok(result.stdout.includes('ainda não foi montado') || result.stderr.includes('ainda não foi montado'),
    'doctor deve avisar que o Córtex não está montado');
});

test('doctor audita um córtex com pendências e inconsistências', () => {
  const dir = mkTmpDir();
  let result = runCli(['init', '.', '--force'], dir);
  assert.equal(result.status, 0, result.stderr);

  // Monta um META.md com mapa de arquivos
  fs.writeFileSync(
    path.join(dir, 'Memoria', 'META.md'),
    '# META — Índice\n\n**Negócio:** Empresa Teste\n**Setor:** Tecnologia\n' +
    '**Tipo:** Eu-presa\n**Onboarding realizado em:** 2025-01-15\n' +
    '**Última revisão:** 2025-07-15\n**Próxima revisão sugerida:** 2026-01-15\n\n' +
    '## Mapa de Arquivos\n\n' +
    '| Tópico | Arquivo | Seção (âncora) |\n' +
    '|--------|---------|----------------|\n' +
    '| Estratégia | `Pilares/01_Estrategia.md` | — |\n' +
    '| Cultura | `Pilares/02_Cultura.md` | — |\n' +
    '| Financeiro | `Pilares/03_Financeiro.md` | — |\n' +
    '| Comercial | `Pilares/04_Comercial.md` | — |\n' +
    '| Comunicação | `Pilares/05_Comunicacao.md` | — |\n' +
    '| Operação | `Pilares/06_Operacao.md` | — |\n' +
    '| Decisões | `Memoria/01_Decisoes.md` | — |\n' +
    '| Lições | `Memoria/02_Licoes.md` | — |\n' +
    '| Projetos | `Memoria/03_Projetos.md` | — |\n'
  );

  // Cria alguns pilares com REVISAR e frontmatter null
  fs.writeFileSync(path.join(dir, 'Pilares', '01_Estrategia.md'), '# Estratégia\n\nAlgum conteúdo real.\n');
  fs.writeFileSync(path.join(dir, 'Pilares', '02_Cultura.md'), '# Cultura\n\n<!-- REVISAR -->\n## Valores\n<!-- REVISAR -->\n');
  fs.writeFileSync(path.join(dir, 'Pilares', '03_Financeiro.md'),
    '---\nmargem_alvo: null\nmargem_minima: null\n---\n\n# Financeiro\n\n## Custos Fixos\n<!-- REVISAR -->\n');
  fs.writeFileSync(path.join(dir, 'Pilares', '04_Comercial.md'),
    '---\npreco_piso: null\ndesconto_max: null\n---\n\n# Comercial\n\n## Seção vazia\n<!-- Apenas comentário -->\n');
  // Pilares 05 e 06 não existem no disco → quebrados no mapa

  // Memoria
  fs.writeFileSync(path.join(dir, 'Memoria', '01_Decisoes.md'), '# Decisões\n');
  fs.writeFileSync(path.join(dir, 'Memoria', '02_Licoes.md'), '# Lições\n');
  // 03_Projetos.md no mapa mas não no disco → quebrado

  // Arquivo não indexado
  fs.writeFileSync(path.join(dir, 'Memoria', '05_Registros_Gerais.md'), '# Registros\n');

  // Cria CEREBRO.md com camadas
  fs.mkdirSync(path.join(dir, 'Frameworks'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'Frameworks', 'CEREBRO.md'),
    '# Cérebro\n\n<!-- CORTEX:BUSINESS:START -->\nNegócio de Teste\n<!-- CORTEX:BUSINESS:END -->\n\n' +
    '<!-- CORTEX:FRAMEWORK:START -->\nRegras\n<!-- CORTEX:FRAMEWORK:END -->\n');

  result = runCli(['doctor', '.'], dir);
  assert.equal(result.status, 0, result.stderr);

  const out = result.stdout;
  assert.ok(out.includes('Empresa Teste'), 'deve mostrar o nome do negócio');
  assert.ok(/[~]?\d+%/.test(out), 'deve mostrar índice de completude');
  assert.ok(out.includes('🔴') || out.includes('Faltando') || out.includes('05_') || out.includes('06_'), 'deve reportar pilares obrigatórios faltando');
  assert.ok(out.includes('REVISAR'), 'deve contar marcadores REVISAR');
  assert.ok(out.includes('null'), 'deve reportar campos null no frontmatter');
  assert.ok(out.includes('Quebrado') || out.includes('quebrado') || out.includes('quebrados'), 'deve reportar arquivos no mapa sem existir no disco');
  assert.ok(out.includes('Não indexado') || out.includes('indexado'), 'deve reportar arquivos no disco fora do mapa');
  assert.ok(out.includes('Frameworks/CEREBRO.md') || out.includes('camadas'), 'deve reportar saúde do cérebro');
});

test('doctor detecta cérebro legado (sem camadas)', () => {
  const dir = mkTmpDir();
  let result = runCli(['init', '.', '--force'], dir);
  assert.equal(result.status, 0, result.stderr);

  fs.writeFileSync(
    path.join(dir, 'Memoria', 'META.md'),
    '# META — Índice\n\n**Negócio:** Legado\n\n## Mapa de Arquivos\n\n' +
    '| Tópico | Arquivo | Seção (âncora) |\n' +
    '|--------|---------|----------------|\n' +
    '| Estratégia | `Pilares/01_Estrategia.md` | — |\n'
  );
  fs.writeFileSync(path.join(dir, 'Pilares', '01_Estrategia.md'), '# Estratégia\n');
  fs.mkdirSync(path.join(dir, 'Frameworks'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'Frameworks', 'CEREBRO.md'), '# Cérebro antigo, sem marcadores de camada\n');

  result = runCli(['doctor', '.'], dir);
  assert.equal(result.status, 0, result.stderr);

  const out = result.stdout;
  assert.ok(out.includes('Formato antigo') || out.includes('sem camadas') || out.includes('legado'),
    'deve reportar que o cérebro está em formato antigo');
});

// ── Caminhos de erro ──────────────────────────────────────────────

test('sync sem CEREBRO.md deve sair com erro', () => {
  const dir = mkTmpDir();
  let result = runCli(['init', '.', '--force'], dir);
  assert.equal(result.status, 0, result.stderr);

  // Remove CEREBRO.md se existir (init não cria por padrão, mas por via das dúvidas)
  const cerebroPath = path.join(dir, 'Frameworks', 'CEREBRO.md');
  if (fs.existsSync(cerebroPath)) fs.rmSync(cerebroPath);

  result = runCli(['sync', '.', '--force'], dir);
  assert.notEqual(result.status, 0, 'sync sem CEREBRO.md deve sair com erro');
});

test('update sem .agents/ deve sair com erro', () => {
  const dir = mkTmpDir();
  let result = runCli(['init', '.', '--force'], dir);
  assert.equal(result.status, 0, result.stderr);

  fs.rmSync(path.join(dir, '.agents'), { recursive: true, force: true });

  result = runCli(['update', '.', '--force'], dir);
  assert.notEqual(result.status, 0, 'update sem .agents/ deve sair com erro');
});

test('doctor alias "checkup" funciona', () => {
  const dir = mkTmpDir();
  let result = runCli(['init', '.', '--force'], dir);
  assert.equal(result.status, 0, result.stderr);

  // Sem META.md — deve reportar erro
  result = runCli(['checkup', '.'], dir);
  assert.notEqual(result.status, 0);
  assert.ok((result.stdout + result.stderr).includes('ainda não foi montado'));
});

test('doctor alias "diagnostico" funciona', () => {
  const dir = mkTmpDir();
  let result = runCli(['init', '.', '--force'], dir);
  assert.equal(result.status, 0, result.stderr);

  result = runCli(['diagnostico', '.'], dir);
  assert.notEqual(result.status, 0);
  assert.ok((result.stdout + result.stderr).includes('ainda não foi montado'));
});

test('sync --targets=all gera todos os targets', () => {
  const dir = mkTmpDir();
  let result = runCli(['init', '.', '--force'], dir);
  assert.equal(result.status, 0, result.stderr);

  fs.mkdirSync(path.join(dir, 'Frameworks'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'Frameworks', 'CEREBRO.md'), '# Cérebro de teste\n');

  result = runCli(['sync', '.', '--force', '--targets=all'], dir);
  assert.equal(result.status, 0, result.stderr);

  for (const f of ['AGENTS.md', 'CLAUDE.md', 'GEMINI.md', 'CODEX.md', '.cursorrules']) {
    assert.ok(fs.existsSync(path.join(dir, f)), `${f} deveria existir com --targets=all`);
  }
});

test('doctor mostra opcionais não configurados (07/08/09)', () => {
  const dir = mkTmpDir();
  let result = runCli(['init', '.', '--force'], dir);
  assert.equal(result.status, 0, result.stderr);

  // Cria META.md só com os obrigatórios + 01_Estrategia no disco
  fs.writeFileSync(
    path.join(dir, 'Memoria', 'META.md'),
    '# META\n\n**Negócio:** Teste\n\n## Mapa de Arquivos\n\n' +
    '| Tópico | Arquivo | Seção |\n|--------|---------|-------|\n' +
    '| Estratégia | `Pilares/01_Estrategia.md` | — |\n' +
    '| Cultura | `Pilares/02_Cultura.md` | — |\n' +
    '| Comunicação | `Pilares/05_Comunicacao.md` | — |\n' +
    '| Operação | `Pilares/06_Operacao.md` | — |\n'
  );
  for (const p of ['01_Estrategia.md', '02_Cultura.md', '05_Comunicacao.md', '06_Operacao.md']) {
    fs.writeFileSync(path.join(dir, 'Pilares', p), `# ${p}\n\nConteúdo.\n`);
  }

  result = runCli(['doctor', '.'], dir);
  assert.equal(result.status, 0, result.stderr);

  const out = result.stdout;
  // A linha é "ℹ️  Pilares opcionais não configurados:" — busca por trechos da mensagem
  assert.ok(
    out.includes('opcionais') || out.includes('Opcional') || out.includes('03_Financeiro.md'),
    'deve mencionar pilares opcionais não configurados'
  );
});

test('update --force aplica sem pedir confirmação', () => {
  const dir = mkTmpDir();
  let result = runCli(['init', '.', '--force'], dir);
  assert.equal(result.status, 0, result.stderr);

  // Modifica uma skill para simular atualização pendente
  const radarPath = path.join(dir, '.agents', 'skills', 'radar', 'SKILL.md');
  fs.writeFileSync(radarPath, '# versão antiga');

  // Com --force não deve pedir stdin — sai com status 0
  result = runCli(['update', '.', '--force'], dir);
  assert.equal(result.status, 0, result.stderr);

  // A skill deve ter sido atualizada
  const updated = fs.readFileSync(radarPath, 'utf8');
  assert.notEqual(updated, '# versão antiga', '--force deve aplicar a atualização');
});
