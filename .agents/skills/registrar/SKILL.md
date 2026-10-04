---
name: registrar
description: "Quickly records decisions, lessons, projects, pending items, people and goals into the Memory files; also undoes or corrects the last entry and captures a whole meeting in one batch. Trigger by typing words like: 'registra', 'nova lição', 'pendência', 'decidi que', 'resolvido', 'desfaz', 'corrige o último', 'anota a reunião', 'cliente novo', 'meta do trimestre'."
---

# Skill: Registrar

This skill speeds up data entry into the memory folders. When the user triggers it with a short instruction (e.g. "lição: perdi cliente por conta do prazo"), you should process the entry silently and save it to the right file.

## 1. Classifying the Entry Type
Analyze the user's request and decide where the information should go. All paths are **relative to the workspace root**:
- **Lesson** (mistakes, successes, campaigns) → `Memoria/02_Licoes.md`
- **Decision** (prices, policies, suppliers, standards) → `Memoria/01_Decisoes.md`
- **Pending / Waiting / Resolved** → `Memoria/04_Pessoas_Pendencias.md`
- **Person** (client, partner, supplier, team member worth remembering) → `Memoria/04_Pessoas_Pendencias.md`, section "Stakeholders (Pessoas-Chave)"
- **Project** (status change, new project) → `Memoria/03_Projetos.md`
- **Quarterly goal** → `Memoria/03_Projetos.md`, section "Metas do Trimestre"
- **General info** (partners, where things are kept, misc notes) → `Memoria/05_Registros_Gerais.md`

## 2. Formatting Standard (Mandatory)
Before writing, mentally format the entry to match the existing patterns in the files.
- **Lessons:** Always start with `- **[YYYY-MM-DD]** **[CATEGORIA]** [Texto]`. Common categories: `[COMERCIAL]`, `[OPERAÇÃO]`, `[COMUNICAÇÃO]`, `[GESTÃO]`.
- **Decisions:** Start with `- **[YYYY-MM-DD]** [Texto]`.
- **Pending items:** Start with `- 🔴 **[DEADLINE YYYY-MM-DD]** [Texto]` if it has a date, or `- ⏳ **[AGUARDANDO]** [Texto]` if it depends on a third party.
- **Resolved:** Move the line to the "Pendências Resolvidas" section as `- ✅ **[YYYY-MM-DD]** [Texto]`, where the date is the day it was resolved.
- **People:** one line per person, `- 👥 **[Nome]** — [papel ou empresa] — [nota curta: preferência, combinado ou última interação] *(YYYY-MM-DD)*`. If the person is already listed, update that line instead of adding a second one. This is a memory aid, not a CRM: one line, no contact history.
- **Projects:** Start with `- **[STATUS]** **[Nome do Projeto]**...` (Status like `[BRIEFING]`, `[EXECUÇÃO]`, `[ENTREGA]`, `[CONCLUÍDO]`), ending with `*(atualizado em YYYY-MM-DD)*`.
- **Quarterly goal:** `- 🎯 **[AAAA-T#]** [Meta] — [progresso, com data]`. Keep one line per goal and update its progress note in place.
- **Revoking a decision:** if the user says an old decision no longer holds, do NOT delete the original line in `Memoria/01_Decisoes.md`. Prepend the prefix `[REVOGADA em YYYY-MM-DD: motivo/nova decisão]` to the existing line. The `consolidar` skill moves revoked decisions to `Memoria/_Arquivo/` at the next consolidation (see `Frameworks/PROTOCOLO_MEMORIA.md`).

## 3. Silent Action Flow
1. Get the **real system date** (via terminal/whatever date tool is available) before formatting any `[YYYY-MM-DD]` stamp. Never estimate or "guess" the date — Radar and the semi-annual review depend on it being correct.
2. Read the target file (relative path).
3. Identify the section/heading the item best fits into.
4. Use your file-writing tools to inject the new line without touching the rest of the file.
5. If a pending item is **missing a deadline** (a future date, not the creation stamp), **ask the user** instead of making one up — a wrong deadline breaks Radar. If the user doesn't know, register it without a deadline using `- ⏳ **[SEM PRAZO]** [Texto]`.
6. If the entry creates a new file in `Pilares/` or `Memoria/` that isn't yet listed in `Memoria/META.md`'s map, update META as part of the same action.
7. After a successful entry, return to the user only the formatted line that was inserted, followed by a ✅ and, in small text, `(disse errado? é só falar "desfaz")`.

*Don't ask permission to make the entry itself. Don't ask for confirmation to write to the file — just make the change immediately and show how it turned out. The only question allowed is for a missing deadline (step 5).*

## 3.5 Price and Discount Decisions
When the decision records a price, a price floor or a discount, write it as usual and then check it against `Pilares/04_Comercial.md` (`preco_piso`, `desconto_max`) and `Pilares/03_Financeiro.md` (`margem_minima`), if those exist. If it conflicts (e.g. a 20% discount when `desconto_max` is 10), add ONE line after the ✅: *"⚠️ Isso passa do desconto máximo que você definiu (10%). Quer que eu atualize o pilar Comercial?"* — and change nothing in the pillar without a yes. If the pillars or the numbers do not exist, say nothing.

## 4. Undo and Correct
- **"desfaz" / "apaga o último registro":** remove exactly the line you inserted most recently in this conversation, and confirm with `↩️ Removido: [linha]`. If the last action was moving a pending item to "resolved", move it back.
- **"corrige o último" / "na verdade era...":** replace that same line with the corrected version and show `✏️ Antes: ... → Agora: ...`.
- If you no longer have the inserted line in this conversation, do not guess: show the 3 most recent dated entries of the relevant file and ask which one.
- Undo only ever touches a line created by this skill. Never use it to remove older history — revoking a decision follows the `[REVOGADA ...]` rule above.

## 5. Batch Capture ("anota a reunião")
When the user pastes meeting notes, a call summary, a transcript, or dictates several things at once:
1. Extract every decision, pending item (with owner and deadline when stated), lesson and person mentioned.
2. Show them as **one** list, already in the formats above, grouped by type:

   ```
   📋 **Encontrei [N] itens nessa anotação:**

   **Decisões**
   • [linha formatada]
   **Pendências**
   • [linha formatada]
   **Lições**
   • [linha formatada]

   Gravo tudo assim? (pode me dizer o que tirar ou ajustar)
   ```
3. After **one** confirmation, write everything, then reply with `✅ [N] itens registrados.`
4. Pending items with no deadline in the notes are listed as `[SEM PRAZO]` — do not interrupt the batch to ask for each one.

## 6. What Never Goes In
- **Passwords, card numbers, access keys or tokens.** If the user dictates one, do not write it; record only *where* it is kept (e.g. "senha do banco: no gerenciador de senhas") and say so in one line.
