#!/usr/bin/env node

// Gera (ou verifica) .agents/manifest.json — a lista de arquivos que pertencem
// à camada de framework nesta versão do Córtex. `cortex update` usa esse
// manifesto para distinguir arquivos que o framework descontinuou de
// arquivos que o usuário criou por conta própria dentro de .agents/.
//
// Uso:
//   node scripts/build-manifest.js          → (re)gera .agents/manifest.json
//   node scripts/build-manifest.js --check  → falha (exit 1) se o manifesto
//                                              commitado estiver desatualizado

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const AGENTS_DIR = path.join(ROOT, '.agents');
const MANIFEST_PATH = path.join(AGENTS_DIR, 'manifest.json');
const PKG_PATH = path.join(ROOT, 'package.json');

function toPosix(p) {
  return p.split(path.sep).join('/');
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
      results.push(toPosix(path.relative(base, fullPath)));
    }
  }
  return results;
}

function buildManifest() {
  const pkg = JSON.parse(fs.readFileSync(PKG_PATH, 'utf8'));
  const files = listFilesRecursive(AGENTS_DIR)
    .filter((f) => f !== 'manifest.json')
    .map((f) => `.agents/${f}`)
    .sort();
  return { version: pkg.version, files };
}

function main() {
  const manifest = buildManifest();
  const content = JSON.stringify(manifest, null, 2) + '\n';
  const isCheck = process.argv.includes('--check');

  if (isCheck) {
    // Compara o conteúdo interpretado, não o texto cru: o fim de linha do arquivo
    // muda conforme o sistema e a configuração do Git de quem fez o checkout.
    let current = null;
    try {
      current = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    } catch (e) {}
    const upToDate =
      current &&
      current.version === manifest.version &&
      Array.isArray(current.files) &&
      JSON.stringify(current.files) === JSON.stringify(manifest.files);
    if (!upToDate) {
      console.error('❌ .agents/manifest.json está desatualizado em relação a .agents/.');
      console.error('   Rode: npm run build:manifest');
      process.exit(1);
    }
    console.log('✓ .agents/manifest.json está em dia.');
    return;
  }

  fs.writeFileSync(MANIFEST_PATH, content);
  console.log(`✓ Manifesto gerado: ${path.relative(ROOT, MANIFEST_PATH)} (${manifest.files.length} arquivos)`);
}

main();
