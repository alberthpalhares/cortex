---
name: registrar
description: "Quickly records decisions, lessons, projects, pending items, reminders, routines that repeat, people and goals into the Memory files; also undoes or corrects the last entry and captures a whole meeting, or notes brought from the phone, in one batch, each with the date of its own day, and weighs two options before a decision is made. Trigger by typing words like: 'registra', 'nova lição', 'nova pendência', 'decidi que', 'estou em dúvida entre', 'resolvido', 'me lembra de', 'lembrete', 'não me deixa esquecer', 'desfaz', 'corrige o último', 'anota a reunião', 'anota isso', 'cliente novo', 'a meta do trimestre é', 'enviei a proposta', 'mandei o orçamento', 'a proposta fechou', 'perdemos a proposta', 'todo dia 20', 'toda segunda', 'todo ano em', 'feito', 'paguei'."
---

# Skill: Registrar

**Only orders are recorded.** A question ("quais são minhas pendências?") is a lookup for `radar` or `lembrar` — never write anything for it.

## Read First: Which Case Is This?
This file alone is NOT enough for the four cases below. If the message is one of them, STOP: read the named file (in `.agents/skills/registrar/`) before doing anything else, then follow it together with this file. More than one can apply (a meeting that brings a discount: `lote.md` and `decisoes.md`).
- **Several things at once** → read `lote.md`: "anota a reunião"; "anota isso" with more than one thing; notes, minutes, a transcript, a call summary or a forwarded message (even one) — pasted, dictated, announced ("vou colar a ata") or in a file the user points to, also from the phone or WhatsApp.
- **A proposal or quote sent, won or lost** → read `propostas.md`: "enviei a proposta", "mandei o orçamento", "a proposta fechou", "o João fechou", "aprovaram o orçamento", "perdemos a proposta", "o João não fechou", "desistiram", "resolvido" said about a proposal.
- **Something that repeats** → read `rotinas.md`: "todo dia 20…", "toda segunda…", "todo ano em…", "sempre no dia…"; a routine changed or ended; "feito", "paguei…" or "resolvido" when the matching line starts with 🔁 — that line is never moved to "resolved".
- **A decision** → read `decisoes.md`: "decidi que"; any entry that writes or changes a line in `Memoria/01_Decisoes.md` (a price, a discount, a policy, something agreed with a client or a supplier, a decision that no longer holds); a decision still open ("estou em dúvida entre…", "não sei se faço A ou B").

This file is enough for everything else: one plain record ("registra", "anota isso" with one thing the user typed), "nova lição", "nova pendência", a reminder ("me lembra de…"), "feito" or "resolvido" (not about a proposal or a 🔁 routine), "cliente novo" or another person with nothing agreed, a project, "a meta do trimestre é…", general info, "desfaz", "corrige o último".

## Entry Types: File and Line Format (Mandatory)
Paths are **relative to the workspace root**. Match the patterns already in the files.
- **Lesson** → `Memoria/02_Licoes.md`: `- **[YYYY-MM-DD]** **[CATEGORIA]** [Texto]`. Common categories: `[COMERCIAL]`, `[OPERAÇÃO]`, `[COMUNICAÇÃO]`, `[GESTÃO]`.
- **Decision** (prices, policies, standards, and anything agreed with a client or a supplier) → `Memoria/01_Decisoes.md`: `- **[YYYY-MM-DD]** [Texto]`. Reason ending and `[REVOGADA …]` prefix: `decisoes.md`.
- **Pending item** (also waiting, reminder) → `Memoria/04_Pessoas_Pendencias.md`, three kinds:
  - with a date → `- 🔴 **[DEADLINE YYYY-MM-DD]** [Texto]`
  - depends on someone else → `- ⏳ **[AGUARDANDO]** [Texto] *(desde YYYY-MM-DD)*` — when you know who, name them: `**[AGUARDANDO: Marina]**`
  - no date → `- ⏳ **[SEM PRAZO]** [Texto] *(desde YYYY-MM-DD)*`

  `[Texto]` starts with a capital letter and ends with a period, before the stamp. An item someone else owes by a date is the dated kind, with their name in the text. `desde` is the day the item was created. Older lines without it stay valid — never rewrite a line only to add it.
- **Resolved:** ("resolvido", "feito", "paguei…") move the line to the "Pendências Resolvidas" section of that file as `- ✅ **[YYYY-MM-DD]** [Texto]`, dated the day it was resolved. An item the user gives up on goes to the same section as `- 🚫 **[YYYY-MM-DD]** [Texto] *(deixada de lado)*` — it is not counted as resolved.
- **Proposal sent, won or lost** → the same file; read `propostas.md` before writing or closing any waiting line about a proposal or a quote (`Resposta da proposta`).
- **Person** (client, partner, supplier, team member worth remembering) → the same file, section "Stakeholders (Pessoas-Chave)": one line per person, `- 👥 **[Nome]** — [papel ou empresa] — [nota curta: preferência ou última interação] *(YYYY-MM-DD)*`. If the person is already listed, update that line instead of adding a second one. Lines whose note holds an agreement (older versions wrote it there) stay valid. Not a CRM: one line, no contact history.
- **Project** (status change, new project) → `Memoria/03_Projetos.md`: `- **[STATUS]** **[Nome do Projeto]**...` (Status like `[BRIEFING]`, `[EXECUÇÃO]`, `[ENTREGA]`, `[CONCLUÍDO]`), ending with `*(atualizado em YYYY-MM-DD)*`.
- **Quarterly goal** → `Memoria/03_Projetos.md`, section "Metas do Trimestre": `- 🎯 **[AAAA-T#]** [Meta] — [progresso, com data]`. Keep one line per goal and update its progress note in place. A goal for a new quarter is always a new line: never overwrite or retag a line from another quarter — a line whose quarter has ended stays where it is until `semana` closes it into `## Metas Anteriores`.
- **General info** (where things are kept, misc notes) → `Memoria/05_Registros_Gerais.md`

**Clients, suppliers and partners: who they are is one thing, what was agreed is another.** *Who they are* (a person or a company) is ONE person line. *What was agreed or decided with them* (a price, a discount, a standing delivery or payment term, any condition that keeps holding) is a Decision line that starts with their name — `- **[YYYY-MM-DD]** [Nome]: [combinado]`, in the section that fits (a supplier's under "Fornecedores e Ferramentas") — so it is never replaced when the person's note changes. A sentence that brings both ("fornecedor novo: Gráfica Print, combinamos 10% acima de 500 cópias") writes both lines. A one-off thing they owe by a date ("a gráfica entrega os banners até dia 20") is not a Decision: it is a dated pending item, so radar shows it. Suppliers and partners that older versions listed under "Parceiros e Fornecedores" in `Memoria/05_Registros_Gerais.md` stay there and stay valid: never move or rewrite them, and add no new ones there.

## Write Flow (Silent)
1. Get the **real system date** (terminal or any date tool) before formatting any `[YYYY-MM-DD]` stamp. Never guess it.
2. Read the target file.
3. Identify the section/heading the item best fits into.
4. If a pending item is **missing a deadline** (a future date, not the creation stamp), ask before writing, in ONE line and nothing else — *"Tem prazo para isso? (se não souber, anoto sem prazo)"* — instead of making one up. If the user doesn't know, register it as `[SEM PRAZO]` and reply exactly as in step 7, without acknowledging the answer first.
5. **Re-read the target file right before writing.** It may have changed since step 2 (another computer, a partner, a cloud-synced folder). Then inject the new line, inside a section that already exists, into the file as it is now, without touching the rest — never write the whole file back from an earlier read. This holds for every write of this skill (a batch after its confirmation, an in-place update, a move to "resolved", an undo): if the line you were about to change or remove is no longer there, or reads differently, do not force it — show what is there now and ask. If you notice a file beside it whose name looks like a sync conflict (`cópia em conflito`, `conflicted copy`, ` (1)`), say in one line that the cloud kept two versions and that the other one is not being read — and still write only to the file with the normal name.
6. If the entry creates a new file in `Pilares/` or `Memoria/` that isn't yet listed in `Memoria/META.md`'s map, update META in the same action.
7. After a successful entry, reply with the formatted line (or lines) inserted, followed by a ✅ and, on the next line, in italics, `(disse errado? é só falar "desfaz")`. No lead-in sentence ("Registrei:", "Pronto!") and nothing else — except the additions that this file and the support files call for, each between the ✅ and the "desfaz" hint.

*Never ask permission or confirmation to write an entry: write it at once and show how it turned out. Before writing, ask only where this skill says to (a missing deadline in step 4, a day, a routine or a proposal you cannot tell, a line that changed since you read it, the one confirmation of a batch in `lote.md`).*

**An entry placed on another day** ("ontem decidi que…", "na segunda combinei com…") gets that day's date, by the date rules of `lote.md` (read them first; no list, no confirmation); the step 7 reply already shows it. When the day cannot be told ("semana passada decidi…"), write it with today's date and add ONE line after the ✅: *"📅 Anotei com a data de hoje. Se foi outro dia, me diz qual."*

## Reminders
A reminder ("me lembra de…", "lembrete", "não me deixa esquecer") is a pending item with a deadline — record it, do not search the memory for it.
- Turn "sexta", "amanhã", "dia 20", "semana que vem" into a date counted from the real system date. **Never do this calendar sum in your head:** compute it with the same date tool, and check with it that it falls on the weekday the user said. If you cannot tell which day is meant, ask.
- The reply is the step 7 reply plus one line between the ✅ and the "desfaz" hint, confirming the weekday and the date: *"Anotado para sexta, 09/10."*
- The first time in a conversation, that line also says where it will show up: *"Vai aparecer no seu radar nessa semana — eu não mando aviso no celular."* Never promise a notification.

## Undo and Correct
- **"desfaz" / "apaga o último registro"** undoes the last **operation** of this conversation — every line it wrote and every part below that applies — not just one line:
  - a single entry → remove the line or lines it wrote (a person + what was agreed are two, in two files) and confirm with `↩️ Removido: [linha]` for each
  - a batch ("anota a reunião") or a weekly close ("fechar a semana") → remove every line that operation wrote, and list them. Remove only those lines: each file must end up exactly as it was before, with no blank line left behind and its final line break intact
  - an item moved to "resolved" → move it back
  - an in-place update → restore the previous text
- **"corrige o último" / "na verdade era...":** replace that same line with the corrected version and show `✏️ Antes: ... → Agora: ...`.
- **In-place updates** (a person already listed, a goal's progress, a project's status, a proposal line, a routine done or re-dated, a reason added to a decision) are written without asking, but the reply always shows `✏️ Antes: ... → Agora: ...`, so nothing is replaced out of sight. When updating a person, keep a standing agreement that was in the note; when the user says it changed, follow `decisoes.md` ("An Agreement That Changed").
- If you no longer have the inserted line in this conversation, do not guess: show the 3 most recent dated entries of that file and ask which one.
- Undo only touches what this skill (or `semana`, or `analisador-dre`) wrote in this conversation. Never use it to remove older history — a decision that no longer holds is revoked, never deleted (`decisoes.md`).

## What Never Goes In
- **Passwords, card numbers, access keys or tokens.** If the user dictates one, do not write it; record only *where* it is kept (e.g. "senha do banco: no gerenciador de senhas") and say so in one line.
