---
name: radar
description: "Delivers a fast, up-to-date snapshot of all active pending items and project status to support decision-making. Use at the start of the day or when the user asks for a general status. Trigger with: 'radar', 'status', 'como estamos?', 'briefing'."
---

# Skill: Radar

You've just been triggered to run the business's **Radar**. The goal of this skill is to give the user an instant snapshot (10 to 15 lines max) of where the current bottleneck is.

## Step by Step

1. **Silently read** `Memoria/META.md` to find out the business name.
2. **Silently read** the pending items file: `Memoria/04_Pessoas_Pendencias.md`
3. **Silently read** the projects file: `Memoria/03_Projetos.md`
4. **Get the real system date** (via terminal/whatever date tool is available) — never infer the date from the conversation text. Compare that real date against the listed deadlines to classify items as late/urgent.
5. If the `Próxima revisão sugerida` in `META.md` has already passed or is less than 2 weeks from today's real date, include a line suggesting `revisar córtex`.
5.5. Take a quick look at the size of `Memoria/01_Decisoes.md` and `Memoria/02_Licoes.md` (approximate line count). If either is large (more than ~80 lines), include a line suggesting `consolidar memória` (the `consolidar` skill) — no need to open the files in full for this, a quick scan is enough.
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

[🔄 **Sugestão:** já passou da data de revisão semestral do Córtex — quer rodar "revisar córtex"? — SOMENTE se aplicável, ver passo 5]
[🗄️ **Sugestão:** a Memória está grande — quer rodar "consolidar memória"? — SOMENTE se aplicável, ver passo 5.5]

💡 O que você gostaria de focar hoje?
```

## Formatting Rules
- Never bring up resolved pending items.
- If there's nothing overdue, write "Nenhum atraso crítico hoje. ✅".
- Be extremely concise. Don't rewrite the whole task description, just its core. The user already knows the projects.
- All file paths are **relative to the workspace root**. Never use absolute paths.
