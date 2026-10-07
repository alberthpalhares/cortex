---
name: consolidar
description: "Applies the Living Memory Protocol: archives old Memory items, marks revoked decisions as movable, and merges duplicates — without ever deleting history. Trigger with: 'consolidar memória', 'arquivar memória', 'a memória está grande'."
---

# Skill: Consolidar Memória

This skill executes `.agents/cortex/PROTOCOLO_MEMORIA.md`. It keeps `Memoria/` lean over time, moving (never deleting) what has gone stale or redundant into `Memoria/_Arquivo/`. The rules below are complete on their own: follow them even if an older copy of the protocol exists elsewhere in the folder.

## Step by Step

1. **Check whether there's any Memory.** If neither `Memoria/01_Decisoes.md` nor `Memoria/02_Licoes.md` exist, tell the user there's nothing to consolidate yet. Stop here.

2. **Get the real system date** (via terminal/whatever date tool is available) — never estimate. Every age calculation depends on it.

3. **Read the consolidation candidates:**
   - `Memoria/01_Decisoes.md` — look for lines already marked `[REVOGADA em ...]`.
   - `Memoria/02_Licoes.md` — look for items older than 12 months from today's real date.
   - `Memoria/03_Projetos.md` — projects with `[CONCLUÍDO]` status for more than 12 months (if applicable).
   - `Memoria/04_Pessoas_Pendencias.md` — items in the "Pendências Resolvidas" section older than **60 days**. This file is read on every radar, so finished items leave it sooner. A `🔁` line under `## Rotinas` is never a candidate, however old its dates, and is never merged: a routine stays until the user ends it (then it is a `Rotina encerrada` line under "Pendências Resolvidas", archived like any other).

   Age is always counted from the `**[YYYY-MM-DD]**` stamp at the start of the line. A line with no stamp (older versions wrote resolved items without one) has an unknown age: never estimate it and never use a leftover `[DEADLINE …]` date as if it were the resolution date. Show such lines as their own entry in the batch summary — *"[N] pendências resolvidas sem data — arquivo também?"* — and archive them only if the user says yes. A decision that is still in force is never archived, however old: in `01_Decisoes.md` only `[REVOGADA …]` lines are candidates. A `📊` line under `## Resultado Mês a Mês` of `Memoria/05_Registros_Gerais.md` (one month's result, stamped `**[YYYY-MM]**`) is never a candidate and is never merged, however old: the `analisador-dre` skill compares each new month with the same month of earlier years.

4. **Identify duplicates, conservatively.** Within each file, look for items that say the same thing (the same decision restated, the same lesson repeated). Two lines that differ in a number, a proper name or a condition (10% vs 15%, client A vs client B, "always" vs "only with a contract") are NOT duplicates. When in doubt, do not merge. A merged line keeps the reason (`— porque …`) of whichever original had one.

5. **Assemble a batch summary** — never apply item by item without showing the whole set first. For every merge, show the exact text that will remain:

   ```
   🗄️ **CONSOLIDAÇÃO DE MEMÓRIA — [Nome do Negócio]**

   📦 Itens a arquivar:
      • [Memoria/02_Licoes.md] "..." (YYYY-MM-DD)
      • [Memoria/01_Decisoes.md] "..." — revogada em YYYY-MM-DD
      • [Memoria/04_Pessoas_Pendencias.md] [N] pendências resolvidas há mais de 60 dias

   🔗 Itens a fundir (duplicatas):
      • "..." + "..."
        → fica: "[texto final da linha única] (primeiro registro em YYYY-MM-DD)"

   Isso move esses itens para Memoria/_Arquivo/AAAA.md — nada é apagado, só sai dos arquivos ativos. As linhas fundidas também ficam guardadas lá, como estavam. Posso aplicar?
   ```

6. **Only after the user confirms**, re-read each file you are about to change — it may have changed while the summary was on screen (another computer, a partner, a cloud-synced folder) — and leave out, saying so, any line of the batch that is no longer there or reads differently; never write a whole file back from the earlier read. Then apply it in this order:
   1. **Make a safety copy first.** Run `npx @aksp/cortex@latest backup` (it only copies `Pilares/`, `Memoria/`, `Ativos/` and the brain into `.cortex/backups/dados-<timestamp>/`, changes nothing and asks nothing). If the command cannot run or does not end by naming the folder it saved (no terminal, no Node.js, no network, an answer such as "Comando não reconhecido", any other error), copy each `Memoria/` file you are about to change, as it is, into `.cortex/backups/dados-[YYYY-MM-DD]/Memoria/` with your file tools. Use a folder that does not exist yet: if `dados-[YYYY-MM-DD]` is already there (an earlier copy from today), name this one `dados-[YYYY-MM-DD]-2` (then `-3`…). Never save over a file that is already inside a copy folder: the older copy is the one that holds how things were. Do not touch any file before one of the two copies exists; one copy per conversation is enough.
   2. Create (or update) `Memoria/_Arquivo/AAAA.md` for each year needed, following the format described in `.agents/cortex/PROTOCOLO_MEMORIA.md`, and copy there every line that is going to be archived.
   3. For each merge, copy the original lines **word for word** into that same archive file, under a `## Fundidas em [YYYY-MM-DD]` heading.
   4. Only then remove the archived lines from the source files and replace each group of duplicates with its single merged line — most recent date first, the oldest date cited in parentheses.
   5. If `Memoria/_Arquivo/` was just created for the first time, add a line for it in `Memoria/META.md`'s File Map.

7. **Check your own work before saying it is done.** Take the lines that existed before and account for every one of them: it is still in its file, or it is in the archive. Report it in one line — *"Das 96 linhas de antes, 62 continuam onde estavam e 34 estão no arquivo; 2 linhas novas de fusão."* If any line cannot be found in either place, name it and say the consolidation is NOT complete.

8. **Show a final summary** of what was moved/merged and where to find it (`Memoria/_Arquivo/AAAA.md`), ending with one line naming the real folder of the safety copy: *"Antes de mexer, guardei uma cópia de como estava em `.cortex/backups/dados-…`."*

## Rules

1. **Never delete information.** Everything that leaves an active file — archived or merged — must already be saved in `Memoria/_Arquivo/` before being removed from the source.
2. **Always confirm as a batch before applying.** Don't ask item by item — show the whole package at once (step 5).
3. **If nothing is eligible**, say so briefly and don't generate an empty report.
4. **Relative paths.** All paths are relative to the workspace root.
5. **Don't judge the business's content** — this skill only organizes the memory's structure, it doesn't evaluate whether the decisions were good or bad.
