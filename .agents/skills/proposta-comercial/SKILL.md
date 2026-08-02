---
name: proposta-comercial
description: "Assembles a ready-to-send commercial proposal, cross-referencing Comercial + Comunicação + Identidade Visual. Applies the 'Fill the Gaps' Mode from PROTOCOLO_AUTONOMIA. Trigger with: 'gerar proposta', 'monta uma proposta pro cliente X', 'proposta comercial'."
---

# Skill: Proposta Comercial

Generates a commercial proposal that's **90% ready** to send from what's already registered in the Córtex — the user just reviews and sends it. Never built from a long form.

## Step by Step

1. **Identify the minimum request.** You need at least: the client's name and what they want to hire (can be one item from the Product/Service lineup or something custom). If either is missing, ask objectively — just that, nothing more.

2. **Silently read:**
   - `Pilares/04_Comercial.md` (if it exists) — product lineup, frontmatter (`preco_piso`, `desconto_max`), and payment rules.
   - `Pilares/03_Financeiro.md` (if it exists) — frontmatter (`custos_variaveis`, `custo_variavel_padrao`) for the real variable cost of each item being quoted.
   - `Pilares/05_Comunicacao.md` — tone of voice.
   - `Pilares/09_Identidade_Visual.md`, if it exists — colors, font, brand guidelines.
   - `Memoria/01_Decisoes.md` — commercial rules already settled that affect the proposal (e.g. mandatory deposit, minimum deadline).

   If `Pilares/04_Comercial.md` doesn't exist, the user hasn't configured the commercial pillar yet — it's optional. In that case:
   - Ask the user for the service/item name, price, and payment terms directly (just what's needed for this proposal).
   - Don't apply `preco_piso`/`desconto_max` guardrails (they weren't set).
   - At the end of the proposal, add a note: *"💡 Você ainda não configurou os pilares financeiro e comercial no Córtex. Se quiser, posso te ajudar a registrar seus produtos, preços e políticas — aí as próximas propostas saem sozinhas, sem precisar perguntar valores."*

3. **Assemble the proposal** in the tone of voice from the Communication pillar, using the real values and terms you found. Never make up a price — if the requested service isn't in the lineup and has no clear reference, build the proposal with the value as `[A DEFINIR]` and warn the user.

4. **Apply "Fill the Gaps" Mode:** highlight, between `[BOLD BRACKETS]`, only the data that needs user confirmation (client's exact trade name, tax ID, proposal's validity date, specific delivery deadline).

5. **Never exceed `desconto_max`** from `04_Comercial.md`'s frontmatter without explicitly warning that the requested terms fall outside standard policy.

6. **Save the proposal** to `Ativos/Propostas/AAAA-MM-DD_Nome-do-Cliente.md` (create the subfolder if it doesn't exist) using the real system date, and also show the full content in chat.

## Output Format

```markdown
# Proposta Comercial — [Nome do Negócio] × [Cliente]

**Data:** [data real de hoje]
**Válida até:** [data real + 15 dias, ou o padrão do negócio se registrado]

## Escopo
[Descrição do que será entregue, no tom de voz do negócio]

## Investimento
[Valor(es), condições de pagamento, parcelamento se aplicável]

## Próximos passos
[Como o cliente confirma — sinal, assinatura, contato]
```

## Rules

1. **Never make up a price, deadline, or payment term.** Use what's registered; if missing, mark `[A DEFINIR]` and warn.
2. **Respect the frontmatter's discount floor and ceiling.** If the user asks for something outside policy, warn before generating.
3. **Tone of voice is mandatory.** Never generate a generic, robotic proposal — always in the style defined in `05_Comunicacao.md`.
4. **Relative paths.** All paths are relative to the workspace root.
5. **Don't send anything.** This skill only generates the document; sending it to the client is always the user's action.
