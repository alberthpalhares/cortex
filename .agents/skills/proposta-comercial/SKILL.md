---
name: proposta-comercial
description: "Monta uma proposta comercial pronta para envio, cruzando Comercial + Comunicação + Identidade Visual. Aplica o Modo 'Preencher Lacunas' do PROTOCOLO_AUTONOMIA. Acione com: 'gerar proposta', 'monta uma proposta pro cliente X', 'proposta comercial'."
---

# Skill: Proposta Comercial

Gera uma proposta comercial **90% pronta** a partir do que já está registrado no Córtex, para o usuário só revisar e enviar — nunca a partir de um formulário longo.

## Passo a Passo

1. **Identifique o pedido mínimo.** Você precisa de pelo menos: nome do cliente e o que ele quer contratar (pode ser um dos itens da Esteira de Produtos/Serviços ou algo sob medida). Se faltar um dos dois, pergunte objetivamente — só isso, nada além.

2. **Leia silenciosamente:**
   - `Pilares/04_Comercial.md` — esteira de produtos, frontmatter (`preco_piso`, `desconto_max`) e regras de pagamento.
   - `Pilares/05_Comunicacao.md` — tom de voz.
   - `Pilares/09_Identidade_Visual.md`, se existir — cores, fonte, diretrizes de marca.
   - `Memoria/01_Decisoes.md` — regras comerciais já batidas que afetem a proposta (ex: sinal obrigatório, prazo mínimo).

3. **Monte a proposta** no tom de voz do Pilar de Comunicação, usando os valores e condições reais encontrados. Nunca invente preço — se o serviço pedido não estiver na esteira nem tiver referência clara, monte a proposta com o valor entre `[A DEFINIR]` e avise o usuário.

4. **Aplique o Modo "Preencher Lacunas":** destaque entre `[COLCHETES NEGRITO]` apenas os dados que exigem confirmação do usuário (nome fantasia exato do cliente, CNPJ, data de validade da proposta, prazo de entrega específico).

5. **Nunca ultrapasse `desconto_max`** do frontmatter de `04_Comercial.md` sem avisar explicitamente que a condição pedida foge da política padrão.

6. **Salve a proposta** em `Ativos/Propostas/AAAA-MM-DD_Nome-do-Cliente.md` (crie a subpasta se não existir) usando a data real do sistema, e também mostre o conteúdo completo no chat.

## Formato de Saída

```markdown
# Proposta Comercial — [Nome do Negócio] × [Cliente]

**Data:** [data real de hoje]
**Válida até:** [data real + 15 dias, ou o padrão do negócio se registrado]

## Escopo
[Descrição do que será entregue, no tom de voz do negócio]

## Investimento
[Valor(es), condições de pagamento, parcelamento se aplicável]

## Próximos passos
[Como o cliente confirma — sinal, assinatura, contato]
```

## Regras

1. **Nunca invente preço, prazo ou condição de pagamento.** Use o que está registrado; se faltar, marque `[A DEFINIR]` e avise.
2. **Respeite o piso e o teto de desconto do frontmatter.** Se o usuário pedir algo fora da política, avise antes de gerar.
3. **Tom de voz é obrigatório.** Nunca gere uma proposta genérica de robô — sempre no estilo definido em `05_Comunicacao.md`.
4. **Caminhos relativos.** Todos os caminhos são relativos à raiz do workspace.
5. **Não envie nada.** Esta skill só gera o documento; enviar ao cliente é sempre ação do usuário.
