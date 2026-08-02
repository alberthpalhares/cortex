# Contratos do Córtex — v1.0.0

> **Congelados em 2026-08-02.**
> Estes são os contratos estruturais da v1.0.0. Mudanças que quebrem qualquer um destes exigem uma major version bump (v2.0.0) e plano de migração documentado para Córtex existentes.

---

## 1. Manifesto de Framework (`.agents/manifest.json`)

**Propósito:** Lista versionada e exaustiva dos arquivos que pertencem à camada de framework. Usado pelo `cortex update` para diferenciar arquivos do framework de customizações do usuário.

**Schema:**

```json
{
  "version": "1.0.0",
  "files": [
    ".agents/cortex/brain.framework.md",
    ".agents/skills/ajuda/SKILL.md",
    "..."
  ]
}
```

**Regras:**
- `version` sempre casa com `package.json` → `version`
- `files` é um array de strings ordenado alfabeticamente, com caminhos POSIX (`/`) relativos à raiz do repositório
- Gerado por `scripts/build-manifest.js` (varredura determinística de `.agents/`)
- Commitado no repositório; o CI (`npm run verify:manifest`) falha se estiver desatualizado
- **Garantia de breaking change:** renomear ou remover `manifest.json`, ou mudar seu caminho (`MANIFEST_REL_PATH` em `bin/cli.js`)

---

## 2. Camadas do Cérebro (`Frameworks/CEREBRO.md`)

**Propósito:** Separar o que é do framework (regenerável) do que é do negócio (intocável). É isso que permite `cortex update` evoluir as regras de operação sem nunca alterar os dados do usuário.

**Marcadores (âncoras):**

```
<!-- CORTEX:BUSINESS:START -->
... identidade do negócio, datas de revisão, lista de pilares ...
<!-- CORTEX:BUSINESS:END -->

<!-- CORTEX:FRAMEWORK:START -->
... regras de operação, disparo de skills, protocolos ...
<!-- CORTEX:FRAMEWORK:END -->
```

**Regras:**
- Ambos os pares de marcadores DEVEM existir no `CEREBRO.md` gerado pelo onboarding
- A região `CORTEX:BUSINESS` é escrita uma vez (onboarding) e **nunca** tocada por `cortex update`
- A região `CORTEX:FRAMEWORK` é regenerada a cada `cortex update` a partir de `.agents/cortex/brain.framework.md`
- O conteúdo entre `BUSINESS:START` e `BUSINESS:END` inclui obrigatoriamente: nome do negócio (`**Negócio:**`), setor, tipo, data de onboarding, data de próxima revisão, e a lista de pilares (`{{LISTA_PILARES}}`)
- **Garantia de breaking change:** alterar os marcadores (`BUSINESS_START`, `BUSINESS_END`, `FRAMEWORK_START`, `FRAMEWORK_END` em `bin/cli.js`), ou mudar o caminho do template fonte (`BRAIN_FRAMEWORK_REL_PATH`)

---

## 3. Schema do Diretório `.cortex/`

**Propósito:** Fonte-máquina de metadados estruturados. Complementa o `META.md` (fonte humana, Markdown) com dados que o CLI consulta deterministicamente, sem regex frágil.

### 3.1 `.cortex/version.json`

```json
{
  "version": "1.0.0",
  "updatedAt": "2026-08-02T00:00:00.000Z"
}
```

- Escrito por `cortex init` e `cortex update`
- `version` é a versão do framework instalada no projeto

### 3.2 `.cortex/targets.json`

```json
{
  "targets": ["AGENTS.md"],
  "updatedAt": "2026-08-02T00:00:00.000Z"
}
```

- `targets` é um subconjunto de `["AGENTS.md", "CLAUDE.md", "GEMINI.md", "CODEX.md", ".cursorrules"]`
- Escrito pelo onboarding (Step 7) e por `cortex sync --targets=...`
- Se o arquivo não existe, o CLI detecta quais targets já existem na raiz ou usa `["AGENTS.md"]` como padrão

### 3.3 `.cortex/meta.json`

```json
{
  "businessName": "Nome do Negócio",
  "type": "Eu-presa",
  "onboardedAt": "2026-08-02",
  "nextReview": "2027-02-02",
  "updatedAt": "2026-08-02T00:00:00.000Z"
}
```

- `type` é um dos valores: `"Eu-presa"`, `"Pequena empresa"`, `"Entidade sem fins lucrativos"`, `"Negócio recorrente"`
- Escrito pelo onboarding (Step 7); campos adicionais podem ser mergeados via `writeCortexMeta`
- Lido por `readCortexMeta` → `readBusinessName` (fallback: regex no `META.md`)

**Garantia de breaking change:** renomear o diretório `.cortex/` (`CORTEX_META_DIR`), ou mudar o nome/estrutura de qualquer um dos 3 arquivos acima.

---

## 4. Formato dos Artefatos Compilados

**Propósito:** Arquivos de instrução na raiz (`AGENTS.md`, `CLAUDE.md`, etc.) que cada ferramenta de IA lê. São artefatos gerados, não editados à mão.

**Formato:**

```
<!-- ============================================================
     ARQUIVO GERADO PELO CÓRTEX — NÃO EDITE À MÃO.

     Fonte:   Frameworks/CEREBRO.md
     Gerado:  cortex sync (v1.0.0) em 2026-08-02

     Qualquer alteração feita aqui será perdida no próximo
     "npx @aksp/cortex sync". Edite a fonte acima.
     ============================================================ -->

[conteúdo completo de Frameworks/CEREBRO.md, com quebras de linha preservadas]
```

**Regras:**
- O cabeçalho é gerado por `buildGeneratedHeader(version)` em `bin/cli.js`
- O conteúdo é a concatenação direta do header + `CEREBRO.md` completo (não um ponteiro, não um resumo)
- Quebras de linha (CRLF/LF) são preservadas do `CEREBRO.md` original
- Os targets válidos são: `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `CODEX.md`, `.cursorrules`
- **Garantia de breaking change:** alterar o formato do cabeçalho de forma que o teste `sync compila o cérebro COMPLETO` quebre, ou mudar a lista de targets (`KNOWN_TARGETS`)

---

## 5. Pilares Obrigatórios e Opcionais

**Propósito:** Definir quais pilares o `cortex doctor` e o onboarding tratam como estrutura mínima.

**Obrigatórios (4):**
- `Pilares/01_Estrategia.md`
- `Pilares/02_Cultura.md`
- `Pilares/05_Comunicacao.md`
- `Pilares/06_Operacao.md`

**Opcionais (5+):**
- `Pilares/03_Financeiro.md` — incluído apenas se o usuário optar pelo Bloco 3
- `Pilares/04_Comercial.md` — incluído apenas se o usuário optar pelo Bloco 3
- `Pilares/07_Juridico.md` — se aplicável
- `Pilares/08_Inventario.md` — se aplicável
- `Pilares/09_Identidade_Visual.md` — se aplicável
- `Pilares/10_*.md` — pilares customizados do Bloco 9

**Garantia de breaking change:** alterar a lista de prefixos obrigatórios (`mandatoryPrefixes` em `bin/cli.js`).

---

## 6. Nomenclatura de Skills

**Propósito:** Convenção que permite ao `cortex update` distinguir skills do framework de skills do usuário.

- Skills do framework vivem em `.agents/skills/<nome>/SKILL.md`
- Skills customizadas do usuário também vivem em `.agents/skills/<nome>/SKILL.md`
- A distinção é feita exclusivamente pelo manifesto: se o caminho está em `.agents/manifest.json` → framework; senão → usuário
- **Garantia de breaking change:** mudar o diretório de skills, ou o mecanismo de distinção framework vs usuário

---

## 7. Versionamento e Migração

- **SemVer estrito.** Breaking changes nos contratos acima → major bump (v2.0.0)
- **Migração documentada.** Toda major version deve incluir no CHANGELOG um plano de migração para Córtex da versão anterior (ex: "Córtex v0.11.0 → v1.0.0: rode `cortex update`, o cérebro será migrado automaticamente se tiver as camadas CORTEX:BUSINESS/FRAMEWORK")
- **Compatibilidade forward.** `cortex update` de uma versão antiga para uma nova deve preservar `Pilares/`, `Memoria/`, `Ativos/` e a região `CORTEX:BUSINESS` do cérebro — invariante coberta por teste
