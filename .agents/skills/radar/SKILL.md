---
name: radar
description: "Delivers a fast, up-to-date snapshot of all active pending items and project status to support decision-making. Use at the start of the day or when the user asks for a general status, including questions like 'quais são minhas pendências?'. Trigger with: 'radar', 'status', 'como estamos?', 'briefing'."
---

# Skill: Radar

You've just been triggered to run the business's **Radar**. The goal of this skill is to give the user an instant snapshot (10 to 15 lines max) of where the current bottleneck is. This skill only reads: it never changes a file.

"Briefing" alone is the radar. A briefing about one person or one meeting ("briefing da reunião com a Marina", "preparar reunião com o Grupo Andradas") is not: follow the `lembrar` skill instead.

## Step by Step

1. **Silently read** `Memoria/META.md` to find out the business name.
2. **Silently read** the pending items file: `Memoria/04_Pessoas_Pendencias.md`
3. **Silently read** the projects file: `Memoria/03_Projetos.md`, including its `## Metas do Trimestre` section.
4. **Get the real system date and weekday** (via terminal/whatever date tool is available) — never infer them from the conversation text. If no tool gives you the date, ask the user what day it is, once. Weeks run Monday to Sunday.
   - Compare the date against every deadline. Any weekday you print must come from the date tool, not from a sum in your head.
   - For every line that ends with `*(desde YYYY-MM-DD)*`, work out how many days ago that was: the report prints `há N dias`, never the raw date. A line without `(desde …)` simply shows no age — never estimate one and never add the tag to an old line.
5. **Sort every active pending item into one of three groups** — nothing the user recorded may disappear:
   - **Atrasados / urgentes:** deadline already passed, due today, or due later this week (up to this Sunday).
   - **Aguardando terceiros:** `[AGUARDANDO]` items. When the tag names someone (`[AGUARDANDO: Marina]`), that name goes in the line.
   - **Depois / sem prazo:** deadlines beyond this week, and `[SEM PRAZO]` items.

   Items in "Pendências Resolvidas" are never shown.
6. **If there is no active pending item and no active project, stop here** and reply as described in "Empty radar" below.
7. **Pick at most ONE suggestion line** — a radar with three nudges gets ignored.
   - If `.cortex/novidades.md` exists and has at least one `- ` line, the suggestion is always the "novidades" line. (That is a file in the hidden `.cortex/` folder at the workspace root. `.agents/cortex/novidades.json` is a different file and is never read here.)
   - Otherwise go through the list below, but **start at a different item each day** so the same nudge is not repeated: start at item ((day of the month − 1) mod 6) + 1 — on the 1st start at item 1, on the 2nd at item 2 … on the 6th at item 6, on the 7th at item 1 again — and move down the list, wrapping around from 6 to 1, until one applies. Show that one. Check them one at a time, in that order, opening only the file each item names. An item counts as "does not apply" only after you opened its file and checked — never skip one to save a read. A missing file means that item does not apply.
     1. The `Próxima revisão sugerida` in `META.md` has passed or is less than 2 weeks away → suggest `revisar córtex`.
     2. There are at least 5 lines `consolidar` can actually archive: `[REVOGADA` lines in `Memoria/01_Decisoes.md`, entries stamped more than 12 months ago in `Memoria/02_Licoes.md`, and resolved pending items stamped more than 60 days ago (already read in step 2; a resolved line with no date stamp does not count). A decision still in force is never archivable, however old. Size alone is not a reason — never suggest it for fewer than 5 eligible lines.
     3. The most recent date written in `Memoria/` — a `**[YYYY-MM-DD]**` stamp, `(desde …)`, `(atualizado em …)` or a trailing `(YYYY-MM-DD)` — is more than 7 days old → the inactivity line. Ignore future dates (deadlines, the next review) and `META.md`. Exactly 7 days is not "more than 7".
     4. `Pilares/03_Financeiro.md` exists but `margem_alvo` or `margem_minima` is empty → offer `descobrir minha margem`.
     5. One of the 4 mandatory pillars (`Pilares/01_Estrategia.md`, `02_Cultura.md`, `05_Comunicacao.md`, `06_Operacao.md`) still has `<!-- REVISAR -->` markers, or no quarterly goal is recorded at all → offer **one** small next step, naming how long it takes. (A goal whose quarter ended is already handled by the 🎯 line — do not repeat it here.)
     6. `checkedAt` (or, if absent, `updatedAt`) in `.cortex/version.json` is more than 90 days old → the "atualizar" line. Skip quietly if the file is missing or has neither date (a folder downloaded as a ZIP: the count starts at its first `update`).
8. Generate a **Mini Radar Report** strictly in this format (use emojis and be concise):

```
📡 **RADAR [NOME DO NEGÓCIO] — [DD/MM/AAAA]**

🔴 **ATRASADOS / URGENTES:**
   • [Pendência cujo prazo já passou] — venceu em DD/MM [as mais antigas primeiro, no máximo 5]
   • [… e mais N atrasadas — SOMENTE se houver mais de 5 atrasadas]
   • [Pendência que vence hoje ou ainda nesta semana] — [hoje | dia da semana, DD/MM] [sempre todas]

⏳ **AGUARDANDO TERCEIROS:**
   • [Quem se aguarda, quando a etiqueta tiver nome] — [núcleo do item, sem a etiqueta] — há N dias [quando a linha tiver "(desde …)"]

🗂️ **DEPOIS / SEM PRAZO:**
   • [Pendência com prazo depois desta semana] — DD/MM [a mais próxima primeiro, no máximo 3; depois "… e mais N"]
   • Sem prazo: [N] itens, o mais antigo há X dias [com um item só: "Sem prazo: 1 item, há X dias"]

📂 **PROJETOS ATIVOS:**
   • [Nome do Projeto] - [Status Atual]

🎯 **META DO TRIMESTRE:** [meta — progresso]

[UMA linha de sugestão, conforme o passo 7 — exemplos:]
[✨ O Córtex foi atualizado e tem novidade para você — diga "novidades".]
[🔄 Já passou da data de revisão do Córtex — quer rodar "revisar córtex"?]
[🗄️ Há itens antigos que já podem ir para o arquivo — quer rodar "consolidar memória"? Nada é apagado.]
[🕰️ A anotação mais recente é de [N] dias atrás. Aconteceu algo depois disso que vale guardar? É só dizer "registra que..."]
[💰 Ainda não sei a sua margem, então não consigo conferir preços e descontos. 5 minutos? Diga "descobrir minha margem".]
[🧩 Ainda não sei seu tom de voz — 2 minutos para eu aprender? Diga "continuar onboarding".]
[📦 Faz [N] meses que o Córtex não é atualizado. Para buscar a versão nova, rode no terminal desta pasta: npx @aksp/cortex@latest update (seus dados não são tocados).]

💡 O que você gostaria de focar hoje?
```

## Empty radar

When step 6 applies, do not print the report above. Reply with the lines below and nothing else — no empty headings and no closing question:

```
📡 **RADAR [NOME DO NEGÓCIO] — [Data de Hoje]**
Seu radar está limpo. O que está na sua cabeça hoje? Conta tudo de uma vez que eu organizo.
[🎯 linha da meta do trimestre — SOMENTE se houver meta registrada]
[✨ ou 🔄 — SOMENTE se houver novidades pendentes ou se a data de revisão já passou; nenhuma outra sugestão aqui]
```

Treat the answer as a batch for the `registrar` skill ("anota a reunião" flow): one list, one confirmation.

## Formatting Rules
- Never bring up resolved pending items.
- **Overdue items are capped at 5 lines**, the longest-overdue first; summarize the other overdue ones as "… e mais N atrasadas". Items due today or later this week are always listed, every one of them, and never count toward that limit — a reminder must show up by name on its day.
- If nothing is overdue or due this week, keep the 🔴 heading with a single line under it: "Nenhum atraso crítico hoje. ✅".
- A waiting item that has been stuck for more than 10 days gets `— quer que eu escreva a cobrança?` at the end of its line. Add it to one item only: the oldest. If the user says yes, write it as the `conteudo` skill describes ("Message to one person").
- **Proposals out with a client.** A waiting line whose text starts with `Resposta da proposta` is a proposal the user sent (written by `registrar`). Keep the service and the `R$` value in its line; if it has `vale até YYYY-MM-DD`, show `vale até DD/MM`, or `venceu em DD/MM` once that date has passed. A proposal waiting for more than 3 days, or past its `vale até` date, gets `— quer uma mensagem de retorno?` at the end, never the "cobrança" line above. Add it to one proposal only: the oldest. A proposal line with no `(desde …)` and no `vale até` just shows up with no age and no nudge. If the user says yes, write that message as the `conteudo` skill describes ("Message to one person").
- "Sem prazo" items are only counted, and the age shown is that of the oldest one that has `(desde …)`. Exception: when the user asked for the pending items themselves ("quais são minhas pendências?", "mostra todas"), list them by name too.
- **Quarterly goal.** Quarters: T1 = Jan–Mar, T2 = Apr–Jun, T3 = Jul–Sep, T4 = Oct–Dec. Show the goal tagged with the current quarter. If the only goal on record is tagged with a quarter that has already ended, the 🎯 line becomes: `🎯 **META DO TRIMESTRE:** O trimestre virou — a meta era "[meta]". Diga "fechar a semana" para fechar essa e definir a próxima.` With no goal at all, omit the line.
- Omit a whole block (e.g. "AGUARDANDO TERCEIROS") when it has no items, instead of printing an empty heading.
- Be extremely concise. Don't rewrite the whole task description, just its core. The user already knows the projects.
- On Fridays (or when the user says the week is ending), the closing line may be: "Quer fechar a semana? Diga `fechar a semana`."
- All file paths are **relative to the workspace root**. Never use absolute paths.
