---
name: registrar
description: "Registra rapidamente decisões, lições, projetos ou pendências nos arquivos de Memória. Acione digitando palavras como: 'registra', 'nova lição', 'pendência', 'decidi que' ou 'resolvido'."
---

# Skill: Registrar

Esta skill agiliza a entrada de dados nas pastas de memória. Quando o usuário invocar esta skill com uma instrução curta (ex: "lição: perdi cliente por conta do prazo"), você deve processar a entrada silenciosamente e gravar no arquivo correto.

## 1. Classificação do Tipo de Registro
Analise o pedido do usuário e decida para onde a informação deve ir. Todos os caminhos são **relativos à raiz do workspace**:
- **Lição** (erros, acertos, campanhas) → `Memoria/02_Licoes.md`
- **Decisão** (preços, políticas, fornecedores, manuais) → `Memoria/01_Decisoes.md`
- **Pendência / Aguardando / Resolvido** → `Memoria/04_Pessoas_Pendencias.md`
- **Projeto** (mudança de status, novo projeto) → `Memoria/03_Projetos.md`
- **Informação geral** (parceiros, acessos, anotações diversas) → `Memoria/05_Registros_Gerais.md`

## 2. Padrão de Formatação (Obrigatório)
Antes de escrever, formate mentalmente a entrada de acordo com os padrões já existentes nos arquivos.
- **Lições:** Sempre inicie com `- **[YYYY-MM-DD]** **[CATEGORIA]** [Texto]`. Categorias comuns: `[COMERCIAL]`, `[OPERAÇÃO]`, `[COMUNICAÇÃO]`, `[GESTÃO]`.
- **Decisões:** Inicie com `- **[YYYY-MM-DD]** [Texto]`.
- **Pendências:** Inicie com `- 🔴 **[DEADLINE YYYY-MM-DD]** [Texto]` se tiver data, ou `- ⏳ **[AGUARDANDO]** [Texto]` se depender de terceiros.
- **Resolvidos:** Mova/Adicione na seção "Pendências Resolvidas" com `- ✅ [Texto]`.
- **Projetos:** Inicie com `- **[STATUS]** **[Nome do Projeto]**...` (Status como `[BRIEFING]`, `[EXECUÇÃO]`, `[ENTREGA]`, `[CONCLUÍDO]`).

## 3. Fluxo de Ação Silenciosa
1. Leia o arquivo destino (caminho relativo).
2. Identifique a seção/cabeçalho onde o item se encaixa melhor.
3. Use suas ferramentas de escrita de arquivo para injetar a nova linha sem modificar o resto.
4. Se faltar informação (ex: "prazo" de uma pendência), insira a data atual aproximada e avise o usuário.
5. Após o registro feito com sucesso, retorne ao usuário apenas a linha formatada que foi inserida, acompanhada de um ✅.

*Não pergunte se pode fazer. Não peça confirmação, apenas faça a alteração no arquivo imediatamente e mostre como ficou.*
