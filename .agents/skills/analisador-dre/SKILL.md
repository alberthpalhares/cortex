---
name: analisador-dre
description: "Reads a DRE or spreadsheet the user provides, cross-references it against the Financial pillar's margin targets and keeps one line per month, so months can be compared. Trigger with: 'analisar DRE', 'analisa essa planilha', 'analisa esses números'. With no new data, answers from the months already kept: 'como foi setembro?', 'compara setembro com agosto', 'como está o ano?'. A bare 'como está minha margem?' with no spreadsheet is a Margin Guardian question (margin per job), not this skill."
---

# Skill: Analisador de DRE

This skill **is not an ERP and doesn't do accounting**. It only analyzes the data the user brings (spreadsheet, screenshot, pasted text) and cross-references it against the targets already registered in the Córtex — it never computes cash flow or projections on its own without real numbers in hand.

**Which case is this?** New data (a file, a screenshot, numbers pasted or typed), or a request to analyse → the Step by Step, then "Keep the Month". A question about a month, two months or the year with no new data ("como foi setembro?", "compara setembro com agosto", "como está o ano?") → only "Answer From What Is Kept": never ask for a spreadsheet first.

## Step by Step

1. **Check whether the user provided data.** If they just said "analisa minha DRE" without attaching anything, ask for the spreadsheet, screenshot, or numbers pasted as text. Don't proceed without real data. **Privacy line, once per conversation:** when you ask for the data, end that request with *"🔒 O que eu leio é enviado ao fornecedor da ferramenta de IA que você usa: deixe de fora senhas, números de cartão e documentos pessoais."*; if the data came with the request, put that line once at the end of the diagnosis instead. Never repeat it in the same conversation — not even when another skill was the one that said it — and never wait for an answer to it.

2. **Read `Pilares/03_Financeiro.md`** (if it exists — the financial pillar is optional).

   **If the file exists:** Extract the frontmatter (`margem_alvo`, `margem_minima`, `custos_variaveis`, `custo_variavel_padrao`) and the registered fixed costs. If per-item variable costs are filled in, use them to compute the real contribution margin instead of a generic one. Continue to steps 3-4 normally.

   **If the file doesn't exist:** The user hasn't configured the financial pillar yet. Still analyze whatever data the user provided (revenue, costs, margin from the spreadsheet) and show the user's own result plainly — **do not compare against "market" or "typical" margins**, which are not the user's reality. Skip the target comparison in step 4 and go straight to the diagnosis. End with: *"💡 Você ainda não definiu suas metas de margem no Córtex. Diga 'descobrir minha margem' e em 5 minutos a gente descobre quanto sobra de verdade nos seus trabalhos — aí eu cruzo suas planilhas com os seus números."*

3. **Extract from the material the user provided:** total revenue, total costs/expenses, net profit, and the resulting net margin (net profit ÷ revenue × 100). If the material already brings the computed margin, use it; don't recompute it based on assumptions.

4. **Compare:**
   - **Mind what each margin means.** `margem_alvo` / `margem_minima` are *per job*, after variable costs only. A DRE's net margin also deducts fixed costs, so it is naturally lower. Compare targets against the **contribution margin** (revenue − variable costs) when the material allows it; if only the net margin is available, show it, say it is after fixed costs, and do not call it "below target" on that basis alone.
   - The obtained margin vs. `margem_alvo` and `margem_minima` (see the note above).
   - If `custos_variaveis` has per-item data, compute the contribution margin per item: `(price − variable_cost) ÷ price × 100`. Flag items whose contribution margin is below `margem_minima` — they're the ones dragging the overall result down, even if the blended margin looks healthy.
   - If `custo_variavel_padrao` is set but per-item data isn't, use it as a rough estimate and note that it's an approximation.
   - If there's more than one period (e.g. 2 months), point out the trend (rising/falling/stable).

5. **Generate the diagnosis** in the format below. If some required data wasn't in the material (e.g. only revenue, no costs), say exactly what's missing instead of estimating it.

6. **Then "Keep the Month"**, below: the comparison block and the record close the same reply.

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

[📅 Comparando com o que está guardado — SOMENTE se houver outro mês guardado]

[✅ Guardei o resultado de … | ✏️ Antes: … → Agora: … | a pergunta do mês]
```

## Keep the Month

Each month analysed is ONE line in `Memoria/05_Registros_Gerais.md`, under `## Resultado Mês a Mês`, newest month first:

`- 📊 **[YYYY-MM]** Receita R$ 42.000 · Custos e despesas R$ 33.600 · Resultado R$ 8.400 · Margem líquida 20% *(analisado em YYYY-MM-DD)*`

1. **Which month.** It comes from the material (a title, a date column, the file name) or from what the user said — never from today's date, never a guess. A month said with no year ("os números de setembro") is the latest month of that name already over (date tool): today's date settles only the year, never the month, and the ✅ shows it ("setembro/2026"). If nothing says it, end the diagnosis with ONE question and write nothing yet: *"De que mês são esses números? Assim eu guardo para comparar com os próximos."* If the user does not know, keep nothing. Material with several months → one line for each month that has its own numbers. Not kept, and said in one line (*"Só guardo mês fechado, um por linha."*): a period that is not one month (a quarter, the year's total) and the month still running today (date tool).
2. **Which numbers.** Only numbers the material brings or that follow from them by arithmetic (result = revenue − costs; margin = result ÷ revenue × 100, at most one decimal). The minimum is revenue plus either the total of costs and expenses or the result; with less, keep nothing and say what is missing. Never an estimate, never a number taken from the pillar. A loss carries a minus sign: `Resultado -R$ 1.200 · Margem líquida -4%`. Values in the Brazilian form, with cents only when the material has them.
3. **Write.** Get today's date from the date tool. Re-read the file right before writing and add or change only this line — never write the whole file back from an earlier read. If the file has no `## Resultado Mês a Mês` section, create it at the end of the file.
   - **Month not there yet** → a new entry: write it at once, no confirmation, and show it:

     ```
     ✅ Guardei o resultado de [setembro/2026]:
     [a linha gravada — uma por mês, quando forem vários]
     (Errou? Diga "desfaz".)
     ```
   - **Month already there, different numbers** → replace that same line, never a second line for one month, and show `✏️ Antes: [linha antiga] → Agora: [linha nova]` with the same "desfaz" hint.
   - **Month already there, same numbers** → write nothing; say it was already kept.
4. **"Desfaz"** removes the line this skill just wrote (or puts the previous one back), together with the heading if this record created it, leaving the file exactly as it was.
5. Never touch another month's line, and never write these numbers anywhere else — not in the pillar, not as a decision.

## Compare With Earlier Months

When the section holds other months, the diagnosis ends — before the ✅ / ✏️ — with one line against **the closest earlier month kept** and, if it is there, one against **the same month of the year before**. Nothing else to compare with → no block at all, and no remark about it. The block is only for a month that is kept, just now or before: never for the month still running or a period that is not one month, and, when the month had to be asked, only after the answer, with the ✅. Material with several months → the block for the newest one only, and the ✅ lists every line written.

```
📅 Comparando com o que está guardado:
   • Agosto/2026 → setembro/2026: receita R$ 38.000 → R$ 42.000 (+R$ 4.000, +10,5%) · resultado R$ 6.080 → R$ 8.400 (+R$ 2.320) · margem líquida 16% → 20% (+4 pontos)
   • Setembro/2025 → setembro/2026: [o mesmo]
```

A margin difference is in "pontos", never in "%". Compute each difference from the two lines, then check it by adding it back to the earlier number. A kept line that lacks a number (written by hand) is compared only on what it has.

## Answer From What Is Kept

No new data: read only the `## Resultado Mês a Mês` section and answer from its lines. This mode writes nothing and needs no privacy line.

- **One month** ("como foi setembro?") → that month in plain words (receita, custos e despesas, resultado, margem líquida, and *"números que você me trouxe em DD/MM/AAAA"*), then the 📅 block above. A month said without a year is the most recent one kept with that name; always say month and year. When the latest month of that name already over (date tool) is not the one kept, say so first — *"Setembro/2026 eu não tenho; o último setembro guardado é o de 2025:"* — and end with the invitation below.
- **Two months** ("compara setembro com agosto") → one 📅 line, earlier → later.
- **The year** ("como está o ano?") → the months kept for the current year (date tool), one short line each, then the total: revenue, costs and result summed, and the year's margin = summed result ÷ summed revenue × 100 — never the average of the monthly margins. Say which months already over are not kept (*"Faltam janeiro a junho."*); never fill them in.
- **The month, or the whole section, is not there** → say so, name the months that are kept, and add: *"Traga a planilha ou os números desse mês e diga 'analisar DRE' que eu guardo."* Never estimate it, and never answer with the pillar's margins as if they were the month's result.
- **The word "margem" is in the question** ("como foi a margem de setembro?") → answer, then one line: *"Essa é a margem líquida do mês inteiro, depois de todos os custos. A margem de cada trabalho é outra conta: pergunte 'como está minha margem?'."*

## Rules

1. **Never make up numbers.** Only analyze what the user brought. If a number is missing, ask or point out the gap — don't estimate it.
2. **Not financial consultancy.** Point out what the numbers say relative to the already-registered targets; don't recommend investment, credit, or tax decisions.
3. **Never decides on its own to update the Financial pillar.** If the diagnosis suggests revisiting `margem_alvo` or `margem_minima`, ask before editing the frontmatter.
4. **Relative paths.** All paths are relative to the workspace root.
5. **Suggest registering it.** If the diagnosis reveals something important (e.g. margin consistently below the minimum), suggest `registra que...` to leave a documented decision or lesson.
6. **A month line is not a decision, a lesson or a pending item**, and it is never archived: the same month of other years is what makes the comparison possible.
