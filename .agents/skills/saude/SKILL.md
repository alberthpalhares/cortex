---
name: saude
description: "Runs an X-ray of the Córtex structure: missing pillars, pending REVISAR markers, an out-of-sync META.md, and a completeness index. Trigger with: 'saúde do córtex', 'diagnóstico', 'cortex doctor', 'o que falta preencher'."
---

# Skill: Saúde do Córtex

This skill doesn't judge the business's content — it audits the Córtex's **structure** and points out filling gaps, so the user knows exactly what's left to complete (common after a Quickstart-mode onboarding).

## Step by Step

1. **Check whether the Córtex exists.** If there's no `Memoria/META.md`, report that the Córtex hasn't been set up yet and offer to start onboarding. Stop here.

2. **Read `Memoria/META.md`** and extract the File Map declared there.

3. **List the real files** in `Pilares/` and `Memoria/` (names, not content).

4. **Compare the META's map against the disk's reality:**
   - Files in the map that don't exist on disk → `❌ Quebrado`
   - Files on disk that aren't in the map → `⚠️ Não indexado`
   - The 6 mandatory pillars (`01` through `06`) that don't exist → `🔴 Faltando (obrigatório)`

5. **Read each file in `Pilares/`** and count how many `<!-- REVISAR -->` markers or blank sections (a heading followed only by an HTML comment) each one has. In `Pilares/03_Financeiro.md` and `Pilares/04_Comercial.md`, also check the YAML frontmatter at the top: every field (`margem_alvo`, `margem_minima`, `preco_piso`, `desconto_max`) still set to `null` counts as a pending item — it's data the "Margin Guardian" Mode needs and doesn't have yet.

6. **Check the brain layer:**
   - `Frameworks/CEREBRO.md` exists and contains the `CORTEX:BUSINESS` and `CORTEX:FRAMEWORK` markers → **current format**. Confirm at least one compiled instruction file exists at the root (the default is `AGENTS.md`; chosen targets live in `.cortex/targets.json`).
   - `CEREBRO.md` exists but **without** the markers → intermediate format: it works, but `cortex update` can't refresh the rules on its own. Suggest `revisar córtex` to split the two layers.
   - `CEREBRO.md` doesn't exist → legacy format (content duplicated across root files). Suggest `revisar córtex` to migrate.
   - If any root file is still an old-style **pointer** (contains *"leia `Frameworks/CEREBRO.md`"* instead of the full content), flag it: running `npx @aksp/cortex sync` recompiles it.

7. **Calculate a simple completeness index:** the share of mandatory pillars with no remaining `REVISAR` markers. Don't invent decimal precision — round to the nearest ten (e.g. "~70% preenchido").

8. **Generate the report** in the format below.

## Output Format

```
🩺 **SAÚDE DO CÓRTEX — [Nome do Negócio]**

📊 Completude estimada: ~[X]% dos pilares obrigatórios sem pendências

🔴 Pilares obrigatórios faltando:
   • [lista, ou "Nenhum ✅"]

📝 Pilares com marcadores REVISAR pendentes:
   • [Nome do Pilar] — [N] pendência(s)
   • [lista, ou "Nenhum ✅"]

⚠️ Inconsistências no META.md:
   • [arquivos quebrados ou não indexados, ou "Nenhuma ✅"]

🧠 System prompt: [Fonte única (Frameworks/CEREBRO.md) ✅ | Formato antigo — considere migrar]

💡 Sugestão: [próximo passo mais útil — ex: "diga 'revisar córtex' para completar o Pilar Financeiro" ou "está tudo em dia!"]
```

## Rules

1. **Don't rewrite anything yourself.** This skill only diagnoses; any fix must go through `registrar` or `revisar córtex`, never automatically here.
2. **Be honest about gaps**, but without alarm — the tone is "here's what's left," not "serious error."
3. **Relative paths.** All paths are relative to the workspace root.
4. **If everything is complete**, celebrate briefly instead of listing empty "nothing to report" sections.
