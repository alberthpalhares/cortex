---
name: radar
description: "Levanta um panorama rápido e atualizado de todas as pendências ativas e status de projetos para a tomada de decisão. Use no início do dia ou quando o usuário pedir o status geral. Acione com: 'radar', 'status', 'como estamos?', 'briefing'."
---

# Skill: Radar

Você acaba de ser acionado para rodar o **Radar** do negócio. O objetivo desta skill é dar ao usuário uma visão instantânea (em 10 a 15 linhas no máximo) de onde está o gargalo atual.

## Passo a Passo

1. **Leia silenciosamente** o arquivo `Memoria/META.md` para descobrir o nome do negócio.
2. **Leia silenciosamente** o arquivo de Pendências: `Memoria/04_Pessoas_Pendencias.md`
3. **Leia silenciosamente** o arquivo de Projetos: `Memoria/03_Projetos.md`
4. Analise a data atual do sistema em relação aos deadlines listados.
5. Gere um **Mini-Relatório de Radar** estritamente neste formato (use emojis e seja sucinto):

```
📡 **RADAR [NOME DO NEGÓCIO] — [Data de Hoje]**

🔴 **ATRASADOS / URGENTES:**
   • [Listar apenas pendências cujo deadline já passou ou vence hoje]
   • [Listar pendências ativas com deadline próximo na mesma semana]

⏳ **AGUARDANDO TERCEIROS:**
   • [Listar itens travados na mão de clientes/parceiros]

📂 **PROJETOS ATIVOS:**
   • [Nome do Projeto] - [Status Atual]

💡 O que você gostaria de focar hoje?
```

## Regras de Formatação
- Nunca traga pendências resolvidas.
- Se não houver itens atrasados, escreva "Nenhum atraso crítico hoje. ✅".
- Seja extremamente conciso. Não reescreva toda a descrição da tarefa, apenas o núcleo dela. O usuário já conhece os projetos.
- Todos os caminhos de arquivo são **relativos à raiz do workspace**. Nunca use caminhos absolutos.
