#!/usr/bin/env node

// Usado pelo workflow de publicação (.github/workflows/release.yml).
// Confere que a tag é a versão do package.json e imprime o trecho do
// CHANGELOG.md dessa versão — o texto que vira a descrição da Release.
//
// Uso:
//   node scripts/release-notes.js v1.6.0 > notas.md
//
// Sai com código 1, sem imprimir nota nenhuma, se a tag não bater com o
// package.json ou se o CHANGELOG não tiver a seção da versão.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// Devolve o texto entre "## [versão]" e o próximo "## [", ou null.
function extractNotes(changelog, version) {
  const lines = changelog.replace(/\r\n/g, '\n').split('\n');
  const start = lines.findIndex((line) => line.startsWith(`## [${version}]`));
  if (start === -1) return null;
  let end = lines.findIndex((line, i) => i > start && line.startsWith('## ['));
  if (end === -1) end = lines.length;
  return lines.slice(start + 1, end).join('\n').trim();
}

if (require.main === module) {
  const tag = process.argv[2] || '';
  const version = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version;
  if (tag !== `v${version}`) {
    console.error(`✗ A tag "${tag}" não é a versão do package.json (esperado: v${version}). Nada foi publicado.`);
    process.exit(1);
  }
  const notes = extractNotes(fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8'), version);
  if (!notes) {
    console.error(`✗ O CHANGELOG.md não tem a seção "## [${version}]" (ou ela está vazia). Nada foi publicado.`);
    process.exit(1);
  }
  process.stdout.write(notes + '\n');
}

module.exports = { extractNotes };
