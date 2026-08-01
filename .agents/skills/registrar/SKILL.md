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
1. Obtenha a **data real do sistema** (via terminal/ferramenta de data disponível) antes de formatar qualquer carimbo `[YYYY-MM-DD]`. Nunca estime ou "chute" a data — o Radar e a revisão semestral dependem dela estar correta.
2. Leia o arquivo destino (caminho relativo).
3. Identifique a seção/cabeçalho onde o item se encaixa melhor.
4. Use suas ferramentas de escrita de arquivo para injetar a nova linha sem modificar o resto.
5. Se faltar um **deadline** de pendência (data futura, não o carimbo de criação), **pergunte ao usuário** em vez de inventar uma data — um deadline errado quebra o Radar. Se o usuário não souber, registre sem deadline usando `- ⏳ **[SEM PRAZO]** [Texto]`.
6. Se o registro criar um arquivo novo em `Pilares/` ou `Memoria/` que ainda não conste no mapa de `Memoria/META.md`, atualize o META como parte da mesma ação.
7. Após o registro feito com sucesso, retorne ao usuário apenas a linha formatada que foi inserida, acompanhada de um ✅.

*Não pergunte se pode fazer o registro em si. Não peça confirmação para gravar — apenas faça a alteração no arquivo imediatamente e mostre como ficou. A única pergunta permitida é por um deadline faltante (passo 5).*
