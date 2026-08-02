---
name: registrar
description: "Quickly records decisions, lessons, projects, or pending items into the Memory files. Trigger by typing words like: 'registra', 'nova lição', 'pendência', 'decidi que', or 'resolvido'."
---

# Skill: Registrar

This skill speeds up data entry into the memory folders. When the user triggers it with a short instruction (e.g. "lição: perdi cliente por conta do prazo"), you should process the entry silently and save it to the right file.

## 1. Classifying the Entry Type
Analyze the user's request and decide where the information should go. All paths are **relative to the workspace root**:
- **Lesson** (mistakes, successes, campaigns) → `Memoria/02_Licoes.md`
- **Decision** (prices, policies, suppliers, standards) → `Memoria/01_Decisoes.md`
- **Pending / Waiting / Resolved** → `Memoria/04_Pessoas_Pendencias.md`
- **Project** (status change, new project) → `Memoria/03_Projetos.md`
- **General info** (partners, access credentials, misc notes) → `Memoria/05_Registros_Gerais.md`

## 2. Formatting Standard (Mandatory)
Before writing, mentally format the entry to match the existing patterns in the files.
- **Lessons:** Always start with `- **[YYYY-MM-DD]** **[CATEGORIA]** [Texto]`. Common categories: `[COMERCIAL]`, `[OPERAÇÃO]`, `[COMUNICAÇÃO]`, `[GESTÃO]`.
- **Decisions:** Start with `- **[YYYY-MM-DD]** [Texto]`.
- **Pending items:** Start with `- 🔴 **[DEADLINE YYYY-MM-DD]** [Texto]` if it has a date, or `- ⏳ **[AGUARDANDO]** [Texto]` if it depends on a third party.
- **Resolved:** Move/add to the "Pendências Resolvidas" section with `- ✅ [Texto]`.
- **Projects:** Start with `- **[STATUS]** **[Nome do Projeto]**...` (Status like `[BRIEFING]`, `[EXECUÇÃO]`, `[ENTREGA]`, `[CONCLUÍDO]`).
- **Revoking a decision:** if the user says an old decision no longer holds, do NOT delete the original line in `Memoria/01_Decisoes.md`. Prepend the prefix `[REVOGADA em YYYY-MM-DD: motivo/nova decisão]` to the existing line. The `consolidar` skill moves revoked decisions to `Memoria/_Arquivo/` at the next consolidation (see `Frameworks/PROTOCOLO_MEMORIA.md`).

## 3. Silent Action Flow
1. Get the **real system date** (via terminal/whatever date tool is available) before formatting any `[YYYY-MM-DD]` stamp. Never estimate or "guess" the date — Radar and the semi-annual review depend on it being correct.
2. Read the target file (relative path).
3. Identify the section/heading the item best fits into.
4. Use your file-writing tools to inject the new line without touching the rest of the file.
5. If a pending item is **missing a deadline** (a future date, not the creation stamp), **ask the user** instead of making one up — a wrong deadline breaks Radar. If the user doesn't know, register it without a deadline using `- ⏳ **[SEM PRAZO]** [Texto]`.
6. If the entry creates a new file in `Pilares/` or `Memoria/` that isn't yet listed in `Memoria/META.md`'s map, update META as part of the same action.
7. After a successful entry, return to the user only the formatted line that was inserted, followed by a ✅.

*Don't ask permission to make the entry itself. Don't ask for confirmation to write to the file — just make the change immediately and show how it turned out. The only question allowed is for a missing deadline (step 5).*
