---
name: saude
description: "Runs an X-ray of the Córtex structure: missing pillars, pending REVISAR markers, an out-of-sync META.md, and what is left to fill in. Trigger with: 'saúde do córtex', 'diagnóstico do córtex', 'cortex doctor', 'o que falta preencher'. Tip: 'npx @aksp/cortex doctor' runs the same check from the terminal, without using AI tokens."
---

# Skill: Saúde do Córtex

This skill doesn't judge the business's content — it audits the Córtex's **structure** and points out filling gaps, so the user knows exactly what's left to complete (common after a Quickstart-mode onboarding).

## Step by Step

1. **Check whether the Córtex exists.** If there's no `Memoria/META.md`, report that the Córtex hasn't been set up yet and offer to start onboarding. Stop here. Tip: if the user just wants the structural numbers without spending AI tokens, suggest `npx @aksp/cortex doctor` — it runs the same deterministic checks from the terminal.

2. **Read `Memoria/META.md`** and extract the File Map declared there.

3. **List the real files** in `Pilares/` and `Memoria/` (names, not content).

4. **Compare the META's map against the disk's reality:**
   - Files in the map that don't exist on disk → `❌ Quebrado`
   - Files on disk that aren't in the map → `⚠️ Não indexado`
   - The 4 mandatory pillars (`01`, `02`, `05`, `06`) that don't exist → `🔴 Faltando (obrigatório)`
   - Optional pillars (`03_Financeiro`, `04_Comercial`, `07_Juridico`, `08_Inventario`, `09_Identidade_Visual`) that don't exist → `ℹ️ Opcional não configurado` (informational, not an error — the user may have chosen to skip these)

5. **Read each file in `Pilares/`** and count how many `<!-- REVISAR -->` markers or blank sections (a heading followed only by an HTML comment) each one has. The "Panorama Competitivo" section of `01_Estrategia.md` stays blank on purpose until the `pesquisa-mercado` skill runs — never count it as pending. In `Pilares/03_Financeiro.md` and `Pilares/04_Comercial.md`, also check the YAML frontmatter at the top: every field (`margem_alvo`, `margem_minima`, `custos_variaveis`, `custo_variavel_padrao`, `preco_piso`, `desconto_max`) still set to `null` (or `{}` for `custos_variaveis`) counts as a pending item — it's data the "Margin Guardian" Mode needs and doesn't have yet. The `custos_variaveis` field is what lets the Margin Guardian compute `Custo Real → Margem Resultante → Veredito` per item instead of guessing the cost from prose. Still in those two files, a value in those fields, in `imposto_pct`, `taxas_pct` or inside `custos_variaveis` that is not a plain number counts as a "número para corrigir": `1.500,00`, `12,50`, `30%`, `R$ 700`; `1.500` in a value in R$ (`preco_piso`, `custos_variaveis`) — the dot is read as a decimal point, so it is used as 1,5; `margem_alvo` or `margem_minima` below 1 (`0.35` means 0,35%, not 35%). So does a top block missing its closing `---` line. Show what is written and what it probably should be (`1500`, `12.5`, `30`, `700`, `35`), and change nothing until the user confirms the value.

6. **Check the brain layer:**
   - `Frameworks/CEREBRO.md` exists and contains the `CORTEX:BUSINESS` and `CORTEX:FRAMEWORK` markers → **current format**. Confirm at least one compiled instruction file exists at the root (the default is `AGENTS.md`; chosen targets live in `.cortex/targets.json`).
   - `CEREBRO.md` exists but **without** the markers → intermediate format: it works, but `cortex update` can't refresh the rules on its own. Suggest `revisar córtex` to split the two layers.
   - `CEREBRO.md` doesn't exist → legacy format (content duplicated across root files). Suggest `revisar córtex` to migrate.
   - If any root file is still an old-style **pointer** (contains *"leia `Frameworks/CEREBRO.md`"* instead of the full content), flag it: running `npx @aksp/cortex sync --force` recompiles it.

7. **Say what is left in blocks and minutes, never as a percentage.** Count how many of the 4 mandatory pillars (`01`, `02`, `05`, `06`) still have pending items; optional pillars (03/04/07/08/09) don't count. A Córtex set up through the quick path is working as designed — a score of "0%" would tell someone who did everything asked that they failed. Name the blocks left and how long each takes (2 to 5 minutes).

8. **Generate the report** in the format below.

## Output Format

```
🩺 **SAÚDE DO CÓRTEX — [Nome do Negócio]**

📊 [O essencial está funcionando. Faltam [N] blocos rápidos: [tom de voz (2 min), rotina (3 min)…] | Os 4 pilares essenciais estão completos ✅]

🔴 Pilares obrigatórios faltando (4: Estratégia, Cultura, Comunicação, Operação):
   • [lista, ou "Nenhum ✅"]

ℹ️ Pilares opcionais não configurados (Financeiro, Comercial, Jurídico, Inventário, Identidade Visual):
   • [lista dos que não existem, ou "Todos configurados ✅"]

📝 Pilares com marcadores REVISAR pendentes:
   • [Nome do Pilar] — [N] pendência(s)
   • [lista, ou "Nenhum ✅"]

🔢 Números para corrigir (só se houver):
   • [Pilar] — [campo] está escrito "[valor]"; o certo provavelmente é [valor]

⚠️ Inconsistências no META.md:
   • [arquivos quebrados ou não indexados, ou "Nenhuma ✅"]

🧠 System prompt: [Fonte única (Frameworks/CEREBRO.md) ✅ | Formato antigo — considere migrar]

💡 Sugestão: [próximo passo mais útil — ex: "diga 'continuar onboarding' para completar o que falta, um bloco por vez" ou "está tudo em dia!"]
```

## Rules

1. **Don't rewrite anything yourself.** This skill only diagnoses; any fix must go through `registrar`, `continuar onboarding` (to fill gaps) or `revisar córtex` (to migrate or update pillars), never automatically here.
2. **Be honest about gaps**, but without alarm — the tone is "here's what's left," not "serious error."
3. **Relative paths.** All paths are relative to the workspace root.
4. **If everything is complete**, celebrate briefly instead of listing empty "nothing to report" sections.
