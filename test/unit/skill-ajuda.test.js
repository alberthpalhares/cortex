const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

// Verifica que toda skill em .agents/skills/ tem representação na skill ajuda.
// Se este teste falhar, vá até .agents/skills/ajuda/SKILL.md e adicione
// o comando correspondente à nova skill.

const REPO_ROOT = path.join(__dirname, '..', '..');
const SKILLS_DIR = path.join(REPO_ROOT, '.agents', 'skills');
const AJUDA_PATH = path.join(SKILLS_DIR, 'ajuda', 'SKILL.md');

// Mapeamento manual: para skills cujo nome não aparece literalmente no texto
// da ajuda (ex: o nome "registrar" não está escrito, mas "registra que..." está).
// A chave é o name do frontmatter, o valor é um array de strings que DEVEM
// aparecer no ajuda SKILL.md.
const NAME_TO_AJUDA_MARKER = {
  'registrar': ['registra que'],
  'analisador-dre': ['analisar DRE'],
  'consolidar': ['consolidar memória'],
  'cortex-revisao': ['revisar córtex'],
  'proposta-comercial': ['gerar proposta'],
  'pesquisa-mercado': ['pesquisar concorrência'],
  'saude': ['saúde do córtex'],
  'cortex-onboarding': ['montar meu córtex'],
  'ideias': ['nova ideia'],
};

function extractSkillName(skillDir) {
  const skillPath = path.join(SKILLS_DIR, skillDir, 'SKILL.md');
  if (!fs.existsSync(skillPath)) return null;
  const content = fs.readFileSync(skillPath, 'utf8');
  const match = content.match(/^name:\s*(.+)/m);
  return match ? match[1].trim() : null;
}

test('toda skill em .agents/skills/ aparece na ajuda', () => {
  const ajudaContent = fs.readFileSync(AJUDA_PATH, 'utf8');
  const skillDirs = fs.readdirSync(SKILLS_DIR).filter((d) => {
    const full = path.join(SKILLS_DIR, d);
    return fs.statSync(full).isDirectory();
  });

  const missing = [];

  for (const dir of skillDirs) {
    // A própria ajuda não precisa listar a si mesma
    if (dir === 'ajuda') continue;

    const name = extractSkillName(dir);
    if (!name) {
      missing.push(`${dir}: não foi possível extrair o nome do frontmatter`);
      continue;
    }

    // Verifica se o nome aparece literalmente
    if (ajudaContent.includes(name)) continue;

    // Verifica se algum marker conhecido aparece
    const markers = NAME_TO_AJUDA_MARKER[name];
    if (markers && markers.some((m) => ajudaContent.includes(m))) continue;

    // Fallback: o nome em kebab-case pode ser suficiente
    if (ajudaContent.includes(dir)) continue;

    missing.push(`${dir} (name: "${name}") — não encontrado na ajuda`);
  }

  assert.deepEqual(missing, [],
    'Skills sem representação na ajuda (.agents/skills/ajuda/SKILL.md). ' +
    'Adicione uma linha no formato de saída da skill ajuda para cada skill faltante.'
  );
});
