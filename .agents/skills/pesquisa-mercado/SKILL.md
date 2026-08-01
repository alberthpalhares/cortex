---
name: pesquisa-mercado
description: "Faz um levantamento de concorrentes e atualiza o Panorama Competitivo do Pilar Estratégia. Acione com: 'pesquisar concorrência', 'mapear concorrentes', 'quem são meus concorrentes'."
---

# Skill: Pesquisa de Mercado (Concorrência)

Mapeia a concorrência do negócio e propõe uma atualização da seção "Panorama Competitivo" em `Pilares/01_Estrategia.md` — sempre com confirmação antes de gravar.

## Passo a Passo

1. **Leia `Pilares/01_Estrategia.md`** para entender o posicionamento e o ICP já registrados — isso direciona quem realmente é concorrente.

2. **Pergunte ao usuário** quais concorrentes ele já tem em mente (2 a 4 nomes). Se ele não souber nenhum, pergunte setor e região de atuação para você sugerir candidatos.

3. **Verifique se você tem acesso a uma ferramenta de busca/navegação na web** neste ambiente.
   - **Se tiver:** pesquise cada concorrente — posicionamento público, faixa de preço aproximada (se divulgada), diferencial percebido, pontos fracos aparentes. Baseie-se apenas em informação pública real; **nunca invente dado que não encontrou**.
   - **Se não tiver:** peça ao usuário para colar links, prints ou o que ele já sabe sobre cada concorrente, e trabalhe só com isso.

4. **Monte um comparativo curto** (uma tabela ou lista) cruzando o negócio do usuário com cada concorrente pesquisado, focado no que é acionável: onde o negócio do usuário se diferencia e onde está exposto.

5. **Mostre o comparativo e a proposta de texto** para a seção "Panorama Competitivo" e peça confirmação antes de gravar em `Pilares/01_Estrategia.md`.

6. **Se algo relevante emergir** (ex: um concorrente lançou um produto que ameaça o posicionamento), sugira registrar como lição ou pendência via skill `registrar`.

## Formato de Saída

```
🔍 **PESQUISA DE MERCADO — [Nome do Negócio]**

| Concorrente | Posicionamento | Preço aprox. | Diferencial | Ponto fraco |
|---|---|---|---|---|
| [Nome] | ... | ... | ... | ... |

📌 Onde [Nome do Negócio] se diferencia: [...]
⚠️ Onde [Nome do Negócio] está exposto: [...]

Posso atualizar "Panorama Competitivo" em Pilares/01_Estrategia.md com esse resumo?
```

## Regras

1. **Nunca invente dado de concorrente.** Se não encontrou ou não tem informação confiável, diga "não encontrado" em vez de supor.
2. **Só use fontes públicas.** Não tente acessar dados privados, login-protegidos ou pagos de terceiros.
3. **Sempre confirme antes de gravar** no Pilar Estratégia — nunca escreva direto.
4. **Caminhos relativos.** Todos os caminhos são relativos à raiz do workspace.
5. **Seja objetiva.** O comparativo deve caber em poucas linhas por concorrente — nada de relatórios longos.
