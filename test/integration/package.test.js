const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { mkTmpDir } = require('../support/tmp');

// Testa o pacote como o usuário recebe pelo npx: `npm pack` → instala o .tgz →
// roda o CLI instalado. Os outros testes rodam bin/cli.js direto do repositório
// e por isso não enxergam o que o empacotamento muda. Foi assim que a 1.4.0
// chegou ao npm com o init quebrado: o npm não publica arquivos ".gitignore",
// e o init lia esse arquivo de dentro do pacote.

const REPO_ROOT = path.join(__dirname, '..', '..');
const PKG = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'package.json'), 'utf8'));
const quote = (p) => `"${p}"`;

function childEnv() {
  const env = { ...process.env, CORTEX_NO_UPDATE_CHECK: '1', npm_config_update_notifier: 'false' };
  // Se a suíte rodar dentro de "npm publish --dry-run", o pack daqui não pode herdar o dry-run.
  delete env.npm_config_dry_run;
  return env;
}

function npm(argsLine, cwd) {
  return spawnSync(`npm ${argsLine}`, { cwd, env: childEnv(), encoding: 'utf8', shell: true });
}

// Empacota e instala uma única vez; os testes abaixo usam o mesmo pacote instalado.
const work = mkTmpDir('cortex-pack-');
const packed = npm(`pack --json --pack-destination ${quote(work)}`, REPO_ROOT);
const tarball = fs.readdirSync(work).find((f) => f.endsWith('.tgz'));

let packedFiles = [];
try {
  const json = packed.stdout.slice(packed.stdout.indexOf('['));
  packedFiles = JSON.parse(json)[0].files.map((f) => f.path.replace(/\\/g, '/'));
} catch (e) {}

const app = path.join(work, 'app');
fs.mkdirSync(app);
fs.writeFileSync(path.join(app, 'package.json'), JSON.stringify({ name: 'cortex-pack-test', private: true }) + '\n');
const installed = tarball
  ? npm(`install ${quote(path.join(work, tarball))} --no-audit --no-fund --no-package-lock --loglevel=error`, app)
  : null;

const INSTALLED_ROOT = path.join(app, 'node_modules', '@aksp', 'cortex');
const INSTALLED_CLI = path.join(INSTALLED_ROOT, 'bin', 'cli.js');
const run = (args, cwd) => spawnSync(process.execPath, [INSTALLED_CLI, ...args], { cwd, env: childEnv(), encoding: 'utf8' });

test('npm pack e npm install do pacote funcionam', () => {
  assert.equal(packed.status, 0, packed.stderr);
  assert.ok(tarball, 'npm pack deveria gerar um .tgz');
  assert.equal(installed.status, 0, installed.stderr + installed.stdout);
  assert.ok(fs.existsSync(INSTALLED_CLI), 'o CLI deveria estar instalado');
  assert.equal(JSON.parse(fs.readFileSync(path.join(INSTALLED_ROOT, 'package.json'), 'utf8')).version, PKG.version);
});

test('o pacote leva o framework e nenhum dado de negócio', () => {
  assert.ok(packedFiles.length > 0, 'não consegui ler a lista de arquivos do npm pack --json');
  for (const needed of [
    'bin/cli.js', 'AGENTS.md', 'CLAUDE.md', '.agents/manifest.json',
    '.agents/cortex/brain.framework.md', '.agents/cortex/novidades.json',
    // O cérebro manda ler estes dois: sem eles no pacote, o Guardião de Margem não funciona.
    '.agents/cortex/PROTOCOLO_AUTONOMIA.md', '.agents/cortex/PROTOCOLO_MEMORIA.md',
  ]) {
    assert.ok(packedFiles.includes(needed), `faltou no pacote: ${needed}`);
  }
  // Um onboarding de teste feito na raiz do repositório não pode ir para o npm.
  const userDirs = ['Pilares/', 'Memoria/', 'Ativos/', 'Frameworks/'];
  const leaked = packedFiles.filter((f) => userDirs.some((d) => f.startsWith(d)) && path.posix.basename(f) !== '.gitkeep');
  assert.deepEqual(leaked, [], 'dados de negócio dentro do pacote');
  const internal = packedFiles.filter((f) => /^(AUDITORIA|IDEIAS|test\/|examples\/|contrib\/|\.claude\/|\.cortex\/)/.test(f));
  assert.deepEqual(internal, [], 'arquivos internos dentro do pacote');
  // O AGENTS.md do pacote tem de ser o texto de inicialização. Nenhum arquivo de
  // raiz pode ser um cérebro compilado: ele levaria o nome e as regras do negócio
  // de quem fez um teste de montagem na raiz do repositório.
  const bootstrap = fs.readFileSync(path.join(INSTALLED_ROOT, 'AGENTS.md'), 'utf8');
  assert.ok(bootstrap.includes('cortex-onboarding'), 'AGENTS.md do pacote deveria ser o texto de inicialização');
  for (const f of ['AGENTS.md', 'CLAUDE.md', 'GEMINI.md', '.cursorrules']) {
    const p = path.join(INSTALLED_ROOT, f);
    if (!fs.existsSync(p)) continue;
    assert.ok(!fs.readFileSync(p, 'utf8').includes('ARQUIVO GERADO PELO CÓRTEX'), `${f} do pacote não pode ser um cérebro compilado`);
  }
});

test('o pacote sai com fim de linha LF em todos os arquivos', () => {
  // O update compara os arquivos do framework byte a byte: publicar de uma cópia
  // de trabalho em CRLF faria todo usuário ver tudo como "atualizado".
  const withCrlf = packedFiles.filter((f) => {
    const p = path.join(INSTALLED_ROOT, f);
    return fs.existsSync(p) && fs.readFileSync(p).includes('\r\n');
  });
  assert.deepEqual(withCrlf, [],
    'arquivos em CRLF no pacote. O .gitattributes só vale para checkouts novos: com tudo commitado, ' +
    'rode "git rm --cached -r -q . && git reset --hard" (ou clone de novo) antes de publicar.');
});

test('instalação nova pelo pacote: init, init --targets, doctor, sync e update', () => {
  const dir = mkTmpDir('cortex-pack-proj-');

  let r = run(['init', '.', '--force'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  for (const entry of ['.agents', 'Frameworks', 'Memoria', 'Pilares', 'Ativos', 'AGENTS.md', 'CLAUDE.md', '.gitignore', path.join('.cortex', 'version.json')]) {
    assert.ok(fs.existsSync(path.join(dir, entry)), `esperava "${entry}" depois do init pelo pacote`);
  }
  const gitignore = fs.readFileSync(path.join(dir, '.gitignore'), 'utf8');
  assert.ok(gitignore.includes('/Pilares/*') && gitignore.includes('/Memoria/*'), '.gitignore deve proteger os dados do negócio');
  assert.ok(!gitignore.includes('AUDITORIA'), '.gitignore do usuário não leva regras internas do repositório');

  r = run(['init', '.', '--targets=GEMINI.md'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.ok(fs.existsSync(path.join(dir, 'GEMINI.md')), 'a dica do próprio init precisa funcionar');

  r = run(['doctor', '.', '--offline'], dir);
  assert.notEqual(r.status, 0);
  assert.ok(r.stdout.includes('ainda não foi montado'), r.stdout);

  // Monta um cérebro mínimo a partir do molde que veio no pacote.
  fs.copyFileSync(
    path.join(dir, '.agents', 'skills', 'cortex-onboarding', 'resources', 'CORTEX_TEMPLATE.md'),
    path.join(dir, 'Frameworks', 'CEREBRO.md')
  );
  r = run(['sync', '.', '--force'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.ok(fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf8').includes('ARQUIVO GERADO PELO CÓRTEX'));

  r = run(['update', '.', '--force'], dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
});
