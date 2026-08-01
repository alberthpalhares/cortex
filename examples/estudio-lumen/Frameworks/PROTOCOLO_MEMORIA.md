# Protocolo de Memória Viva

*Este protocolo garante que a Memória do Córtex permaneça enxuta e confiável com o tempo, sem jamais apagar histórico silenciosamente. É o "motor" por trás da skill `consolidar`.*

## Por que existe

A promessa central do Córtex é economizar contexto: a IA lê `Pilares/` e `Memoria/` antes de responder. Se `Memoria/` só cresce, o custo de leitura sobe indefinidamente e decisões antigas — já revogadas ou superadas — continuam sendo lidas como se ainda valessem. Este protocolo evita as duas coisas ao mesmo tempo.

## Regras

1. **Arquivar, nunca apagar.** Itens de `Memoria/02_Licoes.md` (e, quando aplicável, decisões antigas e projetos concluídos) com mais de 12 meses — contados a partir da data real do sistema — são candidatos a arquivamento. Eles são movidos, nunca deletados, para `Memoria/_Arquivo/AAAA.md` (um arquivo por ano, criado sob demanda, onde `AAAA` é o ano do item mais antigo do lote).
2. **Decisões revogadas são marcadas, não removidas.** Quando uma decisão em `01_Decisoes.md` deixa de valer, a linha original NUNCA é apagada. Ela recebe o prefixo `[REVOGADA em YYYY-MM-DD: motivo/nova decisão]` e permanece na seção original até a próxima consolidação, quando pode ser movida para o arquivo do ano correspondente em `_Arquivo/`.
3. **Fusão de duplicatas.** Itens que dizem essencialmente a mesma coisa (a mesma decisão reafirmada, a mesma lição repetida com palavras diferentes) são fundidos em uma única linha, preservando a data mais recente e citando a data mais antiga entre parênteses.
4. **Gatilhos de consolidação.** A skill `consolidar` roda:
   - (a) como parte do Fechamento da `cortex-revisao`, a cada revisão semestral;
   - (b) sob demanda, quando o usuário disser algo como "consolidar memória";
   - (c) por sugestão do `radar`, quando um arquivo de `Memoria/` passar de um limite de tamanho legível (ver `radar/SKILL.md`).
5. **Nada se perde.** Arquivar não é apagar. Tudo que sai de um arquivo ativo continua acessível em `Memoria/_Arquivo/`, e `Memoria/META.md` deve indexar essa pasta assim que o primeiro arquivo de arquivo for criado.

## Formato de `Memoria/_Arquivo/AAAA.md`

Mesma estrutura de seções do arquivo de origem (ex: `## Preços e Políticas`, `## Erros e Oportunidades Perdidas`), com uma linha de cabeçalho no topo indicando a origem:

```markdown
# Arquivo — AAAA

> Itens arquivados de Memoria/01_Decisoes.md e Memoria/02_Licoes.md em [data da consolidação].

## Preços e Políticas
- **[YYYY-MM-DD]** Descrição da decisão arquivada.
```

## O que este protocolo NÃO faz

- Não decide sozinho o que é "irrelevante" — apenas o que é **antigo o suficiente** para sair do arquivo ativo.
- Não apaga nada sem que o item já esteja preservado em `_Arquivo/`.
- Não roda de forma totalmente silenciosa: a skill `consolidar` sempre mostra um resumo do que será movido/fundido antes de aplicar.
