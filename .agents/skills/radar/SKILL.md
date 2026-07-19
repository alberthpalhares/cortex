---
name: radar
description: Levanta um panorama rápido e atualizado de todas as pendências ativas e status de projetos para a tomada de decisão no estúdio. Use no início do dia ou quando o usuário pedir o status geral.
---

# Skill: Radar

Você acaba de ser acionado para rodar o **Radar** da produtora PALHARES. O objetivo desta skill é dar ao usuário uma visão instantânea (em 10 a 15 linhas no máximo) de onde está o gargalo atual do negócio.

## Passo a Passo

1. **Leia silenciosamente** o arquivo de Pendências: `c:\Users\alber\OneDrive - PALHARES\30-39 ESTÚDIO\39 Agente de Gestão\Memoria\04_Pessoas_Pendencias.md`
2. **Leia silenciosamente** o arquivo de Projetos: `c:\Users\alber\OneDrive - PALHARES\30-39 ESTÚDIO\39 Agente de Gestão\Memoria\03_Projetos.md`
3. Analise a data atual do sistema em relação aos deadlines listados.
4. Gere um **Mini-Relatório de Radar** estritamente neste formato (use emojis e seja sucinto):

```
📡 **RADAR PALHARES — [Data de Hoje]**

🔴 **ATRASADOS / URGENTES:**
   • [Listar apenas pendências cujo deadline já passou ou vence hoje]
   • [Listar pendências ativas com deadline próximo na mesma semana]

⏳ **AGUARDANDO TERCEIROS:**
   • [Listar itens travados na mão de clientes/parceiros, ex: "Da Tarcila: agenda para gravações"]

📂 **PROJETOS ATIVOS:**
   • [Nome do Projeto] - [Status Atual] (ex: "Piloto Tarcila - EDIÇÃO")

💡 O que você gostaria de focar hoje?
```

## Regras de Formatação
- Nunca traga pendências resolvidas.
- Se não houver itens atrasados, escreva "Nenhum atraso crítico hoje. ✅".
- Seja extremamente conciso. Não reescreva toda a descrição da tarefa, apenas o núcleo dela. O usuário já conhece os projetos.
