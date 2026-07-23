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
let VERSION = '0.4.0';
try {
  const pkg = JSON.parse(fs.readFileSync(PKG_PATH, 'utf8'));
  VERSION = pkg.version || VERSION;
} catch (e) {}

const args = process.argv.slice(2);
const command = args[0];

function printHelp() {
  console.log(`
${bold}${cyan}🧠 Córtex CLI — Central de Inteligência do Seu Negócio${reset} (v${VERSION})

${bold}USO:${reset}
  $ npx cortex-ai init [nome-da-pasta]
  $ npx cortex init [nome-da-pasta]

${bold}COMANDOS:${reset}
  ${green}init [pasta]${reset}   Inicializa a estrutura do Córtex na pasta especificada ou na pasta atual.
  ${green}--help, -h${reset}     Exibe esta mensagem de ajuda.
  ${green}--version, -v${reset}  Exibe a versão atual do CLI.

${bold}EXEMPLOS:${reset}
  $ npx cortex-ai init
  $ npx cortex-ai init MinhaEmpresa
  $ npx cortex init "Meu Negocio"
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

  // Lista de itens a serem copiados do template para a pasta de destino
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
    '.cursorrules'
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

async function main() {
  if (!command || command === 'init') {
    await runInit();
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
