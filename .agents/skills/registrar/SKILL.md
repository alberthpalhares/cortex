---
name: registrar
description: "Quickly records decisions, lessons, projects, pending items, reminders, people and goals into the Memory files; also undoes or corrects the last entry and captures a whole meeting in one batch. Trigger by typing words like: 'registra', 'nova lição', 'nova pendência', 'decidi que', 'resolvido', 'me lembra de', 'lembrete', 'não me deixa esquecer', 'desfaz', 'corrige o último', 'anota a reunião', 'cliente novo', 'a meta do trimestre é'."
---

# Skill: Registrar

This skill speeds up data entry into the memory folders. When the user triggers it with a short instruction (e.g. "lição: perdi cliente por conta do prazo"), you should process the entry silently and save it to the right file.

**Only orders are recorded.** A question ("quais são minhas pendências?", "qual é a meta do trimestre?") is a lookup for `radar` or `lembrar` — never write anything for it.

## 1. Classifying the Entry Type
Analyze the user's request and decide where the information should go. All paths are **relative to the workspace root**:
- **Lesson** (mistakes, successes, campaigns) → `Memoria/02_Licoes.md`
- **Decision** (prices, policies, suppliers, standards) → `Memoria/01_Decisoes.md`
- **Pending / Waiting / Reminder / Resolved** → `Memoria/04_Pessoas_Pendencias.md`
- **Person** (client, partner, supplier, team member worth remembering) → `Memoria/04_Pessoas_Pendencias.md`, section "Stakeholders (Pessoas-Chave)"
- **Project** (status change, new project) → `Memoria/03_Projetos.md`
- **Quarterly goal** → `Memoria/03_Projetos.md`, section "Metas do Trimestre"
- **General info** (partners, where things are kept, misc notes) → `Memoria/05_Registros_Gerais.md`

## 2. Formatting Standard (Mandatory)
Before writing, mentally format the entry to match the existing patterns in the files.
- **Lessons:** Always start with `- **[YYYY-MM-DD]** **[CATEGORIA]** [Texto]`. Common categories: `[COMERCIAL]`, `[OPERAÇÃO]`, `[COMUNICAÇÃO]`, `[GESTÃO]`.
- **Decisions:** Start with `- **[YYYY-MM-DD]** [Texto]`.
- **Pending items, three kinds:**
  - with a date → `- 🔴 **[DEADLINE YYYY-MM-DD]** [Texto]`
  - depends on someone else → `- ⏳ **[AGUARDANDO]** [Texto] *(desde YYYY-MM-DD)*` — when you know who, name them: `**[AGUARDANDO: Marina]**`
  - no date → `- ⏳ **[SEM PRAZO]** [Texto] *(desde YYYY-MM-DD)*`

  `[Texto]` starts with a capital letter and ends with a period, before the stamp. `desde` is the day the item was created; `radar` uses it to show how long something has been stuck. Older lines without it stay valid — never rewrite a line only to add it.
- **Resolved:** Move the line to the "Pendências Resolvidas" section as `- ✅ **[YYYY-MM-DD]** [Texto]`, where the date is the day it was resolved. An item the user gives up on goes to the same section as `- 🚫 **[YYYY-MM-DD]** [Texto] *(deixada de lado)*` — it is not counted as resolved.
- **People:** one line per person, `- 👥 **[Nome]** — [papel ou empresa] — [nota curta: preferência, combinado ou última interação] *(YYYY-MM-DD)*`. If the person is already listed, update that line instead of adding a second one. This is a memory aid, not a CRM: one line, no contact history.
- **Projects:** Start with `- **[STATUS]** **[Nome do Projeto]**...` (Status like `[BRIEFING]`, `[EXECUÇÃO]`, `[ENTREGA]`, `[CONCLUÍDO]`), ending with `*(atualizado em YYYY-MM-DD)*`.
- **Quarterly goal:** `- 🎯 **[AAAA-T#]** [Meta] — [progresso, com data]`. Keep one line per goal and update its progress note in place. A goal for a new quarter is always a new line: never overwrite or retag a line from another quarter — a line whose quarter has ended stays where it is until `semana` closes it into `## Metas Anteriores`.
- **Revoking a decision:** if the user says an old decision no longer holds, do NOT delete the original line in `Memoria/01_Decisoes.md`. Prepend the prefix `[REVOGADA em YYYY-MM-DD: motivo/nova decisão]` to the existing line. The `consolidar` skill moves revoked decisions to `Memoria/_Arquivo/` at the next consolidation (see `.agents/cortex/PROTOCOLO_MEMORIA.md`).

## 3. Silent Action Flow
1. Get the **real system date** (via terminal/whatever date tool is available) before formatting any `[YYYY-MM-DD]` stamp. Never estimate or "guess" the date — Radar and the semi-annual review depend on it being correct.
2. Read the target file (relative path).
3. Identify the section/heading the item best fits into.
4. If a pending item is **missing a deadline** (a future date, not the creation stamp), ask before writing, in ONE line and nothing else — *"Tem prazo para isso? (se não souber, anoto sem prazo)"* — instead of making one up: a wrong deadline breaks Radar. If the user doesn't know, register it as `[SEM PRAZO]` and reply exactly as in step 7, without acknowledging the answer first.
5. Use your file-writing tools to inject the new line, inside a section that already exists, without touching the rest of the file.
6. If the entry creates a new file in `Pilares/` or `Memoria/` that isn't yet listed in `Memoria/META.md`'s map, update META as part of the same action.
7. After a successful entry, reply with the formatted line that was inserted followed by a ✅ and, on the next line, in italics, `(disse errado? é só falar "desfaz")`. No lead-in sentence ("Registrei:", "Pronto!") and nothing else — except the additions that sections 3.1 and 3.5 call for.

*Don't ask permission to make the entry itself. Don't ask for confirmation to write to the file — just make the change immediately and show how it turned out. The only question allowed is for a missing deadline (step 4).*

## 3.1 Reminders ("me lembra de…", "lembrete", "não me deixa esquecer")
A reminder is a pending item with a deadline — record it, do not search the memory for it.
- Turn "sexta", "amanhã", "dia 20", "semana que vem" into a date counted from the real system date. **Never do this calendar sum in your head:** compute the date with the same date tool, and check with the tool that it falls on the weekday the user said — a "sexta" that lands on a Saturday is wrong; recompute. If you cannot tell which day is meant, ask.
- The reply is the step 7 reply plus one line between the ✅ and the "desfaz" hint, confirming the weekday and the date so a mistake is caught at once: *"Anotado para sexta, 09/10."*
- The first time in a conversation, that line also says where it will show up: *"Vai aparecer no seu radar nessa semana — eu não mando aviso no celular."* Never promise a notification.

## 3.5 Price and Discount Decisions
A policy with no number in it ("cobrar deslocamento fora da capital") is not a price decision: skip this check. When the decision records a price, a price floor or a discount, write it as usual and then check it against `Pilares/04_Comercial.md` (`preco_piso`, `desconto_max`) and `Pilares/03_Financeiro.md` (`margem_minima`), if those exist. If it conflicts (e.g. a 20% discount when `desconto_max` is 10), add ONE line after the ✅: *"⚠️ Isso passa do desconto máximo que você definiu (10%). Quer que eu atualize o pilar Comercial?"* — and change nothing in the pillar without a yes. If the pillars or the numbers do not exist, say nothing.

## 4. Undo and Correct
- **"desfaz" / "apaga o último registro"** undoes the last **operation** of this conversation, not just one line:
  - a single entry → remove that line and confirm with `↩️ Removido: [linha]`
  - a batch ("anota a reunião") or a weekly close ("fechar a semana") → remove every line that operation wrote, and list them
  - an item moved to "resolved" → move it back
  - an in-place update → restore the previous text
- **"corrige o último" / "na verdade era...":** replace that same line with the corrected version and show `✏️ Antes: ... → Agora: ...`.
- **In-place updates** (a person already listed, a goal's progress, a project's status) are written without asking, but the reply always shows `✏️ Antes: ... → Agora: ...`, so nothing is replaced out of sight. When updating a person, keep a standing agreement that was in the note unless the user says it changed.
- If you no longer have the inserted line in this conversation, do not guess: show the 3 most recent dated entries of the relevant file and ask which one.
- Undo only ever touches what this skill (or `semana`) wrote in this conversation. Never use it to remove older history — revoking a decision follows the `[REVOGADA ...]` rule above.

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
3. After **one** confirmation, write everything, then reply only with `✅ [N] itens registrados.` — the lines were already shown, so do not repeat them.
4. Pending items with no deadline in the notes are listed as `[SEM PRAZO]`, and those that someone else owes as `[AGUARDANDO: Nome]` — do not interrupt the batch to ask for each one. A deadline said as a weekday ("até quarta") is computed and checked with the date tool, as in section 3.1.
5. **A batch only adds new lines**, of the kinds in step 1, inside sections that already exist — when none fits, use the closest one; never create a section. `[N]` is exactly the number of `•` lines shown and written — count the lines, not the groups — and the same number comes back in the ✅. Never update a project, a goal or any other existing line as part of a batch: if the notes change something already recorded (e.g. a project in `Memoria/03_Projetos.md`), offer it in ONE line after the ✅ — *"Quer que eu atualize o projeto X com isso?"* — and wait for a yes.

## 6. What Never Goes In
- **Passwords, card numbers, access keys or tokens.** If the user dictates one, do not write it; record only *where* it is kept (e.g. "senha do banco: no gerenciador de senhas") and say so in one line.
