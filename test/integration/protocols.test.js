const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// Os testes nunca consultam o npm (o doctor e o update fariam isso).
process.env.CORTEX_NO_UPDATE_CHECK = '1';
const { mkTmpDir } = require('../support/tmp');
const cli = require('../../bin/cli.js');

// Os dois protocolos vêm com o framework (.agents/cortex/) desde a v1.5.0. Antes
// eram copiados para Frameworks/ na montagem e nunca mais atualizados — por isso
// o Guardião de Margem novo não chegava a quem já usava o Córtex.

const ROOT = path.join(__dirname, '..', '..');
const CLI = path.join(ROOT, 'bin', 'cli.js');
const run = (args, cwd) => spawnSync(process.execPath, [CLI, ...args], { cwd, encoding: 'utf8' });
const read = (dir, f) => fs.readFileSync(path.join(dir, f), 'utf8');
const TEMPLATE = path.join('.agents', 'skills', 'cortex-onboarding', 'resources', 'CORTEX_TEMPLATE.md');
const OLD_RULES = '\nRule 7: apply `Frameworks/PROTOCOLO_AUTONOMIA.md`.\n';

function installed() {
  const dir = mkTmpDir();
  assert.equal(run(['init', '.', '--force'], dir).status, 0);
  return dir;
}

function setVersion(dir, version) {
  fs.writeFileSync(path.join(dir, '.cortex', 'version.json'), JSON.stringify({ version, updatedAt: '2026-01-01T00:00:00.000Z' }) + '\n');
}

// Um Córtex montado numa versão antiga: regras antigas no cérebro e as duas cópias em Frameworks/.
function mountedOld(dir) {
  const template = cli.normalizeEol(read(dir, TEMPLATE));
  fs.writeFileSync(
    path.join(dir, 'Frameworks', 'CEREBRO.md'),
    cli.replaceRegion(template, cli.FRAMEWORK_START, cli.FRAMEWORK_END, OLD_RULES)
  );
  for (const f of cli.LEGACY_PROTOCOL_FILES) {
    fs.writeFileSync(path.join(dir, 'Frameworks', f), `CÓPIA ANTIGA DE ${f}`);
    // Antes da 1.5.0 o .agents/ não trazia os protocolos: quem os entrega é o update.
    fs.rmSync(path.join(dir, '.agents', 'cortex', f));
  }
  // O índice da Memória é o mínimo para o doctor rodar o diagnóstico completo.
  fs.writeFileSync(path.join(dir, 'Memoria', 'META.md'), '# META\n\n**Negócio:** Teste\n');
  assert.equal(run(['sync', '.', '--force'], dir).status, 0);
  setVersion(dir, '1.4.2');
}

test('instalação nova traz os protocolos no framework e nenhuma cópia em Frameworks/', () => {
  const dir = installed();
  for (const f of cli.LEGACY_PROTOCOL_FILES) {
    assert.ok(fs.existsSync(path.join(dir, '.agents', 'cortex', f)), `.agents/cortex/${f}`);
    assert.equal(fs.existsSync(path.join(dir, 'Frameworks', f)), false, `Frameworks/${f} não é mais criado`);
  }
  assert.deepEqual(cli.findLegacyProtocols(dir), []);
  assert.ok(read(dir, TEMPLATE).includes('.agents/cortex/PROTOCOLO_AUTONOMIA.md'), 'o molde do cérebro aponta para o protocolo do framework');
});

test('update leva o Guardião novo a um Córtex antigo: o cérebro passa a apontar para o protocolo que se atualiza', () => {
  const dir = installed();
  mountedOld(dir);
  assert.ok(read(dir, 'AGENTS.md').includes('Frameworks/PROTOCOLO_AUTONOMIA.md'), 'ponto de partida: regras antigas');

  // Antes do update o cérebro ainda lê as cópias de Frameworks/: o doctor não pode mandar apagar.
  const before = run(['doctor', '.', '--offline'], dir);
  assert.ok(before.stdout.includes('System prompt'), 'o doctor chegou ao fim do diagnóstico');
  assert.ok(!before.stdout.includes('Pode apagar'), before.stdout);

  const r = run(['update', '.', '--force'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  for (const f of cli.LEGACY_PROTOCOL_FILES) {
    assert.ok(fs.existsSync(path.join(dir, '.agents', 'cortex', f)), `o update entregou .agents/cortex/${f}`);
  }

  for (const f of ['AGENTS.md', path.join('Frameworks', 'CEREBRO.md')]) {
    const content = read(dir, f);
    assert.ok(content.includes('.agents/cortex/PROTOCOLO_AUTONOMIA.md'), `${f} aponta para o protocolo novo`);
    assert.ok(!content.includes('Frameworks/PROTOCOLO_AUTONOMIA.md'), `${f} não aponta mais para a cópia antiga`);
  }
  assert.ok(read(dir, path.join('.agents', 'cortex', 'PROTOCOLO_AUTONOMIA.md')).includes('minimum price ='), 'a conta de volta chegou');

  // As cópias antigas não são apagadas — só avisadas.
  for (const f of cli.LEGACY_PROTOCOL_FILES) assert.equal(read(dir, path.join('Frameworks', f)), `CÓPIA ANTIGA DE ${f}`);
  assert.ok(r.stdout.includes('não são mais usados'), r.stdout);

  // Depois do update o doctor já pode dizer que as cópias sobraram.
  const after = run(['doctor', '.', '--offline'], dir);
  assert.ok(after.stdout.includes('cópia antiga, não é mais usada'), after.stdout);
});

test('Córtex anterior ao CEREBRO.md: o cérebro dos arquivos de raiz ainda lê a cópia, e o update não manda apagar', () => {
  const dir = installed();
  fs.writeFileSync(path.join(dir, 'Memoria', 'META.md'), '# META\n\n**Negócio:** Antigo\n');
  fs.writeFileSync(path.join(dir, 'AGENTS.md'), '# Cérebro antigo\n\nAplique `Frameworks/PROTOCOLO_AUTONOMIA.md`.\n');
  fs.writeFileSync(path.join(dir, 'Frameworks', 'PROTOCOLO_AUTONOMIA.md'), 'CÓPIA EM USO');
  fs.writeFileSync(path.join(dir, '.agents', 'skills', 'radar', 'SKILL.md'), '# versão antiga');
  setVersion(dir, '1.4.2');

  const r = run(['update', '.', '--force'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.ok(!/não (é|são) mais usados?/.test(r.stdout), r.stdout);
  assert.ok(!run(['doctor', '.', '--offline'], dir).stdout.includes('Pode apagar'));
  assert.equal(read(dir, path.join('Frameworks', 'PROTOCOLO_AUTONOMIA.md')), 'CÓPIA EM USO');
});

test('cérebro sem camadas continua lendo a cópia antiga: o update não manda apagá-la', () => {
  const dir = installed();
  fs.writeFileSync(path.join(dir, 'Frameworks', 'CEREBRO.md'), '# Cérebro em bloco único\n\nSiga `Frameworks/PROTOCOLO_AUTONOMIA.md`.\n');
  fs.writeFileSync(path.join(dir, 'Frameworks', 'PROTOCOLO_AUTONOMIA.md'), 'CÓPIA EM USO');
  setVersion(dir, '1.4.2');
  fs.writeFileSync(path.join(dir, '.agents', 'skills', 'radar', 'SKILL.md'), '# versão antiga');

  const r = run(['update', '.', '--force'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.ok(!/não (é|são) mais usados?/.test(r.stdout), r.stdout);
  assert.equal(read(dir, path.join('Frameworks', 'PROTOCOLO_AUTONOMIA.md')), 'CÓPIA EM USO');
});

// ── Doctor: o que falta, em blocos ────────────────────────────────

function mountedQuick(dir, pillars) {
  const map = Object.keys(pillars).map((f) => `| x | \`Pilares/${f}\` | — |`).join('\n');
  fs.writeFileSync(
    path.join(dir, 'Memoria', 'META.md'),
    `# META\n\n**Negócio:** Padaria Teste\n\n## Mapa de Arquivos\n\n| Tópico | Arquivo | Seção (âncora) |\n|---|---|---|\n${map}\n`
  );
  for (const [f, content] of Object.entries(pillars)) fs.writeFileSync(path.join(dir, 'Pilares', f), content);
  fs.copyFileSync(path.join(dir, TEMPLATE), path.join(dir, 'Frameworks', 'CEREBRO.md'));
  assert.equal(run(['sync', '.', '--force'], dir).status, 0);
}

test('doctor depois da montagem rápida: "o essencial está funcionando", não uma nota zero', () => {
  const dir = installed();
  mountedQuick(dir, {
    '01_Estrategia.md': '# Estratégia\n\n## Posicionamento\nPão quente às 6h.\n\n## Panorama Competitivo\n<!-- em branco até a pesquisa -->\n',
    '02_Cultura.md': '# Cultura\n\n## Valores\n<!-- REVISAR -->\n',
    '05_Comunicacao.md': '# Comunicação\n\n## Tom de Voz\n<!-- REVISAR -->\n',
    '06_Operacao.md': '# Operação\n\n## Rotina\nAbre às 6h.\n'
  });

  const r = run(['doctor', '.', '--offline'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.ok(r.stdout.includes('O essencial está funcionando'), r.stdout);
  assert.ok(r.stdout.includes('Falta completar 2 de 4 pilares essenciais (Cultura, Comunicação)'), r.stdout);
  assert.ok(!/~\d+%/.test(r.stdout), 'sem porcentagem de completude');
});

test('doctor com os 4 pilares preenchidos diz que estão completos, mesmo com o Panorama Competitivo em branco', () => {
  const dir = installed();
  mountedQuick(dir, {
    '01_Estrategia.md': '# Estratégia\n\n## Posicionamento\nPão quente às 6h.\n\n## Panorama Competitivo\n<!-- em branco até a pesquisa -->\n',
    '02_Cultura.md': '# Cultura\n\n## Valores\nPontualidade.\n',
    '05_Comunicacao.md': '# Comunicação\n\n## Tom de Voz\nPróximo e direto.\n',
    '06_Operacao.md': '# Operação\n\n## Rotina\nAbre às 6h.\n'
  });

  const r = run(['doctor', '.', '--offline'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.ok(r.stdout.includes('Os 4 pilares essenciais estão completos'), r.stdout);
});
