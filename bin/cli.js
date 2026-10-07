#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const path = require('path');
const readline = require('readline');

// Formatadores ANSI para saída visual no terminal. Só valem quando a saída é um
// terminal de verdade: quando quem lê é uma IA, um arquivo ou outro programa,
// os códigos de cor viram lixo no meio do texto.
const useColor = Boolean(process.stdout.isTTY) && !process.env.NO_COLOR;
const ansi = (code) => (useColor ? `\x1b[${code}m` : '');
const reset = ansi(0);
const bold = ansi(1);
const cyan = ansi(36);
const green = ansi(32);
const yellow = ansi(33);
const red = ansi(31);
const dim = ansi(2);

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

// Regras de .gitignore que o Córtex grava na pasta do usuário. Ficam aqui, como
// texto, e não num arquivo ".gitignore" dentro do pacote: o npm troca esse
// arquivo por ".npmignore" ao publicar, então ele nunca chega a quem instala.
// Como saber se um .gitignore já tem as regras do Córtex: uma linha que seja
// exatamente "/Pilares/*". A versão comentada ("# /Pilares/*") também conta — é
// de quem decidiu versionar os próprios dados e não deve ser avisado a cada update.
// A regra citada no meio de outra linha não conta: ali ela não protege nada.
const USER_GITIGNORE_RULE = /^[ \t]*(#[ \t]*)?\/Pilares\/\*[ \t]*\r?$/m;
const USER_GITIGNORE_DATA_RULES = ['/Pilares/*', '/Memoria/*', '/Ativos/*'];
const USER_GITIGNORE = `# ============================================================
# Córtex — .gitignore
#
# Criado por "npx @aksp/cortex init". Protege por padrão os DADOS
# DO SEU NEGÓCIO (Pilares, Memória, Ativos) de irem parar em um
# repositório Git — inclusive um público.
#
# Se você quiser versionar os seus dados de propósito (ex.: em um
# repositório PRIVADO seu, como backup), remova ou ajuste as linhas
# abaixo.
# ============================================================

# Dados do negócio (criados na conversa de montagem)
/Pilares/*
/Memoria/*
/Ativos/*

# Mantém a estrutura de pastas versionada mesmo vazia
!/Pilares/.gitkeep
!/Memoria/.gitkeep
!/Ativos/.gitkeep

# Backups automáticos do Córtex (update/init) e restos de versões antigas
/.cortex/backups/
/.agents.backup-*/
/Frameworks/CEREBRO.md.backup-*

# Arquivos de sistema operacional
.DS_Store
Thumbs.db
`;

// Código de saída quando o comando precisaria de uma confirmação e não há
// terminal interativo para responder. Diferente de 1 (erro) para que quem
// chamou — em geral uma IA — saiba que basta repetir com --force.
const EXIT_NEEDS_CONFIRMATION = 2;

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
  'AGENTS.md': 'Padrão AGENTS.md — OpenAI Codex, OpenCode, Hermes, Roo Code e ferramentas compatíveis',
  'CLAUDE.md': 'Claude Code',
  'GEMINI.md': 'Gemini CLI, Google Antigravity',
  '.cursorrules': 'Cursor, Windsurf'
};

// Alvos que já foram suportados e deixaram de ser. O Codex lê `AGENTS.md`
// nativamente, então um `CODEX.md` separado nunca foi necessário — a partir da
// v1.3.0 ele é atendido pelo AGENTS.md. Instalações antigas são avisadas.
const RETIRED_TARGETS = {
  'CODEX.md': 'o Codex lê o AGENTS.md diretamente'
};

// `AGENTS.md` é a convenção cross-tool e leva o cérebro completo. `CLAUDE.md`
// entra por padrão porque o Claude Code não lê AGENTS.md sozinho — mas ele é
// gerado como um import nativo (`@AGENTS.md`), então a fonte continua única.
// `GEMINI.md` entra por padrão desde a v1.6.0 (o Gemini CLI só lê esse arquivo)
// e leva o cérebro completo. Os demais são gerados sob demanda
// (`cortex sync --targets=...`). O padrão só vale para pastas que ainda não
// escolheram: quem tem targets.json ou arquivos na raiz segue com os seus.
const DEFAULT_TARGETS = ['AGENTS.md', 'CLAUDE.md', 'GEMINI.md'];

// Sintaxe de import do Claude Code: uma linha `@caminho` dentro do CLAUDE.md é
// resolvida pela própria ferramenta ao carregar a memória do projeto. Não é um
// "ponteiro" que depende de a IA decidir abrir outro arquivo.
const CLAUDE_IMPORT_LINE = '@AGENTS.md';

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
      if (Array.isArray(data.targets)) {
        // Alvos aposentados (ex.: CODEX.md) ou desconhecidos são descartados; se
        // não sobrar nenhum, cai para a detecção/padrão em vez de compilar para nada.
        const known = data.targets.filter((t) => Object.prototype.hasOwnProperty.call(KNOWN_TARGETS, t));
        if (known.length > 0) return known;
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

// Conteúdo do CLAUDE.md quando o AGENTS.md também é gerado: só o import nativo.
// O cérebro fica em um arquivo só, e o Claude Code o carrega por meio do `@`.
function buildClaudeImport(version, eol) {
  return applyEol(buildGeneratedHeader(version) + CLAUDE_IMPORT_LINE + '\n', eol || '\n');
}

// O arquivo é do Córtex (gerado, texto de inicialização ou o ponteiro das
// versões antigas) ou foi escrito pelo usuário?
// Reconhece pela FORMA, não por uma palavra solta: um arquivo do usuário que
// apenas cita "ARQUIVO GERADO PELO CÓRTEX" ou "cortex-onboarding" continua dele.
function isCortexOwnedFile(content) {
  return (
    generatedHeaderEnd(content) > 0 ||
    (plainStart(content).startsWith('# Córtex — Inicialização') && content.includes('cortex-onboarding')) ||
    content.trim() === CLAUDE_IMPORT_LINE ||
    (content.includes('Este arquivo é um **ponteiro**') && content.includes('CEREBRO.md'))
  );
}

function plainStart(content) {
  return normalizeEol(content).replace(/^﻿/, '').trimStart();
}

// Onde termina o cabeçalho de arquivo gerado (o primeiro comentário do arquivo,
// com a frase do Córtex dentro); 0 quando o arquivo não começa por ele.
function generatedHeaderEnd(content) {
  const text = plainStart(content);
  if (!text.startsWith('<!--')) return 0;
  const end = text.indexOf('-->');
  const header = end === -1 ? text : text.slice(0, end);
  if (!header.includes('ARQUIVO GERADO PELO CÓRTEX')) return 0;
  return end === -1 ? text.length : end + 3;
}

// O que o usuário (ou a ferramenta dele) escreveu num CLAUDE.md gerado, além do
// cabeçalho e da linha do import. Vazio quando o arquivo é só o que o Córtex gravou.
function extraTextInGeneratedClaude(content) {
  const end = generatedHeaderEnd(content);
  if (end === 0) return '';
  return plainStart(content).slice(end).split('\n')
    .filter((line) => line.trim() !== '' && line.trim() !== CLAUDE_IMPORT_LINE)
    .join('\n');
}

// Texto em UTF-8 de verdade? Um arquivo salvo em ANSI ou UTF-16 (Bloco de Notas
// antigo, `>` do PowerShell) perderia os acentos se fosse lido e regravado.
function isUtf8Text(raw) {
  return !raw.includes(0) && Buffer.from(raw.toString('utf8'), 'utf8').equals(raw);
}

function isSymlink(filePath) {
  try {
    return fs.lstatSync(filePath).isSymbolicLink();
  } catch (e) {
    return false;
  }
}

// Grava um arquivo de instrução da raiz sem nunca escrever ATRAVÉS de um
// atalho (link simbólico): um CLAUDE.md que aponta para o AGENTS.md faria o
// import ser gravado por cima do cérebro. O atalho vira um arquivo próprio.
function writeRootFile(dest, body) {
  if (isSymlink(dest)) fs.unlinkSync(dest);
  fs.writeFileSync(dest, body);
}

// Acrescenta a linha do import ao CLAUDE.md do usuário sem regravar o texto
// dele: os bytes que ele escreveu (acentos, BOM, fim de linha) ficam como estão.
function appendClaudeImport(dest, raw) {
  const text = raw.toString('utf8');
  const eol = detectEol(text);
  const gap = /\n[ \t]*\r?\n[ \t]*$/.test(text) ? '' : (/\n[ \t]*$/.test(text) ? eol : eol + eol);
  if (isSymlink(dest)) {
    fs.unlinkSync(dest);
    fs.writeFileSync(dest, raw);
  }
  fs.appendFileSync(dest, gap + CLAUDE_IMPORT_LINE + eol);
}

// CLAUDE.md que o usuário escreveu, num projeto em que o AGENTS.md leva o
// cérebro: o texto dele fica e só precisa da linha que importa o AGENTS.md.
function isUserClaudeFile(target, targets, content) {
  return target === 'CLAUDE.md' && targets.includes('AGENTS.md') && !isCortexOwnedFile(content);
}

function hasClaudeImport(content) {
  return normalizeEol(content).split('\n').some((line) => line.trim() === CLAUDE_IMPORT_LINE);
}

// Compila o cérebro para cada alvo. Todos recebem o cérebro completo, exceto o
// CLAUDE.md quando o AGENTS.md está entre os alvos: nesse caso ele apenas
// importa o AGENTS.md.
// Um arquivo que o USUÁRIO escreveu nunca some em silêncio: o CLAUDE.md dele é
// mantido (ganha só a linha do import); qualquer outro é copiado para
// .cortex/backups/originais-<data>/ antes de ser substituído.
// Também ganha cópia antes de ser trocado: o CLAUDE.md dele que não está em
// UTF-8 (acrescentar a linha estragaria os acentos) e o CLAUDE.md gerado em
// que alguém escreveu depois do import.
// Retorna { written, kept, backedUp, backupDir, notUtf8, unlinked }.
function compileTargets(targetDir, targets, version) {
  const cerebroPath = path.join(targetDir, CEREBRO_PATH);
  const cerebro = fs.readFileSync(cerebroPath, 'utf8');
  const content = compileBrain(cerebro, version);
  const claudeImports = targets.includes('AGENTS.md');

  const result = { written: [], kept: [], backedUp: [], backupDir: null, notUtf8: [], unlinked: [] };
  for (const target of targets) {
    const dest = path.join(targetDir, target);
    const raw = fs.existsSync(dest) ? fs.readFileSync(dest) : null;
    const mine = raw === null ? null : raw.toString('utf8');
    if (isSymlink(dest)) result.unlinked.push(target);
    let userText = mine !== null && !isCortexOwnedFile(mine);
    if (userText && isUserClaudeFile(target, targets, mine)) {
      if (hasClaudeImport(mine) || isUtf8Text(raw)) {
        if (!hasClaudeImport(mine)) appendClaudeImport(dest, raw);
        else result.unlinked.pop();
        result.kept.push(target);
        continue;
      }
      result.notUtf8.push(target);
    }
    if (!userText && mine !== null && target === 'CLAUDE.md' && claudeImports) {
      userText = extraTextInGeneratedClaude(mine) !== '';
    }
    if (userText) {
      if (!result.backupDir) result.backupDir = makeBackupDir(targetDir, 'originais');
      fs.copyFileSync(dest, path.join(result.backupDir, target.replace(/^\./, '_')));
      result.backedUp.push(target);
    }
    const body = target === 'CLAUDE.md' && claudeImports
      ? buildClaudeImport(version, detectEol(cerebro))
      : content;
    writeRootFile(dest, body);
    result.written.push(target);
  }
  return result;
}

// Conta ao usuário o que a compilação fez com os arquivos que eram dele.
function reportUserTargets(targetDir, compiled) {
  for (const t of compiled.kept) {
    console.log(`   ${green}✓${reset} ${t} ${dim}— é um arquivo seu: mantive o seu texto, só com a linha ${CLAUDE_IMPORT_LINE} que carrega o cérebro${reset}`);
  }
  if (compiled.backedUp.length > 0) {
    console.log(`  ${yellow}!${reset} ${compiled.backedUp.join(', ')} ${compiled.backedUp.length > 1 ? 'tinham' : 'tinha'} um texto seu, que foi substituído pelo cérebro.`);
    console.log(`    Guardei uma cópia do que você escreveu em ${toPosix(path.relative(targetDir, compiled.backupDir))} ${dim}(essa cópia não é apagada sozinha)${reset}`);
  }
  for (const t of compiled.notUtf8 || []) {
    console.log(`    ${dim}O seu ${t} estava salvo num formato de texto antigo (não era UTF-8): acrescentar a linha estragaria os acentos, por isso ele foi para a cópia acima.${reset}`);
  }
  for (const t of compiled.unlinked || []) {
    console.log(`  ${yellow}!${reset} ${t} era um atalho para outro arquivo: virou um arquivo próprio, para eu não gravar por cima do arquivo de destino.`);
  }
}

// Arquivos de alvos aposentados que ainda estão na raiz do projeto. Só conta
// como "nosso" o que tem o cabeçalho de artefato gerado ou o texto de
// bootstrap/ponteiro do próprio Córtex — um arquivo que o usuário escreveu à
// mão com o mesmo nome nunca é oferecido para remoção.
function findRetiredTargets(targetDir) {
  return Object.keys(RETIRED_TARGETS).filter((name) => {
    const filePath = path.join(targetDir, name);
    if (!fs.existsSync(filePath)) return false;
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return (
        content.includes('ARQUIVO GERADO PELO CÓRTEX') ||
        content.includes('cortex-onboarding') ||
        content.includes('CEREBRO.md')
      );
    } catch (e) {
      return false;
    }
  });
}

// Avisa sobre alvos aposentados e, com confirmação explícita, remove o arquivo.
// Com --force não há a quem perguntar, então apenas avisa — nunca apaga calado.
async function handleRetiredTargets(targetDir, isForce) {
  const retired = findRetiredTargets(targetDir);
  for (const name of retired) {
    console.log(`  ${yellow}Aviso:${reset} ${name} não é mais gerado — ${RETIRED_TARGETS[name]}.`);
    if (isForce || !isInteractive()) {
      console.log(`  ${dim}Pode apagar ${name} quando quiser; ele não é mais atualizado.${reset}`);
      continue;
    }
    const remove = await askConfirmation(`  Remover ${name} agora? (s/N): `);
    if (remove) {
      fs.rmSync(path.join(targetDir, name));
      console.log(`   ${green}✓${reset} ${name} removido`);
    } else {
      console.log(`  ${dim}${name} foi mantido, mas não será mais atualizado.${reset}`);
    }
  }
  return retired;
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
      // META.md é o próprio índice: não faz sentido listá-lo no mapa que ele contém.
      if (sub === 'Memoria' && entry === 'META.md') continue;
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
// Entende: números, null, `{}`, objeto em linha (`{"a": 1}`), objeto em bloco
// (chave sem valor seguida de linhas indentadas), BOM e comentários `# ...`
// (só quando precedidos de espaço e fora de aspas, para não cortar um `#`
// dentro de um valor nem de um nome como "Pacote #2"). `~`, `Null` e aspas
// vazias contam como null: campo por preencher.
function stripComment(v) {
  let inQuotes = false;
  for (let i = 0; i < v.length; i++) {
    if (v[i] === '"') inQuotes = !inQuotes;
    else if (v[i] === '#' && !inQuotes && i > 0 && /\s/.test(v[i - 1])) return v.slice(0, i).trim();
  }
  return v.trim();
}

function parseSimpleFrontmatter(content) {
  const normalized = normalizeEol(content).replace(/^\uFEFF/, '');
  const match = normalized.match(/^---\n([\s\S]*?)\n---[ \t]*(\n|$)/);
  if (!match) return {};
  const lines = match[1].split('\n');
  const result = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s/.test(line) || !line.includes(':')) continue; // linhas indentadas pertencem ao bloco anterior
    const colonIdx = line.indexOf(':');
    const key = line.slice(0, colonIdx).trim();
    if (!key) continue;
    const valueStr = stripComment(line.slice(colonIdx + 1));

    if (valueStr === '') {
      // Valor vazio: pode ser um objeto em bloco (linhas indentadas) ou null.
      const block = {};
      let j = i + 1;
      while (j < lines.length && (/^\s+\S/.test(lines[j]) || lines[j].trim() === '')) {
        const sub = lines[j].trim();
        const c = sub.indexOf(':');
        if (sub && c > 0 && !sub.startsWith('#')) {
          const k = sub.slice(0, c).trim().replace(/^["']|["']$/g, '');
          const v = stripComment(sub.slice(c + 1));
          block[k] = /^-?\d+(\.\d+)?$/.test(v) ? parseFloat(v) : v;
        }
        j++;
      }
      result[key] = Object.keys(block).length > 0 ? block : null;
    } else if (/^(null|~|""|'')$/i.test(valueStr)) {
      result[key] = null;
    } else if (valueStr === '{}') {
      result[key] = {};
    } else if (valueStr.startsWith('{')) {
      try { result[key] = JSON.parse(valueStr); } catch (e) { result[key] = valueStr; }
    } else if (/^-?\d+(\.\d+)?$/.test(valueStr)) {
      result[key] = parseFloat(valueStr);
    } else {
      result[key] = valueStr;
    }
  }
  return result;
}

// Campos numéricos que o Guardião de Margem lê no cabeçalho de 03_Financeiro e
// 04_Comercial (ver .agents/cortex/PROTOCOLO_AUTONOMIA.md), além dos itens de
// `custos_variaveis`.
const MARGIN_NUMBER_FIELDS = ['margem_alvo', 'margem_minima', 'custo_variavel_padrao',
  'imposto_pct', 'taxas_pct', 'preco_piso', 'desconto_max'];

// Diz o que há de errado num valor que deveria ser número puro, ou null se
// está certo (ou vazio: campo por preencher é outra pendência). Pega o jeito
// brasileiro de escrever: "1.500" (lido como 1,5), "1.500,00", "30%", "R$ 700".
// O ponto como separador de milhar só é suspeito em valores em R$: num
// percentual, "6.125" é uma alíquota com três casas, e está certa.
function describeBadNumber(raw, isPercent) {
  const v = raw.trim().replace(/^["']|["']$/g, '').trim();
  if (v === '' || /^(null|~)$/i.test(v) || v === '{}') return null;
  if (!isPercent && /^-?[1-9]\d{0,2}\.\d{3}$/.test(v)) {
    const whole = v.replace('.', '');
    return `está escrito "${v}", que é lido como ${String(parseFloat(v)).replace('.', ',')}. Se o valor é ${whole}, escreva ${whole} (sem o ponto).`;
  }
  if (/^-?\d+(\.\d+)?$/.test(v)) return null;
  const bare = v.replace(/R\$|%|\s/gi, '');
  if (/^-?(\d{1,3}(\.\d{3})+|\d+)(,\d+)?$/.test(bare)) {
    const fixed = String(parseFloat(bare.replace(/\./g, '').replace(',', '.')));
    return `está escrito "${v}". Deixe só o número: ${fixed}${fixed.includes('.') ? ' (com ponto no lugar da vírgula)' : ''}`;
  }
  if (/^-?\d+\.\d+$/.test(bare)) return `está escrito "${v}". Deixe só o número: ${bare}`;
  return `está escrito "${v}". Deixe só o número, sem letras nem símbolos (por exemplo: 30).`;
}

// Confere, no texto cru do cabeçalho (o parser acima já teria transformado
// "1.500" em 1.5), os números que o Guardião de Margem usa. Devolve frases
// prontas para o doctor mostrar; nunca altera o arquivo.
function findNumberIssues(content) {
  const normalized = normalizeEol(content).replace(/^﻿/, '');
  const match = normalized.match(/^---\n([\s\S]*?)\n---[ \t]*(\n|$)/);
  if (!match) {
    return normalized.startsWith('---\n')
      ? ['o cabeçalho do topo não está fechado: falta a linha --- logo depois dos números. Sem ela, a IA não encontra suas margens e preços.']
      : [];
  }
  const lines = match[1].split('\n');
  const unquote = (k) => k.trim().replace(/^["']|["']$/g, '');
  const issues = [];
  const check = (label, raw, isPercent) => {
    const problem = describeBadNumber(raw, isPercent);
    if (problem) issues.push(`${label} ${problem}`);
  };
  // Margem é porcentagem inteira (35, não 0.35): abaixo de 1% é quase sempre
  // fração de planilha. Só nas margens — imposto e taxa de 0,5% existem.
  const marginAsFraction = (key, raw) => {
    if (key !== 'margem_alvo' && key !== 'margem_minima') return false;
    const written = unquote(raw);
    const v = written.replace(/%|\s/g, '').replace(',', '.');
    if (!/^0?\.\d+$/.test(v) || !(parseFloat(v) > 0)) return false;
    const pct = Math.round(parseFloat(v) * 10000) / 100;
    issues.push(`${key} está escrito "${written}", que é lido como ${v.replace(/^\./, '0.').replace('.', ',')}% (menos de 1%). Este campo é a porcentagem inteira: se a sua margem é ${String(pct).replace('.', ',')}%, escreva ${pct}.`);
    return true;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const colonIdx = line.indexOf(':');
    if (/^\s/.test(line) || colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const valueStr = stripComment(line.slice(colonIdx + 1));
    if (MARGIN_NUMBER_FIELDS.includes(key)) {
      if (!marginAsFraction(key, valueStr)) check(key, valueStr, key !== 'preco_piso');
    } else if (key === 'custos_variaveis' && valueStr.startsWith('{')) {
      // O valor sem aspas leva junto a vírgula decimal ("12,50"), desde que
      // depois dela venha o fim do item — senão é o separador do próximo par.
      for (const pair of valueStr.matchAll(/("[^"]*"|[^\s,{:"]+)\s*:\s*("[^"]*"|[^,}]+(?:,\d+(?=\s*[,}]))?)/g)) {
        check(`"${unquote(pair[1])}" (em custos_variaveis)`, pair[2]);
      }
    } else if (key === 'custos_variaveis' && valueStr === '') {
      for (let j = i + 1; j < lines.length && (/^\s+\S/.test(lines[j]) || lines[j].trim() === ''); j++) {
        const sub = lines[j].trim();
        if (sub.startsWith('#')) continue; // linha só de comentário
        // O nome pode ter ":" ou "#" entre aspas; o comentário sai só do valor.
        const m = sub.match(/^("[^"]*"|'[^']*'|[^:]+?)\s*:(.*)$/);
        if (m) check(`"${unquote(m[1])}" (em custos_variaveis)`, stripComment(m[2]));
      }
    }
  }
  return issues;
}

// Conta marcadores <!-- REVISAR --> e seções em branco num pilar.
// Seções em branco: um heading seguido apenas de espaços/comentários HTML.
const BLANK_BY_DESIGN_SECTIONS = ['Panorama Competitivo'];

// Até a v1.4.2 os dois protocolos eram copiados para Frameworks/ na montagem e
// nunca mais atualizados. Desde a v1.5.0 eles vêm com o framework, em
// .agents/cortex/. As cópias antigas não são apagadas — só deixam de ser usadas.
const LEGACY_PROTOCOL_FILES = ['PROTOCOLO_AUTONOMIA.md', 'PROTOCOLO_MEMORIA.md'];

function findLegacyProtocols(targetDir) {
  return LEGACY_PROTOCOL_FILES.filter((f) => fs.existsSync(path.join(targetDir, 'Frameworks', f)));
}

// Seções que ficam em branco de propósito (até a skill pesquisa-mercado rodar)
// não são pendência: contá-las impediria qualquer Córtex de ficar "completo".
function isBlankByDesignHeading(line) {
  return BLANK_BY_DESIGN_SECTIONS.some((name) => new RegExp(`^##\\s+${name}\\b`, 'i').test(line));
}

function countRevisarAndBlanks(content) {
  const normalized = normalizeEol(content);
  const lines = normalized.split('\n');

  // Marcadores REVISAR, menos os que estão dentro de uma seção em branco por
  // desenho: a montagem rápida pode ter deixado um ali, e nenhuma pergunta do
  // onboarding o resolveria.
  let revisarCount = 0;
  let insideExempt = false;
  for (const line of lines) {
    if (/^#{1,2}\s+\S/.test(line)) insideExempt = isBlankByDesignHeading(line);
    if (!insideExempt) revisarCount += (line.match(/<!--\s*REVISAR\s*-->/g) || []).length;
  }

  // Detecta seções em branco: ## heading seguido apenas de comentários/espaços
  // até o próximo heading de mesmo nível ou superior, ou fim do arquivo.
  let blankSections = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!/^##\s+\S/.test(line)) continue;
    if (isBlankByDesignHeading(line)) continue;

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
  $ npx @aksp/cortex update [pasta]
  $ npx @aksp/cortex sync [pasta]
  $ npx @aksp/cortex backup [pasta]
  $ npx @aksp/cortex doctor [pasta]

  ${dim}Sempre com o prefixo @aksp/ — "cortex" sozinho é outro pacote no npm.${reset}

${bold}COMANDOS:${reset}
  ${green}init [pasta]${reset}   Instala o Córtex na pasta indicada (ou na pasta atual).
                  Cria AGENTS.md (Codex, OpenCode e compatíveis), CLAUDE.md (Claude Code)
                  e GEMINI.md (Gemini CLI), e deixa na pasta o COMECE-AQUI.txt (os próximos
                  passos e as frases do dia a dia).
                  Em pasta já instalada e ainda não montada, só acrescenta o que faltar.
                  ${dim}--targets=.cursorrules${reset}   inclui também o arquivo .cursorrules (Cursor)
                  ${dim}--targets=all${reset}            inclui todas as ferramentas conhecidas
  ${green}update [pasta]${reset} Atualiza APENAS a camada de framework (.agents/) para a versão instalada do CLI.
                  Nunca toca em Pilares/, Memoria/, Ativos/ nem na área CORTEX:BUSINESS do cérebro.
                  Regenera a área CORTEX:FRAMEWORK do cérebro e recompila os arquivos de instrução.
                  No fim, diz onde ficou o backup e como voltar à versão anterior.
                  ${dim}--prune${reset}       Remove arquivos que o framework descontinuou (deixaram de existir no
                                manifesto da versão atual). Nunca remove customizações suas — só o que
                                o próprio framework já possuiu e abandonou. Um backup já é feito antes.
  ${green}sync [pasta]${reset}   Compila Frameworks/CEREBRO.md nos arquivos de instrução que a sua ferramenta de IA lê.
                  AGENTS.md e GEMINI.md levam o cérebro completo; CLAUDE.md o importa (@AGENTS.md).
                  Numa pasta que já tem os seus arquivos escolhidos, gera só esses.
                  ${dim}--targets=AGENTS.md,CLAUDE.md${reset}   escolhe os alvos (grava em .cortex/targets.json)
                  ${dim}--targets=all${reset}                   gera todos os alvos conhecidos
                  Um CLAUDE.md que você escreveu é mantido; outro arquivo seu com o mesmo nome
                  ganha uma cópia em .cortex/backups/ antes de ser substituído.
  ${green}backup [pasta]${reset} Guarda uma cópia dos dados do negócio (Pilares/, Memoria/, Ativos/ e o
                  Frameworks/CEREBRO.md) em .cortex/backups/dados-<data>/. Não altera nada e
                  essas cópias nunca são apagadas sozinhas. Atalhos para outras pastas não são
                  seguidos: a cópia avisa quais ficaram de fora.
  ${green}doctor [pasta]${reset} Audita a estrutura do Córtex sem depender de IA: pilares faltando, habilidades faltando em .agents/,
                  marcadores REVISAR pendentes, frontmatter incompleto, número de margem ou
                  preço escrito de um jeito que muda o valor (ex.: 1.500, 30%), saúde do cérebro.
                  Avisa se existe versão nova (consulta só o número da versão no npm).
                  ${dim}--offline${reset}     não consulta o npm
                  ${dim}Aliases: checkup, diagnostico${reset}
  ${green}--force, -f${reset}    Em init, update e sync: não pede confirmação.
                  ${dim}Sem terminal interativo (uma IA rodando o comando, um script), o que
                  precisaria de confirmação não é feito sem --force: o comando mostra o
                  plano e sai com código 2. O init numa pasta sem nenhum nome igual ao do
                  que o Córtex cria não tem o que confirmar: instala direto, só acrescentando.${reset}
  ${green}--help, -h${reset}     Exibe esta mensagem de ajuda.
  ${green}--version, -v${reset}  Exibe a versão atual do CLI.

${bold}EXEMPLOS:${reset}
  $ npx @aksp/cortex init
  $ npx @aksp/cortex init "Minha Empresa"
  $ npx @aksp/cortex@latest update
  $ npx @aksp/cortex update --prune
  $ npx @aksp/cortex sync --targets=all
  $ npx @aksp/cortex@latest backup
  $ npx @aksp/cortex doctor
`);
}

function printVersion() {
  console.log(`v${VERSION}`);
}

function isInteractive() {
  return Boolean(process.stdin.isTTY);
}

// Pergunta "s/N" no terminal. Sem terminal interativo (uma IA rodando o comando,
// um script, um pipe) não há quem responda: em vez de terminar calado com
// "sucesso" sem ter feito nada, diz que nada mudou e sai com um código próprio.
function askConfirmation(query) {
  if (!isInteractive()) {
    console.log(`${query}${dim}(sem terminal interativo para responder)${reset}`);
    console.log(`\n${yellow}Nada foi alterado.${reset} Para aplicar sem perguntar, rode o mesmo comando com ${cyan}--force${reset}.\n`);
    process.exit(EXIT_NEEDS_CONFIRMATION);
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => {
    let answered = false;
    rl.question(query, (ans) => {
      answered = true;
      rl.close();
      resolve(ans.trim().toLowerCase().startsWith('s') || ans.trim().toLowerCase().startsWith('y'));
    });
    // Entrada encerrada sem resposta (Ctrl+D, janela fechada) conta como "não".
    rl.on('close', () => {
      if (!answered) resolve(false);
    });
  });
}

// Garante as regras do Córtex no .gitignore da pasta, sem nunca apagar as do
// usuário. Com `appendToExisting: false`, um .gitignore que já existe não é tocado.
// Retorna 'created', 'appended', 'present' ou 'missing-rules'.
function ensureGitignore(targetDir, options) {
  const appendToExisting = Boolean(options && options.appendToExisting);
  const dest = path.join(targetDir, '.gitignore');
  if (!fs.existsSync(dest)) {
    fs.writeFileSync(dest, USER_GITIGNORE);
    return 'created';
  }
  const existing = fs.readFileSync(dest, 'utf8');
  if (USER_GITIGNORE_RULE.test(existing)) return 'present';
  if (!appendToExisting) return 'missing-rules';
  fs.writeFileSync(dest, existing.replace(/\s*$/, '\n\n') + USER_GITIGNORE);
  return 'appended';
}

// Traduz um erro inesperado em algo que o dono do negócio consiga ler e agir.
// O detalhe técnico vai junto, por último, para quem for ajudar.
function describeError(err) {
  const code = err && err.code;
  const lines = [];
  if (code === 'EPERM' || code === 'EBUSY' || code === 'EACCES') {
    lines.push('Um arquivo desta pasta estava em uso ou bloqueado (OneDrive, antivírus ou outro programa aberto).');
    lines.push('Feche o que estiver usando a pasta e rode o mesmo comando de novo.');
  } else if (code === 'ENOSPC') {
    lines.push('O disco está sem espaço. Libere espaço e rode o mesmo comando de novo.');
  } else {
    lines.push('Rode o mesmo comando de novo. Se o erro continuar, copie o detalhe técnico abaixo e envie em:');
    lines.push('https://github.com/alberthpalhares/cortex/issues');
  }
  return {
    lines,
    detail: err && err.stack ? String(err.stack) : String(err)
  };
}

// Com `skipped` (uma lista), a cópia não atravessa atalhos (links simbólicos e
// junções de pasta): anota o caminho e segue. É o que o `backup` usa, para um
// atalho que aponta para a própria pasta não fazer a cópia nunca terminar.
function copyRecursiveSync(src, dest, skipped) {
  if (skipped && isSymlink(src)) {
    skipped.push(src);
    return;
  }
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
        path.join(dest, childItemName),
        skipped
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
  const now = new Date().toISOString();
  fs.writeFileSync(
    versionPath,
    JSON.stringify({ version, updatedAt: now, checkedAt: now }, null, 2) + '\n'
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

// Registra que o usuário conferiu se há versão nova, sem mexer em updatedAt.
// O radar usa checkedAt para lembrar de atualizar só quando faz tempo de verdade.
function touchVersionCheck(targetDir) {
  const current = readVersionFile(targetDir);
  if (!current || !current.version) return;
  const versionPath = path.join(targetDir, CORTEX_META_DIR, CORTEX_VERSION_FILE);
  fs.writeFileSync(
    versionPath,
    JSON.stringify({ ...current, checkedAt: new Date().toISOString() }, null, 2) + '\n'
  );
}

const REGISTRY_LATEST_URL = 'https://registry.npmjs.org/@aksp/cortex/latest';

// Pergunta ao npm qual é a versão mais recente. Só lê o número da versão — nada
// do projeto do usuário é enviado. Qualquer falha (sem internet, timeout, proxy)
// vira null em silêncio: o aviso de versão nova é um extra, nunca um bloqueio.
function fetchLatestVersion(timeoutMs) {
  if (process.env.CORTEX_NO_UPDATE_CHECK || args.includes('--offline')) return Promise.resolve(null);
  const limit = timeoutMs || 2500;
  return new Promise((resolve) => {
    let req = null;
    let done = false;
    const finish = (value) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      if (req) req.destroy();
      resolve(value);
    };
    const timer = setTimeout(() => finish(null), limit);
    try {
      req = require('https').get(REGISTRY_LATEST_URL, { headers: { accept: 'application/json' } }, (res) => {
        if (res.statusCode !== 200) return finish(null);
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          body += chunk;
          if (body.length > 1000000) finish(null);
        });
        res.on('end', () => {
          try {
            const latest = JSON.parse(body).version;
            finish(typeof latest === 'string' ? latest : null);
          } catch (e) {
            finish(null);
          }
        });
      });
      req.on('error', () => finish(null));
    } catch (e) {
      finish(null);
    }
  });
}

// Novidades que valem ser contadas ao usuário depois de um update: ficam em
// .agents/cortex/novidades.json (framework) e viram .cortex/novidades.md, que a
// skill "novidades" apresenta uma vez no chat e apaga.
const NOVIDADES_SRC_REL_PATH = path.join('.agents', 'cortex', 'novidades.json');
const NOVIDADES_FILE = 'novidades.md';

function selectNovidades(entries, fromVersion, toVersion) {
  if (!Array.isArray(entries)) return [];
  return entries.filter((e) =>
    e && e.version && e.texto &&
    compareVersions(e.version, fromVersion) > 0 &&
    compareVersions(e.version, toVersion) <= 0
  );
}

function formatNovidade(entry) {
  return `- ${entry.texto}` + (entry.diga ? ` — diga: \`${entry.diga}\`` : '');
}

function writeNovidades(targetDir, templateDir, fromVersion, toVersion) {
  let entries;
  try {
    entries = JSON.parse(fs.readFileSync(path.join(templateDir, NOVIDADES_SRC_REL_PATH), 'utf8'));
  } catch (e) {
    return [];
  }
  const selected = selectNovidades(entries, fromVersion || '0.0.0', toVersion);
  if (selected.length === 0) return [];

  const filePath = path.join(targetDir, CORTEX_META_DIR, NOVIDADES_FILE);
  // Novidades de um update anterior que o usuário ainda não viu continuam na lista.
  const lines = fs.existsSync(filePath)
    ? normalizeEol(fs.readFileSync(filePath, 'utf8')).split('\n').filter((l) => l.startsWith('- '))
    : [];
  for (const entry of selected) {
    const line = formatNovidade(entry);
    if (!lines.includes(line)) lines.push(line);
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, [
    '<!-- Gerado por "cortex update". A skill "novidades" apresenta esta lista uma vez no chat e apaga este arquivo. -->',
    `# Novidades do Córtex (v${toVersion})`,
    '',
    ...lines,
    ''
  ].join('\n'));
  return selected;
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

// O que o doctor confere da instalação: arquivos do framework que deveriam
// estar em .agents/ e não estão (ou estão vazios, como fica um arquivo que a
// nuvem não terminou de baixar). A lista esperada é o manifesto INSTALADO na
// pasta (o da versão que o dono tem), não o do comando que está rodando.
// Skill editada pelo dono é legítima e nunca aparece aqui: só conta o que falta.
// Retorna { wholeFolder, missing } — `missing` no formato ".agents/skills/x/SKILL.md" —
// e `unverified: true` quando não havia lista com que comparar.
function findMissingFrameworkFiles(targetDir, templateDir) {
  if (!fs.existsSync(path.join(targetDir, '.agents'))) return { wholeFolder: true, missing: [] };

  const missing = [];
  let expected = readManifestFiles(targetDir);
  if (!expected) {
    // Sem manifesto legível. Numa instalação anterior à v0.10.0 (ou sem registro
    // de versão) isso é normal e não há lista para comparar. Nas demais, o
    // próprio manifesto é um arquivo que falta; a lista do pacote só serve de
    // referência quando a pasta está na mesma versão deste comando.
    const installed = readVersionFile(targetDir);
    if (!installed || !installed.version || compareVersions(String(installed.version), '0.10.0') < 0) {
      // `unverified`: nada foi conferido — não é o mesmo que "nada faltando".
      return { wholeFolder: false, missing, unverified: true };
    }
    missing.push(toPosix(MANIFEST_REL_PATH));
    expected = installed.version === VERSION ? readManifestFiles(templateDir) : null;
  }

  for (const rel of Array.from(expected || []).sort()) {
    if (typeof rel !== 'string' || !rel.startsWith('.agents/') || rel.split('/').includes('..')) continue;
    let size = -1;
    try {
      const stats = fs.statSync(path.join(targetDir, rel));
      size = stats.isFile() ? stats.size : -1;
    } catch (e) {}
    if (size <= 0) missing.push(rel);
  }
  return { wholeFolder: false, missing };
}

// O bloco que o doctor mostra quando falta arquivo do framework, com o único
// comando que repõe. Em pasta montada (ou com .agents/ pela metade) é o
// `update --force`: o `update` simples responde "nada a fazer" quando a versão
// é a mesma, e o `init` não mexe numa pasta .agents/ que existe.
const INSTALL_LIST_LIMIT = 8;
function printInstallProblem(install, targetArg, targetDir) {
  const fixCommand = `npx @aksp/cortex@latest update${folderHint(targetArg)} --force`;
  if (install.wholeFolder && targetDir && !hasBrainEntry(targetDir)) {
    // O update recusa esta pasta (ver hasBrainEntry): não se mostra um comando que não resolve.
    console.log(`${red}🧩 Instalação incompleta:${reset} esta pasta tem a Memória do negócio, mas não a pasta .agents/ (as habilidades do Córtex),`);
    console.log(`   nem o cérebro (${toPosix(CEREBRO_PATH)}), nem o arquivo de instrução que a IA lê (AGENTS.md).`);
    console.log(`   ${BRAINLESS_ADVICE}`);
    console.log(`   Seus dados (Pilares/, Memoria/, Ativos/) estão aqui e não são tocados.`);
    return '';
  }
  if (install.wholeFolder) {
    console.log(`${red}🧩 Instalação incompleta:${reset} falta a pasta .agents/ inteira — é nela que ficam as habilidades do Córtex (radar, registrar, proposta…).`);
    console.log(`   Sem ela a IA não tem como fazer o que você pede. Seus dados (Pilares/, Memoria/, Ativos/) estão aqui e não são tocados.`);
  } else {
    const n = install.missing.length;
    console.log(`${red}🧩 Instalação incompleta:${reset} ${n === 1 ? 'falta 1 arquivo' : `faltam ${n} arquivos`} do próprio Córtex em .agents/ (as habilidades que a IA usa):`);
    for (const f of install.missing.slice(0, INSTALL_LIST_LIMIT)) {
      const skill = f.match(/^\.agents\/skills\/([^/]+)\/SKILL\.md$/);
      console.log(`   • ${f}${skill ? ` ${dim}— a habilidade "${skill[1]}"${reset}` : ''}`);
    }
    if (n > INSTALL_LIST_LIMIT) console.log(`   ${dim}… e mais ${n - INSTALL_LIST_LIMIT}${reset}`);
    console.log(`   Sem ${n === 1 ? 'ele' : 'eles'}, a IA não consegue fazer o que ${n === 1 ? 'esse arquivo ensina' : 'esses arquivos ensinam'}. Seus dados (Pilares/, Memoria/, Ativos/) não são tocados.`);
  }
  console.log(`   Para repor, rode:`);
  console.log(`     ${cyan}${fixCommand}${reset}`);
  if (!install.wholeFolder) {
    console.log(`   ${dim}Antes de mexer, ele guarda uma cópia de .agents/ em ${toPosix(BACKUPS_REL)}: se você editou alguma habilidade, ela volta ao texto padrão e a sua versão fica nessa cópia.${reset}`);
    console.log(`   ${dim}Só as ${BACKUPS_TO_KEEP} cópias mais recentes são guardadas: se quiser manter a sua versão, copie o arquivo para outra pasta.${reset}`);
  }
  return fixCommand;
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

// Compara versões "x.y.z". Retorna -1, 0 ou 1.
function compareVersions(a, b) {
  const pa = String(a || '0').split('.').map((n) => parseInt(n, 10) || 0);
  const pb = String(b || '0').split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) > (pb[i] || 0) ? 1 : -1;
  }
  return 0;
}

// Todos os backups ficam num lugar só, fora da raiz do projeto e ignorado pelo git.
const BACKUPS_REL = path.join(CORTEX_META_DIR, 'backups');
const BACKUPS_TO_KEEP = 3;

function timestampForPath() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function makeBackupDir(targetDir, label) {
  const dir = path.join(targetDir, BACKUPS_REL, `${label}-${timestampForPath()}`);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

// Mantém só os últimos N backups de atualização (`update-<data>`, nome ordenável).
// Só esses giram: são cópias do framework, que dá para baixar de novo. As pastas
// `init-`, `originais-` (arquivos que o usuário escreveu) e `dados-` (cópia dos
// dados do negócio) não têm como ser refeitas e nunca são apagadas aqui.
function pruneBackups(targetDir, keep) {
  const base = path.join(targetDir, BACKUPS_REL);
  if (!fs.existsSync(base)) return 0;
  const entries = fs.readdirSync(base)
    .filter((n) => n.startsWith('update-') && fs.statSync(path.join(base, n)).isDirectory())
    .sort()
    .reverse();
  const old = entries.slice(keep === undefined ? BACKUPS_TO_KEEP : keep);
  for (const n of old) fs.rmSync(path.join(base, n), { recursive: true, force: true });
  return old.length;
}

// Marca, dentro de um backup `update-…`, de que a atualização que o criou ainda
// não terminou. Guarda a versão de onde ela partiu.
const UPDATE_PENDING_FILE = '.atualizacao-em-andamento';

// O backup de uma atualização interrompida que partiu desta mesma versão.
function findPendingUpdateBackup(targetDir, fromVersion) {
  const base = path.join(targetDir, BACKUPS_REL);
  if (!fs.existsSync(base)) return null;
  const names = fs.readdirSync(base).filter((n) => n.startsWith('update-')).sort().reverse();
  for (const n of names) {
    try {
      if (fs.readFileSync(path.join(base, n, UPDATE_PENDING_FILE), 'utf8').trim() === fromVersion) return path.join(base, n);
    } catch (e) {
      // sem a marca: é o backup de uma atualização que terminou
    }
  }
  return null;
}

// A partir desta versão o comando antigo sabe preservar o CLAUDE.md do usuário
// e as cópias init-/originais-/dados-. Antes dela, `npx @aksp/cortex@<antiga>
// update --force` regravaria o CLAUDE.md e apagaria essas cópias: para essas
// versões o caminho de volta é manual, a partir do backup da atualização.
const ROLLBACK_BY_COMMAND_SINCE = '1.6.0';

// Como voltar da versão `current` para a `previous`: 'comando', 'manual' ou
// null (não há versão anterior para oferecer).
function rollbackAdvice(previous, current) {
  if (!/^\d+\.\d+\.\d+$/.test(String(previous)) || compareVersions(previous, current) >= 0) return null;
  return compareVersions(previous, ROLLBACK_BY_COMMAND_SINCE) >= 0 ? 'comando' : 'manual';
}

// "Montado" = a conversa de montagem já aconteceu: existe o cérebro (ou, num
// Córtex antigo, o índice da Memória). Só ter instalado não conta: o init grava
// .cortex/version.json, mas até a conversa não há nada do negócio para proteger.
function isCortexMounted(targetDir) {
  return (
    fs.existsSync(path.join(targetDir, CEREBRO_PATH)) ||
    fs.existsSync(path.join(targetDir, 'Memoria', 'META.md'))
  );
}

// Há por onde a IA começar: o cérebro, ou um arquivo de instrução na raiz (o
// Córtex antigo só tinha esse). Uma pasta só com Memoria/META.md — os dados
// copiados sem o resto — não tem nenhum dos dois: repor a .agents/ ali deixaria
// um Córtex que nenhuma ferramenta de IA carrega, e o init não roda nela.
function hasBrainEntry(targetDir) {
  return (
    fs.existsSync(path.join(targetDir, CEREBRO_PATH)) ||
    Object.keys(KNOWN_TARGETS).some((t) => fs.existsSync(path.join(targetDir, t)))
  );
}

const BRAINLESS_ADVICE = 'Traga a pasta do negócio inteira, de onde ela foi copiada ou de um backup seu — incluindo a pasta Frameworks/ e o AGENTS.md — e rode este comando de novo.';

// "Instalado" = o init já rodou nesta pasta (montado ou não).
function isCortexInstalled(targetDir) {
  return fs.existsSync(path.join(targetDir, CORTEX_META_DIR, CORTEX_VERSION_FILE));
}

// O que o init copia do pacote para a pasta do usuário. As quatro pastas de
// dados chegam vazias (só um .gitkeep); quem as preenche é a conversa de montagem.
const INSTALL_ITEMS = ['.agents', 'Frameworks', 'Memoria', 'Pilares', 'Ativos'];

// O bilhete em texto simples para quem abre a pasta: como começar e as frases
// do dia a dia. A fonte vem com o framework (.agents/cortex/); a cópia da raiz
// é a que o dono lê, imprime e pode editar.
const START_HERE_FILE = 'COMECE-AQUI.txt';
const START_HERE_REL_PATH = path.join('.agents', 'cortex', START_HERE_FILE);

// Grava (ou renova) a cópia da raiz a partir da fonte já instalada em .agents/.
// `previous` é o texto da fonte ANTES de uma atualização (null no init ou quando
// a versão anterior não trazia o arquivo). Só troca a cópia que continua igual
// à fonte anterior: um arquivo que o dono editou, ou um arquivo dele com o
// mesmo nome, fica como está; e o que ele apagou não volta.
// A cópia leva a marca UTF-8 (BOM) para os acentos abrirem certo em qualquer
// Bloco de Notas.
// O `update` passa `sourceDir` (o pacote) e chama isto ANTES de trocar os
// arquivos de .agents/: se a rodada parar no meio, a fonte instalada ainda é a
// anterior (ou a cópia já é a nova) e repetir o comando termina o serviço.
function refreshStartHere(targetDir, previous, sourceDir) {
  const srcPath = path.join(sourceDir || targetDir, START_HERE_REL_PATH);
  if (!fs.existsSync(srcPath)) return 'absent';
  const plain = (text) => normalizeEol(String(text).replace(/^﻿/, ''));
  const fresh = plain(fs.readFileSync(srcPath, 'utf8'));
  const dest = path.join(targetDir, START_HERE_FILE);
  if (fs.existsSync(dest)) {
    const mine = plain(fs.readFileSync(dest, 'utf8'));
    if (mine === fresh) return 'current';
    if (previous === null || mine !== plain(previous)) return 'kept';
  } else if (previous !== null) {
    return 'removed';
  }
  fs.writeFileSync(dest, '﻿' + fresh);
  return 'written';
}

function readStartHereSource(targetDir) {
  try {
    return fs.readFileSync(path.join(targetDir, START_HERE_REL_PATH), 'utf8');
  } catch (e) {
    return null;
  }
}

// Cria os arquivos de inicialização que ainda não existem para as ferramentas
// pedidas. Nunca sobrescreve um arquivo existente. Retorna `created` (os que
// criou), `imported` (o CLAUDE.md do usuário que ganhou a linha do import, como
// no init novo e no sync) e `kept` (os que já existiam, foram escritos pelo
// usuário e por isso continuam sem as instruções do Córtex).
function addMissingBootstrapTargets(targetDir, templateDir, targets) {
  const bootstrap = fs.readFileSync(path.join(templateDir, 'AGENTS.md'), 'utf8');
  const created = [];
  const kept = [];
  const imported = [];
  for (const target of targets) {
    const dest = path.join(targetDir, target);
    if (fs.existsSync(dest)) {
      let raw = null;
      try {
        raw = fs.readFileSync(dest);
      } catch (e) {}
      const content = raw === null ? '' : raw.toString('utf8');
      const ready = isCortexOwnedFile(content) || (target === 'CLAUDE.md' && hasClaudeImport(content));
      if (ready) continue;
      // Um atalho ou um texto que não está em UTF-8 fica como está (com aviso):
      // aqui não há cópia de segurança feita antes.
      if (raw !== null && isUserClaudeFile(target, targets, content) && isUtf8Text(raw) && !isSymlink(dest)) {
        appendClaudeImport(dest, raw);
        imported.push(target);
      } else {
        kept.push(target);
      }
      continue;
    }
    writeRootFile(dest, target === 'CLAUDE.md' ? `${CLAUDE_IMPORT_LINE}\n` : bootstrap);
    created.push(target);
  }
  return { created, kept, imported };
}

// Trecho " <pasta>" para as dicas de comando. Quem instalou com
// `init "Minha Empresa"` continua no diretório de cima: sem a pasta, seguir a
// dica instalaria um segundo Córtex ali.
function folderHint(targetArg) {
  if (!targetArg || targetArg === '.') return '';
  return /\s/.test(targetArg) ? ` "${targetArg}"` : ` ${targetArg}`;
}

// Arquivos de instrução na raiz que estão diferentes do que o cérebro geraria
// hoje (ou que não existem). Sem cérebro não há o que comparar.
function findStaleTargets(targetDir, version) {
  const cerebroPath = path.join(targetDir, CEREBRO_PATH);
  if (!fs.existsSync(cerebroPath)) return [];
  const cerebro = fs.readFileSync(cerebroPath, 'utf8');
  const targets = readTargets(targetDir);
  const full = compileBrain(cerebro, version);
  const claudeImports = targets.includes('AGENTS.md');
  return targets.filter((target) => {
    const filePath = path.join(targetDir, target);
    if (!fs.existsSync(filePath)) return true;
    const expected = target === 'CLAUDE.md' && claudeImports
      ? buildClaudeImport(version, detectEol(cerebro))
      : full;
    try {
      const current = fs.readFileSync(filePath, 'utf8');
      // O CLAUDE.md do usuário é mantido pela compilação: está em dia se já importa o AGENTS.md.
      if (isUserClaudeFile(target, targets, current)) return !hasClaudeImport(current);
      return current !== expected;
    } catch (e) {
      return true;
    }
  });
}

// Pastas onde o Córtex ficaria misturado com as coisas pessoais de quem
// instala: a pasta do usuário, a Área de Trabalho, Documentos e Downloads
// (também dentro do OneDrive) e a raiz do disco. Um terminal aberto pelo menu
// Iniciar começa justamente na pasta do usuário.
// Também as pastas do sistema: um terminal aberto "como administrador" começa
// em C:\Windows\System32.
const PERSONAL_FOLDER_NAMES = ['desktop', 'documents', 'downloads', 'área de trabalho', 'area de trabalho', 'documentos'];

// Só no Windows essas variáveis existem; nos outros sistemas a lista fica vazia
// (lá, gravar numa pasta do sistema já exige permissão especial).
function systemFolders() {
  return ['SystemRoot', 'ProgramFiles', 'ProgramFiles(x86)', 'ProgramData'].map((k) => process.env[k]).filter(Boolean);
}

function isPersonalRootFolder(dir, home) {
  const norm = (p) => {
    try {
      return fs.realpathSync(p).toLowerCase();
    } catch (e) {
      return path.resolve(p).toLowerCase();
    }
  };
  const d = norm(dir);
  const h = norm(home || os.homedir());
  if (d === h || d === path.parse(d).root) return true;
  // Em ou abaixo de uma pasta do sistema (a pasta temporária, que em alguns
  // ambientes fica dentro de uma delas, não conta).
  const within = (base) => d === base || d.startsWith(base.replace(/[\\/]+$/, '') + path.sep);
  if (systemFolders().map(norm).some(within) && !within(norm(os.tmpdir()))) return true;
  if (!PERSONAL_FOLDER_NAMES.includes(path.basename(d))) return false;
  const parent = path.dirname(d);
  return parent === h || (path.dirname(parent) === h && path.basename(parent).startsWith('onedrive'));
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

  if (isCortexMounted(targetDir) && !hasBrainEntry(targetDir)) {
    // Só a Memória veio para cá: mandar rodar o update seria um beco sem saída (ele recusa esta pasta).
    console.log(`${red}Achei a Memória do negócio nesta pasta, mas não o cérebro (${toPosix(CEREBRO_PATH)}) nem o arquivo de instrução que a IA lê (AGENTS.md).${reset}`);
    console.log(`O \`init\` não instala por cima de dados que já existem. ${BRAINLESS_ADVICE}`);
    console.log(`Nenhum arquivo foi alterado.\n`);
    process.exit(1);
  }

  if (isCortexMounted(targetDir)) {
    console.log(`${yellow}Já existe um Córtex montado nesta pasta.${reset}`);
    console.log(`  O \`init\` só serve para a primeira instalação — rodar de novo apagaria o seu cérebro compilado.`);
    console.log(`  Para trazer as novidades sem mexer nos seus dados, use:`);
    console.log(`    ${cyan}npx @aksp/cortex@latest update${folderHint(targetArg)}${reset}`);
    if (toolsFlag) {
      // No sync, --targets é a lista COMPLETA de ferramentas (ele substitui a
      // anterior): a dica leva as que já estão em uso mais as pedidas.
      const all = Array.from(new Set(readTargets(targetDir).concat(toolsFlag)));
      console.log(`  Para preparar outra ferramenta de IA nesta pasta, use (a lista inclui as que você já usa):`);
      console.log(`    ${cyan}npx @aksp/cortex sync${folderHint(targetArg)} --targets=${all.join(',')}${reset}`);
    }
    console.log('');
    process.exit(1);
  }

  // init cria os alvos padrão (AGENTS.md, CLAUDE.md e GEMINI.md). Os demais são gerados
  // sob demanda: pelo onboarding (Step 7), por --targets= no init, ou por
  // `cortex sync --targets=...`.
  const bootstrapTargets = DEFAULT_TARGETS.concat(
    (toolsFlag || []).filter((t) => !DEFAULT_TARGETS.includes(t))
  );

  // Já instalado, mas a conversa de montagem ainda não aconteceu: não há o que
  // refazer. Só acrescenta os arquivos de ferramenta pedidos que estejam
  // faltando — é o que faz "init --targets=GEMINI.md" funcionar depois do init.
  if (isCortexInstalled(targetDir)) {
    const installed = readVersionFile(targetDir);

    // Repõe, sem sobrescrever nada, o que tiver sumido da instalação (a pasta
    // .agents/ apagada por engano ou perdida ao copiar a pasta para outro computador).
    const restored = INSTALL_ITEMS.filter((item) => {
      const src = path.join(templateDir, item);
      if (fs.existsSync(path.join(targetDir, item)) || !fs.existsSync(src)) return false;
      copyRecursiveSync(src, path.join(targetDir, item));
      return true;
    });
    // O framework reposto é o desta versão do CLI.
    if (restored.includes('.agents')) writeVersionFile(targetDir, VERSION);

    const { created, kept, imported } = addMissingBootstrapTargets(targetDir, templateDir, bootstrapTargets);
    const gitignore = ensureGitignore(targetDir, { appendToExisting: false });

    console.log(`${green}✓${reset} O Córtex já está instalado nesta pasta.`);
    restored.forEach((item) => console.log(`   ${green}+${reset} ${item} ${dim}— estava faltando e foi reposta${reset}`));
    created.forEach((t) => console.log(`   ${green}+${reset} ${t} ${dim}— ${KNOWN_TARGETS[t]}${reset}`));
    if (gitignore === 'created') console.log(`   ${green}+${reset} .gitignore`);
    for (const t of imported) {
      console.log(`   ${green}✓${reset} ${t} ${dim}— é um arquivo seu: mantive o seu texto e só acrescentei a linha ${CLAUDE_IMPORT_LINE}${reset}`);
    }
    for (const t of kept) {
      console.log(`   ${yellow}!${reset} ${t} já existia e foi mantido como está — ele não tem as instruções do Córtex.`);
      console.log(`     ${dim}Para o Córtex prepará-lo, renomeie o seu arquivo e rode este comando de novo.${reset}`);
    }
    if (restored.length === 0 && created.length === 0 && kept.length === 0 && imported.length === 0 && gitignore !== 'created') {
      console.log(`  ${dim}Nenhum arquivo novo era necessário.${reset}`);
    }
    console.log(`
${bold}Falta só a conversa que monta o cérebro do seu negócio:${reset}
  abra esta pasta na sua ferramenta de IA e escreva ${bold}${yellow}"Quero montar meu Córtex"${reset}.
`);
    if (installed && !restored.includes('.agents') && compareVersions(VERSION, installed.version) > 0) {
      console.log(`${dim}Esta pasta foi instalada com a v${installed.version}. Para trazer a v${VERSION}: npx @aksp/cortex@latest update${folderHint(targetArg)}${reset}\n`);
    }
    return;
  }

  if (!isForce && isPersonalRootFolder(targetDir)) {
    console.log(`  Esta é uma pasta de uso geral do seu computador: ${targetDir}`);
    console.log(`  O Córtex cria aqui as pastas dele (Pilares, Memoria, Frameworks, Ativos), e elas ficariam misturadas com as suas coisas.`);
    console.log(`  O melhor é uma pasta só para o negócio. Para criar a pasta e instalar nela, rode (troque pelo nome que quiser):`);
    console.log(`    ${cyan}npx @aksp/cortex init "Meu Negocio"${reset}\n`);
    const here = await askConfirmation(`  Prefere instalar aqui mesmo assim? (s/N): `);
    if (!here) {
      console.log(`\nNada foi alterado.\n`);
      process.exit(0);
    }
  }

  // Antes de escrever, guarda uma cópia de qualquer arquivo do usuário que vá
  // ser substituído ou alterado — o init nunca pode apagar nada em silêncio.
  const userFiles = ['.gitignore'].concat(bootstrapTargets).filter((f) => {
    const fp = path.join(targetDir, f);
    if (!fs.existsSync(fp)) return false;
    return f === '.gitignore' || !isCortexOwnedFile(fs.readFileSync(fp, 'utf8'));
  });

  // Pasta com arquivos é o caso normal (o README manda instalar na pasta do
  // negócio). Só há o que confirmar quando algo do usuário tem o mesmo nome de
  // algo que o init grava: uma das pastas do Córtex, ou um arquivo de instrução
  // que será substituído (o .gitignore e o CLAUDE.md dele são mantidos).
  const existingFiles = fs.readdirSync(targetDir);
  const itemNames = INSTALL_ITEMS.map((i) => i.toLowerCase());
  const sameFolders = existingFiles.filter((f) => itemNames.includes(f.toLowerCase()));
  const replacedFiles = userFiles.filter((f) => f !== '.gitignore' && f !== 'CLAUDE.md');

  // Um ARQUIVO do usuário no lugar de uma pasta que o Córtex precisa criar: a
  // cópia quebraria no meio. Para antes de gravar qualquer coisa, dizendo o que fazer.
  const blockers = INSTALL_ITEMS.filter((item) => {
    const p = path.join(targetDir, item);
    return fs.existsSync(p) && !fs.statSync(p).isDirectory();
  });
  if (blockers.length > 0) {
    const um = blockers.length === 1;
    console.log(`  ${yellow}Nesta pasta existe ${um ? 'um arquivo chamado' : 'arquivos chamados'} ${blockers.join(', ')}, e o Córtex precisa criar ${um ? 'uma pasta com esse nome' : 'pastas com esses nomes'}.${reset}`);
    console.log(`  Renomeie ${um ? 'o seu arquivo' : 'os seus arquivos'} (por exemplo, para "${blockers[0]}-antigo") e rode o mesmo comando de novo.`);
    console.log(`\nNada foi alterado.\n`);
    process.exit(1);
  }

  if (existingFiles.length > 0 && sameFolders.length + replacedFiles.length === 0) {
    console.log(`  Esta pasta já tem arquivos seus. O Córtex só acrescenta as pastas e os arquivos dele ao lado dos seus: nada seu é apagado.\n`);
  } else if (existingFiles.length > 0 && !isForce) {
    console.log(`  Esta pasta já tem itens com o mesmo nome dos que o Córtex cria: ${sameFolders.concat(replacedFiles).join(', ')}`);
    if (sameFolders.length > 0) {
      console.log(`  Dentro de ${sameFolders.join(', ')}, um arquivo seu que tenha o mesmo nome de um arquivo do Córtex seria substituído; os demais ficam como estão.`);
    }
    if (replacedFiles.length > 0) {
      console.log(`  ${replacedFiles.join(', ')}: guardo uma cópia em ${toPosix(BACKUPS_REL)} antes de substituir.`);
    }
    const confirmed = await askConfirmation(`  Continuar? (s/N): `);
    if (!confirmed) {
      console.log(`\nNada foi alterado. Se preferir uma pasta nova só para o Córtex: ${cyan}npx @aksp/cortex init "Meu Negocio"${reset}\n`);
      process.exit(0);
    }
  }
  let initBackupDir = null;
  if (userFiles.length > 0) {
    initBackupDir = makeBackupDir(targetDir, 'init');
    for (const f of userFiles) fs.copyFileSync(path.join(targetDir, f), path.join(initBackupDir, f.replace(/^\./, '_')));
    console.log(`  ${yellow}Guardei uma cópia dos seus arquivos antes de mexer:${reset} ${userFiles.join(', ')}`);
    console.log(`  ${dim}em ${toPosix(path.relative(targetDir, initBackupDir))}${reset}\n`);
  }

  console.log(`  ${dim}Copiando arquivos do framework...${reset}`);

  // .gitignore: se o usuário já tem um, mantém o dele e acrescenta o do Córtex.
  const gitignore = ensureGitignore(targetDir, { appendToExisting: true });
  if (gitignore === 'appended') {
    console.log(`   ${green}✓${reset} .gitignore ${dim}— o seu foi mantido e as regras do Córtex foram acrescentadas${reset}`);
  } else if (gitignore === 'present') {
    console.log(`   ${green}✓${reset} .gitignore ${dim}— já continha as regras do Córtex${reset}`);
  } else {
    console.log(`   ${green}✓${reset} .gitignore`);
  }

  for (const item of INSTALL_ITEMS) {
    const srcPath = path.join(templateDir, item);
    if (fs.existsSync(srcPath)) {
      copyRecursiveSync(srcPath, path.join(targetDir, item));
      console.log(`   ${green}✓${reset} ${item}`);
    }
  }

  // Todos os arquivos de instrução nascem do mesmo texto de inicialização (o
  // AGENTS.md do pacote). O CLAUDE.md apenas importa o AGENTS.md.
  const bootstrap = fs.readFileSync(path.join(templateDir, 'AGENTS.md'), 'utf8');
  for (const target of bootstrapTargets) {
    const body = target === 'CLAUDE.md' ? `${CLAUDE_IMPORT_LINE}\n` : bootstrap;
    const existingPath = path.join(targetDir, target);
    // CLAUDE.md escrito pelo usuário: o texto dele fica e só ganha a linha do
    // import. Um atalho para outro arquivo, ou um texto que não está em UTF-8
    // (a linha estragaria os acentos), é trocado: a cópia já está em init-….
    if (target === 'CLAUDE.md' && userFiles.includes('CLAUDE.md') && !isSymlink(existingPath)) {
      const raw = fs.readFileSync(existingPath);
      const mine = raw.toString('utf8');
      if (hasClaudeImport(mine) || isUtf8Text(raw)) {
        if (!hasClaudeImport(mine)) appendClaudeImport(existingPath, raw);
        console.log(`   ${green}✓${reset} ${target} ${dim}— ${KNOWN_TARGETS[target]}${reset}`);
        continue;
      }
      console.log(`   ${yellow}!${reset} O seu ${target} estava salvo num formato de texto antigo (não era UTF-8): ficou na cópia acima e foi trocado por um novo.`);
    }
    writeRootFile(existingPath, body);
    console.log(`   ${green}✓${reset} ${target} ${dim}— ${KNOWN_TARGETS[target]}${reset}`);
  }

  const startHere = refreshStartHere(targetDir, null);
  if (startHere === 'written') {
    console.log(`   ${green}✓${reset} ${START_HERE_FILE} ${dim}— os próximos passos e as frases do dia a dia, para ler ou imprimir${reset}`);
  } else if (startHere === 'kept') {
    console.log(`   ${yellow}!${reset} ${START_HERE_FILE} já existia e foi mantido como está ${dim}— o do Córtex está em ${toPosix(START_HERE_REL_PATH)}${reset}`);
  }

  writeVersionFile(targetDir, VERSION);

  const outrasFerramentas =Object.keys(KNOWN_TARGETS).filter((t) => !bootstrapTargets.includes(t));

  console.log(`
${bold}${green}🎉 Córtex instalado!${reset} Agora falta só a conversa que monta o cérebro do seu negócio.

${bold}Próximos passos:${reset}
  1. Abra o seu aplicativo de IA (Claude Code, Cursor…), escolha ${bold}Abrir pasta${reset} e aponte para esta pasta:
     ${dim}${targetDir}${reset}

  2. Escreva no chat:
     ${bold}${yellow}"Quero montar meu Córtex"${reset}

  3. São 4 perguntas rápidas (uns 5 minutos). Depois é só dizer ${bold}radar${reset} ou ${bold}ajuda${reset}.
${startHere === 'written' ? `
  Estes passos e as frases do dia a dia ficaram guardados no arquivo ${bold}${START_HERE_FILE}${reset}, dentro da pasta.
` : ''}
${dim}Prefere o terminal? É opcional: dentro desta pasta, digite claude ou gemini e escreva a mesma frase.${reset}
${outrasFerramentas.length > 0 ? `
${dim}Usa ${outrasFerramentas.map((t) => KNOWN_TARGETS[t].split(',')[0]).join(' ou ')}? Rode: npx @aksp/cortex init${folderHint(targetArg)} --targets=${outrasFerramentas.join(',')}${reset}
` : ''}
${dim}Dúvidas e exemplos: https://github.com/alberthpalhares/cortex${reset}
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
  const fromVersion = installed && installed.version ? String(installed.version) : '';
  const hasFramework = fs.existsSync(path.join(targetDir, '.agents'));

  // Córtex montado que perdeu a pasta .agents/ (apagada por engano, ou a pasta
  // do negócio copiada sem ela): o init se recusa a rodar por cima de um cérebro
  // que existe, então é aqui que ela é reposta — todos os arquivos entram como novos.
  const restoringFramework = !hasFramework && isCortexMounted(targetDir);

  if (!hasFramework && !restoringFramework) {
    console.log(`${red}Não encontrei uma pasta .agents/ aqui.${reset} Este comando atualiza um Córtex já inicializado.`);
    console.log(`Rode ${cyan}npx @aksp/cortex@latest init${folderHint(targetArg)}${reset} primeiro.\n`);
    process.exit(1);
  }

  if (restoringFramework && !hasBrainEntry(targetDir)) {
    console.log(`${red}Achei a Memória do negócio nesta pasta, mas não o cérebro (${toPosix(CEREBRO_PATH)}) nem o arquivo de instrução que a IA lê (AGENTS.md).${reset}`);
    console.log(`Sem um dos dois, repor a pasta .agents/ deixaria um Córtex que a sua IA não carrega. ${BRAINLESS_ADVICE}`);
    console.log(`Nenhum arquivo foi alterado.\n`);
    process.exit(1);
  }

  if (installed && compareVersions(installed.version, VERSION) > 0 && !isForce) {
    console.log(`${yellow}Este projeto está na v${installed.version}, mas o comando que você rodou é a v${VERSION} (mais antiga).${reset}`);
    console.log(`  Atualizar agora faria o seu Córtex voltar no tempo. Use a versão mais recente:`);
    console.log(`    ${cyan}npx @aksp/cortex@latest update${reset}\n`);
    process.exit(1);
  }

  if (!installed) {
    console.log(`  ${yellow}⚠️ Não encontrei ${CORTEX_META_DIR}/${CORTEX_VERSION_FILE}${reset} — este Córtex foi instalado antes do comando update existir.`);
    console.log(`  Vou tratar a versão atual como desconhecida e comparar diretamente os arquivos.\n`);
  } else if (installed.version === VERSION && !isForce && !restoringFramework) {
    const latest = await fetchLatestVersion();
    if (latest && compareVersions(latest, VERSION) > 0) {
      console.log(`  ${yellow}Este projeto está na v${VERSION}, mas já existe a v${latest}.${reset}`);
      console.log(`  O comando que você rodou usou uma versão antiga guardada no computador. Rode assim:`);
      console.log(`    ${cyan}npx @aksp/cortex@latest update${reset}\n`);
      return;
    }
    touchVersionCheck(targetDir);
    if (latest) {
      console.log(`  ${green}✓${reset} Este projeto já está na v${VERSION}, a mais recente. Nada a fazer.\n`);
    } else {
      console.log(`  ${green}✓${reset} Este projeto já está na v${VERSION}, a versão que este comando conhece.`);
      console.log(`  ${dim}Para buscar uma versão mais nova no npm, rode: npx @aksp/cortex@latest update${reset}`);
      console.log(`  ${dim}Use --force para conferir os arquivos mesmo assim.${reset}\n`);
    }
    return;
  }

  console.log(`  ${dim}Versão instalada no projeto:${reset} ${installed ? 'v' + installed.version : 'desconhecida'}`);
  console.log(`  ${dim}Versão do CLI:${reset} v${VERSION}\n`);

  // Quem instalou pelo npm até a 1.3.0 nunca recebeu o .gitignore (o pacote não
  // o trazia). Cria quando não existe; um .gitignore do usuário nunca é tocado.
  const reportGitignore = () => {
    const isGitRepo = fs.existsSync(path.join(targetDir, '.git'));
    const hasFile = fs.existsSync(path.join(targetDir, '.gitignore'));
    let status;
    try {
      // Repositório Git sem .gitignore: o usuário pode estar versionando os dados
      // de propósito (backup). Criar o arquivo faria os arquivos novos sumirem do
      // repositório dele em silêncio — então só avisa.
      status = isGitRepo && !hasFile ? 'missing-rules' : ensureGitignore(targetDir, { appendToExisting: false });
    } catch (e) {
      // Um .gitignore que não pôde ser lido não pode derrubar a atualização no fim.
      console.log(`  ${yellow}!${reset} Não consegui conferir o .gitignore agora ${dim}(${e.code || e.message})${reset} — a atualização seguiu normalmente.`);
      return;
    }
    if (status === 'created') {
      console.log(`  ${green}✓${reset} .gitignore criado ${dim}— mantém Pilares/, Memoria/ e Ativos/ fora de um repositório Git${reset}`);
    } else if (status === 'missing-rules' && isGitRepo) {
      console.log(`  ${yellow}!${reset} Esta pasta é um repositório Git e o .gitignore ${hasFile ? 'não tem as regras do Córtex' : 'não existe'}.`);
      console.log(`    Se você NÃO quer os dados do negócio no repositório, acrescente estas linhas ao .gitignore (uma por linha):`);
      USER_GITIGNORE_DATA_RULES.forEach((rule) => console.log(`      ${rule}`));
    }
  };

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
    // O --prune só funciona nesta rodada: depois de aplicada a atualização, o
    // manifesto instalado já é o novo e estes arquivos passam a parecer do usuário.
    const acao = isPrune ? `${red}serão removidos${reset} (--prune ativo)` : `${dim}mantidos — para remover, cancele e rode este mesmo comando com --prune${reset}`;
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

  // Arquivos de instrução na raiz diferentes do que o cérebro geraria hoje também
  // são trabalho pendente. É o que torna o update repetível: se uma rodada parou
  // no meio (um arquivo preso pelo OneDrive, por exemplo), rodar o mesmo comando
  // de novo termina o serviço em vez de responder "nada para atualizar".
  const staleTargets = hasBrainWork ? [] : findStaleTargets(targetDir, VERSION);
  const hasStaleTargets = staleTargets.length > 0;
  if (hasStaleTargets) {
    console.log(`  ${yellow}~${reset} arquivo(s) de instrução desatualizado(s), que serão recompilados: ${staleTargets.join(', ')}`);
  }

  if (!hasFrameworkChanges && !hasPruneWork && !hasBrainWork && !hasStaleTargets) {
    console.log(`${green}Nada para atualizar em .agents/.${reset}`);
    reportGitignore();
    // Uma rodada anterior pode ter parado depois de atualizar tudo e antes de
    // registrar as novidades: num Córtex montado elas ainda precisam ser contadas.
    if (fs.existsSync(path.join(targetDir, CEREBRO_PATH))) {
      writeNovidades(targetDir, templateDir, installed && installed.version, VERSION);
    }
    writeVersionFile(targetDir, VERSION);
    // A atualização que tinha parado no meio terminou aqui: o backup dela está completo.
    let pending;
    while ((pending = findPendingUpdateBackup(targetDir, fromVersion))) fs.rmSync(path.join(pending, UPDATE_PENDING_FILE));
    return;
  }

  if (!isForce) {
    // Sem .agents/ não há o que copiar dela: só o cérebro (quando existe) é guardado.
    const confirmed = await askConfirmation(restoringFramework
      ? `  Aplicar essas mudanças? A pasta .agents/ será reposta; o cérebro, se existir, é guardado antes. (s/N): `
      : `  Aplicar essas mudanças? Um backup de .agents/ será criado antes. (s/N): `);
    if (!confirmed) {
      console.log(`\n${red}Atualização cancelada. Nenhum arquivo foi alterado.${reset}\n`);
      return;
    }
  }

  // Uma rodada anterior desta mesma atualização parou no meio? O backup dela é
  // o que guarda "como estava antes" (.agents/ já foi trocada em parte): ele é
  // reaproveitado, em vez de se criar outro com os arquivos já novos. Assim a
  // mensagem final aponta para a cópia certa e repetir o comando várias vezes
  // não a empurra para fora dos 3 backups guardados.
  const cerebroPath = path.join(targetDir, CEREBRO_PATH);
  let backupDir = findPendingUpdateBackup(targetDir, fromVersion);
  if (backupDir) {
    console.log(`  ${dim}Backup da tentativa anterior reaproveitado:${reset} ${toPosix(path.relative(targetDir, backupDir))}`);
  } else {
    backupDir = makeBackupDir(targetDir, 'update');
    if (hasFramework) copyRecursiveSync(path.join(targetDir, '.agents'), path.join(backupDir, 'agents'));
    if (fs.existsSync(cerebroPath)) {
      fs.copyFileSync(cerebroPath, path.join(backupDir, 'CEREBRO.md'));
    }
    // A marca só entra com a cópia completa, e só sai quando a atualização termina.
    fs.writeFileSync(path.join(backupDir, UPDATE_PENDING_FILE), fromVersion + '\n');
    if (hasFramework || fs.existsSync(cerebroPath)) {
      console.log(`  ${dim}Backup salvo em:${reset} ${toPosix(path.relative(targetDir, backupDir))}`);
    }
  }

  if (hasPruneWork) {
    pruneDeprecatedFiles(targetDir, removidosPeloFramework);
    console.log(`  ${yellow}${removidosPeloFramework.length} arquivo(s) descontinuado(s) removido(s).${reset} ${dim}(preservados no backup acima)${reset}`);
  }

  // A folha da raiz é renovada a partir do pacote ANTES de .agents/ ser trocada
  // (ver refreshStartHere): uma rodada interrompida não a deixa velha para sempre.
  const startHere = refreshStartHere(targetDir, readStartHereSource(targetDir), templateDir);
  if (startHere === 'written') {
    console.log(`  ${green}✓${reset} ${START_HERE_FILE} ${dim}— a folha com os primeiros passos e as frases do dia a dia, na raiz da pasta${reset}`);
  } else if (startHere === 'kept') {
    console.log(`  ${dim}${START_HERE_FILE}: o seu foi mantido como está (o do Córtex fica em ${toPosix(START_HERE_REL_PATH)}).${reset}`);
  }

  applyFrameworkUpdate(templateDir, targetDir, novos, alterados);

  // Propaga o cérebro: sem este passo, as skills novas chegam ao disco mas
  // continuam invisíveis para a IA, porque nada as ensina a acioná-las.
  const removidos = pruneBackups(targetDir, BACKUPS_TO_KEEP);
  if (removidos > 0) console.log(`  ${dim}Backups antigos de atualização removidos (guardo os ${BACKUPS_TO_KEEP} mais recentes): ${removidos}${reset}`);

  const brain = refreshBrainFramework(targetDir, templateDir);

  if (brain.status === 'updated') {
    console.log(`  ${green}✓${reset} Regras de operação do cérebro atualizadas em ${toPosix(CEREBRO_PATH)} ${dim}(sua área de negócio ficou intacta)${reset}`);
  } else if (brain.status === 'no-markers') {
    console.log(`  ${yellow}!${reset} ${toPosix(CEREBRO_PATH)} ainda não tem as camadas CORTEX:BUSINESS/CORTEX:FRAMEWORK.`);
    console.log(`    ${dim}Não mexi nele. Rode "revisar córtex" no chat para migrar e destravar a atualização automática das regras.${reset}`);
  }

  if (fs.existsSync(cerebroPath)) {
    const targets = readTargets(targetDir);
    // Instalações anteriores à 1.3.0 só tinham AGENTS.md, que o Claude Code não lê sozinho.
    // Cria o CLAUDE.md (um import de uma linha) se ele ainda não existir — nunca sobrescreve o do usuário.
    if (
      installed && compareVersions(installed.version, '1.3.0') < 0 &&
      targets.includes('AGENTS.md') && !targets.includes('CLAUDE.md') &&
      !fs.existsSync(path.join(targetDir, 'CLAUDE.md'))
    ) {
      targets.push('CLAUDE.md');
      console.log(`  ${green}✓${reset} CLAUDE.md criado ${dim}— o Claude Code passa a carregar o cérebro (importa o AGENTS.md)${reset}`);
    }
    const compiled = compileTargets(targetDir, targets, VERSION);
    writeTargets(targetDir, targets);
    console.log(`  ${green}✓${reset} Cérebro recompilado para: ${targets.join(', ')}`);
    reportUserTargets(targetDir, compiled);
    await handleRetiredTargets(targetDir, isForce);
  }

  // Os protocolos passaram a vir com o framework. Uma cópia antiga em Frameworks/
  // só deixa de ser lida quando o cérebro em camadas foi regenerado (é ele quem
  // aponta o caminho). Sem CEREBRO.md ou sem as camadas, o cérebro antigo ainda
  // lê a cópia — então nada de mandar apagar.
  const legacyProtocols = findLegacyProtocols(targetDir);
  if (legacyProtocols.length > 0 && (brain.status === 'updated' || brain.status === 'unchanged')) {
    console.log(`  ${yellow}!${reset} Frameworks/${legacyProtocols.join(' e Frameworks/')} ${legacyProtocols.length > 1 ? 'não são mais usados' : 'não é mais usado'}:`);
    console.log(`    ${dim}os protocolos agora vêm com o framework (.agents/cortex/) e se atualizam sozinhos. Pode apagar ${legacyProtocols.length > 1 ? 'esses arquivos' : 'esse arquivo'} quando quiser.${reset}`);
  }

  if (!isPrune && removidosPeloFramework.length > 0) {
    console.log(`  ${dim}${removidosPeloFramework.length} arquivo(s) que o framework não usa mais ficaram em .agents/ e não são lidos por nada; pode apagar à mão:${reset}`);
    removidosPeloFramework.forEach((f) => console.log(`     ${dim}• ${f}${reset}`));
  }

  reportGitignore();
  // A versão é a última coisa gravada: se algo falhar antes, o projeto continua
  // marcado com a versão antiga e rodar o mesmo comando de novo termina o serviço.
  const novidades = writeNovidades(targetDir, templateDir, installed && installed.version, VERSION);
  writeVersionFile(targetDir, VERSION);
  fs.rmSync(path.join(backupDir, UPDATE_PENDING_FILE), { force: true });

  const backupRel = toPosix(path.relative(targetDir, backupDir));
  // O que a cópia guarda de fato. Quando a .agents/ não existia (foi reposta),
  // não há pasta `agents` nela — salvo num backup reaproveitado de uma tentativa
  // anterior. As frases abaixo só prometem o que está lá.
  const temAgents = fs.existsSync(path.join(backupDir, 'agents'));
  const temCerebro = fs.existsSync(path.join(backupDir, 'CEREBRO.md'));
  const guardado = temAgents
    ? `Como estava antes (a pasta .agents/ e o cérebro) ficou guardado em ${backupRel} — se você tinha personalizado alguma habilidade, a sua versão está lá.`
    : `A pasta .agents/ não estava aqui e foi reposta do zero${temCerebro ? `; o seu cérebro como estava ficou guardado em ${backupRel}` : ''}.`;
  console.log(`
${bold}${green}🎉 Framework atualizado para v${VERSION}!${reset}

${dim}Pilares/, Memoria/, Ativos/ e a área CORTEX:BUSINESS do seu cérebro não foram tocados.${reset}
${dim}${guardado}${reset}
`);

  // Caminho de volta. Uma versão que já protege os arquivos do usuário volta
  // pelo próprio comando dela; para as anteriores, a volta é à mão, a partir do
  // backup acima (ver ROLLBACK_BY_COMMAND_SINCE) — e só existe quando a cópia
  // tem a pasta `agents`: sem ela não há estado anterior para onde voltar.
  let rollback = rollbackAdvice(fromVersion, VERSION);
  if (rollback === 'manual' && !temAgents) rollback = null;
  if (rollback === 'comando') {
    console.log(`${bold}Algo ficou estranho depois de atualizar?${reset} Para voltar à v${fromVersion}, rode:`);
    console.log(`  ${cyan}npx @aksp/cortex@${fromVersion} update${folderHint(targetArg)} --force${reset}\n`);
  } else if (rollback === 'manual') {
    console.log(`${bold}Algo ficou estranho depois de atualizar?${reset} Dá para voltar à v${fromVersion} copiando de volta o que ficou guardado:`);
    console.log(`  1. Abra a pasta ${backupRel} ${dim}(fica dentro da pasta do negócio)${reset}.`);
    console.log(`  2. Copie tudo o que há dentro da pasta ${bold}agents${reset} para dentro da pasta ${bold}.agents${reset} do negócio, substituindo os arquivos.`);
    if (temCerebro) {
      console.log(`  3. Copie o arquivo ${bold}CEREBRO.md${reset} para dentro da pasta ${bold}Frameworks${reset}, substituindo o que está lá.`);
    }
    console.log(`  ${temCerebro ? 4 : 3}. Rode: ${cyan}npx @aksp/cortex@latest sync${folderHint(targetArg)}${reset}`);
    console.log(`  ${dim}Não use o comando da versão antiga (npx @aksp/cortex@${fromVersion}): ela não conhece as cópias guardadas em ${toPosix(BACKUPS_REL)}${reset}`);
    console.log(`  ${dim}nem o seu CLAUDE.md, e poderia apagá-los. Para atualizar de novo mais tarde: npx @aksp/cortex@latest update${folderHint(targetArg)} --force${reset}\n`);
  }

  if (novidades.length > 0) {
    console.log(`${bold}✨ O que há de novo para você:${reset}`);
    novidades.forEach((n) => console.log(`  • ${n.texto}${n.diga ? ` ${dim}— diga:${reset} ${cyan}${n.diga}${reset}` : ''}`));
    console.log(`\n  ${dim}Na próxima conversa com a sua IA, diga${reset} ${cyan}novidades${reset} ${dim}que ela te mostra tudo isso com calma.${reset}\n`);
  }
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
    console.log(`${red}Ainda não há um cérebro para compilar${reset} (${toPosix(CEREBRO_PATH)} não existe).`);
    console.log(`  O mais provável: o Córtex foi instalado, mas a conversa de montagem ainda não aconteceu.`);
    console.log(`  Abra esta pasta na sua ferramenta de IA e escreva ${bold}"Quero montar meu Córtex"${reset}.`);
    console.log(`  ${dim}Se o seu Córtex é anterior à v0.7.0, diga "revisar córtex" no chat para migrar.${reset}\n`);
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
    console.log(`  ${dim}Não gerados: ${naoGerados.join(', ')} — para incluir algum, liste todos em --targets= (ou use --targets=all).${reset}`);
  }

  // --targets= é a lista COMPLETA: uma ferramenta que estava em uso e ficou de
  // fora deixa de ser atualizada daqui em diante. Isso precisa ser dito às claras.
  if (flagTargets) {
    const dropped = readTargets(targetDir).filter((t) => !targets.includes(t) && fs.existsSync(path.join(targetDir, t)));
    if (dropped.length > 0) {
      console.log(`  ${yellow}Atenção:${reset} ${dropped.join(', ')} ${dropped.length > 1 ? 'saem' : 'sai'} da lista e não ${dropped.length > 1 ? 'serão mais atualizados' : 'será mais atualizado'}.`);
      console.log(`  Para manter todos, rode: ${cyan}npx @aksp/cortex sync${folderHint(targetArg)} --targets=${Array.from(new Set(readTargets(targetDir).concat(targets))).join(',')}${reset}`);
    }
  }
  console.log('');

  if (!isForce) {
    const confirmed = await askConfirmation(`  Sobrescrever ${targets.length} arquivo(s) com o cérebro compilado? (s/N): `);
    if (!confirmed) {
      console.log(`\n${red}Sincronização cancelada. Nenhum arquivo foi alterado.${reset}\n`);
      return;
    }
  }

  const compiled = compileTargets(targetDir, targets, VERSION);
  writeTargets(targetDir, targets);

  for (const file of compiled.written) {
    console.log(`   ${green}✓${reset} ${file}`);
  }
  reportUserTargets(targetDir, compiled);

  await handleRetiredTargets(targetDir, isForce);

  console.log(`
${bold}${green}🎉 Cérebro compilado!${reset}

${dim}A sua ferramenta de IA carrega o cérebro completo ao abrir a pasta${targets.includes('AGENTS.md') && targets.includes('CLAUDE.md') ? ' (o CLAUDE.md importa o AGENTS.md)' : ''}.${reset}
${dim}Esses arquivos são gerados: edite sempre ${toPosix(CEREBRO_PATH)} e rode "npx @aksp/cortex sync" de novo.${reset}
`);
}

// Os dados do negócio: o que o `backup` copia (e o que o `update` nunca toca).
const DATA_BACKUP_ITEMS = ['Pilares', 'Memoria', 'Ativos', CEREBRO_PATH];

// Faz a cópia em si. Não atravessa atalhos (devolve-os em `skipped`). Se a
// cópia falhar no meio (arquivo preso, disco cheio), a pasta desta tentativa é
// removida: uma pasta dados-… pela metade seria tomada por uma cópia boa.
function copyBusinessData(targetDir) {
  const items = DATA_BACKUP_ITEMS.filter((item) => fs.existsSync(path.join(targetDir, item)));
  const backupDir = makeBackupDir(targetDir, 'dados');
  const skipped = [];
  try {
    for (const item of items) {
      copyRecursiveSync(path.join(targetDir, item), path.join(backupDir, item), skipped);
      console.log(`   ${green}✓${reset} ${toPosix(item)}`);
    }
  } catch (err) {
    let sobrou = null;
    try {
      fs.rmSync(backupDir, { recursive: true, force: true });
    } catch (e) {
      try {
        fs.renameSync(backupDir, backupDir + '-incompleta');
        sobrou = backupDir + '-incompleta';
      } catch (e2) {
        sobrou = backupDir;
      }
    }
    console.log(`\n  ${red}A cópia não terminou: nenhuma cópia foi guardada desta vez.${reset}`);
    if (sobrou) {
      console.log(`  Sobrou uma pasta pela metade, que não serve como cópia e pode ser apagada: ${toPosix(path.relative(targetDir, sobrou))}`);
    }
    throw err;
  }
  return { backupDir, skipped };
}

// Copia os dados do negócio para .cortex/backups/dados-<data>/. Só lê os
// originais; não altera nem apaga nada, por isso não pede confirmação.
function runBackup() {
  const targetArg = args[1] && !args[1].startsWith('-') ? args[1] : '.';
  const targetDir = path.resolve(process.cwd(), targetArg);

  console.log(`\n${bold}${cyan}🧠 Guardando uma cópia dos dados do seu negócio...${reset}\n`);

  if (!fs.existsSync(targetDir)) {
    console.log(`${red}Pasta não encontrada:${reset} ${targetDir}`);
    process.exit(1);
  }

  if (!isCortexMounted(targetDir)) {
    console.log(`${red}Ainda não há dados do negócio para copiar nesta pasta.${reset}`);
    console.log(`  Confira se você está na pasta do seu negócio. Se o Córtex acabou de ser instalado, a cópia só faz`);
    console.log(`  sentido depois da conversa de montagem (${bold}"Quero montar meu Córtex"${reset}). Nenhuma cópia foi feita.\n`);
    process.exit(1);
  }

  const { backupDir, skipped } = copyBusinessData(targetDir);

  if (skipped.length > 0) {
    console.log(`\n  ${yellow}!${reset} Atalho(s) para outra pasta que NÃO entraram na cópia ${dim}(a cópia não segue atalhos; se precisar do conteúdo, copie à mão)${reset}:`);
    skipped.forEach((p) => console.log(`     ${yellow}•${reset} ${toPosix(path.relative(targetDir, p))}`));
  }

  const backupRel = toPosix(path.relative(targetDir, backupDir));
  const total = listFilesRecursive(backupDir).length;
  console.log(`
${bold}${green}Cópia guardada:${reset} ${total} arquivo(s) em
  ${backupDir}

${bold}Para restaurar:${reset} abra essa pasta e copie de volta, por cima, o arquivo ou a pasta que você quer
  recuperar (ex.: ${backupRel}/Memoria → Memoria). Os nomes e os lugares são os mesmos da pasta do negócio.
  ${dim}Se restaurar o ${toPosix(CEREBRO_PATH)}, rode depois: npx @aksp/cortex sync${folderHint(targetArg)}${reset}

${dim}Estas cópias (pastas "dados-...") nunca são apagadas sozinhas: quando juntar muitas, apague as mais antigas à mão.${reset}
${dim}Elas ficam dentro da própria pasta do negócio. Para se proteger de perder o computador, copie a pasta inteira para fora dele.${reset}
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

  // Três estados: nada instalado aqui; instalado, mas a conversa de montagem
  // ainda não aconteceu; montado (segue para o diagnóstico).
  const metaPath = path.join(targetDir, 'Memoria', 'META.md');
  if (!fs.existsSync(metaPath)) {
    const hasBrain = fs.existsSync(path.join(targetDir, CEREBRO_PATH));
    // A skill de montagem é o sinal de que o framework do Córtex está na pasta
    // (uma pasta .agents/ qualquer pode ser de outra ferramenta).
    const hasFramework = fs.existsSync(path.join(targetDir, '.agents', 'skills', 'cortex-onboarding', 'SKILL.md'));
    if (hasBrain) {
      // Já foi montado: mandar "fazer a conversa" refaria a montagem por cima de um cérebro que existe.
      console.log(`${red}Este Córtex tem um cérebro (${toPosix(CEREBRO_PATH)}), mas falta o índice Memoria/META.md.${reset}`);
      console.log(`Sem o índice, a IA não sabe onde está cada informação. Traga a pasta Memoria/ de volta de uma cópia sua`);
      console.log(`ou peça à IA: ${cyan}"recrie o Memoria/META.md a partir dos arquivos que existem em Pilares/ e Memoria/"${reset}.\n`);
    } else if (hasFramework) {
      console.log(`${yellow}O Córtex está instalado nesta pasta, mas ainda não foi montado.${reset}`);
      console.log(`Falta só a conversa: abra esta pasta na sua ferramenta de IA e escreva ${cyan}"Quero montar meu Córtex"${reset}.`);
      console.log(`${dim}Depois dela, rode este diagnóstico de novo.${reset}\n`);
      // A conversa de montagem usa os moldes e as outras habilidades: se algum
      // arquivo do framework sumiu, é isso que se resolve primeiro.
      const install = findMissingFrameworkFiles(targetDir, path.resolve(__dirname, '..'));
      if (install.missing.length > 0) {
        printInstallProblem(install, targetArg);
        console.log('');
        console.log(`${bold}💡 Sugestão:${reset} Primeiro rode o comando acima; depois faça a conversa de montagem.\n`);
      }
    } else if (isCortexInstalled(targetDir) && fs.existsSync(path.join(targetDir, '.agents'))) {
      // A pasta .agents/ existe, mas sem a habilidade de montagem: o init não
      // mexe numa pasta que já existe; quem repõe arquivo por arquivo é o update.
      const install = findMissingFrameworkFiles(targetDir, path.resolve(__dirname, '..'));
      if (install.missing.length === 0) install.missing.push('.agents/skills/cortex-onboarding/SKILL.md');
      printInstallProblem(install, targetArg);
      console.log('');
    } else if (isCortexInstalled(targetDir)) {
      console.log(`${red}A instalação do Córtex nesta pasta está incompleta: falta a pasta .agents/.${reset}`);
      console.log(`Rode ${cyan}npx @aksp/cortex@latest init${folderHint(targetArg)}${reset}: ele repõe o que falta e não sobrescreve nada seu.\n`);
    } else {
      console.log(`${red}Não encontrei um Córtex nesta pasta.${reset} Confira se você está na pasta do seu negócio.`);
      console.log(`Para instalar aqui, rode ${cyan}npx @aksp/cortex init${reset} e depois peça para a IA ${cyan}"montar meu córtex"${reset}.\n`);
    }
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

  // O arquivo morto (Memoria/_Arquivo/, criado pela skill consolidar) fica numa
  // subpasta que listRealFiles não percorre. A linha dele no mapa pode apontar
  // para a pasta ou para um ou mais arquivos dela: a pasta precisa existir, e
  // cada .md citado na linha também (menos os marcadores AAAA.md e *.md).
  const archiveExists = (f) => {
    if (f !== 'Memoria/_Arquivo' && !f.startsWith('Memoria/_Arquivo/')) return false;
    const archiveDir = path.join(targetDir, 'Memoria', '_Arquivo');
    if (!fs.existsSync(archiveDir)) return false;
    return [...f.matchAll(/Memoria\/_Arquivo\/([^\s,;()#]+\.md)/g)]
      .map((m) => m[1])
      .filter((name) => name !== 'AAAA.md' && name !== '*.md')
      .every((name) => fs.existsSync(path.join(archiveDir, name)));
  };

  for (const f of mapFiles) {
    if (diskFiles.has(f) || archiveExists(f)) {
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

    // Números do Guardião de Margem escritos de um jeito que muda o valor.
    const numberIssues = /^Pilares\/0[34]_/.test(f) ? findNumberIssues(content) : [];

    pillarResults.push({
      file: f,
      exists: true,
      revisarCount,
      blankSections,
      nullFields,
      numberIssues,
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
      numberIssues: [],
    });
  }

  // --- 4. Cérebro ---
  const brain = checkBrainHealth(targetDir);

  // --- 5. Completude ---
  const completeness = calculateCompleteness(pillarResults);

  // --- 6. Relatório ---
  // Em blocos e minutos, não em porcentagem: quem fez a montagem rápida fez tudo
  // o que foi pedido, e um "~0%" diria a essa pessoa que ela falhou.
  const essentialsPending = MANDATORY_PILLAR_PREFIXES.filter((prefix) => {
    const entry = pillarResults.find((p) => p.file.startsWith(`Pilares/${prefix}`));
    return entry && entry.exists && (entry.revisarCount > 0 || entry.blankSections > 0 || entry.nullFields.length > 0);
  });
  if (mandatoryMissing.length > 0) {
    console.log(`${bold}📊 Montagem incompleta:${reset} faltam ${mandatoryMissing.length} dos ${MANDATORY_PILLAR_PREFIXES.length} pilares essenciais.\n`);
  } else if (completeness === 100) {
    console.log(`${bold}📊 Os ${MANDATORY_PILLAR_PREFIXES.length} pilares essenciais estão completos ✅${reset}\n`);
  } else {
    const names = essentialsPending.map((prefix) => MANDATORY_PILLAR_NAMES[prefix]).join(', ');
    console.log(`${bold}📊 O essencial está funcionando.${reset} Falta completar ${essentialsPending.length} de ${MANDATORY_PILLAR_PREFIXES.length} pilares essenciais (${names}) — uns 2 a 5 minutos cada.\n`);
  }

  if (mandatoryMissing.length > 0) {
    console.log(`${red}🔴 Pilares obrigatórios faltando:${reset}`);
    for (const prefix of mandatoryMissing) {
      const name = MANDATORY_PILLAR_NAMES[prefix] || prefix;
      console.log(`   • ${prefix}${name}.md`);
    }
    console.log('');
  } else {
    console.log(`${green}✅ Pilares obrigatórios: nenhum faltando${reset}\n`);
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

  const withPendencies = pillarResults.filter((p) => p.exists && (p.revisarCount > 0 || p.blankSections > 0 || p.nullFields.length > 0 || p.numberIssues.length > 0));
  if (withPendencies.length > 0) {
    console.log(`${yellow}📝 Pilares com pendências:${reset}`);
    for (const p of withPendencies) {
      const parts = [];
      if (p.revisarCount > 0) parts.push(`${p.revisarCount} REVISAR`);
      if (p.blankSections > 0) parts.push(`${p.blankSections} seção(ões) em branco`);
      if (p.nullFields.length > 0) parts.push(`campos null: ${p.nullFields.join(', ')}`);
      if (p.numberIssues.length > 0) parts.push(`${p.numberIssues.length} número(s) para corrigir (veja abaixo)`);
      console.log(`   • ${p.file} — ${parts.join(' | ')}`);
    }
    console.log('');
  } else {
    console.log(`${green}📝 Pilares com pendências: Nenhum ✅${reset}\n`);
  }

  const withNumberIssues = pillarResults.filter((p) => p.numberIssues.length > 0);
  if (withNumberIssues.length > 0) {
    console.log(`${red}🔢 Números para corrigir${reset} (a IA usa estes valores nas contas de preço, desconto e margem):`);
    for (const p of withNumberIssues) {
      for (const issue of p.numberIssues) console.log(`   • ${p.file} — ${issue}`);
    }
    console.log(`   ${dim}Eles ficam no topo do arquivo, entre as duas linhas ---. Corrija ali, ou peça à IA: "corrija os números do cabeçalho dos pilares". Nada foi alterado por este diagnóstico.${reset}\n`);
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
    console.log(`${green}✅ META.md: sem inconsistências${reset}\n`);
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
  // Só é "cópia antiga" depois do update: quando o cérebro já não cita
  // Frameworks/<arquivo> e o protocolo novo existe em .agents/cortex/. Antes
  // disso o cérebro ainda lê a cópia, e mandar apagar quebraria o Córtex.
  const cerebroText = brain.hasCerebro ? fs.readFileSync(path.join(targetDir, CEREBRO_PATH), 'utf8') : '';
  const legacyProtocols = findLegacyProtocols(targetDir).filter((f) =>
    brain.hasLayers &&
    !cerebroText.includes(`Frameworks/${f}`) &&
    fs.existsSync(path.join(targetDir, '.agents', 'cortex', f)));
  if (legacyProtocols.length > 0) {
    console.log(`  ${dim}Frameworks/${legacyProtocols.join(' e Frameworks/')}: cópia antiga, não é mais usada (os protocolos agora vêm em .agents/cortex/). Pode apagar.${reset}`);
  }

  // --- 7. Instalação ---
  // Só o que FALTA em .agents/. Skill editada pelo dono não é problema, e o que
  // sobrou de versões antigas é assunto do update (--prune).
  const install = findMissingFrameworkFiles(targetDir, path.resolve(__dirname, '..'));
  const installBroken = install.wholeFolder || install.missing.length > 0;
  let installFix = '';
  console.log('');
  const unverifiedFix = `npx @aksp/cortex@latest update${folderHint(targetArg)} --force`;
  if (installBroken) {
    installFix = printInstallProblem(install, targetArg, targetDir);
  } else if (install.unverified) {
    // Sem lista não houve conferência: dizer "nada faltando" seria um falso verde.
    console.log(`${yellow}🧩 Instalação: não consegui conferir${reset} — esta pasta não tem a lista de arquivos do Córtex (.agents/manifest.json) nem um registro de versão que diga qual lista usar.`);
    console.log(`   Para repor o que estiver faltando, sem tocar nos seus dados, rode:`);
    console.log(`     ${cyan}${unverifiedFix}${reset}`);
  } else {
    console.log(`${green}🧩 Instalação: nenhum arquivo do Córtex faltando em .agents/ ✅${reset}`);
  }

  // --- 8. Versão ---
  const installedVersion = readVersionFile(targetDir);
  const latest = await fetchLatestVersion();
  if (installedVersion && installedVersion.version) {
    const current = installedVersion.version;
    if (latest && compareVersions(latest, current) > 0) {
      console.log(`\n${bold}📦 Versão:${reset} ${yellow}v${current} — já existe a v${latest}.${reset} Para atualizar (seus dados não são tocados):`);
      console.log(`  ${cyan}npx @aksp/cortex@latest update${reset}`);
    } else if (latest) {
      console.log(`\n${bold}📦 Versão:${reset} ${green}v${current}, a mais recente ✅${reset}`);
    } else {
      console.log(`\n${bold}📦 Versão:${reset} v${current} ${dim}(não consegui consultar o npm para saber se há uma mais nova)${reset}`);
    }
  }

  // --- 9. Sugestão ---
  console.log(`\n${bold}💡 Sugestão:${reset}`, (() => {
    // Vem primeiro: as outras sugestões mandam "dizer no chat", e sem as
    // habilidades na pasta a IA não tem como atender.
    if (installBroken && !installFix) return `Primeiro traga de volta a pasta do negócio inteira (veja "Instalação incompleta" acima). Depois rode este diagnóstico de novo.`;
    if (installBroken) return `Primeiro reponha o que falta na instalação — rode "${installFix}". Depois rode este diagnóstico de novo.`;
    if (mandatoryMissing.length > 0) return `Crie os pilares obrigatórios faltantes — diga "revisar córtex" no chat.`;
    if (withNumberIssues.length > 0) {
      return withPendencies.some((p) => p.revisarCount > 0 || p.blankSections > 0 || p.nullFields.length > 0)
        ? `Primeiro corrija os números apontados acima; depois diga "continuar onboarding" no chat para completar o resto, um bloco por vez.`
        : `Corrija os números apontados acima — ou diga "corrija os números do cabeçalho dos pilares" no chat.`;
    }
    if (withPendencies.length > 0) return `Ainda há itens a completar — diga "continuar onboarding" no chat e fazemos um bloco por vez.`;
    if (!brain.hasLayers) return `Migre o cérebro para o formato com camadas — diga "revisar córtex" no chat.`;
    if (brain.isPointer) return `Recompile os arquivos de raiz — rode "npx @aksp/cortex sync".`;
    if (latest && installedVersion && compareVersions(latest, installedVersion.version) > 0) {
      return `A estrutura está em ordem. Falta só atualizar — rode "npx @aksp/cortex@latest update".`;
    }
    if (install.unverified) return `A estrutura está em ordem, mas não deu para conferir os arquivos do próprio Córtex — rode "${unverifiedFix}".`;
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
  } else if (command === 'backup') {
    runBackup();
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
    const { lines, detail } = describeError(err);
    console.error(`\n${red}O Córtex encontrou um erro e parou.${reset}`);
    console.error(`  Os dados do seu negócio (Pilares/, Memoria/, Ativos/) não foram alterados.`);
    lines.forEach((l) => console.error(`  ${l}`));
    console.error(`\n${dim}Detalhe técnico:\n${detail}${reset}\n`);
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
  compareVersions,
  rollbackAdvice,
  copyBusinessData,
  pruneBackups,
  makeBackupDir,
  isCortexMounted,
  hasBrainEntry,
  BACKUPS_TO_KEEP,
  isCortexInstalled,
  addMissingBootstrapTargets,
  ensureGitignore,
  describeError,
  folderHint,
  findStaleTargets,
  findLegacyProtocols,
  LEGACY_PROTOCOL_FILES,
  INSTALL_ITEMS,
  isPersonalRootFolder,
  USER_GITIGNORE,
  EXIT_NEEDS_CONFIRMATION,
  isCortexOwnedFile,
  BACKUPS_REL,
  RETIRED_TARGETS,
  DEFAULT_TARGETS,
  CLAUDE_IMPORT_LINE,
  buildClaudeImport,
  findRetiredTargets,
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
  findNumberIssues,
  countRevisarAndBlanks,
  checkBrainHealth,
  calculateCompleteness,
  copyRecursiveSync,
  refreshStartHere,
  writeVersionFile,
  readVersionFile,
  touchVersionCheck,
  fetchLatestVersion,
  selectNovidades,
  formatNovidade,
  writeNovidades,
  NOVIDADES_SRC_REL_PATH,
  readManifestFiles,
  listFilesRecursive,
  diffFrameworkLayer,
  findMissingFrameworkFiles,
  classifyPreserved,
  applyFrameworkUpdate,
  pruneDeprecatedFiles
};
