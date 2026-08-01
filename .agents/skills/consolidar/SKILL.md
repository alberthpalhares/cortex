---
name: consolidar
description: "Aplica o Protocolo de Memória Viva: arquiva itens antigos de Memória, marca decisões revogadas como movíveis e funde duplicatas — sem nunca apagar histórico. Acione com: 'consolidar memória', 'arquivar memória', 'a memória está grande'."
---

# Skill: Consolidar Memória

Esta skill executa o `Frameworks/PROTOCOLO_MEMORIA.md`. Ela mantém `Memoria/` enxuta ao longo do tempo, movendo (nunca apagando) o que ficou velho ou redundante para `Memoria/_Arquivo/`.

## Passo a Passo

1. **Verifique se há Memória.** Se não houver `Memoria/01_Decisoes.md` nem `Memoria/02_Licoes.md`, informe que ainda não há nada para consolidar. Pare aqui.

2. **Obtenha a data real do sistema** (via terminal/ferramenta de data disponível) — nunca estime. Todo cálculo de "mais de 12 meses" depende dela.

3. **Leia os candidatos a consolidação:**
   - `Memoria/01_Decisoes.md` — procure linhas já marcadas `[REVOGADA em ...]`.
   - `Memoria/02_Licoes.md` — procure itens com mais de 12 meses a partir da data real de hoje.
   - `Memoria/03_Projetos.md` — projetos com status `[CONCLUÍDO]` há mais de 12 meses (se aplicável).
   - `Memoria/04_Pessoas_Pendencias.md` — itens antigos na seção "Pendências Resolvidas" (mais de 12 meses).

4. **Identifique duplicatas.** Dentro de cada arquivo, procure itens que dizem essencialmente a mesma coisa (mesma decisão reafirmada, mesma lição repetida). Marque para fusão.

5. **Monte um resumo do lote** — nunca aplique item a item sem mostrar o conjunto primeiro:

   ```
   🗄️ **CONSOLIDAÇÃO DE MEMÓRIA — [Nome do Negócio]**

   📦 Itens a arquivar (mais de 12 meses ou já revogados):
      • [Memoria/02_Licoes.md] "..." (YYYY-MM-DD)
      • [Memoria/01_Decisoes.md] "..." — revogada em YYYY-MM-DD

   🔗 Itens a fundir (duplicatas):
      • "..." + "..." → versão única mantida

   Isso vai mover esses itens para Memoria/_Arquivo/AAAA.md — nada é apagado, só sai dos arquivos ativos. Posso aplicar?
   ```

6. **Só após confirmação do usuário**, aplique:
   - Crie (ou atualize) `Memoria/_Arquivo/AAAA.md` para cada ano necessário, seguindo o formato descrito em `Frameworks/PROTOCOLO_MEMORIA.md`.
   - Remova as linhas movidas dos arquivos de origem.
   - Funda as duplicatas identificadas em uma única linha, mantendo a data mais recente.
   - Se `Memoria/_Arquivo/` acabou de ser criada pela primeira vez, adicione uma linha para ela no Mapa de Arquivos de `Memoria/META.md`.

7. **Mostre um resumo final** do que foi movido/fundido e onde encontrar (`Memoria/_Arquivo/AAAA.md`).

## Regras

1. **Nunca apague informação.** Tudo que sai de um arquivo ativo tem que estar salvo em `Memoria/_Arquivo/` antes de ser removido da origem.
2. **Sempre confirme em lote antes de aplicar.** Não pergunte item a item — mostre o pacote completo de uma vez (passo 5).
3. **Se não houver nada elegível**, diga isso brevemente e não gere um relatório vazio.
4. **Caminhos relativos.** Todos os caminhos são relativos à raiz do workspace.
5. **Não julgue o conteúdo do negócio** — esta skill só organiza a estrutura da memória, não avalia se as decisões foram boas ou ruins.
