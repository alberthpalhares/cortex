---
name: ideias
description: "Captura e analisa ideias de melhoria para o projeto Córtex. Registra no IDEIAS.md (não versionado) com análise de viabilidade estruturada. Trigger with: 'ideia', 'nova ideia', 'tenho uma ideia', 'analisar viabilidade', 'analisar ideia'."
---

# Skill: Ideias — Captura e Análise de Viabilidade

This skill captures improvement ideas for the Córtex project itself, registers them in a structured file outside version control (`IDEIAS.md`), and analyzes their viability against the project's design principles.

## Step by Step

### Mode A — Capturing a new idea

1. **Listen and extract.** When the user shares an idea (triggered by phrases like "tenho uma ideia", "e se a gente...", "podia ter um jeito de..."), extract the core: what's the observed problem, and what's the proposed solution.

2. **Probe lightly.** If something isn't clear, ask 1-2 clarifying questions max:
   - What problem does this solve? (What real pain prompted the idea?)
   - What would the ideal workflow look like?

3. **Write the idea to `IDEIAS.md`** using the template format:
   ```markdown
   ## N. Título da Ideia

   **Problema:** [1-2 frases]

   **Proposta:** [Solução concreta, com exemplos]

   **Arquivos afetados:**
   - `caminho/arquivo` — o que muda

   **Horizonte:** [Curto | Médio | Longo prazo (estimativa em semanas)]

   **Análise de Viabilidade:**
   - Cobertura: [🔴 Nova | 🟡 Existe parcialmente | 🟢 Já coberta]
   - Diretrizes:
     - ✅/⚠️ [avaliação contra cada princípio relevante do projeto]
   - Impacto: [🔴 Alto / 🟡 Médio / 🟢 Baixo]
   - Esforço: [🔴 Alto / 🟡 Médio / 🟢 Baixo]
   - Dependências: [ou "Nenhuma"]
   - Riscos: [principal risco e mitigação]
   ```

   Number the idea sequentially (incrementing from the last one). Append it before the `## Priorização` section.

4. **Confirm.** Show the user the recorded idea and ask: *"Registrei a ideia. Quer que eu analise a viabilidade agora ou prefere deixar para depois?"*

### Mode B — Analyzing viability

When the user asks to analyze an idea ("analisa a ideia X", "viabilidade da ideia 3"), or when you're generating the viability section for a new idea:

1. **Read the current project context:**
   - `CONTRACTS.md` — frozen structural contracts for v1.0.0 (principles, schemas, invariants)
   - `CONTRIBUTING.md` — contribution guidelines, trigger convention, and token economy rules
   - `CHANGELOG.md` — recent changes (to avoid reinventing what already exists)

2. **Evaluate the idea against each of these dimensions:**

   | Dimensão | Pergunta-chave |
   |----------|---------------|
   | **Cobertura** | Isso já existe, mesmo que parcialmente? Há algo similar implementado? |
   | **Simplicidade** | A solução é a mais simples que resolve o problema? Dá para simplificar ainda mais? |
   | **YAGNI** | Essa ideia resolve uma dor real e frequente, ou é antecipação de algo que talvez nunca aconteça? |
   | **Tokens** | Qual o custo/benefício em tokens? A economia de contexto justifica a complexidade adicionada? |
   | **Dados do usuário** | A mudança respeita a invariante de nunca tocar em `Pilares/`, `Memoria/`, `Ativos/` sem consentimento? |
   | **Local-first** | Mantém o Córtex independente de internet/servidores externos? |

3. **Assign scores:**
   - **Impacto:** Alto (muda como as pessoas usam o Córtex) | Médio (melhora perceptível) | Baixo (nice-to-have)
   - **Esforço:** Alto (arquitetural, vários arquivos) | Médio (alguns arquivos, complexidade moderada) | Baixo (poucos arquivos, bem localizado)

4. **Update `IDEIAS.md`** with the completed viability analysis.

### Mode C — Listing and prioritizing

When the user says "lista de ideias", "priorização", or "o que temos no backlog":

1. Read `IDEIAS.md`.
2. If the prioritization table is empty or outdated, rebuild it from the analyzed ideas.
3. Present the ideas ordered by impact/effort ratio, with a suggested next action:
   > *"Temos X ideias registradas. As de maior impacto com menor esforço são: [top 2-3]. Quer começar por alguma delas?"*

## Project Design Principles (for viability analysis)

Always reference these when evaluating ideas (from `AUDITORIA_EVOLUCAO_v1.md`, section 6):

1. **Local-first e privado.** Sem telemetria. Testes rodam sobre fixtures, nunca sobre dados reais.
2. **Markdown é a fonte humana; `.cortex/` é a fonte-máquina.** Estruturação leve (frontmatter, manifesto/metadados JSON) é permitida; banco de dados, não.
3. **Economia de contexto é requisito.** Internals em inglês, `cortex doctor` para o mecânico.
4. **Dados do usuário são intocáveis** — provado por teste, não só por convenção.
5. **A experiência é em português.** Instruções internas em inglês, conversa sempre em pt-BR.
6. **Portabilidade por construção.** Arquivos de instrução são artefatos gerados de uma fonte única.

## Output Format

For new ideas:
```
📝 **Ideia #N registrada:** [título]

Problema: [1 frase]
Solução proposta: [1 frase]
Horizonte estimado: [curto/médio/longo]

Análise de viabilidade: [pendente — diga "analisar ideia N" | concluída abaixo]
```

For viability analysis:
```
🔍 **Viabilidade — Ideia #N: [título]**

Cobertura: [status]
✅ Simplicidade: [avaliação]
⚠️ YAGNI: [avaliação]
💰 Tokens: [custo/benefício]
🛡️ Dados do usuário: [seguro / atenção]
🏠 Local-first: [mantém / precisa de internet]

Impacto: [🔴/🟡/🟢] | Esforço: [🔴/🟡/🟢]
Dependências: [lista ou "Nenhuma"]
Risco: [principal risco + mitigação]

🎯 Veredito: [✅ Vale a pena | ⚠️ Vale com ajustes | ❌ Não vale — motivo]
```

## Rules

1. **IDEIAS.md is NEVER committed.** It's in `.gitignore` — it's the user's personal thinking space about the project's future, not part of the public framework.
2. **Don't over-analyze on capture.** Mode A is fast (just register). Mode B is deep (analyze viability). The user decides when to switch from A to B.
3. **Don't implement anything from IDEIAS.md without explicit user request.** This file is for thinking and prioritizing, not an auto-execute backlog.
4. **Always read the project's current state before analyzing viability.** The codebase evolves; a "nova" feature from last week might already exist today.
5. **Respect the template format.** Consistency makes the prioritization table buildable.
6. **The user's ideia might be for their Córtex business, NOT for the Córtex framework itself.** If the idea is about the user's business (e.g. "devia ter um pilar de logística"), redirect to the appropriate Córtex skill (`registrar`, `cortex-revisao`, onboarding continuation). This skill is for ideas about the Córtex codebase/framework.
