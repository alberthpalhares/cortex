---
name: pesquisa-mercado
description: "Surveys competitors and updates the Strategy pillar's Competitive Landscape section. Trigger with: 'pesquisar concorrência', 'mapear concorrentes', 'quem são meus concorrentes'."
---

# Skill: Pesquisa de Mercado (Concorrência)

Maps the business's competition and proposes an update to the "Panorama Competitivo" section in `Pilares/01_Estrategia.md` — always with confirmation before writing.

## Step by Step

1. **Read `Pilares/01_Estrategia.md`** to understand the positioning and ICP already registered — that's what determines who actually counts as a competitor.

2. **Ask the user** which competitors they already have in mind (2 to 4 names). If they don't know any, ask about sector and region so you can suggest candidates.

3. **Check whether you have access to a web search/browsing tool** in this environment.
   - **If you do:** research each competitor — public positioning, approximate price range (if disclosed), perceived differentiator, apparent weak points. Base this only on real public information; **never make up data you couldn't find**.
   - **If you don't:** ask the user to paste links, screenshots, or whatever they already know about each competitor, and work only with that.

4. **Build a short comparison** (a table or list) crossing the user's business against each researched competitor, focused on what's actionable: where the user's business differentiates itself, and where it's exposed.

5. **Show the comparison and the proposed text** for the "Panorama Competitivo" section and ask for confirmation before writing to `Pilares/01_Estrategia.md`.

6. **If something relevant comes up** (e.g. a competitor launched a product that threatens the positioning), suggest registering it as a lesson or pending item via the `registrar` skill.

## Output Format

```
🔍 **PESQUISA DE MERCADO — [Nome do Negócio]**

| Concorrente | Posicionamento | Preço aprox. | Diferencial | Ponto fraco |
|---|---|---|---|---|
| [Nome] | ... | ... | ... | ... |

📌 Onde [Nome do Negócio] se diferencia: [...]
⚠️ Onde [Nome do Negócio] está exposto: [...]

Posso atualizar "Panorama Competitivo" em Pilares/01_Estrategia.md com esse resumo?
```

## Rules

1. **Never make up data about a competitor.** If you couldn't find it or don't have reliable information, say "não encontrado" instead of assuming.
2. **Only use public sources.** Don't try to access private, login-protected, or paid third-party data.
3. **Always confirm before writing** to the Strategy pillar — never write directly.
4. **Relative paths.** All paths are relative to the workspace root.
5. **Be objective.** The comparison should fit in a few lines per competitor — no long reports.
