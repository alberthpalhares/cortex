---
name: ajuda
description: "Mostra os comandos disponíveis do Córtex e sugere o próximo passo. Acione com: 'ajuda', 'o que você faz?', 'comandos', 'help'."
---

# Skill: Ajuda

Esta skill responde rapidamente "o que dá para fazer aqui" sem exigir que o usuário decore comandos.

## Passo a Passo

1. **Leia silenciosamente** o `Memoria/META.md`, se existir, para saber o nome do negócio e se há pilares customizados.
2. Responda com a lista de comandos abaixo, adaptando a linha final ao estado atual do Córtex (ex: se `META.md` não existir, sugira "montar meu Córtex" em vez dos demais comandos).
3. Seja direto — sem introdução longa.

## Formato de Saída

```
🧠 **O que eu sei fazer no Córtex de [Nome do Negócio]:**

📡 `radar` — panorama rápido de pendências, projetos e atrasos
📝 `registra que...` — grava uma decisão, lição, pendência ou projeto
🔴 `pendência: ...` — adiciona uma tarefa pendente
✅ `resolvido: ...` — move uma pendência para "resolvidas"
💡 `lição: ...` — registra um aprendizado
🔄 `revisar córtex` — inicia a revisão semestral dos pilares
🩺 `saúde do córtex` — raio-x do que está faltando preencher
🗄️ `consolidar memória` — arquiva itens antigos sem apagar histórico
💬 Pergunte qualquer coisa sobre o negócio — eu consulto os seus Pilares e Memória antes de responder

👉 [Se souber algo do contexto — ex: uma revisão atrasada ou pendências críticas — sugira isso como próximo passo aqui]
```

## Regras

1. Se o Córtex ainda não foi montado (sem `Memoria/META.md`), não liste os comandos acima — diga apenas que é preciso rodar o onboarding e ofereça iniciar agora.
2. Não invente comandos que não existem nas outras skills.
3. Todos os caminhos de arquivo são **relativos à raiz do workspace**.
