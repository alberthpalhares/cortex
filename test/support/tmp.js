// Utilitário compartilhado pelos testes: cria diretórios temporários isolados
// para cada teste, para nunca tocar no repositório real durante a execução.

const fs = require('fs');
const os = require('os');
const path = require('path');

const created = [];

function mkTmpDir(prefix) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix || 'cortex-test-'));
  created.push(dir);
  return dir;
}

// Cada arquivo de teste roda no seu próprio processo: ao sair, ele apaga as
// pastas que criou. CORTEX_KEEP_TMP=1 deixa tudo no lugar, para investigar um
// teste que falhou.
process.on('exit', () => {
  if (process.env.CORTEX_KEEP_TMP) return;
  for (const dir of created) {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
    } catch (e) {
      // No Windows um arquivo ainda em uso impede a remoção: a pasta fica, e o
      // teste não falha por causa disso.
    }
  }
});

module.exports = { mkTmpDir };
