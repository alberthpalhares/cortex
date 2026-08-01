---
name: analisador-dre
description: "Lê um DRE ou planilha financeira que o usuário fornecer e cruza com as metas de margem do Pilar Financeiro. Acione com: 'analisar DRE', 'analisa essa planilha', 'como está minha margem'."
---

# Skill: Analisador de DRE

Esta skill **não é um ERP e não faz contabilidade**. Ela só analisa os dados que o usuário trouxer (planilha, print, texto colado) e cruza com as metas já registradas no Córtex — nunca calcula fluxo de caixa ou projeções sozinha sem os números reais em mãos.

## Passo a Passo

1. **Verifique se o usuário forneceu dados.** Se ele só disse "analisa minha DRE" sem anexar nada, peça a planilha, o print ou os números colados em texto. Não prossiga sem dados reais.

2. **Leia `Pilares/03_Financeiro.md`** — extraia o frontmatter (`margem_alvo`, `margem_minima`) e os custos fixos registrados.

3. **Extraia do material fornecido pelo usuário:** receita total, custos/despesas totais, lucro líquido, e a margem líquida resultante (lucro líquido ÷ receita × 100). Se o material já trouxer a margem calculada, use-a; não recalcule com base em suposições.

4. **Compare:**
   - Margem obtida vs. `margem_alvo` e `margem_minima`.
   - Se houver mais de um período (ex: 2 meses), aponte a tendência (subindo/caindo/estável).

5. **Gere o diagnóstico** no formato abaixo. Se algum dado necessário não veio no material (ex: só receita, sem custos), diga exatamente o que falta em vez de estimar.

## Formato de Saída

```
📊 **DIAGNÓSTICO FINANCEIRO — [Nome do Negócio]**

💰 Receita: [valor] | Custos/Despesas: [valor] | Lucro líquido: [valor]
📈 Margem líquida: [X]%

🎯 Meta (margem_alvo): [Y]% → [✅ Dentro da meta | ⚠️ Abaixo da meta em Z pontos]
🔴 Mínimo (margem_minima): [W]% → [✅ Acima do mínimo | 🔴 Abaixo do mínimo — atenção]

[📉/📈 Tendência, se houver mais de um período]

💡 Observação: [1-2 linhas objetivas — nunca conselho financeiro genérico, só o que os números mostram]
```

## Regras

1. **Nunca invente números.** Só analisa o que o usuário trouxe. Se faltar um dado, pergunte ou aponte a lacuna — não estime.
2. **Não é consultoria financeira.** Aponte o que os números dizem em relação às metas já registradas; não recomende decisões de investimento, crédito ou tributação.
3. **Não decide sozinha atualizar o Pilar Financeiro.** Se o diagnóstico sugerir revisar `margem_alvo` ou `margem_minima`, pergunte antes de editar o frontmatter.
4. **Caminhos relativos.** Todos os caminhos são relativos à raiz do workspace.
5. **Sugira registrar.** Se o diagnóstico revelar algo importante (ex: margem consistentemente abaixo do mínimo), sugira `registra que...` para deixar uma decisão ou lição documentada.
