---
name: ajuda
description: "Shows what Córtex can do, organized by everyday situation, and suggests the next step. Trigger with: 'ajuda', 'o que você faz?', 'comandos', 'help'."
---

# Skill: Ajuda

This skill quickly answers "what can I do here" without requiring the user to memorize commands. It is organized by the situation the owner is in, not by feature.

## Step by Step

1. **Silently read** `Memoria/META.md`, if it exists, to find out the business name and whether there are custom pillars.
2. Reply with the list below, adapting the closing line to the Córtex's current state.
3. Be direct — no long intro, and do not explain how Córtex works internally.
4. Omit the "Para vender" lines about proposals and margin if `Pilares/04_Comercial.md` and `Pilares/03_Financeiro.md` do not exist; in that case add one line: `🧩 continuar onboarding — para eu aprender seus preços e poder montar propostas`.

## Output Format

```
🧠 **O que eu faço pelo [Nome do Negócio]:**

**No dia a dia**
📡 `radar` — o que está atrasado, o que está parado e em que focar hoje
📝 `registra que...` — guardo uma decisão, lição, pendência ou pessoa (errou? diga `desfaz`)
📋 `anota a reunião` — cole suas anotações e eu separo decisões, pendências e lições
🔎 `o que você sabe sobre...` — digo o que já está registrado, com data
🗓️ `fechar a semana` — 5 minutos: o que andou, o que ficou e o foco da próxima

**Para vender e comunicar**
🧾 `gerar proposta para [cliente]` — proposta pronta, com seus preços e seu tom
✍️ `cria um post sobre...` — post, legenda ou mensagem de WhatsApp do seu jeito
📊 `analisar DRE` — comparo seus números com as suas metas de margem
🔍 `pesquisar concorrência` — quem são, quanto cobram e onde você se diferencia

**Para cuidar do Córtex**
🧩 `continuar onboarding` — completo o que ficou faltando, um bloco por vez
🩺 `saúde do córtex` — mostro o que ainda está em branco
🔄 `revisar córtex` — a cada 6 meses, conferimos o que mudou
🗄️ `consolidar memória` — arquivo o que ficou antigo, sem apagar nada

💬 E pode perguntar qualquer coisa sobre o negócio — "posso dar 15% de desconto?", "qual era o combinado com o fornecedor?" — eu consulto o que está registrado antes de responder.

👉 [Um próximo passo concreto, tirado do estado atual — ex: uma pendência vencida, uma revisão atrasada, ou um bloco ainda não preenchido]
```

## Rules

1. If the Córtex hasn't been set up yet (no `Memoria/META.md`), don't show the list — say in one line that the first step is a 5-minute conversation, and offer to start it now (`montar meu córtex`).
2. Don't invent commands that don't exist in the other skills.
3. No technical jargon in the reply: no file names, no terminal commands, no "skill", "token" or "frontmatter".
4. All file paths are **relative to the workspace root**.
