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

// ── Doctor: números do cabeçalho e arquivo morto ──────────────────

const FULL_PILLARS = {
  '01_Estrategia.md': '# Estratégia\n\n## Posicionamento\nPão quente às 6h.\n',
  '02_Cultura.md': '# Cultura\n\n## Valores\nPontualidade.\n',
  '05_Comunicacao.md': '# Comunicação\n\n## Tom de Voz\nPróximo e direto.\n',
  '06_Operacao.md': '# Operação\n\n## Rotina\nAbre às 6h.\n'
};

test('doctor aponta número no formato brasileiro no cabeçalho do Financeiro e do Comercial, sem mexer nos arquivos', () => {
  const dir = installed();
  const financeiro = '---\nmargem_alvo: 30%   # meta\nmargem_minima: 20\ncustos_variaveis:\n  "Bolo de festa": R$ 45,50\n  "Pão": 2\nimposto_pct: 6\n---\n\n# Financeiro\n\n## Custos\nAluguel.\n';
  const comercial = '---\npreco_piso: 1.500\ndesconto_max: 10\n---\n\n# Comercial\n\n## Preços\nTabela.\n';
  mountedQuick(dir, { ...FULL_PILLARS, '03_Financeiro.md': financeiro, '04_Comercial.md': comercial });

  const r = run(['doctor', '.', '--offline'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.ok(r.stdout.includes('Números para corrigir'), r.stdout);
  assert.ok(/03_Financeiro\.md — margem_alvo está escrito "30%"\. Deixe só o número: 30/.test(r.stdout), r.stdout);
  assert.ok(r.stdout.includes('"Bolo de festa" (em custos_variaveis) está escrito "R$ 45,50". Deixe só o número: 45.5'), r.stdout);
  assert.ok(/04_Comercial\.md — preco_piso está escrito "1\.500", que é lido como 1,5\. Se o valor é 1500, escreva 1500/.test(r.stdout), r.stdout);
  assert.ok(!r.stdout.includes('Pilares com pendências: Nenhum'), 'um pilar com número quebrado não está "sem pendências"');
  const sugestao = r.stdout.slice(r.stdout.indexOf('Sugestão:'));
  assert.ok(sugestao.includes('Corrija os números apontados acima'), r.stdout);
  assert.ok(!sugestao.includes('continuar onboarding'), 'o onboarding não corrige formato de número');
  for (const bom of ['margem_minima', 'desconto_max', 'imposto_pct', '"Pão"']) {
    assert.ok(!r.stdout.includes(`${bom} está escrito`), `${bom} está certo e não pode ser acusado`);
  }
  assert.equal(read(dir, path.join('Pilares', '03_Financeiro.md')), financeiro, 'o doctor só relata');
  assert.equal(read(dir, path.join('Pilares', '04_Comercial.md')), comercial, 'o doctor só relata');
});

test('doctor não acusa números quando o cabeçalho está certo', () => {
  const r = run(['doctor', path.join(ROOT, 'examples', 'estudio-lumen'), '--offline'], ROOT);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.ok(!r.stdout.includes('Números para corrigir'), r.stdout);
});

function withArchiveInMap(dir, mapLines) {
  mountedQuick(dir, FULL_PILLARS);
  fs.appendFileSync(path.join(dir, 'Memoria', 'META.md'), mapLines.map((l) => `| Itens antigos | \`${l}\` | — |\n`).join(''));
}

test('doctor não chama de "Quebrado" o arquivo morto (Memoria/_Arquivo) que existe', () => {
  const dir = installed();
  fs.mkdirSync(path.join(dir, 'Memoria', '_Arquivo'));
  fs.writeFileSync(path.join(dir, 'Memoria', '_Arquivo', '2025.md'), '# Arquivo 2025\n');
  fs.writeFileSync(path.join(dir, 'Memoria', '_Arquivo', '2024.md'), '# Arquivo 2024\n');
  withArchiveInMap(dir, ['Memoria/_Arquivo/', 'Memoria/_Arquivo/2025.md', 'Memoria/_Arquivo/AAAA.md',
    'Memoria/_Arquivo/ (2024, 2025)', 'Memoria/_Arquivo/2024.md`, `Memoria/_Arquivo/2025.md']);

  const r = run(['doctor', '.', '--offline'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.ok(!r.stdout.includes('Quebrado'), r.stdout);
  assert.ok(r.stdout.includes('META.md: sem inconsistências'), r.stdout);
});

test('doctor continua acusando o arquivo morto que está no mapa e sumiu do disco', () => {
  const dir = installed();
  fs.mkdirSync(path.join(dir, 'Memoria', '_Arquivo'));
  fs.writeFileSync(path.join(dir, 'Memoria', '_Arquivo', '2025.md'), '# Arquivo 2025\n');
  withArchiveInMap(dir, ['Memoria/_Arquivo/2024.md']);
  let r = run(['doctor', '.', '--offline'], dir);
  assert.ok(r.stdout.includes('Quebrado') && r.stdout.includes('Memoria/_Arquivo/2024.md'), r.stdout);

  // Pasta existe, mas o arquivo citado não: sufixo, nome parecido, um dos dois anos.
  const citados = ['Memoria/_Arquivo/2023.md (antigos)', 'Memoria/_Arquivos_Velhos.md',
    'Memoria/_Arquivo/Decisoes_2023.md', 'Memoria/_Arquivo/2025.md, Memoria/_Arquivo/2019.md'];
  const outro = installed();
  fs.mkdirSync(path.join(outro, 'Memoria', '_Arquivo'));
  fs.writeFileSync(path.join(outro, 'Memoria', '_Arquivo', '2025.md'), '# Arquivo 2025\n');
  withArchiveInMap(outro, citados);
  r = run(['doctor', '.', '--offline'], outro);
  for (const linha of citados) {
    assert.ok(r.stdout.includes(`Quebrado\u001b[0m — ${linha}`) || r.stdout.includes(`Quebrado — ${linha}`), `${linha}\n${r.stdout}`);
  }

  const semPasta = installed();
  withArchiveInMap(semPasta, ['Memoria/_Arquivo/']);
  r = run(['doctor', '.', '--offline'], semPasta);
  assert.ok(r.stdout.includes('Quebrado') && r.stdout.includes('Memoria/_Arquivo/'), r.stdout);
});

test('doctor não acusa a seção de rotinas nem as linhas 🔁, com ou sem a linha dela no índice', () => {
  const pend = path.join('Memoria', '04_Pessoas_Pendencias.md');
  const meta = path.join('Memoria', 'META.md');
  const check = (dir, label) => {
    const before = read(dir, pend);
    const r = run(['doctor', dir, '--offline'], ROOT);
    assert.equal(r.status, 0, r.stdout + r.stderr);
    assert.ok(r.stdout.includes('META.md: sem inconsistências'), `${label}: ${r.stdout}`);
    assert.ok(r.stdout.includes('Pilares com pendências: Nenhum'), `${label}: a seção nova não é pendência de preenchimento`);
    for (const word of ['Quebrado', 'Não indexado', 'Rotinas', '🔁']) assert.ok(!r.stdout.includes(word), `${label}: o doctor não deveria falar de "${word}"`);
    assert.equal(read(dir, pend), before, 'o doctor só relata');
  };

  // O exemplo: seção com duas rotinas e a linha "## Rotinas" no índice.
  const withRow = mkTmpDir();
  cli.copyRecursiveSync(path.join(ROOT, 'examples', 'estudio-lumen'), withRow);
  assert.ok(read(withRow, pend).includes('## Rotinas\n- 🔁 **[TODO MÊS: dia 10]**') && read(withRow, meta).includes('`## Rotinas`'));
  check(withRow, 'com a linha no índice');

  // Instalação antiga: o registrar criou a seção, o índice continua sem a linha dela.
  const oldIndex = mkTmpDir();
  cli.copyRecursiveSync(path.join(ROOT, 'examples', 'estudio-lumen'), oldIndex);
  fs.writeFileSync(path.join(oldIndex, meta), read(oldIndex, meta).split('\n').filter((l) => !l.includes('## Rotinas')).join('\n'));
  check(oldIndex, 'sem a linha no índice');

  // E um arquivo que ainda não tem a seção continua sem nada a apontar.
  const noSection = mkTmpDir();
  cli.copyRecursiveSync(path.join(ROOT, 'examples', 'estudio-lumen'), noSection);
  fs.writeFileSync(path.join(noSection, pend), read(noSection, pend).replace(/## Rotinas\n(- 🔁 .*\n)+\n/, ''));
  assert.ok(!read(noSection, pend).includes('Rotinas'));
  check(noSection, 'sem a seção');
});

test('doctor não acusa a seção de resultado mês a mês nem as linhas 📊, com ou sem a linha dela no índice', () => {
  const gerais = path.join('Memoria', '05_Registros_Gerais.md');
  const meta = path.join('Memoria', 'META.md');
  const check = (dir, label) => {
    const before = read(dir, gerais);
    const r = run(['doctor', dir, '--offline'], ROOT);
    assert.equal(r.status, 0, r.stdout + r.stderr);
    assert.ok(r.stdout.includes('META.md: sem inconsistências'), `${label}: ${r.stdout}`);
    assert.ok(r.stdout.includes('Pilares com pendências: Nenhum'), `${label}: a seção nova não é pendência de preenchimento`);
    for (const word of ['Quebrado', 'Não indexado', 'Resultado Mês', 'Receita R$']) assert.ok(!r.stdout.includes(word), `${label}: o doctor não deveria falar de "${word}"`);
    assert.equal(read(dir, gerais), before, 'o doctor só relata');
  };
  const copy = () => {
    const dir = mkTmpDir();
    cli.copyRecursiveSync(path.join(ROOT, 'examples', 'estudio-lumen'), dir);
    return dir;
  };

  // O exemplo: seção com dois meses e a linha dela no índice.
  const withRow = copy();
  assert.ok(read(withRow, gerais).includes('## Resultado Mês a Mês\n- 📊 **[2026-08]**') && read(withRow, meta).includes('`## Resultado Mês a Mês`'));
  check(withRow, 'com a linha no índice');

  // Instalação antiga: a skill criou a seção, o índice continua sem a linha dela.
  const oldIndex = copy();
  fs.writeFileSync(path.join(oldIndex, meta), read(oldIndex, meta).split('\n').filter((l) => !l.includes('## Resultado Mês a Mês')).join('\n'));
  check(oldIndex, 'sem a linha no índice');

  // Índice novo (o molde já traz a linha) e arquivo que ainda não tem a seção.
  const noSection = copy();
  fs.writeFileSync(path.join(noSection, gerais), read(noSection, gerais).replace(/\n## Resultado Mês a Mês\n(- 📊 .*\n)+/, ''));
  assert.ok(!read(noSection, gerais).includes('Resultado'));
  check(noSection, 'sem a seção');

  // Um mês com prejuízo e um escrito à mão, incompleto, também não são problema.
  const odd = copy();
  fs.appendFileSync(path.join(odd, gerais), '- 📊 **[2026-06]** Receita R$ 9.000 · Custos e despesas R$ 10.200 · Resultado -R$ 1.200 · Margem líquida -13,3% *(analisado em 2026-07-03)*\n- 📊 **[2026-05]** Receita R$ 12.000\n');
  check(odd, 'prejuízo e linha escrita à mão');
});
