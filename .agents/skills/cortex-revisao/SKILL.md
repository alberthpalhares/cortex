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
3. Se sim → conduza um mini-onboarding apenas daquele pilar novo
4. Se não → siga para a Memória

### Revisão Rápida da Memória

1. Leia `Memoria/04_Pessoas_Pendencias.md`
2. Mostre as pendências ativas e pergunte: *"Alguma dessas já foi resolvida ou pode ser removida?"*
3. Mova as resolvidas para a seção "Pendências Resolvidas"
4. Leia `Memoria/03_Projetos.md`
5. Pergunte: *"Algum projeto mudou de status ou pode ser arquivado?"*
6. Atualize conforme necessário

### Fechamento

1. **Atualize a data de revisão** no `Memoria/META.md`:
   ```
   Última revisão: YYYY-MM-DD
   Próxima revisão sugerida: [data + 6 meses]
   ```
2. **Atualize TODOS os system prompts da raiz** (`GEMINI.md`, `CLAUDE.md`, `CODEX.md`, `AGENTS.md`, `.cursorrules`) com as datas de revisão atualizadas, se estiverem hardcoded lá.
3. **Mostre um resumo** do que foi alterado:

> *"✅ Revisão do Córtex concluída!*
>
> *Alterações feitas:*
> - *Pilar Comercial: Atualizado preço do serviço X*
> - *Pilar Cultura: Adicionado novo valor*
> - *3 pendências movidas para Resolvidas*
> - *Projeto Y arquivado*
>
> *Próxima revisão sugerida: [data]. Até lá, continue usando o radar e registrando suas decisões! 🧠"*

## Regras

1. **Nunca apague conteúdo sem confirmar.** Sempre mostre o que será removido ou alterado.
2. **Seja rápido.** Se o pilar não mudou, gaste 10 segundos nele e siga.
3. **Registre tudo.** Qualquer alteração feita deve ser refletida tanto no pilar quanto no META.md.
4. **Sugira.** Se o usuário cresceu (contratou, mudou de modelo), sugira proativamente que novos pilares sejam adicionados.
5. **Caminhos relativos.** Todos os caminhos são relativos à raiz do workspace. Nunca use caminhos absolutos.
