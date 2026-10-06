---
name: cortex-revisao
description: "Semi-annual Córtex review. Walks through each pillar, showing what was recorded during onboarding, and asks whether it still reflects the business's reality. Trigger with: 'revisar córtex', 'revisão do córtex', 'revisar pilares', or when Radar warns the review date is near."
---

# Skill: Córtex — Revisão Semestral

This skill runs a **structured review** of the Córtex knowledge base. The goal is to make sure what was said during onboarding is still true — and to update whatever changed.

## When to Trigger

- `Memoria/META.md` holds the onboarding date and the suggested review date
- If the review date has already passed or is close (< 2 weeks), the Business Partner Agent should proactively suggest it
- The user can also trigger it manually at any time

## Review Philosophy

> **This is not rework. It's a 15-minute conversation to keep the business's brain up to date.**

The review does NOT redo onboarding from scratch. It:
1. Shows what's currently registered in each pillar
2. Asks: *"Isso ainda é verdade?"*
3. If yes → moves on
4. If no → asks what changed and updates the file

## Review Flow

### Preparation

1. Read `Memoria/META.md` to learn the business name and the date of the last onboarding/review
2. List every `.md` file inside `Pilares/` to know which pillars exist (including custom pillars beyond the 9 standard ones)
3. Read each pillar file found
4. **Before the first change of this review** (a pillar, the Memory or the brain — not before reading), make a safety copy: run `npx @aksp/cortex@latest backup` (it only copies `Pilares/`, `Memoria/`, `Ativos/` and the brain into `.cortex/backups/dados-<timestamp>/`, changes nothing and asks nothing). If the command cannot run or does not end by naming the folder it saved (no terminal, no Node.js, no network, an answer such as "Comando não reconhecido", any other error), copy each file you are about to change, as it is, into `.cortex/backups/dados-[YYYY-MM-DD]/` (same relative path) with your file tools, before saving it. Use a folder that does not exist yet: if `dados-[YYYY-MM-DD]` is already there (an earlier copy from today), name this one `dados-[YYYY-MM-DD]-2` (then `-3`…). Never save over a file that is already inside a copy folder: the older copy is the one that holds how things were. Say it once, in one line, naming the real folder: *"Antes de mexer, guardei uma cópia de como está hoje em `.cortex/backups/dados-…`."* One copy covers the whole review, the consolidation step included; a review that changes nothing needs none.

### For Each Pillar

Follow this script:

1. **Show a 3-5 line summary** of the pillar's current content
2. Ask: *"Isso ainda reflete a realidade do [nome do negócio]? Mudou algo?"*
3. If the user says something changed:
   - Ask what changed
   - Propose the specific edit
   - Show before and after
   - Ask for confirmation before saving
4. If the user says it's fine → move to the next pillar

### Checking for New Pillars

After going through the existing pillars:

1. Ask: *"Surgiu alguma área nova no negócio que ainda não está registrada?"*
2. Give examples based on what does NOT exist yet (Jurídico? Inventário? Identidade Visual? Or something totally different?)
3. If yes → run a mini-onboarding for just that new pillar and **immediately add it to `Memoria/META.md`'s File Map** (and to the "Pilares Customizados" section if numbered 10+). Don't leave it for the Closing step.
4. If no → move on to Memory

### Quick Memory Review

1. Read `Memoria/04_Pessoas_Pendencias.md`
2. Show the active pending items and ask: *"Alguma dessas já foi resolvida ou pode ser removida?"*
3. Move resolved ones to the "Pendências Resolvidas" section
4. Read `Memoria/03_Projetos.md`
5. Ask: *"Algum projeto mudou de status ou pode ser arquivado?"*
6. Update as needed

### Memory Consolidation (Living Memory Protocol)

Now apply `.agents/cortex/PROTOCOLO_MEMORIA.md`: follow the `consolidar` skill's flow to identify items eligible for archiving (older than 12 months; resolved pending items older than 60 days), decisions already marked `[REVOGADA ...]` ready to move, and duplicates. Show the batch summary and ask for confirmation before applying it, exactly as the `consolidar` skill describes. If nothing is eligible, silently skip this step and move to Closing.

### Closing

1. **Get the real system date** (via terminal/whatever date tool is available) — never estimate. Update the review date in `Memoria/META.md`:
   ```
   Última revisão: [data real de hoje]
   Próxima revisão sugerida: [data real de hoje + 6 meses]
   ```
2. **Check `Memoria/META.md`'s File Map against the real file list in `Pilares/` and `Memoria/`.** Any file that exists on disk and isn't in the map must be added now — this is the review's last chance to fix an out-of-sync META.
3. **Update the brain (`Frameworks/CEREBRO.md`).** It is the SOURCE; the root files (`AGENTS.md` etc.) are artifacts compiled from it. Identify which of the three states the Córtex is in:

   **(a) Has `CEREBRO.md` WITH the `CORTEX:BUSINESS` / `CORTEX:FRAMEWORK` markers (current format).**
   Edit **only inside the `CORTEX:BUSINESS` region** — update the dates in the "Ciclo de Revisão" section and the pillar list, if it changed. **Never edit the `CORTEX:FRAMEWORK` region**: it's regenerated by `npx @aksp/cortex update`, and anything written there will be lost. When done, run `npx @aksp/cortex sync --force` (or ask the user to) to recompile the instruction files. Without `--force` the command only shows its plan when there is no interactive terminal, and nothing is written.

   **(b) Has `CEREBRO.md` WITHOUT the markers (Córtex between v0.7.0 and v0.10.0).**
   Offer the migration: *"Seu cérebro ainda é um bloco único. Posso separá-lo em duas áreas — a do seu negócio e a das regras do Córtex? A vantagem é que, daí em diante, as atualizações do framework chegam sozinhas sem nunca mexer nos seus dados."* If yes:
   - Wrap the business part (identity, review dates, pillar list) between `<!-- CORTEX:BUSINESS:START -->` and `<!-- CORTEX:BUSINESS:END -->`.
   - **Replace** the entire operating-rules part with the literal content of `.agents/cortex/brain.framework.md`, wrapped in `<!-- CORTEX:FRAMEWORK:START -->` and `<!-- CORTEX:FRAMEWORK:END -->`. If the user had their own custom rules there, show them first and ask where they want to keep them (the natural place is the business region).
   - Run `npx @aksp/cortex sync --force` at the end.

   **(c) Doesn't have `CEREBRO.md` (Córtex older than v0.7.0, with content duplicated across the 5 root files).**
   Copy the content of any one of the root files (they should be identical) into `Frameworks/CEREBRO.md` and follow case (b) exactly to split it into two layers.

   > In any case: if any root file still has an old-style "pointer" (something like *"leia `Frameworks/CEREBRO.md`"*), it's stale — `sync` will replace it with the full compiled brain, which is what guarantees the AI tool reads the instructions without depending on following any indirection.
4. **Show a summary** of what changed:

> *"✅ Revisão do Córtex concluída!*
>
> *Alterações feitas:*
> - *Pilar Comercial: Atualizado preço do serviço X*
> - *Pilar Cultura: Adicionado novo valor*
> - *3 pendências movidas para Resolvidas*
> - *Projeto Y arquivado*
> - *4 itens antigos movidos para Memoria/_Arquivo/2025.md (se aplicável)*
>
> *Próxima revisão sugerida: [data]. Até lá, continue usando o radar e registrando suas decisões! 🧠"*

## Rules

1. **Never delete content without confirming.** Always show what will be removed or changed.
2. **Be fast.** If a pillar hasn't changed, spend 10 seconds on it and move on.
3. **Record everything.** Any change made must be reflected both in the pillar and in META.md.
4. **Suggest proactively.** If the user's business grew (hired someone, changed models), proactively suggest adding new pillars.
5. **Relative paths.** All paths are relative to the workspace root. Never use absolute paths.
6. **Point out gaps.** If you find leftover `<!-- REVISAR -->` markers from a Quickstart (or older) onboarding, use the review to complete them together with the user, or suggest running the `saude` skill for a full X-ray of what's missing.
