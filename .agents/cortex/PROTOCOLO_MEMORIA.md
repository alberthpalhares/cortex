# Living Memory Protocol

*This protocol keeps Córtex's Memory lean and reliable over time, without ever silently deleting history. It's the "engine" behind the `consolidar` skill. It ships with the framework (`.agents/cortex/`) and is refreshed by `cortex update`; never copy it into the user's folders.*

## Why it exists

Córtex's core promise is saving context: the AI reads `Pilares/` and `Memoria/` before answering. If `Memoria/` only ever grows, the reading cost climbs indefinitely, and old decisions — already revoked or superseded — keep being read as if they still applied. This protocol prevents both problems at once.

## Rules

1. **Archive, never delete.** Items in `Memoria/02_Licoes.md`, and projects marked `[CONCLUÍDO]`, older than 12 months — counted from the real system date and from the stamp at the start of the line — are candidates for archiving. A routine (a `🔁` line under `## Rotinas`) is never archived while it is there. A month's result (a `📊` line under `## Resultado Mês a Mês`) is never archived or merged: the same month of earlier years is what a new month is compared with. A decision that is still in force is never archived by age: in `Memoria/01_Decisoes.md` only revoked decisions move (rule 2). Resolved pending items become candidates sooner, after 60 days: `Memoria/04_Pessoas_Pendencias.md` is read on every `radar`, so it must stay short. Everything is moved, never deleted, to `Memoria/_Arquivo/AAAA.md` (one file per year, created on demand, where `AAAA` is the year of the batch's oldest item).
2. **Revoked decisions are marked, not removed.** When a decision in `01_Decisoes.md` stops applying, the original line is NEVER deleted. It gets the prefix `[REVOGADA em YYYY-MM-DD: motivo/nova decisão]` and stays in its original section until the next consolidation, when it can be moved to the matching year's file in `_Arquivo/`.
3. **Duplicate merging keeps the originals.** Items that essentially say the same thing (the same decision restated, the same lesson repeated in different words) are merged into a single line, keeping the most recent date and citing the oldest one in parentheses. Before merging, the original lines are copied word for word to `Memoria/_Arquivo/AAAA.md`, under a `## Fundidas em [data]` heading. Lines that differ in a number, a proper name or a condition (10% vs 15%, client A vs client B) are NOT duplicates: when in doubt, do not merge.
4. **Consolidation triggers.** The `consolidar` skill runs:
   - (a) as part of `cortex-revisao`'s Closing step, every semi-annual review;
   - (b) on demand, when the user says something like "consolidar memória";
   - (c) on `radar`'s suggestion, when at least 5 lines are eligible for archiving under this protocol (see `radar/SKILL.md`). File size alone is never the trigger.
5. **Nothing is lost.** Archiving is not deleting. Everything that leaves an active file stays accessible in `Memoria/_Arquivo/`, and `Memoria/META.md` must index that folder as soon as the first archive file is created.
6. **Re-read before writing.** The folder may be open on two computers, shared with a partner or kept in a cloud-synced folder, so a file can change between the moment the AI read it and the moment it writes. Every skill that writes in `Memoria/` (`registrar`, `semana`, `consolidar`, `cortex-revisao`, `analisador-dre`) reads the target file again immediately before writing, adds or changes only its own lines, and never rewrites a whole file from an earlier read.

## `Memoria/_Arquivo/AAAA.md` format

Same section structure as the source file (e.g. `## Preços e Políticas`, `## Erros e Oportunidades Perdidas`), with a header line at the top stating its origin:

```markdown
# Arquivo — AAAA

> Itens arquivados de Memoria/01_Decisoes.md e Memoria/02_Licoes.md em [data da consolidação].

## Preços e Políticas
- **[YYYY-MM-DD]** Descrição da decisão arquivada.
```

## What this protocol does NOT do

- It doesn't decide on its own what's "irrelevant" — only what's **old enough** to leave the active file.
- It never deletes anything before the item is already preserved in `_Arquivo/`.
- It never runs fully silently: the `consolidar` skill always shows a summary of what will be moved/merged before applying it.
