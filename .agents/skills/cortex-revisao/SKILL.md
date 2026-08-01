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
3. **Atualize o system prompt:**
   - Se `Frameworks/CEREBRO.md` existir (Córtex montado a partir da v0.7.0), é ele o ÚNICO arquivo a editar — atualize as datas de revisão e qualquer conteúdo que tenha mudado lá. Os 5 arquivos de raiz são só ponteiros; não precisam de edição a menos que estejam corrompidos (nesse caso, rode `npx @aksp/cortex sync`).
   - Se `Frameworks/CEREBRO.md` **não** existir (Córtex mais antigo, com o conteúdo completo duplicado nos 5 arquivos de raiz), pergunte ao usuário: *"Seu Córtex ainda usa o formato antigo, com o cérebro duplicado em 5 arquivos. Quer que eu migre para o formato novo — um arquivo único (`Frameworks/CEREBRO.md`) com ponteiros nos outros 5? Isso evita que eles fiquem dessincronizados no futuro."* Se sim: copie o conteúdo de qualquer um dos 5 arquivos de raiz (eles devem ser idênticos) para `Frameworks/CEREBRO.md`, atualize-o com o que mudou nesta revisão, e substitua os 5 arquivos de raiz pelo ponteiro curto descrito na skill `cortex-onboarding` (Passo 7). Se não, apenas atualize os 5 arquivos normalmente, mantendo-os idênticos entre si.
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
