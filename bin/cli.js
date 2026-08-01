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

const FRAMEWORK_ITEMS = ['.agents'];

const USER_DATA_ITEMS = [
  'Frameworks',
  'Memoria',
  'Pilares',
  'Ativos',
  'AGENTS.md',
  'GEMINI.md',
  'CLAUDE.md',
  'CODEX.md',
  '.cursorrules'
];

const CORTEX_META_DIR = '.cortex';
const CORTEX_VERSION_FILE = 'version.json';

const POINTER_ROOT_FILES = ['GEMINI.md', 'CLAUDE.md', 'CODEX.md', 'AGENTS.md', '.cursorrules'];
const CEREBRO_PATH = path.join('Frameworks', 'CEREBRO.md');

function buildPointerContent(nomeNegocio) {
  const titulo = nomeNegocio ? `Córtex — ${nomeNegocio}` : 'Córtex';
  return `# ${titulo}

> Este arquivo é um **ponteiro**. A fonte única de instruções está em \`Frameworks/CEREBRO.md\`.

**INSTRUÇÃO PARA A IA:** Leia agora o arquivo \`Frameworks/CEREBRO.md\` na raiz deste workspace e trate TODO o conteúdo dele como suas instruções de sistema para este negócio. Releia esse arquivo sempre que a conversa reiniciar ou o contexto for limpo. NUNCA duplique o conteúdo aqui — qualquer atualização do "cérebro" deve ser feita em \`Frameworks/CEREBRO.md\`, nunca neste arquivo.
`;
}

function readBusinessName(targetDir) {
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
  ${green}update [pasta]${reset} Atualiza APENAS a camada de framework (.agents/skills) para a versão instalada do CLI.
                  Nunca toca em Pilares/, Memoria/, Ativos/, Frameworks/ ou nos system prompts de raiz.
  ${green}sync [pasta]${reset}   Regenera os 5 ponteiros de raiz (GEMINI.md, CLAUDE.md, CODEX.md, AGENTS.md, .cursorrules)
                  a partir de Frameworks/CEREBRO.md. Use se algum ponteiro for sobrescrito ou corrompido.
  ${green}--help, -h${reset}     Exibe esta mensagem de ajuda.
  ${green}--version, -v${reset}  Exibe a versão atual do CLI.

${bold}EXEMPLOS:${reset}
  $ npx @aksp/cortex init
  $ npx @aksp/cortex init MinhaEmpresa
  $ npx cortex init "Meu Negocio"
  $ npx cortex update
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
      const label = path.join(item, relPath);

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

    for (const relPath of targetFiles) {
      preservados.push(path.join(item, relPath));
    }
  }

  return { novos, alterados, semMudanca, preservados };
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

async function runInit() {
  const targetArg = args[1] && !args[1].startsWith('-') ? args[1] : '.';
  const targetDir = path.resolve(process.cwd(), targetArg);
  const templateDir = path.resolve(__dirname, '..');

  console.log(`\n${bold}${cyan}🧠 Inicializando Córtex...${reset}\n`);

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log(`  ${dim}Criada pasta:${reset} ${targetDir}`);
  }

  const existingFiles = fs.readdirSync(targetDir);
  if (existingFiles.length > 0 && targetArg !== '.') {
    const isForce = args.includes('--force') || args.includes('-f');
    if (!isForce) {
      console.log(`  ${yellow}⚠️ A pasta de destino não está vazia:${reset} ${targetDir}`);
      const confirmed = await askConfirmation(`  Deseja copiar a estrutura do Córtex mesmo assim? (s/N): `);
      if (!confirmed) {
        console.log(`\n${red}Operação cancelada.${reset}\n`);
        process.exit(0);
      }
    }
  }

  const itemsToCopy = [
    '.agents',
    'Frameworks',
    'Memoria',
    'Pilares',
    'Ativos',
    'AGENTS.md',
    'GEMINI.md',
    'CLAUDE.md',
    'CODEX.md',
    '.cursorrules',
    '.gitignore'
  ];

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

  console.log(`${bold}O que vai mudar em .agents/ (skills e templates do framework):${reset}`);
  console.log(`  ${green}+ ${novos.length} arquivo(s) novo(s)${reset}`);
  novos.forEach((f) => console.log(`     ${green}+${reset} ${f}`));
  console.log(`  ${yellow}~ ${alterados.length} arquivo(s) atualizado(s)${reset}`);
  alterados.forEach((f) => console.log(`     ${yellow}~${reset} ${f}`));
  console.log(`  ${dim}= ${semMudanca.length} arquivo(s) sem mudança${reset}`);
  if (preservados.length > 0) {
    console.log(`  ${cyan}• ${preservados.length} arquivo(s) seu(s) preservado(s)${reset} ${dim}(não fazem parte do framework padrão — ex: skills customizadas suas)${reset}`);
    preservados.forEach((f) => console.log(`     ${cyan}•${reset} ${f}`));
  }

  console.log(`\n${bold}O que NUNCA é tocado:${reset} ${USER_DATA_ITEMS.join(', ')}\n`);

  if (novos.length === 0 && alterados.length === 0) {
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

  applyFrameworkUpdate(templateDir, targetDir, novos, alterados);
  writeVersionFile(targetDir, VERSION);

  console.log(`
${bold}${green}🎉 Framework atualizado para v${VERSION}!${reset}

${dim}Se você tinha personalizado algum arquivo dentro de .agents/skills, confira o backup acima para recuperar suas mudanças.${reset}
${dim}Pilares/, Memoria/, Ativos/, Frameworks/ e os system prompts de raiz não foram tocados.${reset}
`);
}

async function runSync() {
  const targetArg = args[1] && !args[1].startsWith('-') ? args[1] : '.';
  const targetDir = path.resolve(process.cwd(), targetArg);
  const isForce = args.includes('--force') || args.includes('-f');

  console.log(`\n${bold}${cyan}🧠 Sincronizando ponteiros do Córtex...${reset}\n`);

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

  const nomeNegocio = readBusinessName(targetDir);
  const pointerContent = buildPointerContent(nomeNegocio);

  console.log(`  ${dim}Fonte:${reset} ${CEREBRO_PATH}`);
  console.log(`${bold}Ponteiros a regenerar:${reset}`);
  POINTER_ROOT_FILES.forEach((f) => console.log(`   ${cyan}•${reset} ${f}`));
  console.log('');

  if (!isForce) {
    const confirmed = await askConfirmation(`  Sobrescrever esses ${POINTER_ROOT_FILES.length} arquivos com o ponteiro padrão? (s/N): `);
    if (!confirmed) {
      console.log(`\n${red}Sincronização cancelada. Nenhum arquivo foi alterado.${reset}\n`);
      return;
    }
  }

  for (const file of POINTER_ROOT_FILES) {
    fs.writeFileSync(path.join(targetDir, file), pointerContent);
    console.log(`   ${green}✓${reset} ${file}`);
  }

  console.log(`
${bold}${green}🎉 Ponteiros sincronizados!${reset}

${dim}Todos os 5 arquivos de raiz agora apontam para ${CEREBRO_PATH}. O conteúdo completo do system prompt continua vivendo só lá.${reset}
`);
}

async function main() {
  if (!command || command === 'init') {
    await runInit();
  } else if (command === 'update') {
    await runUpdate();
  } else if (command === 'sync') {
    await runSync();
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

main().catch((err) => {
  console.error(`${red}Erro ao executar CLI:${reset}`, err);
  process.exit(1);
});
