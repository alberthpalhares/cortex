// Utilitário compartilhado pelos testes: cria diretórios temporários isolados
// para cada teste, para nunca tocar no repositório real durante a execução.

const fs = require('fs');
const os = require('os');
const path = require('path');

function mkTmpDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix || 'cortex-test-'));
}

module.exports = { mkTmpDir };
