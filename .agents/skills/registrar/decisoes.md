Read this when an entry writes or changes a line in `Memoria/01_Decisoes.md` — a decision, a price, a discount, a policy, something agreed with a client or a supplier, a decision that no longer holds — or when the user is still choosing ("estou em dúvida entre X e Y"). The core (`SKILL.md`, in this folder) still holds: its line formats, its write flow (re-read before writing, the step 7 reply), its undo rules and what never goes in.

## Revoking a Decision
If the user says an old decision no longer holds, do NOT delete the original line in `Memoria/01_Decisoes.md`. Prepend the prefix `[REVOGADA em YYYY-MM-DD: motivo/nova decisão]` to the existing line. The `consolidar` skill moves revoked decisions to `Memoria/_Arquivo/` at the next consolidation (see `.agents/cortex/PROTOCOLO_MEMORIA.md`).

## An Agreement That Changed
When the user says a standing agreement with a client, a supplier or a partner changed, write the new one as a Decision line (the core's "who they are is one thing, what was agreed is another") and retire the old one in the same reply, wherever it is recorded (the person's note, an older Decision line, an old "Parceiros e Fornecedores" line — the one case such a line is edited), showing `✏️ Antes: ... → Agora: ...`, so two agreements never stand at once.

## Price and Discount Decisions
A policy with no number in it ("cobrar deslocamento fora da capital") is not a price decision, and neither is a price or a discount a supplier gives the business: skip this check. When the decision records a price, a price floor or a discount, write it as usual and then check it against `Pilares/04_Comercial.md` (`preco_piso`, `desconto_max`) and `Pilares/03_Financeiro.md` (`margem_minima`), if those exist. If it conflicts (e.g. a 20% discount when `desconto_max` is 10), add ONE line after the ✅: *"⚠️ Isso passa do desconto máximo que você definiu (10%). Quer que eu atualize o pilar Comercial?"* — and change nothing in the pillar without a yes. If the pillars or the numbers do not exist, say nothing.

## The Why of a Decision
A decision recorded without its reason gets reopened six months later. The reason is an optional ending of the decision line; lines without it — every line written by an older version — stay valid, and you never rewrite or ask about an old line only to add one:
`- **[YYYY-MM-DD]** [Decisão] — porque [motivo] — descartado: [alternativa].`
- **The user gave the reason** ("decidi não atender casamento porque tira o foco do corporativo") → write `— porque [motivo]` in their own words. `— descartado: [alternativa]` is written only when the user named what was left aside. Then the usual step 7 reply.
- **No reason given** ("decidi que não atendo mais aos domingos") → write the line at once, as always — never hold a decision back to ask — and add ONE line after the ✅: *"Quer guardar o porquê? Me conta em uma frase e eu anoto junto."* If the answer comes, add `— porque [motivo]` to that same line and show `✏️ Antes: ... → Agora: ...`; if it does not, never ask again and never guess a reason — not even an obvious one.
- **No question** when the reply already carries the ⚠️ line of the price check above, when the line is something agreed with a client or a supplier, when a decision is revoked (its reason goes in the `[REVOGADA …]` prefix) and in a batch (`lote.md`), where a reason found in the notes is simply kept.

## A Decision Still in the Making
"Estou em dúvida entre X e Y", "não sei se faço A ou B" is not a record yet: write nothing until the user chooses.
1. Before answering, read, through `Memoria/META.md`, what the pillars say on the subject (`Pilares/01_Estrategia.md` always) and the decisions and lessons about it in `Memoria/01_Decisoes.md` and `Memoria/02_Licoes.md`.
2. Answer in up to 8 short lines: for each option, what on record favors it and what weighs against it, each point with its source (*Decisões, 20/05/2025*; *pilar Estratégia*), then which option fits what is on record better — as a reading, never as an order. Cite only lines you read for this answer; where nothing on record bears on an option, say so instead of filling in with general advice.
3. Close with: *"Qual você escolhe? Eu registro a decisão já com o porquê."*
4. When the user chooses, that is the order: write the decision line with `— porque [motivo] — descartado: [a outra opção]`, where the reason is the one the user gave or agreed with — never your own argument put in their mouth; if they chose without giving one, write the line without `— porque …`, keeping `— descartado: …`, and ask the question above (*"Quer guardar o porquê?…"*).

A doubt about a price or a discount ("dou 10% ou 15%?") gets the Margin Guardian answer (brain rule 7) instead.
