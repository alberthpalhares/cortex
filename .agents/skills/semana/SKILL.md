---
name: semana
description: "Runs a five-minute weekly close: what got resolved, what slipped, one lesson, the top three for the coming days, and progress on the quarterly goal. Trigger with: 'fechar a semana', 'revisão da semana', 'resumo da semana', 'como foi a semana'."
---

# Skill: Fechar a Semana

`radar` shows the present. This skill closes a period: it turns a week of loose entries into one short look back and a clear plan for the coming days. It should take the user about five minutes.

## Step by Step

1. **Get the real system date and weekday** (terminal / date tool). The "week" being closed is the last 7 days ending today (closing on 05/10 covers 29/09 to 05/10). Weeks run Monday to Sunday.
   - **Work out the planning Friday now, with the date tool, and check that it is a Friday:** the coming Friday when today is Saturday, Sunday or Monday; otherwise the Friday of the following week. (Closing on Monday 05/10 plans up to Friday 09/10; closing on Friday 09/10 plans up to Friday 16/10.) Every new priority gets this date.
2. **Silently read:**
   - `Memoria/04_Pessoas_Pendencias.md` — active and resolved pending items
   - `Memoria/03_Projetos.md` — active projects and the `## Metas do Trimestre` section
   - `Memoria/01_Decisoes.md` and `Memoria/02_Licoes.md` — entries dated within the week
   - the `Próxima revisão sugerida` line of `Memoria/META.md`
3. **Show the look-back** (first block of the output format), built only from what is recorded.
4. **Clear the backlog, only if there is one.** Only `🔴 **[DEADLINE …]**` lines can be overdue — `[AGUARDANDO]` and `[SEM PRAZO]` items never are. If any deadline passed more than 14 days ago, ask about those in ONE message (at most 5 items, the oldest first):
   *"Estes estão vencidos há mais de duas semanas. Para cada um, me diz: novo prazo, deixar de lado ou manter?"*
   - new deadline → update the date on that same line
   - deixar de lado → move it to "Pendências Resolvidas" as `- 🚫 **[YYYY-MM-DD]** [Texto] *(deixada de lado)*` — it is not counted as resolved
   - manter → leave it as it is
   Skip this step entirely when nothing is that old. This is what keeps the radar short and true after a few months.
5. **Ask two questions, one at a time:**
   - *"Qual foi a principal lição desta semana? Pode ser um acerto ou um erro."* — if the user has nothing, move on without insisting.
   - *"Quais são as 3 coisas mais importantes até [dia da semana, DD/MM]?"* — using the planning Friday from step 1. Always put 2 or 3 candidates in the question itself, taken from the overdue and upcoming items, so the user only has to confirm or adjust. When a candidate is an active line whose deadline has already passed, say the change in the suggestion itself — *"[Texto] — o prazo passa de DD/MM para sexta, DD/MM"* — so the user's yes covers the new date.
6. **Quarterly goal** (quarters: T1 = Jan–Mar, T2 = Apr–Jun, T3 = Jul–Sep, T4 = Oct–Dec):
   - A line in `## Metas do Trimestre` is tagged with a quarter that has already ended → *"O trimestre virou. A meta era [meta] — bateu?"* Move that line to a `## Metas Anteriores` section of `Memoria/03_Projetos.md` (create the section if it does not exist), adding the outcome and today's date. Then, only if there is no line for the current quarter yet, ask for the goal of the new quarter.
   - The goal is from the current quarter → ask in one line how it is going and update its progress note.
   - There is no goal → ask once: *"Você tem uma meta para este trimestre? Uma só já ajuda — ex: 'fechar 5 clientes novos'."* If the user declines, do not ask again this session.
7. **Write, without asking for another confirmation** (new lines are memory appends; the only existing lines you may change are the goal's progress note from step 6 and an overdue priority, as described below — and both are shown in the close):
   - the lesson → `Memoria/02_Licoes.md`, in the `registrar` format `- **[YYYY-MM-DD]** **[CATEGORIA]** [Texto]`, under the section that fits it (a success goes under the "Acertos" section, a mistake under the "Erros" one)
   - the three priorities → `Memoria/04_Pessoas_Pendencias.md` under "Pendências Ativas", as `- 🔴 **[DEADLINE YYYY-MM-DD]** [Texto]` with the planning Friday as the deadline. A priority that is already a `🔴 **[DEADLINE …]**` line for the same task is not duplicated:
     - its deadline has already passed → update the deadline on its existing line to the planning Friday, so a chosen priority never stays overdue;
     - its deadline is still ahead → that is a real due date: leave the line untouched and show its own date in the close.
   - Never reword, convert or remove an `[AGUARDANDO]` or `[SEM PRAZO]` line. A priority about something that is waiting ("cobrar o Grupo Andradas") is a new line; the waiting line stays as it is.
   - the goal or its progress → `Memoria/03_Projetos.md` under `## Metas do Trimestre`, as `- 🎯 **[AAAA-T#]** [Meta] — [progresso, com data]`
8. **Close** with the second block of the output format, and nothing after it.

## Output Format

Look-back (step 3):

```
🗓️ **SEMANA DE [DD/MM] A [DD/MM] — [Nome do Negócio]**

✅ **Resolvido:** [N] itens
   • [item resolvido na semana]

⏳ **Ficou para trás:**
   • [pendência vencida ou que não andou]

📝 **Registrado na semana:** [N] decisões, [N] lições
🎯 **Meta do trimestre:** [meta e progresso, ou "ainda não definida"]
```

Close (step 8):

```
✅ Semana fechada.

📌 **Foco dos próximos dias:**
   1. [prioridade] — até [dia da semana, DD/MM]
   2. [prioridade] — até [dia da semana, DD/MM]
   3. [prioridade] — até [dia da semana, DD/MM]

[✏️ Prazo atualizado: [item] — antes DD/MM → agora DD/MM — SOMENTE para prioridade que já estava na lista e estava vencida]
[🎯 Meta: antes "[progresso anterior]" → agora "[progresso novo]" — SOMENTE se a nota de progresso mudou]
[🔄 Já está na hora de revisar o Córtex — quando puder, diga "revisar córtex". — SOMENTE se a data de revisão do META.md já passou ou falta menos de 2 semanas]

Na próxima vez, é só dizer "radar".
```

## Rules

1. **Five minutes.** Two questions plus the goal check, and the backlog question only when there is a backlog. Do not turn this into an interview.
2. **Report only what is recorded.** If the week has no entries, say so plainly and go straight to the questions — an empty week is useful information, not a failure.
3. **Never mark something as resolved on your own.** If an item looks done, ask.
4. **Real dates only.** Never infer the date from the conversation, and never do calendar sums in your head: compute dates and weekdays with the date tool.
5. **One undo for the whole close.** If the user says "desfaz" right after, remove every line this close wrote and restore the ones it changed (see `registrar`, "Undo and Correct").
6. **Relative paths.** All paths are relative to the workspace root.
