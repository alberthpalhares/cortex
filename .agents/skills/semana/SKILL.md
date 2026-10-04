---
name: semana
description: "Runs a five-minute weekly close: what got resolved, what slipped, one lesson, the top three for next week, and progress on the quarterly goal. Trigger with: 'fechar a semana', 'revisão da semana', 'resumo da semana', 'como foi a semana'."
---

# Skill: Fechar a Semana

`radar` shows the present. This skill closes a period: it turns a week of loose entries into one short look back and a clear plan for the next week. It should take the user about five minutes.

## Step by Step

1. **Get the real system date** (terminal / date tool). The "week" is the last 7 days ending today.
2. **Silently read:**
   - `Memoria/04_Pessoas_Pendencias.md` — active and resolved pending items
   - `Memoria/03_Projetos.md` — active projects and the `## Metas do Trimestre` section
   - `Memoria/01_Decisoes.md` and `Memoria/02_Licoes.md` — entries dated within the week
3. **Show the look-back** (first block of the output format), built only from what is recorded.
4. **Ask two questions, one at a time:**
   - *"Qual foi a principal lição desta semana? Pode ser um acerto ou um erro."* — if the user has nothing, move on without insisting.
   - *"Quais são as 3 coisas mais importantes para a semana que vem?"* — suggest candidates from the overdue and upcoming items so the user only has to confirm or adjust.
5. **Quarterly goal:**
   - If `## Metas do Trimestre` has a goal, ask in one line how it is going and update its progress note.
   - If it is empty, ask once: *"Você tem uma meta para este trimestre? Uma só já ajuda — ex: 'fechar 5 clientes novos'."* If the user declines, do not ask again this session.
6. **Write, without asking for another confirmation** (these are memory appends):
   - the lesson → `Memoria/02_Licoes.md`, in the `registrar` format `- **[YYYY-MM-DD]** **[CATEGORIA]** [Texto]`
   - the three priorities → `Memoria/04_Pessoas_Pendencias.md` under "Pendências Ativas", as `- 🔴 **[DEADLINE YYYY-MM-DD]** [Texto]` with the deadline set to the end of next week, skipping any that already exist there
   - the goal or its progress → `Memoria/03_Projetos.md` under `## Metas do Trimestre`, as `- 🎯 **[AAAA-T#]** [Meta] — [progresso, com data]`
7. **Close** with the second block of the output format.

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

Close (step 7):

```
✅ Semana fechada.

📌 **Foco da próxima semana:**
   1. [prioridade]
   2. [prioridade]
   3. [prioridade]

Na segunda, é só dizer "radar".
```

## Rules

1. **Five minutes.** Two questions plus the goal check. Do not turn this into an interview.
2. **Report only what is recorded.** If the week has no entries, say so plainly and go straight to the questions — an empty week is useful information, not a failure.
3. **Never mark something as resolved on your own.** If an item looks done, ask.
4. **Real dates only.** Never infer the date from the conversation.
5. **Relative paths.** All paths are relative to the workspace root.
