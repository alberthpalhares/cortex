---
name: proposta-comercial
description: "Assembles a ready-to-send commercial proposal, cross-referencing Comercial + Comunicação + Identidade Visual, the commercial lessons and the reasons of lost proposals. Applies the 'Fill the Gaps' Mode from PROTOCOLO_AUTONOMIA. Trigger with: 'gerar proposta', 'monta uma proposta pro cliente X', 'proposta comercial', 'orçamento para', 'cotação para'."
---

# Skill: Proposta Comercial

Generates a commercial proposal that's **90% ready** to send from what's already registered in the Córtex — the user just reviews and sends it. Never built from a long form.

## Step by Step

1. **Identify the minimum request.** You need at least: the client's name and what they want to hire (can be one item from the Product/Service lineup or something custom). If either is missing, ask objectively — just that, nothing more.

2. **Silently read:**
   - `Pilares/04_Comercial.md` (if it exists) — product lineup, frontmatter (`preco_piso`, `desconto_max`), and payment rules.
   - `Pilares/03_Financeiro.md` (if it exists) — frontmatter (`custos_variaveis`, `custo_variavel_padrao`) for the real variable cost of each item being quoted.
   - `Pilares/05_Comunicacao.md` — tone of voice.
   - `Pilares/06_Operacao.md` (if it exists) — delivery and editing deadlines on record.
   - `Pilares/09_Identidade_Visual.md`, if it exists — colors, font, brand guidelines.
   - `Memoria/01_Decisoes.md` — commercial rules already settled that affect the proposal (e.g. mandatory deposit, minimum deadline), and anything agreed with this client (a line that starts with or mentions their name).
   - `Memoria/02_Licoes.md` — only the lines tagged `**[COMERCIAL]**`, in any section (the same lines in `Memoria/_Arquivo/*.md` count too, if that folder exists).
   - `Memoria/04_Pessoas_Pendencias.md` — this client's line under "Stakeholders", and every `Proposta perdida` line under "Pendências Resolvidas" that carries a `motivo:` (the same lines in `Memoria/_Arquivo/*.md` count too, if that folder exists).

   **Use what was learned.** Apply to this proposal the commercial lessons and the reasons of lost proposals that fit it (the same kind of service, the same price range, the same kind of client) — e.g. a proposal lost over a long delivery time means this one states the deadline up front. Do it silently. A lesson or a reason never overrides a price, a floor, a payment rule or a decision: when they disagree, the pillar and the decision win. Do not turn a lesson into a promise, a discount or a deadline that is not on record: when a reason asks for a deadline, the proposal carries the one on record or, with none on record, `**[PRAZO DE ENTREGA — A CONFIRMAR]**` — never leave the line out. Files or lines that do not exist are simply skipped.

   If `Pilares/04_Comercial.md` doesn't exist, the user hasn't configured the commercial pillar yet — it's optional. In that case:
   - Ask the user for the service/item name, price, and payment terms directly (just what's needed for this proposal).
   - Don't apply `preco_piso`/`desconto_max` guardrails (they weren't set).
   - At the end of the proposal, add a note: *"💡 Você ainda não configurou os pilares financeiro e comercial no Córtex. Se quiser, posso te ajudar a registrar seus produtos, preços e políticas — aí as próximas propostas saem sozinhas, sem precisar perguntar valores."*

3. **Assemble the proposal** in the tone of voice from the Communication pillar, using the real values and terms you found. Never make up a price — if the requested service isn't in the lineup and has no clear reference, build the proposal with the value as `[A DEFINIR]` and warn the user.

4. **Apply "Fill the Gaps" Mode:** highlight, between `[BOLD BRACKETS]`, only the data that needs user confirmation (client's exact trade name, tax ID, proposal's validity date, specific delivery deadline).

5. **Margin check BEFORE saving** — apply the "Margin Guardian" mode of `.agents/cortex/PROTOCOLO_AUTONOMIA.md` (its Step 2 formulas and Step 3 order) to the price and any discount in this proposal, using the real variable cost of the quoted item:
   - net price below `preco_piso`, or discount above `desconto_max` → warn before generating and ask whether to go ahead anyway
   - margin below `margem_minima` → warn in one line with the figures (*"Com esse valor, de cada R$ 100 sobram R$ X — abaixo do mínimo que você definiu (Y%)."*) and offer the minimum price from the protocol's cost-to-price formula (never cost × (1 + margin)); generate the proposal only after the user decides
   - **if the cost or the margins are unknown, do not block and do not guess:** generate the proposal and add one line at the end — *"💡 Não consegui conferir sua margem neste preço porque falta [o custo deste serviço / sua margem mínima]. Diga 'descobrir minha margem' e a gente resolve em 5 minutos."*

6. **Save the proposal** to `Ativos/Propostas/AAAA-MM-DD_Nome-do-Cliente.md` (create the subfolder if it doesn't exist) using the real system date, and also show the full content in chat. After it, besides any warning the steps above ask for, at most two lines, in this order:
   - only if a lesson or a lost-proposal reason changed something in the proposal, the single one that weighed most, with the date written on that lesson or `Proposta perdida` line (never the date of a decision): *"💡 Usei o que você aprendeu: [lição ou motivo, em poucas palavras] ([DD/MM/AAAA])."* — never more than one, and none when nothing applied
   - always: *"Quando enviar, diga "enviei a proposta" que eu acompanho o retorno."*

   Do not write anything in `Memoria/`: a generated proposal has not been sent yet, and the `registrar` skill records it when the user says so.

## Output Format

```markdown
# Proposta Comercial — [Nome do Negócio] × [Cliente]

**Data:** [data real de hoje]
**Válida até:** [data real + 15 dias, ou o padrão do negócio se registrado]
**Prazo de entrega:** [o prazo registrado; sem registro, **[PRAZO DE ENTREGA — A CONFIRMAR]**]

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
