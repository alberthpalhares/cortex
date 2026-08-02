---
name: analisador-dre
description: "Reads a DRE or spreadsheet the user provides and cross-references it against the Financial pillar's margin targets. Trigger with: 'analisar DRE', 'analisa essa planilha', 'como está minha margem'."
---

# Skill: Analisador de DRE

This skill **is not an ERP and doesn't do accounting**. It only analyzes the data the user brings (spreadsheet, screenshot, pasted text) and cross-references it against the targets already registered in the Córtex — it never computes cash flow or projections on its own without real numbers in hand.

## Step by Step

1. **Check whether the user provided data.** If they just said "analisa minha DRE" without attaching anything, ask for the spreadsheet, screenshot, or numbers pasted as text. Don't proceed without real data.

2. **Read `Pilares/03_Financeiro.md`** — extract the frontmatter (`margem_alvo`, `margem_minima`) and the registered fixed costs.

3. **Extract from the material the user provided:** total revenue, total costs/expenses, net profit, and the resulting net margin (net profit ÷ revenue × 100). If the material already brings the computed margin, use it; don't recompute it based on assumptions.

4. **Compare:**
   - The obtained margin vs. `margem_alvo` and `margem_minima`.
   - If there's more than one period (e.g. 2 months), point out the trend (rising/falling/stable).

5. **Generate the diagnosis** in the format below. If some required data wasn't in the material (e.g. only revenue, no costs), say exactly what's missing instead of estimating it.

## Output Format

```
📊 **DIAGNÓSTICO FINANCEIRO — [Nome do Negócio]**

💰 Receita: [valor] | Custos/Despesas: [valor] | Lucro líquido: [valor]
📈 Margem líquida: [X]%

🎯 Meta (margem_alvo): [Y]% → [✅ Dentro da meta | ⚠️ Abaixo da meta em Z pontos]
🔴 Mínimo (margem_minima): [W]% → [✅ Acima do mínimo | 🔴 Abaixo do mínimo — atenção]

[📉/📈 Tendência, se houver mais de um período]

💡 Observação: [1-2 linhas objetivas — nunca conselho financeiro genérico, só o que os números mostram]
```

## Rules

1. **Never make up numbers.** Only analyze what the user brought. If a number is missing, ask or point out the gap — don't estimate it.
2. **Not financial consultancy.** Point out what the numbers say relative to the already-registered targets; don't recommend investment, credit, or tax decisions.
3. **Never decides on its own to update the Financial pillar.** If the diagnosis suggests revisiting `margem_alvo` or `margem_minima`, ask before editing the frontmatter.
4. **Relative paths.** All paths are relative to the workspace root.
5. **Suggest registering it.** If the diagnosis reveals something important (e.g. margin consistently below the minimum), suggest `registra que...` to leave a documented decision or lesson.
