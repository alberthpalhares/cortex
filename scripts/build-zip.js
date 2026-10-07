#!/usr/bin/env node

// Gera as duas pastas prontas para baixar, que vão anexadas à Release do GitHub:
//
//   dist/cortex-<versão>.zip
//     exatamente o que `cortex init` instala numa pasta vazia. Quem baixa só
//     descompacta, abre a pasta na ferramenta de IA e conversa — sem Node.js.
//   dist/cortex-exemplo-estudio-lumen-<versão>.zip
//     o Córtex de exemplo (examples/estudio-lumen) já com o framework (.agents/)
//     dentro, pronto para abrir e dizer "radar".
//
// O primeiro ZIP sai do init de verdade, rodado numa pasta temporária: não há
// uma segunda lista de "o que instalar" para manter em dia.
//
// O Node não tem um gravador de ZIP embutido, e o Córtex não tem dependências:
// o formato é escrito aqui (compressão deflate do próprio zlib, nomes em UTF-8,
// barras "/" e entradas em ordem alfabética, igual em qualquer sistema).
//
// Uso:
//   node scripts/build-zip.js [pasta-de-saída] [--hoje=AAAA-MM-DD]     (padrão: dist/)
//
// As datas do exemplo são ajustadas para a semana em que o ZIP é gerado (ver
// "As datas do exemplo", abaixo). --hoje (ou a variável CORTEX_ZIP_HOJE) fixa
// esse dia: --hoje=2026-10-05 gera o exemplo com as datas do repositório. Com
// o dia fixado, os dois ZIPs saem iguais byte a byte em qualquer hora.

const fs = require('fs');
const os = require('os');
const path = require('path');
const zlib = require('zlib');
const { spawnSync } = require('child_process');
const { copyRecursiveSync, extractRegion, replaceRegion, BUSINESS_START, BUSINESS_END, CEREBRO_PATH } = require('../bin/cli.js');

const ROOT = path.resolve(__dirname, '..');
const CLI = path.join(ROOT, 'bin', 'cli.js');
const EXAMPLE_DIR = path.join(ROOT, 'examples', 'estudio-lumen');
const VERSION = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version;

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

// Monta um arquivo ZIP em memória. `entries` é uma lista de { name, data }:
// `name` com barras "/" e `data` um Buffer. A ordem de gravação é a alfabética.
function createZip(entries, date) {
  // O campo de data do ZIP não tem fuso: o descompactador lê como hora local.
  // Vai no horário de Brasília (UTC-3), para os arquivos extraídos no Brasil
  // não aparecerem "modificados no futuro".
  const when = new Date((date || new Date()).getTime() - 3 * 60 * 60 * 1000);
  const dosTime = (when.getUTCHours() << 11) | (when.getUTCMinutes() << 5) | (when.getUTCSeconds() >> 1);
  const dosDate = ((Math.max(when.getUTCFullYear(), 1980) - 1980) << 9) | ((when.getUTCMonth() + 1) << 5) | when.getUTCDate();
  const sorted = entries.slice().sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

  const locals = [];
  const centrals = [];
  let offset = 0;

  for (const entry of sorted) {
    const name = Buffer.from(entry.name, 'utf8');
    const deflated = zlib.deflateRawSync(entry.data, { level: 9 });
    const store = deflated.length >= entry.data.length;
    const body = store ? entry.data : deflated;

    // Campos comuns ao cabeçalho local e ao diretório central.
    const common = Buffer.alloc(26);
    common.writeUInt16LE(20, 0);                // versão necessária para extrair (2.0)
    common.writeUInt16LE(0x0800, 2);            // bit 11: nomes em UTF-8
    common.writeUInt16LE(store ? 0 : 8, 4);     // 0 = sem compressão, 8 = deflate
    common.writeUInt16LE(dosTime, 6);
    common.writeUInt16LE(dosDate, 8);
    common.writeUInt32LE(crc32(entry.data), 10);
    common.writeUInt32LE(body.length, 14);
    common.writeUInt32LE(entry.data.length, 18);
    common.writeUInt16LE(name.length, 22);
    common.writeUInt16LE(0, 24);                // campo extra

    const localSig = Buffer.alloc(4);
    localSig.writeUInt32LE(0x04034b50, 0);
    locals.push(localSig, common, name, body);

    const centralHead = Buffer.alloc(6);
    centralHead.writeUInt32LE(0x02014b50, 0);
    centralHead.writeUInt16LE(20, 4);           // versão de quem gravou
    const centralTail = Buffer.alloc(14);       // comentário, disco, atributos (zeros)
    centralTail.writeUInt32LE(offset, 10);      // onde começa o cabeçalho local
    centrals.push(centralHead, common, centralTail, name);

    offset += 4 + common.length + name.length + body.length;
  }

  const central = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(sorted.length, 8);
  end.writeUInt16LE(sorted.length, 10);
  end.writeUInt32LE(central.length, 12);
  end.writeUInt32LE(offset, 16);

  return Buffer.concat(locals.concat([central, end]));
}

function listFiles(dir, base) {
  base = base || dir;
  let out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out = out.concat(listFiles(full, base));
    else out.push(path.relative(base, full).split(path.sep).join('/'));
  }
  return out;
}

// Os arquivos ficam soltos na raiz do ZIP (sem uma pasta por cima): o "Extrair
// tudo" do Windows e o duplo clique do Mac já criam uma pasta com o nome do ZIP.
function zipFolder(dir, date) {
  return createZip(listFiles(dir).map((name) => ({ name, data: fs.readFileSync(path.join(dir, name)) })), date);
}

function runCli(args) {
  const r = spawnSync(process.execPath, [CLI, ...args], {
    encoding: 'utf8',
    env: { ...process.env, CORTEX_NO_UPDATE_CHECK: '1' },
  });
  if (r.status !== 0) throw new Error(`"cortex ${args[0]}" falhou ao montar a pasta:\n${r.stdout}${r.stderr}`);
}

// A marca de versão das pastas prontas leva só a versão, sem as datas que o
// init grava: a data seria a do dia em que o ZIP foi gerado, e meses depois o
// radar diria a quem acabou de baixar que "faz tempo que não atualiza". As
// datas entram no primeiro `update`.
function writeZipVersion(dir) {
  fs.mkdirSync(path.join(dir, '.cortex'), { recursive: true });
  fs.writeFileSync(path.join(dir, '.cortex', 'version.json'), JSON.stringify({ version: VERSION }, null, 2) + '\n');
}

// O init copia as pastas de dados da raiz deste repositório. Um onboarding de
// teste feito aqui não pode ir parar num arquivo público.
function assertNoBusinessData(dir) {
  const leaked = listFiles(dir).filter((f) => /^(Pilares|Memoria|Ativos|Frameworks)\//.test(f) && !f.endsWith('/.gitkeep'));
  const compiled = fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf8').includes('ARQUIVO GERADO PELO CÓRTEX');
  if (leaked.length > 0 || compiled) {
    throw new Error(
      'A raiz do repositório tem dados de um negócio (um onboarding de teste?). ' +
      'Gere o ZIP a partir de um checkout limpo.\n' + leaked.join('\n')
    );
  }
}

// Roda o init de verdade em `dir` (uma pasta vazia).
function stageInstall(dir) {
  runCli(['init', dir, '--force']);
  assertNoBusinessData(dir);
  writeZipVersion(dir);
}

// ── As datas do exemplo ───────────────────────────────────────────
//
// examples/estudio-lumen tem datas fixas (testes e documentação dependem
// delas). Elas foram escritas para a semana desta segunda-feira: a espera do
// Grupo Andradas tem 7 dias, a rotina do contador cai no sábado e o prazo do
// vídeo vence dali a duas semanas. No ZIP — e só nele — todas as datas andam o
// mesmo número de SEMANAS inteiras, até a semana em que o ZIP é gerado: quem
// baixa vê um radar "desta semana", e os dias da semana continuam verdadeiros.
// O README do exemplo no repositório cita este dia (um teste confere).
const EXAMPLE_REFERENCE_DAY = '2026-10-05';

const DAY_MS = 24 * 60 * 60 * 1000;
const MONTH_NAMES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const pad = (n) => String(n).padStart(2, '0');
const dayToMs = (iso) => Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)));
const msToDay = (ms) => new Date(ms).toISOString().slice(0, 10);
const toBrDay = (iso) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;
const daysInMonth = (year, month) => new Date(Date.UTC(year, month, 0)).getUTCDate();

// O dia de hoje no horário de Brasília (o mesmo fuso das datas gravadas no ZIP).
function todayInBrazil() {
  return msToDay(Date.now() - 3 * 60 * 60 * 1000);
}

// Quanto as datas do exemplo andam para um ZIP gerado no dia `hoje` (AAAA-MM-DD):
// dias (sempre múltiplo de 7), meses e trimestres de diferença entre a semana de
// referência e a semana de `hoje`, e a segunda-feira dessa semana (`weekOf`).
function exampleShift(hoje) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(hoje)) || msToDay(dayToMs(hoje)) !== hoje) {
    throw new Error(`Data inválida para --hoje: "${hoje}". Use o formato AAAA-MM-DD (ex.: ${EXAMPLE_REFERENCE_DAY}).`);
  }
  const ref = dayToMs(EXAMPLE_REFERENCE_DAY);
  const days = Math.floor((dayToMs(hoje) - ref) / DAY_MS / 7) * 7;
  const monthIndex = (ms) => new Date(ms).getUTCFullYear() * 12 + new Date(ms).getUTCMonth();
  const now = ref + days * DAY_MS;
  return {
    days,
    months: monthIndex(now) - monthIndex(ref),
    quarters: Math.floor(monthIndex(now) / 3) - Math.floor(monthIndex(ref) / 3),
    weekOf: msToDay(now),
  };
}

// Anda uma linha do exemplo. Regras:
//   - data completa (AAAA-MM-DD ou DD/MM/AAAA): + shift.days;
//   - mês solto (AAAA-MM, como o carimbo **[AAAA-MM]** do resultado mensal): + shift.months;
//   - etiqueta de trimestre [AAAA-T#]: + shift.quarters;
//   - linha de resultado mensal (**[AAAA-MM]**): as datas completas dela andam
//     em MESES, mantendo o dia — senão "analisado em" poderia cair dentro do
//     próprio mês analisado;
//   - rotina [TODO ANO: mês]: a "próxima" volta a ser o último dia do mês em
//     que a rotina foi feita (ou começou), nos anos seguintes, como na regra da rotina;
//   - etiquetas de rotina acompanham a data "próxima" da própria linha:
//     [TODO MÊS: dia N] e [TODO ANO: DD/MM] passam a ter o dia dela, e
//     [TODO ANO: mês] o mês dela. [TODA SEMANA: …] não muda (semanas inteiras);
//   - ano solto ("Congresso RH Norte 2026") acompanha a data da mesma linha que tinha esse ano.
function shiftExampleLine(line, shift) {
  const monthLine = /\*\*\[\d{4}-\d{2}\]\*\*/.test(line);
  const yearly = /\[TODO ANO: [^\d\]]+\]/.test(line) && line.match(/(?:feito em|desde) (\d{4})-(\d{2})-\d{2}.*próxima (\d{4})-(\d{2})-\d{2}/);
  const years = {};
  const move = (y, m, d) => {
    let out;
    if (monthLine) {
      const index = y * 12 + (m - 1) + shift.months;
      const ny = Math.floor(index / 12);
      const nm = (index % 12) + 1;
      out = `${ny}-${pad(nm)}-${pad(d === daysInMonth(y, m) ? daysInMonth(ny, nm) : Math.min(d, daysInMonth(ny, nm)))}`;
    } else {
      out = msToDay(Date.UTC(y, m - 1, d) + shift.days * DAY_MS);
    }
    if (!years[y]) years[y] = out.slice(0, 4);
    return out;
  };

  let out = line
    .replace(/(?<![\d-])(\d{4})-(\d{2})-(\d{2})(?![\d-])/g, (all, y, m, d) => move(Number(y), Number(m), Number(d)))
    .replace(/(?<![\d/])(\d{2})\/(\d{2})\/(\d{4})(?![\d/])/g, (all, d, m, y) => toBrDay(move(Number(y), Number(m), Number(d))))
    .replace(/(?<![\d-])(\d{4})-(0[1-9]|1[0-2])(?![\d-])/g, (all, y, m) => {
      const index = Number(y) * 12 + Number(m) - 1 + shift.months;
      return `${Math.floor(index / 12)}-${pad((index % 12) + 1)}`;
    })
    .replace(/\[(\d{4})-T([1-4])\]/g, (all, y, q) => {
      const index = Number(y) * 4 + Number(q) - 1 + shift.quarters;
      return `[${Math.floor(index / 4)}-T${(index % 4) + 1}]`;
    });

  if (yearly) {
    // Meses entre a data de partida e a "próxima", contados a partir da data de partida já ajustada.
    const gap = (Number(yearly[3]) * 12 + Number(yearly[4])) - (Number(yearly[1]) * 12 + Number(yearly[2]));
    const from = out.match(/(?:feito em|desde) (\d{4})-(\d{2})-\d{2}/);
    const index = Number(from[1]) * 12 + Number(from[2]) - 1 + gap;
    const ny = Math.floor(index / 12);
    const nm = (index % 12) + 1;
    out = out.replace(/próxima \d{4}-\d{2}-\d{2}/, `próxima ${ny}-${pad(nm)}-${pad(daysInMonth(ny, nm))}`);
  }
  const next = out.match(/próxima (\d{4})-(\d{2})-(\d{2})/);
  if (next) {
    out = out
      .replace(/\[TODO MÊS: dia \d+\]/, `[TODO MÊS: dia ${Number(next[3])}]`)
      .replace(/\[TODO ANO: \d{2}\/\d{2}\]/, `[TODO ANO: ${next[3]}/${next[2]}]`)
      .replace(/\[TODO ANO: [^\d\]]+\]/, `[TODO ANO: ${MONTH_NAMES[Number(next[2]) - 1]}]`);
  }
  return out.replace(/(?<![\d/-])(20\d{2})(?![\d/-])/g, (all, y) => years[y] || y);
}

function shiftExampleText(text, shift) {
  if (shift.days === 0) return text;
  return text.split('\n').map((line) => shiftExampleLine(line, shift)).join('\n');
}

// Anda as datas dos dados do exemplo montado em `dir`: Memoria/, Pilares/ e a
// área CORTEX:BUSINESS do cérebro (as regras do Córtex ficam como são). Os
// arquivos de instrução da raiz saem certos porque são recompilados depois.
function shiftExampleDates(dir, shift) {
  for (const folder of ['Memoria', 'Pilares']) {
    for (const name of listFiles(path.join(dir, folder)).filter((f) => f.endsWith('.md'))) {
      const file = path.join(dir, folder, name);
      fs.writeFileSync(file, shiftExampleText(fs.readFileSync(file, 'utf8'), shift));
    }
  }
  const cerebroPath = path.join(dir, CEREBRO_PATH);
  const cerebro = fs.readFileSync(cerebroPath, 'utf8');
  const business = extractRegion(cerebro, BUSINESS_START, BUSINESS_END);
  if (business === null) throw new Error('O cérebro do exemplo está sem a área CORTEX:BUSINESS.');
  fs.writeFileSync(cerebroPath, replaceRegion(cerebro, BUSINESS_START, BUSINESS_END, shiftExampleText(business, shift)));
}

// O README de examples/estudio-lumen fala com quem está no GitHub ("baixe o
// ZIP"). Dentro do ZIP vai este, para quem já baixou. As datas que ele cita
// são lidas dos dados já ajustados em `dir`, não escritas aqui.
function exampleZipReadme(dir, shift) {
  const read = (f) => fs.readFileSync(path.join(dir, 'Memoria', f), 'utf8');
  const pendencias = read('04_Pessoas_Pendencias.md');
  const deadline = pendencias.match(/\[DEADLINE (\d{4}-\d{2}-\d{2})\]/);
  const routine = pendencias.match(/\[TODO MÊS: dia (\d+)\].*próxima (\d{4}-\d{2}-\d{2})/);
  const months = [...read('05_Registros_Gerais.md').matchAll(/\*\*\[(\d{4})-(\d{2})\]\*\*/g)]
    .map((m) => ({ year: m[1], name: MONTH_NAMES[Number(m[2]) - 1] }))
    .reverse();
  const sameYear = months.every((m) => m.year === months[0].year);
  const monthList = months.map((m) => (sameYear ? m.name : `${m.name} de ${m.year}`)).join(' e ') + (sameYear && months.length > 0 ? ` de ${months[0].year}` : '');

  const dates = [`As datas deste exemplo foram ajustadas para a semana de ${toBrDay(shift.weekOf)} (a semana em que este ZIP foi gerado), para o radar ter o que mostrar.`];
  if (deadline) dates.push(`O único prazo é ${toBrDay(deadline[1])}.`);
  if (routine) dates.push(`A rotina de todo dia ${routine[1]} está em aberto a partir de ${toBrDay(routine[2])}.`);
  dates.push('Se você abrir a pasta semanas depois, o radar mostra esses itens como atrasados: é o esperado.');
  if (months.length > 0) dates.push(`Há também ${months.length === 1 ? 'um mês' : `${months.length} meses`} de resultado guardados (${monthList}): pergunte \`como foi ${months[months.length - 1].name}?\`.`);

  return [
    '# Exemplo: Estúdio Lumen (negócio fictício)',
    '',
    'Esta pasta já está completa: traz os dados de um estúdio de fotografia e vídeo inventado e as habilidades da IA (a pasta `.agents/`). Nenhum dado aqui é real. Não precisa de Node.js nem de terminal.',
    '',
    '1. Abra esta pasta na sua ferramenta de IA. Ela vem pronta para o Claude Code, o Gemini CLI e as ferramentas que leem o arquivo `AGENTS.md`.',
    '2. Diga `radar`, ou pergunte "quem é o cliente ideal do Estúdio Lumen?" ou "posso dar 15% de desconto na cobertura de evento?".',
    '',
    'A IA não reagiu? Confira se você abriu esta pasta (e não a pasta de cima) e escreva no chat: "Leia o arquivo AGENTS.md e siga as instruções."',
    '',
    dates.join(' '),
    '',
    'Para montar o Córtex do seu negócio: https://github.com/alberthpalhares/cortex',
    '',
  ].join('\n');
}

// Monta o exemplo em `dir`: os dados de examples/estudio-lumen (com as datas
// ajustadas para a semana de `hoje`) + o framework desta versão + a marca de
// versão, troca o README pelo de quem já baixou e recompila o cérebro para as
// ferramentas padrão (o exemplo do repositório não traz o GEMINI.md).
function stageExample(dir, hoje) {
  const shift = exampleShift(hoje || todayInBrazil());
  copyRecursiveSync(EXAMPLE_DIR, dir);
  shiftExampleDates(dir, shift);
  fs.writeFileSync(path.join(dir, 'README.md'), exampleZipReadme(dir, shift));
  copyRecursiveSync(path.join(ROOT, '.agents'), path.join(dir, '.agents'));
  writeZipVersion(dir);
  runCli(['sync', dir, '--targets=AGENTS.md,CLAUDE.md,GEMINI.md', '--force']);
  return shift;
}

// O init e o sync carimbam o momento em que rodaram: o dia no cabeçalho
// "Gerado: … em AAAA-MM-DD" dos arquivos de instrução e o `updatedAt` de
// .cortex/targets.json. Na pasta pronta, esses carimbos passam a ser os de
// `hoje`/`when`, para o conteúdo do ZIP depender só do código e do dia pedido.
function stampStaged(dir, hoje, when) {
  for (const name of ['AGENTS.md', 'CLAUDE.md', 'GEMINI.md']) {
    const file = path.join(dir, name);
    if (!fs.existsSync(file)) continue;
    const text = fs.readFileSync(file, 'utf8');
    fs.writeFileSync(file, text.replace(/^(\s*Gerado:\s+cortex sync \(v[^)\n]*\) em )\d{4}-\d{2}-\d{2}$/m, `$1${hoje}`));
  }
  const targetsFile = path.join(dir, '.cortex', 'targets.json');
  if (fs.existsSync(targetsFile)) {
    const data = JSON.parse(fs.readFileSync(targetsFile, 'utf8'));
    if (data.updatedAt) fs.writeFileSync(targetsFile, JSON.stringify({ ...data, updatedAt: when.toISOString() }, null, 2) + '\n');
  }
}

// `options.hoje` (AAAA-MM-DD) fixa o dia para o qual as datas do exemplo são
// ajustadas; sem ele vale o dia de hoje. Com ele a geração é repetível byte a
// byte: a hora gravada nas entradas do ZIP e os carimbos de "gerado em" deixam
// de ser os do relógio e passam a ser a meia-noite (de Brasília) desse dia —
// nunca uma hora "no futuro" para quem extrai no Brasil.
function buildZips(outDir, options) {
  // Conferido antes de qualquer trabalho: uma data errada não deixa nada pela metade.
  const fixed = Boolean(options && options.hoje);
  const hoje = fixed ? options.hoje : todayInBrazil();
  exampleShift(hoje);
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'cortex-zip-'));
  const date = fixed ? new Date(dayToMs(hoje) + 3 * 60 * 60 * 1000) : new Date();
  try {
    const installDir = path.join(work, 'cortex');
    const exampleDir = path.join(work, 'exemplo');
    fs.mkdirSync(installDir);
    stageInstall(installDir);
    const shift = stageExample(exampleDir, hoje);
    stampStaged(installDir, hoje, date);
    stampStaged(exampleDir, hoje, date);

    fs.mkdirSync(outDir, { recursive: true });
    const outputs = [
      { file: path.join(outDir, `cortex-${VERSION}.zip`), dir: installDir },
      { file: path.join(outDir, `cortex-exemplo-estudio-lumen-${VERSION}.zip`), dir: exampleDir, shift },
    ];
    for (const out of outputs) {
      out.count = listFiles(out.dir).length;
      fs.writeFileSync(out.file, zipFolder(out.dir, date));
    }
    return outputs.map(({ file, count, shift: moved }) => (moved ? { file, count, shift: moved } : { file, count }));
  } finally {
    fs.rmSync(work, { recursive: true, force: true });
  }
}

if (require.main === module) {
  try {
    const argv = process.argv.slice(2);
    const hojeFlag = argv.find((a) => a.startsWith('--hoje='));
    const hoje = hojeFlag ? hojeFlag.slice('--hoje='.length) : process.env.CORTEX_ZIP_HOJE;
    const outDir = path.resolve(argv.find((a) => !a.startsWith('--')) || path.join(ROOT, 'dist'));
    for (const { file, count, shift } of buildZips(outDir, { hoje })) {
      const kb = Math.round(fs.statSync(file).size / 1024);
      console.log(`✓ ${path.relative(process.cwd(), file)} (${count} arquivos, ${kb} KB)`);
      if (shift) console.log(`  datas do exemplo: semana de ${toBrDay(shift.weekOf)} (${shift.days / 7} semana(s) depois da semana de referência, ${toBrDay(EXAMPLE_REFERENCE_DAY)})`);
    }
  } catch (err) {
    console.error(`✗ Não consegui gerar os ZIPs: ${err.message}`);
    process.exit(1);
  }
}

module.exports = {
  crc32, createZip, listFiles, zipFolder, assertNoBusinessData, stageInstall, stageExample, buildZips,
  EXAMPLE_REFERENCE_DAY, exampleShift, shiftExampleLine, shiftExampleText,
};
