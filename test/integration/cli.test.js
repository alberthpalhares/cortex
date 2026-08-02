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

  for (const entry of ['.agents', 'Frameworks', 'Memoria', 'Pilares', 'Ativos', 'AGENTS.md', 'CLAUDE.md', 'GEMINI.md', 'CODEX.md', '.cursorrules', '.gitignore']) {
    assert.ok(fs.existsSync(path.join(dir, entry)), `esperava "${entry}" depois do init`);
  }
  assert.ok(fs.existsSync(path.join(dir, '.cortex', 'version.json')), 'esperava .cortex/version.json depois do init');
  assert.ok(fs.existsSync(path.join(dir, '.agents', 'manifest.json')), 'esperava .agents/manifest.json depois do init');
});

test('update nunca altera os dados do usuário (Pilares, Memoria, Ativos, Frameworks, ponteiros de raiz)', () => {
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

  const userDataSnapshot = new Map();
  for (const rel of ['Pilares/01_Estrategia.md', 'Memoria/META.md', '.gitignore', 'AGENTS.md', 'CLAUDE.md']) {
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

test('sync regenera os 5 ponteiros de raiz a partir de Frameworks/CEREBRO.md', () => {
  const dir = mkTmpDir();
  let result = runCli(['init', '.', '--force'], dir);
  assert.equal(result.status, 0, result.stderr);

  fs.mkdirSync(path.join(dir, 'Frameworks'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'Frameworks', 'CEREBRO.md'), '# Cérebro de teste');
  fs.writeFileSync(path.join(dir, 'CLAUDE.md'), 'conteúdo corrompido, precisa ser regenerado');

  result = runCli(['sync', '.', '--force'], dir);
  assert.equal(result.status, 0, result.stderr);

  const claudeContent = fs.readFileSync(path.join(dir, 'CLAUDE.md'), 'utf8');
  assert.ok(claudeContent.includes('Frameworks/CEREBRO.md'), 'ponteiro regenerado deveria referenciar Frameworks/CEREBRO.md');
});
