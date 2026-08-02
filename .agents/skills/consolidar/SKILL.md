---
name: consolidar
description: "Applies the Living Memory Protocol: archives old Memory items, marks revoked decisions as movable, and merges duplicates — without ever deleting history. Trigger with: 'consolidar memória', 'arquivar memória', 'a memória está grande'."
---

# Skill: Consolidar Memória

This skill executes `Frameworks/PROTOCOLO_MEMORIA.md`. It keeps `Memoria/` lean over time, moving (never deleting) what has gone stale or redundant into `Memoria/_Arquivo/`.

## Step by Step

1. **Check whether there's any Memory.** If neither `Memoria/01_Decisoes.md` nor `Memoria/02_Licoes.md` exist, tell the user there's nothing to consolidate yet. Stop here.

2. **Get the real system date** (via terminal/whatever date tool is available) — never estimate. Every "more than 12 months" calculation depends on it.

3. **Read the consolidation candidates:**
   - `Memoria/01_Decisoes.md` — look for lines already marked `[REVOGADA em ...]`.
   - `Memoria/02_Licoes.md` — look for items older than 12 months from today's real date.
   - `Memoria/03_Projetos.md` — projects with `[CONCLUÍDO]` status for more than 12 months (if applicable).
   - `Memoria/04_Pessoas_Pendencias.md` — old items in the "Pendências Resolvidas" section (more than 12 months).

4. **Identify duplicates.** Within each file, look for items that essentially say the same thing (the same decision restated, the same lesson repeated). Flag them for merging.

5. **Assemble a batch summary** — never apply item by item without showing the whole set first:

   ```
   🗄️ **CONSOLIDAÇÃO DE MEMÓRIA — [Nome do Negócio]**

   📦 Itens a arquivar (mais de 12 meses ou já revogados):
      • [Memoria/02_Licoes.md] "..." (YYYY-MM-DD)
      • [Memoria/01_Decisoes.md] "..." — revogada em YYYY-MM-DD

   🔗 Itens a fundir (duplicatas):
      • "..." + "..." → versão única mantida

   Isso vai mover esses itens para Memoria/_Arquivo/AAAA.md — nada é apagado, só sai dos arquivos ativos. Posso aplicar?
   ```

6. **Only after the user confirms**, apply it:
   - Create (or update) `Memoria/_Arquivo/AAAA.md` for each year needed, following the format described in `Frameworks/PROTOCOLO_MEMORIA.md`.
   - Remove the moved lines from the source files.
   - Merge the identified duplicates into a single line, keeping the most recent date.
   - If `Memoria/_Arquivo/` was just created for the first time, add a line for it in `Memoria/META.md`'s File Map.

7. **Show a final summary** of what was moved/merged and where to find it (`Memoria/_Arquivo/AAAA.md`).

## Rules

1. **Never delete information.** Everything that leaves an active file must already be saved in `Memoria/_Arquivo/` before being removed from the source.
2. **Always confirm as a batch before applying.** Don't ask item by item — show the whole package at once (step 5).
3. **If nothing is eligible**, say so briefly and don't generate an empty report.
4. **Relative paths.** All paths are relative to the workspace root.
5. **Don't judge the business's content** — this skill only organizes the memory's structure, it doesn't evaluate whether the decisions were good or bad.
