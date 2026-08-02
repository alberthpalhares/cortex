---
name: analisador-dre
description: "Reads a DRE or spreadsheet the user provides and cross-references it against the Financial pillar's margin targets. Trigger with: 'analisar DRE', 'analisa essa planilha', 'como está minha margem'."
---

# Skill: Analisador de DRE

This skill **is not an ERP and doesn't do accounting**. It only analyzes the data the user brings (spreadsheet, screenshot, pasted text) and cross-references it against the targets already registered in the Córtex — it never computes cash flow or projections on its own without real numbers in hand.

## Step by Step

1. **Check whether the user provided data.** If they just said "analisa minha DRE" without attaching anything, ask for the spreadsheet, screenshot, or numbers pasted as text. Don't proceed without real data.

2. **Read `Pilares/03_Financeiro.md`** (if it exists — the financial pillar is optional).

   **If the file exists:** Extract the frontmatter (`margem_alvo`, `margem_minima`, `custos_variaveis`, `custo_variavel_padrao`) and the registered fixed costs. If per-item variable costs are filled in, use them to compute the real contribution margin instead of a generic one. Continue to steps 3-4 normally.

   **If the file doesn't exist:** The user hasn't configured the financial pillar yet. Still analyze whatever data the user provided (revenue, costs, margin from the spreadsheet), but compare against common-sense benchmarks instead of the user's own targets. Skip steps 3-4 below (they depend on `03_Financeiro.md` existing) and go straight to the diagnosis. End with: *"💡 Você ainda não configurou o pilar financeiro no Córtex. Se quiser, posso te ajudar a registrar suas metas de margem e custos — aí na próxima análise eu cruzo com os seus números de verdade, não com médias de mercado."*

3. **Extract from the material the user provided:** total revenue, total costs/expenses, net profit, and the resulting net margin (net profit ÷ revenue × 100). If the material already brings the computed margin, use it; don't recompute it based on assumptions.

4. **Compare:**
   - The obtained margin vs. `margem_alvo` and `margem_minima`.
   - If `custos_variaveis` has per-item data, compute the contribution margin per item: `(price − variable_cost) ÷ price × 100`. Flag items whose contribution margin is below `margem_minima` — they're the ones dragging the overall result down, even if the blended margin looks healthy.
   - If `custo_variavel_padrao` is set but per-item data isn't, use it as a rough estimate and note that it's an approximation.
   - If there's more than one period (e.g. 2 months), point out the trend (rising/falling/stable).

5. **Generate the diagnosis** in the format below. If some required data wasn't in the material (e.g. only revenue, no costs), say exactly what's missing instead of estimating it.

## Output Format

```
📊 **DIAGNÓSTICO FINANCEIRO — [Nome do Negócio]**

💰 Receita: [valor] | Custos/Despesas: [valor] | Lucro líquido: [valor]
📈 Margem líquida: [X]%

🎯 Meta (margem_alvo): [Y]% → [✅ Dentro da meta | ⚠️ Abaixo da meta em Z pontos]
🔴 Mínimo (margem_minima): [W]% → [✅ Acima do mínimo | 🔴 Abaixo do mínimo — atenção]

🏷️ Margem de contribuição por item (se houver custos_variaveis):
   • [item]: preço R$[preço] − custo variável R$[custo] = [X]% de margem → [✅ | ⚠️ | 🔴]

[📉/📈 Tendência, se houver mais de um período]

💡 Observação: [1-2 linhas objetivas — nunca conselho financeiro genérico, só o que os números mostram]
```

## Rules

1. **Never make up numbers.** Only analyze what the user brought. If a number is missing, ask or point out the gap — don't estimate it.
2. **Not financial consultancy.** Point out what the numbers say relative to the already-registered targets; don't recommend investment, credit, or tax decisions.
3. **Never decides on its own to update the Financial pillar.** If the diagnosis suggests revisiting `margem_alvo` or `margem_minima`, ask before editing the frontmatter.
4. **Relative paths.** All paths are relative to the workspace root.
5. **Suggest registering it.** If the diagnosis reveals something important (e.g. margin consistently below the minimum), suggest `registra que...` to leave a documented decision or lesson.
