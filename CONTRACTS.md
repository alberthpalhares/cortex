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
  "updatedAt": "2026-08-02T00:00:00.000Z",
  "checkedAt": "2026-08-02T00:00:00.000Z"
}
```

- Escrito por `cortex init` e `cortex update`
- `version` é a versão do framework instalada no projeto
- `checkedAt` (opcional, v1.4.1+) é a última vez em que o usuário conferiu se havia versão nova; o radar usa esse campo, e cai para `updatedAt` quando ele não existe
- A existência deste arquivo significa **instalado**, não **montado**. Montado é quando existe `Frameworks/CEREBRO.md` (ou, em instalações antigas, `Memoria/META.md`): só então o `init` se recusa a rodar de novo (v1.4.2+)

### 3.2 `.cortex/targets.json`

```json
{
  "targets": ["AGENTS.md"],
  "updatedAt": "2026-08-02T00:00:00.000Z"
}
```

- `targets` é um subconjunto de `["AGENTS.md", "CLAUDE.md", "GEMINI.md", ".cursorrules"]`
- Escrito pelo onboarding (Step 7), por `cortex sync` e por `cortex update`
- Se o arquivo não existe, o CLI detecta quais targets já existem na raiz ou usa `["AGENTS.md", "CLAUDE.md"]` como padrão
- Alvos aposentados (ver emenda da v1.3.0 abaixo) presentes em um `targets.json` antigo são ignorados na leitura

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
- **Exceção — `CLAUDE.md`:** quando `AGENTS.md` também está entre os targets, o `CLAUDE.md` contém o header + a linha `@AGENTS.md`. Isso é um *import nativo* do Claude Code (resolvido pela ferramenta ao carregar a memória do projeto), não um ponteiro que dependa de a IA decidir abrir outro arquivo. Sem `AGENTS.md` entre os targets, o `CLAUDE.md` recebe o conteúdo completo.
- Quebras de linha (CRLF/LF) são preservadas do `CEREBRO.md` original
- Os targets válidos são: `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.cursorrules`
- **Garantia de breaking change:** alterar o formato do cabeçalho de forma que o teste `sync compila o cérebro COMPLETO` quebre, ou mudar a lista de targets (`KNOWN_TARGETS`)

> **Emenda — v1.3.0 (2026-10-04).** `CODEX.md` foi retirado da lista de targets. Pela regra acima isso seria uma quebra de contrato; registramos como emenda, e não como major version, porque **nenhuma instalação perde funcionalidade**: o Codex lê `AGENTS.md` nativamente, então o `CODEX.md` era uma cópia redundante. Córtex existentes continuam funcionando sem ação: `cortex sync`/`update` avisam sobre um `CODEX.md` antigo e só o removem com confirmação explícita. Na mesma versão, o padrão de targets passou de `["AGENTS.md"]` para `["AGENTS.md", "CLAUDE.md"]` (o Claude Code não lê `AGENTS.md` sozinho) — instalações que já têm `targets.json` não são alteradas.

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

**Garantia de breaking change:** alterar a lista de prefixos obrigatórios (`MANDATORY_PILLAR_PREFIXES` em `bin/cli.js`).

---

## 6. Nomenclatura de Skills

**Propósito:** Convenção que permite ao `cortex update` distinguir skills do framework de skills do usuário.

- Skills do framework vivem em `.agents/skills/<nome>/SKILL.md`
- Skills customizadas do usuário também vivem em `.agents/skills/<nome>/SKILL.md`
- A distinção é feita exclusivamente pelo manifesto: se o caminho está em `.agents/manifest.json` → framework; senão → usuário
- **Garantia de breaking change:** mudar o diretório de skills, ou o mecanismo de distinção framework vs usuário

---

## 7. Formato das Linhas da Memória e Protocolos

**Propósito:** As skills gravam linhas de texto em `Memoria/`, e essas linhas são dados do usuário. Uma versão nova nunca pode deixar de entender o que uma versão antiga gravou.

- **Formatos só crescem.** Um formato novo acrescenta informação opcional no fim da linha (ex.: `*(desde AAAA-MM-DD)*` nas pendências sem prazo, a partir da v1.5.0). Linhas no formato antigo continuam válidas e nunca são reescritas só para ganhar o campo novo.
- **Nenhuma migração de dados automática.** O CLI não reescreve arquivos de `Memoria/` nem de `Pilares/`; uma skill só altera uma linha existente quando o usuário pede aquela alteração.
- **Marcadores congelados:** `[DEADLINE AAAA-MM-DD]`, `[AGUARDANDO]` (opcionalmente `[AGUARDANDO: Nome]`), `[SEM PRAZO]`, `[REVOGADA em AAAA-MM-DD: …]`, o carimbo `**[AAAA-MM-DD]**` no início das linhas e a etiqueta de trimestre `[AAAA-T#]`.
- **Protocolos na camada do framework (v1.5.0+).** `PROTOCOLO_AUTONOMIA.md` e `PROTOCOLO_MEMORIA.md` vivem em `.agents/cortex/` e são atualizados pelo `cortex update`. Cópias antigas em `Frameworks/` (instalações até a v1.4.2) não são apagadas nem lidas pelo cérebro novo; um cérebro ainda sem as camadas `CORTEX:BUSINESS`/`CORTEX:FRAMEWORK` continua apontando para elas.
- **Garantia de breaking change:** remover ou mudar o significado de um marcador acima, ou passar a exigir um campo que linhas antigas não têm.

---

## 8. Versionamento e Migração

- **SemVer estrito.** Breaking changes nos contratos acima → major bump (v2.0.0)
- **Migração documentada.** Toda major version deve incluir no CHANGELOG um plano de migração para Córtex da versão anterior (ex: "Córtex v0.11.0 → v1.0.0: rode `cortex update`, o cérebro será migrado automaticamente se tiver as camadas CORTEX:BUSINESS/FRAMEWORK")
- **Compatibilidade forward.** `cortex update` de uma versão antiga para uma nova deve preservar `Pilares/`, `Memoria/`, `Ativos/` e a região `CORTEX:BUSINESS` do cérebro — invariante coberta por teste
