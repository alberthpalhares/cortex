---
name: cortex-revisao
description: "Revisão semestral do Córtex. Percorre cada pilar mostrando o que foi registrado no onboarding e pergunta se ainda reflete a realidade do negócio. Acione com: 'revisão do córtex', 'revisar pilares' ou quando o radar avisar que a data de revisão se aproxima."
---

# Skill: Córtex — Revisão Semestral

Esta skill conduz uma **revisão estruturada** da base de conhecimento do Córtex. O objetivo é garantir que o que foi dito no onboarding ainda é verdade — e atualizar o que mudou.

## Quando Acionar

- O `Memoria/META.md` contém a data do onboarding e a data sugerida para revisão
- Se a data de revisão já passou ou está próxima (< 2 semanas), o Agente Sócio deve sugerir proativamente
- O usuário também pode acionar manualmente a qualquer momento

## Filosofia da Revisão

> **Isso não é um retrabalho. É uma conversa de 15 minutos para manter o cérebro do negócio atualizado.**

A revisão NÃO refaz o onboarding do zero. Ela:
1. Mostra o que está registrado em cada pilar
2. Pergunta: *"Isso ainda é verdade?"*
3. Se sim → segue adiante
4. Se não → pergunta o que mudou e atualiza o arquivo

## Fluxo da Revisão

### Preparação

1. Leia o `Memoria/META.md` para saber o nome do negócio e a data do último onboarding/revisão
2. Liste todos os arquivos `.md` dentro de `Pilares/` para saber quais pilares existem (incluindo pilares customizados além dos 9 padrão)
3. Leia cada arquivo de pilar encontrado

### Para Cada Pilar

Siga este roteiro:

1. **Mostre um resumo de 3-5 linhas** do conteúdo atual do pilar
2. Pergunte: *"Isso ainda reflete a realidade do [nome do negócio]? Mudou algo?"*
3. Se o usuário disser que mudou:
   - Pergunte o que mudou
   - Proponha a edição específica
   - Mostre o antes e depois
   - Peça confirmação antes de gravar
4. Se o usuário disser que está ok → avance para o próximo pilar

### Verificação de Novos Pilares

Após percorrer os pilares existentes:

1. Pergunte: *"Surgiu alguma área nova no negócio que ainda não está registrada?"*
2. Dê exemplos baseados no que NÃO existe ainda (Jurídico? Inventário? Identidade Visual? Ou algo totalmente diferente?)
3. Se sim → conduza um mini-onboarding apenas daquele pilar novo e **adicione-o imediatamente ao Mapa de Arquivos do `Memoria/META.md`** (e à seção "Pilares Customizados" se for numerado 10+). Não deixe para o passo de Fechamento.
4. Se não → siga para a Memória

### Revisão Rápida da Memória

1. Leia `Memoria/04_Pessoas_Pendencias.md`
2. Mostre as pendências ativas e pergunte: *"Alguma dessas já foi resolvida ou pode ser removida?"*
3. Mova as resolvidas para a seção "Pendências Resolvidas"
4. Leia `Memoria/03_Projetos.md`
5. Pergunte: *"Algum projeto mudou de status ou pode ser arquivado?"*
6. Atualize conforme necessário

### Consolidação da Memória (Protocolo de Memória Viva)

Aplique agora o `Frameworks/PROTOCOLO_MEMORIA.md`: siga o fluxo da skill `consolidar` para identificar itens elegíveis para arquivamento (mais de 12 meses), decisões já marcadas `[REVOGADA ...]` prontas para mover, e duplicatas. Mostre o resumo do lote e peça confirmação antes de aplicar, exatamente como a skill `consolidar` descreve. Se não houver nada elegível, pule esta etapa silenciosamente e siga para o Fechamento.

### Fechamento

1. **Obtenha a data real do sistema** (via terminal/ferramenta de data disponível) — nunca estime. Atualize a data de revisão no `Memoria/META.md`:
   ```
   Última revisão: [data real de hoje]
   Próxima revisão sugerida: [data real de hoje + 6 meses]
   ```
2. **Confira o Mapa de Arquivos do `Memoria/META.md` contra a lista real de arquivos em `Pilares/` e `Memoria/`.** Qualquer arquivo que exista no disco e não esteja no mapa deve ser adicionado agora — esta é a última chance da revisão de corrigir um META desatualizado.
3. **Atualize o cérebro (`Frameworks/CEREBRO.md`).** Ele é a FONTE; os arquivos de raiz (`AGENTS.md` etc.) são artefatos compilados a partir dele. Identifique em qual dos três estados o Córtex está:

   **(a) Tem `CEREBRO.md` COM os marcadores `CORTEX:BUSINESS` / `CORTEX:FRAMEWORK` (formato atual).**
   Edite **somente dentro da região `CORTEX:BUSINESS`** — atualize as datas na seção "Ciclo de Revisão" e a lista de pilares, se mudou. **Nunca edite a região `CORTEX:FRAMEWORK`**: ela é regenerada pelo `npx @aksp/cortex update` e qualquer coisa escrita ali será perdida. Ao terminar, rode `npx @aksp/cortex sync` (ou peça ao usuário) para recompilar os arquivos de instrução.

   **(b) Tem `CEREBRO.md` SEM os marcadores (Córtex entre a v0.7.0 e a v0.10.0).**
   Ofereça a migração: *"Seu cérebro ainda é um bloco único. Posso separá-lo em duas áreas — a do seu negócio e a das regras do Córtex? A vantagem é que, daí em diante, as atualizações do framework chegam sozinhas sem nunca mexer nos seus dados."* Se sim:
   - Envolva a parte do negócio (identidade, datas de revisão, lista de pilares) entre `<!-- CORTEX:BUSINESS:START -->` e `<!-- CORTEX:BUSINESS:END -->`.
   - **Substitua** toda a parte de regras de operação pelo conteúdo literal de `.agents/cortex/brain.framework.md`, envolto em `<!-- CORTEX:FRAMEWORK:START -->` e `<!-- CORTEX:FRAMEWORK:END -->`. Se o usuário tinha regras próprias ali, mostre-as antes e pergunte onde ele quer preservá-las (o lugar natural é a região de negócio).
   - Rode `npx @aksp/cortex sync` ao final.

   **(c) Não tem `CEREBRO.md` (Córtex anterior à v0.7.0, com o conteúdo duplicado nos 5 arquivos de raiz).**
   Copie o conteúdo de qualquer um dos arquivos de raiz (eles devem ser idênticos) para `Frameworks/CEREBRO.md` e siga exatamente o caso (b) para separá-lo em duas camadas.

   > Em qualquer caso: se algum arquivo de raiz ainda contiver um "ponteiro" antigo (do tipo *"leia `Frameworks/CEREBRO.md`"*), ele está obsoleto — `sync` vai substituí-lo pelo cérebro completo, que é o que garante que a ferramenta de IA leia as instruções sem depender de seguir a indireção.
4. **Mostre um resumo** do que foi alterado:

> *"✅ Revisão do Córtex concluída!*
>
> *Alterações feitas:*
> - *Pilar Comercial: Atualizado preço do serviço X*
> - *Pilar Cultura: Adicionado novo valor*
> - *3 pendências movidas para Resolvidas*
> - *Projeto Y arquivado*
> - *4 itens antigos movidos para Memoria/_Arquivo/2025.md (se aplicável)*
>
> *Próxima revisão sugerida: [data]. Até lá, continue usando o radar e registrando suas decisões! 🧠"*

## Regras

1. **Nunca apague conteúdo sem confirmar.** Sempre mostre o que será removido ou alterado.
2. **Seja rápido.** Se o pilar não mudou, gaste 10 segundos nele e siga.
3. **Registre tudo.** Qualquer alteração feita deve ser refletida tanto no pilar quanto no META.md.
4. **Sugira.** Se o usuário cresceu (contratou, mudou de modelo), sugira proativamente que novos pilares sejam adicionados.
5. **Caminhos relativos.** Todos os caminhos são relativos à raiz do workspace. Nunca use caminhos absolutos.
6. **Aponte lacunas.** Se encontrar marcadores `<!-- REVISAR -->` sobrando de um onboarding rápido (Quickstart) ou anterior, aproveite a revisão para completá-los junto com o usuário, ou sugira rodar a skill `saude` para um raio-x completo do que falta.
