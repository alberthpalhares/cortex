#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Formatadores ANSI para saída visual no terminal
const reset = '\x1b[0m';
const bold = '\x1b[1m';
const cyan = '\x1b[36m';
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const red = '\x1b[31m';
const dim = '\x1b[2m';

const PKG_PATH = path.join(__dirname, '..', 'package.json');
let VERSION = '0.9.0';
try {
  const pkg = JSON.parse(fs.readFileSync(PKG_PATH, 'utf8'));
  VERSION = pkg.version || VERSION;
} catch (e) {}

const args = process.argv.slice(2);
const command = args[0];

// Camada de FRAMEWORK: código e templates que o CLI pode atualizar com segurança.
// NUNCA inclui Pilares/, Memoria/, Ativos/ ou a região CORTEX:BUSINESS do cérebro
// — esses são os dados do negócio do usuário. Os arquivos de instrução na raiz
// (AGENTS.md, etc.) são artefatos compilados: update os regenera para propagar
// regras novas, mas nunca toca nos dados do negócio.
const FRAMEWORK_ITEMS = ['.agents'];

// Dados do usuário que `cortex update` NUNCA altera.
// Os arquivos de raiz (AGENTS.md etc.) NÃO estão aqui porque são artefatos
// compilados que o update INTENCIONALMENTE regenera para propagar regras novas.
const USER_DATA_ITEMS = [
  'Frameworks',
  'Memoria',
  'Pilares',
  'Ativos',
  '.gitignore'
];

const CORTEX_META_DIR = '.cortex';
const CORTEX_VERSION_FILE = 'version.json';

// Manifesto de framework: lista, versionada, dos arquivos que pertencem à
// camada de framework nesta release. Gerado por scripts/build-manifest.js e
// commitado dentro de .agents/. `cortex update` usa esse manifesto para
// diferenciar arquivos que o framework descontinuou (existiam no manifesto
// instalado, sumiram do manifesto novo) de arquivos que o usuário criou por
// conta própria dentro de .agents/skills (nunca estiveram em nenhum manifesto).
const MANIFEST_REL_PATH = path.join('.agents', 'manifest.json');

// Alvos de compilação: os arquivos de instrução que cada ferramenta de IA lê.
// A partir da v0.11.0 eles são ARTEFATOS GERADOS com o conteúdo COMPLETO do
// cérebro — não mais ponteiros dizendo "vá ler outro arquivo". Ponteiro só
// funciona se a ferramenta seguir a indireção, e nem toda IDE faz isso.
const KNOWN_TARGETS = {
  'AGENTS.md': 'Padrão AGENTS.md — OpenCode, Hermes, Roo Code e ferramentas compatíveis',
  'CLAUDE.md': 'Claude Code',
  'GEMINI.md': 'Gemini CLI, Google Antigravity',
  'CODEX.md': 'OpenAI Codex, Codex CLI, ChatGPT CLI',
  '.cursorrules': 'Cursor, Windsurf'
};

// `AGENTS.md` virou a convenção cross-tool de fato, então é o único alvo gerado
// por padrão. Os demais são gerados sob demanda (`cortex sync --targets=...`),
// mantendo a raiz do projeto limpa e reduzindo a superfície de arquivos.
const DEFAULT_TARGETS = ['AGENTS.md'];

const TARGETS_FILE = 'targets.json';
const CEREBRO_PATH = path.join('Frameworks', 'CEREBRO.md');

// Pilares obrigatórios (v1.0.0+): 01_Estrategia, 02_Cultura, 05_Comunicacao, 06_Operacao.
// 03_Financeiro e 04_Comercial tornaram-se opcionais — eram a principal barreira
// de adoção para novos usuários. Fonte única usada por runDoctor e calculateCompleteness.
const MANDATORY_PILLAR_PREFIXES = ['01_', '02_', '05_', '06_'];
const MANDATORY_PILLAR_NAMES = {
  '01_': 'Estratégia', '02_': 'Cultura',
  '05_': 'Comunicação', '06_': 'Operação'
};

// Template da camada de framework do cérebro (regras de operação, disparo de
// skills). Vive dentro de .agents/, então `cortex update` o atualiza junto com
// as skills — é isso que faz uma skill nova passar a ser realmente acionada
// num Córtex antigo, em vez de só aparecer no disco sem ninguém chamar.
const BRAIN_FRAMEWORK_REL_PATH = path.join('.agents', 'cortex', 'brain.framework.md');

// Marcadores que separam, dentro de Frameworks/CEREBRO.md, o que é do usuário
// (BUSINESS — nunca tocado) do que é do framework (FRAMEWORK — regenerável).
const BUSINESS_START = '<!-- CORTEX:BUSINESS:START -->';
const BUSINESS_END = '<!-- CORTEX:BUSINESS:END -->';
const FRAMEWORK_START = '<!-- CORTEX:FRAMEWORK:START -->';
const FRAMEWORK_END = '<!-- CORTEX:FRAMEWORK:END -->';

// Normaliza separadores de caminho para "/" — necessário porque o manifesto
// é gerado numa máquina (Windows, macOS ou Linux) e comparado em outra.
function toPosix(p) {
  return p.split(path.sep).join('/');
}

// Normalização de fim de linha. Os arquivos do framework chegam com LF, mas o
// cérebro do usuário pode estar em CRLF (Windows, ou checkout do Git com
// autocrlf). Sem isso, toda comparação daria "mudou" e o `update` reescreveria
// o cérebro a cada execução, gerando ruído e diffs gigantes por nada.
function normalizeEol(text) {
  return text.replace(/\r\n/g, '\n');
}

// Descobre o estilo de quebra de linha dominante de um conteúdo, para escrever
// de volta no mesmo padrão em que o arquivo do usuário já estava.
function detectEol(text) {
  const crlf = (text.match(/\r\n/g) || []).length;
  const lf = (text.match(/\n/g) || []).length - crlf;
  return crlf > lf ? '\r\n' : '\n';
}

function applyEol(text, eol) {
  return eol === '\r\n' ? normalizeEol(text).replace(/\n/g, '\r\n') : normalizeEol(text);
}

// Cabeçalho de artefato gerado. Precisa deixar claro para um humano que abrir
// o arquivo que ele não deve ser editado ali — a edição se perde no próximo
// sync. Como é comentário HTML, não atrapalha a leitura pela IA.
function buildGeneratedHeader(version) {
  const data = new Date().toISOString().slice(0, 10);
  return `<!-- ============================================================
     ARQUIVO GERADO PELO CÓRTEX — NÃO EDITE À MÃO.

     Fonte:   ${toPosix(CEREBRO_PATH)}
     Gerado:  cortex sync (v${version}) em ${data}

     Qualquer alteração feita aqui será perdida no próximo
     "npx @aksp/cortex sync". Edite a fonte acima.
     ============================================================ -->

`;
}

// Compila o conteúdo final que cada ferramenta de IA vai ler: o cérebro
// COMPLETO, autossuficiente, sem depender de a IDE seguir nenhum ponteiro.
function compileBrain(cerebroContent, version) {
  const eol = detectEol(cerebroContent);
  const compiled = buildGeneratedHeader(version) + normalizeEol(cerebroContent).trimStart();
  return applyEol(compiled, eol);
}

// Extrai o miolo de uma região marcada. Retorna null se os marcadores não
// existirem (Córtex montado antes da v0.11.0) ou estiverem fora de ordem.
function extractRegion(content, startMarker, endMarker) {
  const startIdx = content.indexOf(startMarker);
  if (startIdx === -1) return null;
  const endIdx = content.indexOf(endMarker, startIdx + startMarker.length);
  if (endIdx === -1) return null;
  return content.slice(startIdx + startMarker.length, endIdx);
}

// Substitui o miolo de uma região marcada, preservando tudo fora dela.
// Retorna null quando os marcadores não existem — o chamador decide o que
// fazer, mas NUNCA deve reescrever o arquivo às cegas nesse caso.
function replaceRegion(content, startMarker, endMarker, newInner) {
  const startIdx = content.indexOf(startMarker);
  if (startIdx === -1) return null;
  const endIdx = content.indexOf(endMarker, startIdx + startMarker.length);
  if (endIdx === -1) return null;
  return (
    content.slice(0, startIdx + startMarker.length) +
    newInner +
    content.slice(endIdx)
  );
}

function hasBrainLayers(content) {
  return (
    extractRegion(content, BUSINESS_START, BUSINESS_END) !== null &&
    extractRegion(content, FRAMEWORK_START, FRAMEWORK_END) !== null
  );
}

// Atualiza APENAS a região de framework do cérebro, a partir do template
// shippado em .agents/. A região de negócio é preservada byte a byte.
// Retorna { status, changed }:
//   'updated'    — região regenerada
//   'unchanged'  — já estava igual
//   'no-markers' — cérebro legado, sem marcadores: nada foi tocado
//   'no-template'/'no-cerebro' — nada a fazer
function refreshBrainFramework(targetDir, templateDir, options) {
  const dryRun = Boolean(options && options.dryRun);
  const cerebroPath = path.join(targetDir, CEREBRO_PATH);
  const templatePath = path.join(templateDir, BRAIN_FRAMEWORK_REL_PATH);

  if (!fs.existsSync(cerebroPath)) return { status: 'no-cerebro', changed: false };
  if (!fs.existsSync(templatePath)) return { status: 'no-template', changed: false };

  const cerebroRaw = fs.readFileSync(cerebroPath, 'utf8');
  const eol = detectEol(cerebroRaw);
  const cerebro = normalizeEol(cerebroRaw);
  const frameworkBody = normalizeEol(fs.readFileSync(templatePath, 'utf8')).trim();

  const currentInner = extractRegion(cerebro, FRAMEWORK_START, FRAMEWORK_END);
  if (currentInner === null) return { status: 'no-markers', changed: false };

  const desiredInner = `\n${frameworkBody}\n`;
  if (currentInner === desiredInner) return { status: 'unchanged', changed: false };

  const updated = replaceRegion(cerebro, FRAMEWORK_START, FRAMEWORK_END, desiredInner);
  if (updated === null) return { status: 'no-markers', changed: false };

  if (dryRun) return { status: 'updated', changed: false };

  fs.writeFileSync(cerebroPath, applyEol(updated, eol));
  return { status: 'updated', changed: true };
}

// Lê os alvos de compilação escolhidos para este projeto. Ordem de precedência:
//   1. .cortex/targets.json (escolha explícita do usuário)
//   2. arquivos de instrução que já existem na raiz (Córtex anterior à v0.11.0,
//      que tinha os 5 ponteiros — respeitamos o que ele já usava)
//   3. DEFAULT_TARGETS
function readTargets(targetDir) {
  const targetsPath = path.join(targetDir, CORTEX_META_DIR, TARGETS_FILE);
  if (fs.existsSync(targetsPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(targetsPath, 'utf8'));
      if (Array.isArray(data.targets) && data.targets.length > 0) {
        return data.targets.filter((t) => Object.prototype.hasOwnProperty.call(KNOWN_TARGETS, t));
      }
    } catch (e) {}
  }

  const detected = Object.keys(KNOWN_TARGETS).filter((f) => fs.existsSync(path.join(targetDir, f)));
  if (detected.length > 0) return detected;

  return DEFAULT_TARGETS.slice();
}

function writeTargets(targetDir, targets) {
  const metaDir = path.join(targetDir, CORTEX_META_DIR);
  if (!fs.existsSync(metaDir)) {
    fs.mkdirSync(metaDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(metaDir, TARGETS_FILE),
    JSON.stringify({ targets, updatedAt: new Date().toISOString() }, null, 2) + '\n'
  );
}

// Interpreta --targets=AGENTS.md,CLAUDE.md (ou --targets all).
function parseTargetsFlag(argv) {
  const raw = argv.find((a) => a.startsWith('--targets='));
  if (!raw) return null;
  const value = raw.slice('--targets='.length).trim();
  if (value === 'all') return Object.keys(KNOWN_TARGETS);
  const list = value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const valid = list.filter((t) => Object.prototype.hasOwnProperty.call(KNOWN_TARGETS, t));
  const invalid = list.filter((t) => !Object.prototype.hasOwnProperty.call(KNOWN_TARGETS, t));
  if (invalid.length > 0) {
    console.log(`  ${yellow}Aviso:${reset} target(s) desconhecido(s) ignorado(s): ${invalid.join(', ')}`);
    console.log(`  ${dim}Targets válidos: ${Object.keys(KNOWN_TARGETS).join(', ')}${reset}\n`);
  }
  return valid.length > 0 ? valid : null;
}

// Compila o cérebro para cada alvo. Retorna a lista de arquivos escritos.
function compileTargets(targetDir, targets, version) {
  const cerebroPath = path.join(targetDir, CEREBRO_PATH);
  const cerebro = fs.readFileSync(cerebroPath, 'utf8');
  const content = compileBrain(cerebro, version);

  const written = [];
  for (const target of targets) {
    fs.writeFileSync(path.join(targetDir, target), content);
    written.push(target);
  }
  return written;
}

const CORTEX_META_FILE = 'meta.json';

function readBusinessName(targetDir) {
  // Prefer structured metadata written by onboarding (v0.12.0+)
  const meta = readCortexMeta(targetDir);
  if (meta && meta.businessName) return meta.businessName;

  // Fallback: regex parse from META.md (backward compat with pre-v0.12.0)
  const metaPath = path.join(targetDir, 'Memoria', 'META.md');
  if (!fs.existsSync(metaPath)) return null;
  try {
    const content = fs.readFileSync(metaPath, 'utf8');
    const match = content.match(/\*\*Neg[oó]cio:\*\*\s*(.+)/);
    if (match && match[1] && !match[1].includes('[Nome do negócio]')) {
      return match[1].trim();
    }
  } catch (e) {}
  return null;
}

// Lê metadados estruturados de .cortex/meta.json (v0.12.0+).
// Retorna null se o arquivo não existir ou for inválido.
function readCortexMeta(targetDir) {
  const metaPath = path.join(targetDir, CORTEX_META_DIR, CORTEX_META_FILE);
  if (!fs.existsSync(metaPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  } catch (e) {
    return null;
  }
}

// Escreve metadados estruturados em .cortex/meta.json.
function writeCortexMeta(targetDir, meta) {
  const metaDir = path.join(targetDir, CORTEX_META_DIR);
  if (!fs.existsSync(metaDir)) {
    fs.mkdirSync(metaDir, { recursive: true });
  }
  const existing = readCortexMeta(targetDir) || {};
  const merged = Object.assign({}, existing, meta, { updatedAt: new Date().toISOString() });
  fs.writeFileSync(
    path.join(metaDir, CORTEX_META_FILE),
    JSON.stringify(merged, null, 2) + '\n'
  );
}

// Extrai os cabeçalhos do META.md (nome, setor, tipo, datas).
function parseMetaHeaders(content) {
  const meta = {};
  const patterns = {
    businessName: /\*\*Neg[oó]cio:\*\*\s*(.+)/,
    sector: /\*\*Setor:\*\*\s*(.+)/,
    type: /\*\*Tipo:\*\*\s*(.+)/,
    onboardedAt: /\*\*Onboarding realizado em:\*\*\s*(.+)/,
    lastReview: /\*\*Última revisão:\*\*\s*(.+)/,
    nextReview: /\*\*Próxima revisão sugerida:\*\*\s*(.+)/,
  };
  for (const [key, re] of Object.entries(patterns)) {
    const match = content.match(re);
    if (match && match[1] && !match[1].includes('[Nome do negócio]') && !match[1].includes('[Setor')) {
      meta[key] = match[1].trim();
    }
  }
  return meta;
}

// Extrai a lista de arquivos únicos referenciados na tabela "Mapa de Arquivos" do META.md.
function parseFileMapFromMeta(content) {
  const files = new Set();
  // Localiza a tabela: linhas entre "## Mapa de Arquivos" e "## Pilares Customizados" (ou fim)
  const mapStart = content.indexOf('## Mapa de Arquivos');
  if (mapStart === -1) return files;

  const customStart = content.indexOf('## Pilares Customizados', mapStart);
  const tableBlock = customStart !== -1
    ? content.slice(mapStart, customStart)
    : content.slice(mapStart);

  // Cada linha da tabela: | Tópico | Arquivo | Seção |
  for (const line of tableBlock.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|') || trimmed.includes('---') || trimmed.includes('Tópico')) continue;
    const cols = trimmed.split('|').map((s) => s.trim()).filter(Boolean);
    if (cols.length >= 2) {
      const filePath = cols[1].replace(/`/g, '').trim();
      if (filePath && (filePath.startsWith('Pilares/') || filePath.startsWith('Memoria/'))) {
        files.add(filePath);
      }
    }
  }
  return files;
}

// Lista os arquivos reais em Pilares/ e Memoria/ (apenas .md, ignora .gitkeep).
// Caminhos normalizados com "/" para comparação consistente cross-platform.
function listRealFiles(targetDir) {
  const files = [];
  for (const sub of ['Pilares', 'Memoria']) {
    const dir = path.join(targetDir, sub);
    if (!fs.existsSync(dir)) continue;
    for (const entry of fs.readdirSync(dir)) {
      if (entry === '.gitkeep') continue;
      const fullPath = path.join(dir, entry);
      if (fs.statSync(fullPath).isFile() && entry.endsWith('.md')) {
        files.push(toPosix(path.join(sub, entry)));
      }
    }
  }
  return files;
}

// Extrai o frontmatter YAML simples de um arquivo (bloco entre --- no topo).
// Retorna um objeto chave→valor ou {} se não houver frontmatter.
function parseSimpleFrontmatter(content) {
  const normalized = normalizeEol(content);
  if (!normalized.startsWith('---')) return {};
  const endIdx = normalized.indexOf('---', 3);
  if (endIdx === -1) return {};
  const fmBlock = normalized.slice(3, endIdx);
  const result = {};
  for (const line of fmBlock.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const rawValue = line.slice(colonIdx + 1).trim();
    // Remove comentários inline
    const valueStr = rawValue.replace(/\s*#.*$/, '').trim();
    if (!key) continue;
    if (valueStr === 'null' || valueStr === '') {
      result[key] = null;
    } else if (valueStr === '{}') {
      result[key] = {};
    } else if (/^-?\d+(\.\d+)?$/.test(valueStr)) {
      result[key] = parseFloat(valueStr);
    } else {
      result[key] = valueStr;
    }
  }
  return result;
}

// Conta marcadores <!-- REVISAR --> e seções em branco num pilar.
// Seções em branco: um heading seguido apenas de espaços/comentários HTML.
function countRevisarAndBlanks(content) {
  const revisarCount = (content.match(/<!--\s*REVISAR\s*-->/g) || []).length;

  // Detecta seções em branco: ## heading seguido apenas de comentários/espaços
  // até o próximo heading de mesmo nível ou superior, ou fim do arquivo.
  let blankSections = 0;
  const normalized = normalizeEol(content);
  const lines = normalized.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!/^##\s+\S/.test(line)) continue;

    // Encontrou um heading ##. Avança para ver se há conteúdo real depois.
    let hasContent = false;
    for (let j = i + 1; j < lines.length; j++) {
      const nextLine = lines[j];
      // Se bateu em outro heading ## ou #, para
      if (/^##\s+\S/.test(nextLine) || /^#\s+\S/.test(nextLine)) break;
      // Linha não vazia, não é comentário HTML?
      const trimmed = nextLine.trim();
      if (trimmed && !trimmed.startsWith('<!--')) {
        hasContent = true;
        break;
      }
    }
    if (!hasContent) blankSections++;
  }

  return { revisarCount, blankSections };
}

// Verifica a saúde do cérebro: CEREBRO.md existe, tem camadas, tem targets compilados.
function checkBrainHealth(targetDir) {
  const cerebroPath = path.join(targetDir, CEREBRO_PATH);
  const result = {
    hasCerebro: false,
    hasLayers: false,
    compiledTargets: [],
    isLegacy: false,
    isPointer: false,
  };

  if (fs.existsSync(cerebroPath)) {
    result.hasCerebro = true;
    const content = normalizeEol(fs.readFileSync(cerebroPath, 'utf8'));
    result.hasLayers = hasBrainLayers(content);
  }

  // Verifica quais alvos compilados existem
  const targets = readTargets(targetDir);
  for (const t of targets) {
    const targetPath = path.join(targetDir, t);
    if (fs.existsSync(targetPath)) {
      const content = normalizeEol(fs.readFileSync(targetPath, 'utf8'));
      // Arquivo legado: ponteiro dizendo "vá ler CEREBRO.md"
      if (content.includes('leia agora') && content.includes('CEREBRO.md')) {
        result.isPointer = true;
      }
      // Só conta como compilado se tem o cabeçalho GERADO (não é ponteiro legado)
      if (content.includes('ARQUIVO GERADO PELO CÓRTEX')) {
        result.compiledTargets.push(t);
      }
    }
  }

  if (!result.hasLayers && result.hasCerebro) {
    result.isLegacy = true;
  }

  return result;
}

// Calcula o índice de completude: share de pilares obrigatórios sem REVISAR.
// Pilares opcionais (03, 04, 07-09) não afetam o índice.
// Arredonda para a dezena mais próxima.
function calculateCompleteness(pillarResults) {
  const mandatory = MANDATORY_PILLAR_PREFIXES.map((p) => p.replace('_', ''));
  const present = mandatory.filter((prefix) => {
    const entry = pillarResults.find((p) => p.file.startsWith(`Pilares/${prefix}_`));
    return entry && entry.exists;
  });
  if (present.length === 0) return 0;
  const clean = present.filter((prefix) => {
    const entry = pillarResults.find((p) => p.file.startsWith(`Pilares/${prefix}_`));
    return entry && entry.revisarCount === 0 && entry.blankSections === 0 && entry.nullFields.length === 0;
  });
  const pct = Math.round((clean.length / present.length) * 100);
  return Math.round(pct / 10) * 10;
}

function printHelp() {
  console.log(`
${bold}${cyan}🧠 Córtex CLI — Central de Inteligência do Seu Negócio${reset} (v${VERSION})

${bold}USO:${reset}
  $ npx @aksp/cortex init [nome-da-pasta]
  $ npx cortex init [nome-da-pasta]
  $ npx cortex update [pasta]
  $ npx cortex sync [pasta]

${bold}COMANDOS:${reset}
  ${green}init [pasta]${reset}   Inicializa a estrutura do Córtex na pasta especificada ou na pasta atual.
                  Por padrão cria só AGENTS.md (padrão cross-tool). Use --targets= para
                  gerar arquivos para outras ferramentas já na instalação.
                  ${dim}--targets=CLAUDE.md,GEMINI.md${reset}   gera bootstrap para ferramentas específicas
                  ${dim}--targets=all${reset}                   gera para todas as ferramentas conhecidas
  ${green}update [pasta]${reset} Atualiza APENAS a camada de framework (.agents/) para a versão instalada do CLI.
                  Nunca toca em Pilares/, Memoria/, Ativos/ nem na área CORTEX:BUSINESS do cérebro.
                  Regenera a área CORTEX:FRAMEWORK do cérebro e recompila os arquivos de instrução.
                  ${dim}--prune${reset}       Remove arquivos que o framework descontinuou (deixaram de existir no
                                manifesto da versão atual). Nunca remove customizações suas — só o que
                                o próprio framework já possuiu e abandonou. Um backup já é feito antes.
  ${green}sync [pasta]${reset}   Compila Frameworks/CEREBRO.md nos arquivos de instrução que a sua ferramenta de IA lê.
                  Cada arquivo gerado leva o cérebro COMPLETO — a IA não precisa seguir ponteiro nenhum.
                  Por padrão gera só AGENTS.md (o padrão cross-tool); os demais, sob demanda.
                  ${dim}--targets=CLAUDE.md,GEMINI.md${reset}   escolhe os alvos (grava em .cortex/targets.json)
                  ${dim}--targets=all${reset}                   gera todos os alvos conhecidos
  ${green}doctor [pasta]${reset} Audita a estrutura do Córtex sem depender de IA: pilares faltando,
                  marcadores REVISAR pendentes, frontmatter incompleto, saúde do cérebro.
                  ${dim}Aliases: checkup, diagnostico${reset}
  ${green}--help, -h${reset}     Exibe esta mensagem de ajuda.
  ${green}--version, -v${reset}  Exibe a versão atual do CLI.

${bold}EXEMPLOS:${reset}
  $ npx @aksp/cortex init
  $ npx @aksp/cortex init MinhaEmpresa
  $ npx cortex init "Meu Negocio"
  $ npx cortex update
  $ npx cortex update --prune
  $ npx cortex sync
`);
}

function printVersion() {
  console.log(`v${VERSION}`);
}

function askConfirmation(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => {
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans.trim().toLowerCase().startsWith('s') || ans.trim().toLowerCase().startsWith('y'));
    });
  });
}

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else if (exists) {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
  }
}

function writeVersionFile(targetDir, version) {
  const metaDir = path.join(targetDir, CORTEX_META_DIR);
  if (!fs.existsSync(metaDir)) {
    fs.mkdirSync(metaDir, { recursive: true });
  }
  const versionPath = path.join(metaDir, CORTEX_VERSION_FILE);
  fs.writeFileSync(
    versionPath,
    JSON.stringify({ version, updatedAt: new Date().toISOString() }, null, 2) + '\n'
  );
}

function readVersionFile(targetDir) {
  const versionPath = path.join(targetDir, CORTEX_META_DIR, CORTEX_VERSION_FILE);
  if (!fs.existsSync(versionPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(versionPath, 'utf8'));
  } catch (e) {
    return null;
  }
}

// Lê o manifesto de framework (.agents/manifest.json) de uma raiz de projeto
// (pode ser o templateDir do pacote instalado ou o targetDir do usuário).
// Retorna um Set de caminhos (formato ".agents/skills/x/SKILL.md") ou null
// se o manifesto não existir — caso de instalações anteriores à v0.10.0.
function readManifestFiles(rootDir) {
  const manifestPath = path.join(rootDir, MANIFEST_REL_PATH);
  if (!fs.existsSync(manifestPath)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    if (!Array.isArray(data.files)) return null;
    return new Set(data.files);
  } catch (e) {
    return null;
  }
}

// Lista recursivamente todos os arquivos (caminhos relativos) dentro de um diretório.
function listFilesRecursive(dir, base) {
  base = base || dir;
  let results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      results = results.concat(listFilesRecursive(fullPath, base));
    } else {
      results.push(path.relative(base, fullPath));
    }
  }
  return results;
}

// Compara a camada de framework do template (pacote instalado) com a do projeto
// alvo e classifica cada arquivo em: novos, alterados, sem mudança e preservados
// (arquivos do usuário dentro de .agents/ que não existem no template — ex: skills
// customizadas que o usuário criou por conta própria, OU skills que o framework
// já possuiu e descontinuou — ver classifyPreserved).
function diffFrameworkLayer(templateDir, targetDir) {
  const novos = [];
  const alterados = [];
  const semMudanca = [];
  const preservados = [];

  for (const item of FRAMEWORK_ITEMS) {
    const templateItemDir = path.join(templateDir, item);
    const targetItemDir = path.join(targetDir, item);

    const templateFiles = listFilesRecursive(templateItemDir);
    const targetFiles = new Set(listFilesRecursive(targetItemDir));

    for (const relPath of templateFiles) {
      const templateFile = path.join(templateItemDir, relPath);
      const targetFile = path.join(targetItemDir, relPath);
      const label = toPosix(path.join(item, relPath));

      if (!fs.existsSync(targetFile)) {
        novos.push(label);
      } else {
        const a = fs.readFileSync(templateFile);
        const b = fs.readFileSync(targetFile);
        if (Buffer.compare(a, b) !== 0) {
          alterados.push(label);
        } else {
          semMudanca.push(label);
        }
      }
      targetFiles.delete(relPath);
    }

    // O que sobrou em targetFiles existe no projeto do usuário mas não no template.
    for (const relPath of targetFiles) {
      preservados.push(toPosix(path.join(item, relPath)));
    }
  }

  return { novos, alterados, semMudanca, preservados };
}

// Separa os arquivos "preservados" (existem no .agents/ do usuário, mas não no
// template atual) em duas categorias:
//   - removidosPeloFramework: o manifesto INSTALADO no projeto (versão antiga)
//     listava esse arquivo como pertencente ao framework, e o manifesto do
//     template ATUAL não lista mais — ou seja, o próprio framework descontinuou
//     ou renomeou esse arquivo. Candidato a remoção (só com --prune).
//   - personalizados: o arquivo nunca esteve em nenhum manifesto conhecido —
//     é uma skill ou customização que o usuário criou por conta própria.
//     Nunca é removido automaticamente, com ou sem --prune.
// Se o projeto alvo não tem manifesto instalado (instalação anterior à
// v0.10.0), não há como distinguir com segurança — tudo cai em
// "personalizados", preservando o comportamento anterior (nunca remover).
function classifyPreserved(preservados, targetDir, templateDir) {
  const oldManifestFiles = readManifestFiles(targetDir);
  const newManifestFiles = readManifestFiles(templateDir);

  if (!oldManifestFiles || !newManifestFiles) {
    return { removidosPeloFramework: [], personalizados: preservados.slice() };
  }

  const removidosPeloFramework = [];
  const personalizados = [];

  for (const label of preservados) {
    if (oldManifestFiles.has(label) && !newManifestFiles.has(label)) {
      removidosPeloFramework.push(label);
    } else {
      personalizados.push(label);
    }
  }

  return { removidosPeloFramework, personalizados };
}

function applyFrameworkUpdate(templateDir, targetDir, novos, alterados) {
  for (const label of novos.concat(alterados)) {
    const srcPath = path.join(templateDir, label);
    const destPath = path.join(targetDir, label);
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(srcPath, destPath);
  }
}

function pruneDeprecatedFiles(targetDir, removidosPeloFramework) {
  for (const label of removidosPeloFramework) {
    const filePath = path.join(targetDir, label);
    if (fs.existsSync(filePath)) {
      fs.rmSync(filePath);
    }
  }
}

async function runInit() {
  // Primeiro argumento que não começa com "-" (pode estar após flags como --force)
  const targetArg = args.slice(1).find((a) => !a.startsWith('-')) || '.';
  const targetDir = path.resolve(process.cwd(), targetArg);
  const templateDir = path.resolve(__dirname, '..');
  const isForce = args.includes('--force') || args.includes('-f');

  // --targets=CLAUDE.md,GEMINI.md ou --targets=all (mesmo parser do sync)
  const toolsFlag = parseTargetsFlag(args);

  console.log(`\n${bold}${cyan}🧠 Inicializando Córtex...${reset}\n`);

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log(`  ${dim}Criada pasta:${reset} ${targetDir}`);
  }

  const existingFiles = fs.readdirSync(targetDir);
  if (existingFiles.length > 0) {
    if (!isForce) {
      console.log(`  ${yellow}⚠️ A pasta de destino não está vazia:${reset} ${targetDir}`);
      const confirmed = await askConfirmation(`  Deseja copiar a estrutura do Córtex mesmo assim? (s/N): `);
      if (!confirmed) {
        console.log(`\n${red}Operação cancelada.${reset}\n`);
        process.exit(0);
      }
    }
  }

  // init sempre cria AGENTS.md (o padrão cross-tool). Os demais targets são
  // gerados sob demanda pelo onboarding Step 7, por --tools= no init, ou por
  // `cortex sync --targets=...`. Isso evita a proliferação de 5 arquivos de
  // instrução que o usuário talvez nunca use.
  const extraTargets = (toolsFlag || []).filter((t) => t !== 'AGENTS.md');
  const bootstrapTargets = ['AGENTS.md'].concat(extraTargets);
  const itemsToCopy = [
    '.agents',
    'Frameworks',
    'Memoria',
    'Pilares',
    'Ativos',
    '.gitignore'
  ].concat(bootstrapTargets);

  console.log(`  ${dim}Copiando arquivos do framework...${reset}`);

  let copiedCount = 0;
  for (const item of itemsToCopy) {
    const srcPath = path.join(templateDir, item);
    const destPath = path.join(targetDir, item);

    if (fs.existsSync(srcPath)) {
      copyRecursiveSync(srcPath, destPath);
      copiedCount++;
      console.log(`   ${green}✓${reset} ${item}`);
    }
  }

  writeVersionFile(targetDir, VERSION);

  const folderName = path.basename(targetDir);

  console.log(`
${bold}${green}🎉 Córtex inicializado com sucesso!${reset}

${bold}Próximos Passos:${reset}
  1. Abra a pasta no seu terminal ou IDE:
     ${cyan}${targetArg === '.' ? '' : `cd "${targetArg}" && `}code .${reset} (ou abra no Cursor, Gemini CLI, Claude Code, etc.)

  2. Peça para a sua IA no chat:
     ${bold}${yellow}"Quero montar meu Córtex"${reset}

  3. A IA vai guiar a entrevista inteligente e gerar todo o seu cérebro de negócios!

${dim}Saiba mais em: https://github.com/alberthpalhares/cortex${reset}
`);
}

async function runUpdate() {
  const targetArg = args[1] && !args[1].startsWith('-') ? args[1] : '.';
  const targetDir = path.resolve(process.cwd(), targetArg);
  const templateDir = path.resolve(__dirname, '..');
  const isForce = args.includes('--force') || args.includes('-f');
  const isPrune = args.includes('--prune');

  console.log(`\n${bold}${cyan}🧠 Verificando atualizações do Córtex...${reset}\n`);

  if (!fs.existsSync(targetDir)) {
    console.log(`${red}Pasta não encontrada:${reset} ${targetDir}`);
    process.exit(1);
  }

  const installed = readVersionFile(targetDir);
  const hasFramework = fs.existsSync(path.join(targetDir, '.agents'));

  if (!hasFramework) {
    console.log(`${red}Não encontrei uma pasta .agents/ aqui.${reset} Este comando atualiza um Córtex já inicializado.`);
    console.log(`Rode ${cyan}npx @aksp/cortex init${reset} primeiro.\n`);
    process.exit(1);
  }

  if (!installed) {
    console.log(`  ${yellow}⚠️ Não encontrei ${CORTEX_META_DIR}/${CORTEX_VERSION_FILE}${reset} — este Córtex foi instalado antes do comando update existir.`);
    console.log(`  Vou tratar a versão atual como desconhecida e comparar diretamente os arquivos.\n`);
  } else if (installed.version === VERSION && !isForce) {
    console.log(`  ${green}✓${reset} Já está na versão mais recente do CLI instalado (v${VERSION}).`);
    console.log(`  ${dim}Use --force se quiser forçar uma nova checagem de arquivos mesmo assim.${reset}\n`);
    return;
  }

  console.log(`  ${dim}Versão instalada no projeto:${reset} ${installed ? 'v' + installed.version : 'desconhecida'}`);
  console.log(`  ${dim}Versão do CLI:${reset} v${VERSION}\n`);

  const { novos, alterados, semMudanca, preservados } = diffFrameworkLayer(templateDir, targetDir);
  const { removidosPeloFramework, personalizados } = classifyPreserved(preservados, targetDir, templateDir);

  console.log(`${bold}O que vai mudar em .agents/ (skills e templates do framework):${reset}`);
  console.log(`  ${green}+ ${novos.length} arquivo(s) novo(s)${reset}`);
  novos.forEach((f) => console.log(`     ${green}+${reset} ${f}`));
  console.log(`  ${yellow}~ ${alterados.length} arquivo(s) atualizado(s)${reset}`);
  alterados.forEach((f) => console.log(`     ${yellow}~${reset} ${f}`));
  console.log(`  ${dim}= ${semMudanca.length} arquivo(s) sem mudança${reset}`);

  if (personalizados.length > 0) {
    console.log(`  ${cyan}• ${personalizados.length} arquivo(s) seu(s) preservado(s)${reset} ${dim}(não fazem parte do framework padrão — ex: skills customizadas suas)${reset}`);
    personalizados.forEach((f) => console.log(`     ${cyan}•${reset} ${f}`));
  }

  if (removidosPeloFramework.length > 0) {
    const acao = isPrune ? `${red}serão removidos${reset} (--prune ativo)` : `${dim}mantidos — rode com --prune para remover${reset}`;
    console.log(`  ${yellow}• ${removidosPeloFramework.length} arquivo(s) que o framework não usa mais nesta versão${reset} — ${acao}`);
    removidosPeloFramework.forEach((f) => console.log(`     ${yellow}•${reset} ${f}`));
  }

  console.log(`\n${bold}O que NUNCA é tocado:${reset} Pilares/, Memoria/, Ativos/ e a área ${dim}CORTEX:BUSINESS${reset} do cérebro (identidade, datas, pilares).`);
  console.log(`${bold}O que é regenerado:${reset} a área ${dim}CORTEX:FRAMEWORK${reset} de ${toPosix(CEREBRO_PATH)} (regras de operação e disparo de skills)`);
  console.log(`  ${dim}e os arquivos de instrução compilados na raiz — sem isso, uma skill nova chega ao disco mas nenhuma IA sabe acioná-la.${reset}\n`);

  const hasFrameworkChanges = novos.length > 0 || alterados.length > 0;
  const hasPruneWork = isPrune && removidosPeloFramework.length > 0;

  // O cérebro pode estar desatualizado mesmo com .agents/ já em dia — é
  // exatamente o caso de quem instalou o framework novo mas nunca migrou as
  // regras. Sem contar isso como trabalho, o update sairia cedo demais e a
  // propagação (a razão de existir deste comando) nunca aconteceria.
  const brainPreview = refreshBrainFramework(targetDir, templateDir, { dryRun: true });
  const hasBrainWork = brainPreview.status === 'updated';

  if (hasBrainWork) {
    console.log(`  ${yellow}~${reset} as regras de operação do cérebro estão desatualizadas e serão regeneradas`);
  }

  if (!hasFrameworkChanges && !hasPruneWork && !hasBrainWork) {
    console.log(`${green}Nada para atualizar em .agents/.${reset}`);
    writeVersionFile(targetDir, VERSION);
    return;
  }

  if (!isForce) {
    const confirmed = await askConfirmation(`  Aplicar essas mudanças? Um backup de .agents/ será criado antes. (s/N): `);
    if (!confirmed) {
      console.log(`\n${red}Atualização cancelada. Nenhum arquivo foi alterado.${reset}\n`);
      return;
    }
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(targetDir, `.agents.backup-${timestamp}`);
  copyRecursiveSync(path.join(targetDir, '.agents'), backupDir);
  console.log(`  ${dim}Backup salvo em:${reset} ${path.relative(targetDir, backupDir)}`);

  if (hasPruneWork) {
    pruneDeprecatedFiles(targetDir, removidosPeloFramework);
    console.log(`  ${yellow}${removidosPeloFramework.length} arquivo(s) descontinuado(s) removido(s).${reset} ${dim}(preservados no backup acima)${reset}`);
  }

  applyFrameworkUpdate(templateDir, targetDir, novos, alterados);

  // Propaga o cérebro: sem este passo, as skills novas chegam ao disco mas
  // continuam invisíveis para a IA, porque nada as ensina a acioná-las.
  const cerebroPath = path.join(targetDir, CEREBRO_PATH);
  if (fs.existsSync(cerebroPath)) {
    fs.copyFileSync(cerebroPath, `${cerebroPath}.backup-${timestamp}`);
  }

  const brain = refreshBrainFramework(targetDir, templateDir);

  if (brain.status === 'updated') {
    console.log(`  ${green}✓${reset} Regras de operação do cérebro atualizadas em ${toPosix(CEREBRO_PATH)} ${dim}(sua área de negócio ficou intacta)${reset}`);
  } else if (brain.status === 'no-markers') {
    console.log(`  ${yellow}!${reset} ${toPosix(CEREBRO_PATH)} ainda não tem as camadas CORTEX:BUSINESS/CORTEX:FRAMEWORK.`);
    console.log(`    ${dim}Não mexi nele. Rode "revisar córtex" no chat para migrar e destravar a atualização automática das regras.${reset}`);
  }

  if (fs.existsSync(cerebroPath)) {
    const targets = readTargets(targetDir);
    compileTargets(targetDir, targets, VERSION);
    writeTargets(targetDir, targets);
    console.log(`  ${green}✓${reset} Cérebro recompilado para: ${targets.join(', ')}`);
  }

  writeVersionFile(targetDir, VERSION);

  console.log(`
${bold}${green}🎉 Framework atualizado para v${VERSION}!${reset}

${dim}Se você tinha personalizado algum arquivo dentro de .agents/skills, confira o backup acima para recuperar suas mudanças.${reset}
${dim}Pilares/, Memoria/, Ativos/ e a área CORTEX:BUSINESS do seu cérebro não foram tocados.${reset}
`);
}

async function runSync() {
  const targetArg = args[1] && !args[1].startsWith('-') ? args[1] : '.';
  const targetDir = path.resolve(process.cwd(), targetArg);
  const isForce = args.includes('--force') || args.includes('-f');

  console.log(`\n${bold}${cyan}🧠 Compilando o cérebro do Córtex...${reset}\n`);

  if (!fs.existsSync(targetDir)) {
    console.log(`${red}Pasta não encontrada:${reset} ${targetDir}`);
    process.exit(1);
  }

  const cerebroPath = path.join(targetDir, CEREBRO_PATH);
  if (!fs.existsSync(cerebroPath)) {
    console.log(`${red}Não encontrei ${CEREBRO_PATH}.${reset}`);
    console.log(`  ${dim}Este comando só se aplica a Córtex montados a partir da v0.7.0, com fonte única do system prompt.${reset}`);
    console.log(`  ${dim}Se o seu Córtex é mais antigo (conteúdo duplicado nos 5 arquivos de raiz), rode "revisar córtex" no chat com sua IA para migrar.${reset}\n`);
    process.exit(1);
  }

  const cerebroContent = fs.readFileSync(cerebroPath, 'utf8');
  const flagTargets = parseTargetsFlag(args);
  const targets = flagTargets || readTargets(targetDir);

  console.log(`  ${dim}Fonte:${reset} ${toPosix(CEREBRO_PATH)}`);

  if (!hasBrainLayers(cerebroContent)) {
    console.log(`  ${yellow}Aviso:${reset} este cérebro ainda não tem as camadas ${dim}CORTEX:BUSINESS${reset}/${dim}CORTEX:FRAMEWORK${reset}.`);
    console.log(`  ${dim}A compilação abaixo funciona normalmente, mas "cortex update" não conseguirá${reset}`);
    console.log(`  ${dim}atualizar sozinho as regras de operação. Rode "revisar córtex" no chat para migrar.${reset}`);
  }

  console.log(`${bold}Arquivos a compilar (conteúdo completo do cérebro):${reset}`);
  targets.forEach((f) => console.log(`   ${cyan}•${reset} ${f} ${dim}— ${KNOWN_TARGETS[f]}${reset}`));

  const naoGerados = Object.keys(KNOWN_TARGETS).filter((t) => !targets.includes(t));
  if (naoGerados.length > 0) {
    console.log(`  ${dim}Não gerados: ${naoGerados.join(', ')} — use --targets=${naoGerados[0]} (ou --targets=all) se precisar.${reset}`);
  }
  console.log('');

  if (!isForce) {
    const confirmed = await askConfirmation(`  Sobrescrever ${targets.length} arquivo(s) com o cérebro compilado? (s/N): `);
    if (!confirmed) {
      console.log(`\n${red}Sincronização cancelada. Nenhum arquivo foi alterado.${reset}\n`);
      return;
    }
  }

  compileTargets(targetDir, targets, VERSION);
  writeTargets(targetDir, targets);

  for (const file of targets) {
    console.log(`   ${green}✓${reset} ${file}`);
  }

  console.log(`
${bold}${green}🎉 Cérebro compilado!${reset}

${dim}Cada arquivo acima contém o cérebro COMPLETO — a ferramenta de IA lê tudo direto, sem depender de seguir nenhum ponteiro.${reset}
${dim}Eles são artefatos gerados: edite sempre ${toPosix(CEREBRO_PATH)} e rode "cortex sync" de novo.${reset}
`);
}

async function runDoctor() {
  const targetArg = args[1] && !args[1].startsWith('-') ? args[1] : '.';
  const targetDir = path.resolve(process.cwd(), targetArg);

  console.log(`\n${bold}${cyan}🩺 Córtex Doctor — Diagnóstico Estrutural${reset}\n`);

  if (!fs.existsSync(targetDir)) {
    console.log(`${red}Pasta não encontrada:${reset} ${targetDir}`);
    process.exit(1);
  }

  const metaPath = path.join(targetDir, 'Memoria', 'META.md');
  if (!fs.existsSync(metaPath)) {
    console.log(`${red}Não encontrei Memoria/META.md.${reset} Este Córtex ainda não foi montado.`);
    console.log(`Rode ${cyan}npx @aksp/cortex init${reset} e depois peça para a IA ${cyan}"montar meu córtex"${reset}.\n`);
    process.exit(1);
  }

  // --- 1. Parse META.md ---
  const metaContent = fs.readFileSync(metaPath, 'utf8');
  const headers = parseMetaHeaders(metaContent);
  const fileMap = parseFileMapFromMeta(metaContent);
  const realFiles = listRealFiles(targetDir);

  const businessName = readBusinessName(targetDir) || headers.businessName || '(sem nome)';

  console.log(`  ${bold}Negócio:${reset} ${businessName}`);
  if (headers.type) console.log(`  ${bold}Tipo:${reset} ${headers.type}`);
  if (headers.nextReview) console.log(`  ${bold}Próxima revisão:${reset} ${headers.nextReview}`);
  console.log('');

  // --- 2. Comparar mapa × disco ---
  const mapFiles = new Set(fileMap);
  const diskFiles = new Set(realFiles);

  const broken = [];    // no mapa mas não no disco
  const unindexed = []; // no disco mas não no mapa
  const ok = [];        // nos dois

  for (const f of mapFiles) {
    if (diskFiles.has(f)) {
      ok.push(f);
    } else {
      broken.push(f);
    }
  }
  for (const f of diskFiles) {
    if (!mapFiles.has(f)) unindexed.push(f);
  }

  const mandatoryMissing = MANDATORY_PILLAR_PREFIXES.filter((prefix) => {
    const exists = [...diskFiles].some((f) => f.startsWith(`Pilares/${prefix}`));
    return !exists;
  });

  // --- 3. Analisar cada pilar ---
  const pillarResults = [];
  for (const f of realFiles) {
    if (!f.startsWith('Pilares/')) continue;
    const fullPath = path.join(targetDir, f);
    const content = fs.readFileSync(fullPath, 'utf8');
    const { revisarCount, blankSections } = countRevisarAndBlanks(content);

    // Frontmatter nulls: verifica apenas campos conhecidos
    const fm = parseSimpleFrontmatter(content);
    const knownFields = ['margem_alvo', 'margem_minima', 'preco_piso', 'desconto_max',
      'custos_variaveis', 'custo_variavel_padrao'];
    const nullFields = knownFields.filter((k) => fm[k] === null || (fm[k] && typeof fm[k] === 'object' && Object.keys(fm[k]).length === 0));

    pillarResults.push({
      file: f,
      exists: true,
      revisarCount,
      blankSections,
      nullFields,
    });
  }

  // Pilares no mapa que não existem no disco também contam
  for (const f of broken) {
    if (!f.startsWith('Pilares/')) continue;
    pillarResults.push({
      file: f,
      exists: false,
      revisarCount: 0,
      blankSections: 0,
      nullFields: [],
    });
  }

  // --- 4. Cérebro ---
  const brain = checkBrainHealth(targetDir);

  // --- 5. Completude ---
  const completeness = calculateCompleteness(pillarResults);

  // --- 6. Relatório ---
  console.log(`${bold}📊 Completude estimada:${reset} ~${completeness}% dos pilares obrigatórios sem pendências\n`);

  if (mandatoryMissing.length > 0) {
    console.log(`${red}🔴 Pilares obrigatórios faltando:${reset}`);
    for (const prefix of mandatoryMissing) {
      const name = MANDATORY_PILLAR_NAMES[prefix] || prefix;
      console.log(`   • ${prefix}${name}.md`);
    }
    console.log('');
  } else {
    console.log(`${green}🔴 Pilares obrigatórios faltando: Nenhum ✅${reset}\n`);
  }

  // Pilares opcionais não configurados (03_, 04_, 07_, 08_, 09_) — informativo, não alarmante
  const optionalPrefixes = ['03_', '04_', '07_', '08_', '09_'];
  const optionalMissing = optionalPrefixes.filter((prefix) => {
    const exists = [...diskFiles].some((f) => f.startsWith(`Pilares/${prefix}`));
    return !exists;
  });
  if (optionalMissing.length > 0) {
    const names = { '03_': 'Financeiro', '04_': 'Comercial', '07_': 'Jurídico',
      '08_': 'Inventário', '09_': 'Identidade Visual' };
    console.log(`${dim}ℹ️  Pilares opcionais não configurados:${reset}`);
    for (const prefix of optionalMissing) {
      console.log(`   ${dim}• ${prefix}${names[prefix] || prefix}.md${reset}`);
    }
    console.log('');
  }

  const withPendencies = pillarResults.filter((p) => p.exists && (p.revisarCount > 0 || p.blankSections > 0 || p.nullFields.length > 0));
  if (withPendencies.length > 0) {
    console.log(`${yellow}📝 Pilares com pendências:${reset}`);
    for (const p of withPendencies) {
      const parts = [];
      if (p.revisarCount > 0) parts.push(`${p.revisarCount} REVISAR`);
      if (p.blankSections > 0) parts.push(`${p.blankSections} seção(ões) em branco`);
      if (p.nullFields.length > 0) parts.push(`campos null: ${p.nullFields.join(', ')}`);
      console.log(`   • ${p.file} — ${parts.join(' | ')}`);
    }
    console.log('');
  } else {
    console.log(`${green}📝 Pilares com pendências: Nenhum ✅${reset}\n`);
  }

  if (broken.length > 0 || unindexed.length > 0) {
    console.log(`${yellow}⚠️ Inconsistências no META.md:${reset}`);
    for (const f of broken) {
      console.log(`   ${red}❌ Quebrado${reset} — ${f} (no mapa, mas não existe no disco)`);
    }
    for (const f of unindexed) {
      console.log(`   ${yellow}⚠️ Não indexado${reset} — ${f} (no disco, mas não está no mapa)`);
    }
    console.log('');
  } else {
    console.log(`${green}⚠️ Inconsistências no META.md: Nenhuma ✅${reset}\n`);
  }

  console.log(`${bold}🧠 System prompt:${reset}`, (() => {
    if (!brain.hasCerebro) return `${red}Sem CEREBRO.md — rode "revisar córtex" no chat`;
    if (brain.hasLayers) return `${green}Fonte única (Frameworks/CEREBRO.md) com camadas ✅${reset}`;
    if (brain.isLegacy) return `${yellow}Formato antigo (sem camadas CORTEX:BUSINESS/FRAMEWORK) — rode "revisar córtex" no chat para migrar${reset}`;
    return `${yellow}Formato desconhecido — verifique manualmente${reset}`;
  })());

  if (brain.isPointer) {
    console.log(`  ${yellow}⚠️ Arquivo(s) de raiz ainda são ponteiros (não compilados). Rode ${cyan}cortex sync${reset} para compilar.${reset}`);
  }
  if (brain.compiledTargets.length > 0) {
    console.log(`  ${dim}Alvos compilados: ${brain.compiledTargets.join(', ')}${reset}`);
  }

  // --- 7. Sugestão ---
  console.log(`\n${bold}💡 Sugestão:${reset}`, (() => {
    if (mandatoryMissing.length > 0) return `Crie os pilares obrigatórios faltantes — diga "revisar córtex" no chat.`;
    if (withPendencies.length > 0) return `Preencha os itens marcados como REVISAR — diga "completar meu córtex" no chat.`;
    if (!brain.hasLayers) return `Migre o cérebro para o formato com camadas — diga "revisar córtex" no chat.`;
    if (brain.isPointer) return `Recompile os arquivos de raiz — rode "npx @aksp/cortex sync".`;
    return `Está tudo em dia! 🎉`;
  })() + '\n');
}

async function main() {
  if (!command || command === 'init') {
    await runInit();
  } else if (command === 'update') {
    await runUpdate();
  } else if (command === 'sync') {
    await runSync();
  } else if (command === 'doctor' || command === 'checkup' || command === 'diagnostico') {
    await runDoctor();
  } else if (command === '--help' || command === '-h' || command === 'help') {
    printHelp();
  } else if (command === '--version' || command === '-v' || command === 'version') {
    printVersion();
  } else {
    console.log(`${red}Comando não reconhecido: ${command}${reset}`);
    printHelp();
    process.exit(1);
  }
}

// Só executa automaticamente quando chamado como CLI (`node bin/cli.js ...`).
// Quando outro módulo faz `require('./bin/cli.js')` — como os testes fazem
// para exercitar as funções puras abaixo — nada roda sozinho.
if (require.main === module) {
  main().catch((err) => {
    console.error(`${red}Erro ao executar CLI:${reset}`, err);
    process.exit(1);
  });
}

module.exports = {
  VERSION,
  FRAMEWORK_ITEMS,
  USER_DATA_ITEMS,
  MANDATORY_PILLAR_PREFIXES,
  MANDATORY_PILLAR_NAMES,
  KNOWN_TARGETS,
  DEFAULT_TARGETS,
  CEREBRO_PATH,
  MANIFEST_REL_PATH,
  BRAIN_FRAMEWORK_REL_PATH,
  BUSINESS_START,
  BUSINESS_END,
  FRAMEWORK_START,
  FRAMEWORK_END,
  toPosix,
  normalizeEol,
  detectEol,
  applyEol,
  buildGeneratedHeader,
  compileBrain,
  extractRegion,
  replaceRegion,
  hasBrainLayers,
  refreshBrainFramework,
  readTargets,
  writeTargets,
  parseTargetsFlag,
  compileTargets,
  readBusinessName,
  readCortexMeta,
  writeCortexMeta,
  parseMetaHeaders,
  parseFileMapFromMeta,
  listRealFiles,
  parseSimpleFrontmatter,
  countRevisarAndBlanks,
  checkBrainHealth,
  calculateCompleteness,
  copyRecursiveSync,
  writeVersionFile,
  readVersionFile,
  readManifestFiles,
  listFilesRecursive,
  diffFrameworkLayer,
  classifyPreserved,
  applyFrameworkUpdate,
  pruneDeprecatedFiles
};
