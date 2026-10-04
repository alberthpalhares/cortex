---
name: radar
description: "Delivers a fast, up-to-date snapshot of all active pending items and project status to support decision-making. Use at the start of the day or when the user asks for a general status. Trigger with: 'radar', 'status', 'como estamos?', 'briefing'."
---

# Skill: Radar

You've just been triggered to run the business's **Radar**. The goal of this skill is to give the user an instant snapshot (10 to 15 lines max) of where the current bottleneck is.

## Step by Step

1. **Silently read** `Memoria/META.md` to find out the business name.
2. **Silently read** the pending items file: `Memoria/04_Pessoas_Pendencias.md`
3. **Silently read** the projects file: `Memoria/03_Projetos.md`, including its `## Metas do Trimestre` section.
4. **Get the real system date** (via terminal/whatever date tool is available) — never infer the date from the conversation text. Compare that real date against the listed deadlines to classify items as late/urgent.
5. **Pick at most ONE suggestion line**, the first that applies in this order — a radar with three nudges gets ignored:
   1. The `Próxima revisão sugerida` in `META.md` has passed or is less than 2 weeks away → suggest `revisar córtex`.
   2. `Memoria/01_Decisoes.md` or `Memoria/02_Licoes.md` is large (more than ~80 lines; a quick scan is enough) → suggest `consolidar memória`.
   3. The most recent date stamp anywhere in `Memoria/` is more than 7 days old → the inactivity line.
   4. A mandatory pillar still has `<!-- REVISAR -->` markers, or there is no quarterly goal → offer **one** small next step, naming how long it takes.
6. Generate a **Mini Radar Report** strictly in this format (use emojis and be concise):

```
📡 **RADAR [NOME DO NEGÓCIO] — [Data de Hoje]**

🔴 **ATRASADOS / URGENTES:**
   • [Listar apenas pendências cujo deadline já passou ou vence hoje]
   • [Listar pendências ativas com deadline próximo na mesma semana]

⏳ **AGUARDANDO TERCEIROS:**
   • [Listar itens travados na mão de clientes/parceiros]

📂 **PROJETOS ATIVOS:**
   • [Nome do Projeto] - [Status Atual]

🎯 **META DO TRIMESTRE:** [meta — progresso] — SOMENTE se houver meta registrada

[UMA linha de sugestão, conforme o passo 5 — exemplos:]
[🔄 Já passou da data de revisão do Córtex — quer rodar "revisar córtex"?]
[🗄️ A Memória está grande — quer rodar "consolidar memória"?]
[🕰️ Faz [N] dias que nada é registrado. Aconteceu algo que vale guardar? É só dizer "registra que..."]
[🧩 Ainda não sei seu tom de voz — 2 minutos para eu aprender? Diga "continuar onboarding".]

💡 O que você gostaria de focar hoje?
```

## Formatting Rules
- Never bring up resolved pending items.
- If there's nothing overdue, write "Nenhum atraso crítico hoje. ✅".
- Omit a whole block (e.g. "AGUARDANDO TERCEIROS") when it has no items, instead of printing an empty heading.
- Be extremely concise. Don't rewrite the whole task description, just its core. The user already knows the projects.
- On Fridays (or when the user says the week is ending), the closing line may be: "Quer fechar a semana? Diga `fechar a semana`."
- All file paths are **relative to the workspace root**. Never use absolute paths.
