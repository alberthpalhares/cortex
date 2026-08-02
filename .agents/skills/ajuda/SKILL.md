---
name: ajuda
description: "Shows the available Córtex commands and suggests the next step. Trigger with: 'ajuda', 'o que você faz?', 'comandos', 'help'."
---

# Skill: Ajuda

This skill quickly answers "what can I do here" without requiring the user to memorize commands.

## Step by Step

1. **Silently read** `Memoria/META.md`, if it exists, to find out the business name and whether there are custom pillars.
2. Reply with the command list below, adapting the closing line to the Córtex's current state (e.g. if `META.md` doesn't exist, suggest "montar meu Córtex" instead of the other commands).
3. Be direct — no long intro.

## Output Format

```
🧠 **O que eu sei fazer no Córtex de [Nome do Negócio]:**

📡 `radar` — panorama rápido de pendências, projetos e atrasos
🧠 `montar meu córtex` — inicia a configuração guiada do Córtex (ou `continuar onboarding` para retomar)
📝 `registra que...` — grava uma decisão, lição, pendência ou projeto
🔴 `pendência: ...` — adiciona uma tarefa pendente
✅ `resolvido: ...` — move uma pendência para "resolvidas"
💡 `lição: ...` — registra um aprendizado
🔄 `revisar córtex` — inicia a revisão semestral dos pilares
🔄 `continuar onboarding` — retoma a configuração de onde parou (pilares incompletos, REVISAR pendentes)
🩺 `saúde do córtex` — raio-x do que está faltando preencher
💻 `npx @aksp/cortex doctor` — mesmo diagnóstico acima, direto no terminal, sem gastar tokens de IA
🗄️ `consolidar memória` — arquiva itens antigos sem apagar histórico
🧾 `gerar proposta para [cliente]` — monta uma proposta comercial pronta para envio
📊 `analisar DRE` — cruza uma planilha financeira com suas metas de margem
🔍 `pesquisar concorrência` — mapeia concorrentes e atualiza o Panorama Competitivo
💡 `ideia` ou `nova ideia` — registra uma ideia de melhoria para o Córtex e analisa a viabilidade (arquivo IDEIAS.md local, não versionado)
💬 Pergunte qualquer coisa sobre o negócio — eu consulto os seus Pilares e Memória antes de responder

👉 [Se souber algo do contexto — ex: uma revisão atrasada ou pendências críticas — sugira isso como próximo passo aqui]
```

## Rules

1. If the Córtex hasn't been set up yet (no `Memoria/META.md`), don't list the commands above — just say the onboarding needs to run and offer to start it now.
2. Don't invent commands that don't exist in the other skills.
3. All file paths are **relative to the workspace root**.
