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
//   node scripts/build-zip.js [pasta-de-saída]     (padrão: dist/)

const fs = require('fs');
const os = require('os');
const path = require('path');
const zlib = require('zlib');
const { spawnSync } = require('child_process');
const { copyRecursiveSync } = require('../bin/cli.js');

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

// O README de examples/estudio-lumen fala com quem está no GitHub ("baixe o
// ZIP"). Dentro do ZIP vai este, para quem já baixou.
const EXAMPLE_ZIP_README = [
  '# Exemplo: Estúdio Lumen (negócio fictício)',
  '',
  'Esta pasta já está completa: traz os dados de um estúdio de fotografia e vídeo inventado e as habilidades da IA (a pasta `.agents/`). Nenhum dado aqui é real. Não precisa de Node.js nem de terminal.',
  '',
  '1. Abra esta pasta na sua ferramenta de IA. Ela vem pronta para o Claude Code, o Gemini CLI e as ferramentas que leem o arquivo `AGENTS.md`.',
  '2. Diga `radar`, ou pergunte "quem é o cliente ideal do Estúdio Lumen?" ou "posso dar 15% de desconto na cobertura de evento?".',
  '',
  'A IA não reagiu? Confira se você abriu esta pasta (e não a pasta de cima) e escreva no chat: "Leia o arquivo AGENTS.md e siga as instruções."',
  '',
  'As datas do exemplo são fixas (o único prazo é 20/10/2026, e a rotina de todo dia 10 está em aberto a partir de 10/10/2026): o que o radar mostra como atrasado depende do dia em que você abre. Há também dois meses de resultado guardados (julho e agosto de 2026): pergunte `como foi agosto?`.',
  '',
  'Para montar o Córtex do seu negócio: https://github.com/alberthpalhares/cortex',
  '',
].join('\n');

// Monta o exemplo em `dir`: os dados de examples/estudio-lumen + o framework
// desta versão + a marca de versão, troca o README pelo de quem já baixou e
// recompila o cérebro para as ferramentas padrão (o exemplo do repositório não
// traz o GEMINI.md).
function stageExample(dir) {
  copyRecursiveSync(EXAMPLE_DIR, dir);
  fs.writeFileSync(path.join(dir, 'README.md'), EXAMPLE_ZIP_README);
  copyRecursiveSync(path.join(ROOT, '.agents'), path.join(dir, '.agents'));
  writeZipVersion(dir);
  runCli(['sync', dir, '--targets=AGENTS.md,CLAUDE.md,GEMINI.md', '--force']);
}

function buildZips(outDir) {
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'cortex-zip-'));
  const date = new Date();
  try {
    const installDir = path.join(work, 'cortex');
    const exampleDir = path.join(work, 'exemplo');
    fs.mkdirSync(installDir);
    stageInstall(installDir);
    stageExample(exampleDir);

    fs.mkdirSync(outDir, { recursive: true });
    const outputs = [
      { file: path.join(outDir, `cortex-${VERSION}.zip`), dir: installDir },
      { file: path.join(outDir, `cortex-exemplo-estudio-lumen-${VERSION}.zip`), dir: exampleDir },
    ];
    for (const out of outputs) {
      out.count = listFiles(out.dir).length;
      fs.writeFileSync(out.file, zipFolder(out.dir, date));
    }
    return outputs.map(({ file, count }) => ({ file, count }));
  } finally {
    fs.rmSync(work, { recursive: true, force: true });
  }
}

if (require.main === module) {
  try {
    const outDir = path.resolve(process.argv[2] || path.join(ROOT, 'dist'));
    for (const { file, count } of buildZips(outDir)) {
      const kb = Math.round(fs.statSync(file).size / 1024);
      console.log(`✓ ${path.relative(process.cwd(), file)} (${count} arquivos, ${kb} KB)`);
    }
  } catch (err) {
    console.error(`✗ Não consegui gerar os ZIPs: ${err.message}`);
    process.exit(1);
  }
}

module.exports = { crc32, createZip, listFiles, zipFolder, assertNoBusinessData, stageInstall, stageExample, buildZips };
