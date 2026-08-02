# Auditoria de Evolução do Córtex — Rumo à v1.0.0

**Versão auditada:** 0.9.0
**Data:** 2026-08-01
**Escopo:** todo o framework — `bin/cli.js`, `package.json`, as 11 skills em `.agents/skills/`, os templates de Pilares/Memória/Frameworks, `CORTEX_TEMPLATE.md` (o "cérebro"), `META.md`, os system prompts de raiz, `README.md`, `CONTRIBUTING.md`, `CHANGELOG.md` e o exemplo `examples/estudio-lumen/`.
**Relação com a auditoria anterior:** a `AUDITORIA.md` (v0.4.0) definiu 4 fases; **todas foram entregues** (v0.5.0 → v0.9.0). Este documento parte de um Córtex já maduro em features e mira o próximo salto: **maturidade de produto e portabilidade real**.

---

## 1. Resumo executivo

O Córtex fechou seu ciclo de features. Em cinco releases (v0.5–v0.9) ganhou proteção de dados, datas reais, `META.md` sincronizado, `cortex update`/`sync`, fonte única do system prompt (`CEREBRO.md`), Quickstart e sete novas skills. O produto **faz o que promete**.

O próximo salto não é mais "features" — é **confiança e portabilidade**. Duas decisões de produto (abaixo) e três lacunas estruturais definem a v1.0:

**Decisões de produto que guiam esta evolução:**
- **D1 — Um cérebro, qualquer app de IA.** O modelo atual gera 5 arquivos de raiz (`AGENTS.md`, `GEMINI.md`, `CLAUDE.md`, `CODEX.md`, `.cursorrules`) como *ponteiros* que mandam a IA "ir ler `CEREBRO.md`". Isso depende de a ferramenta *seguir* a indireção — e nem toda IDE faz isso de forma confiável. É frágil por natureza. A v1.0 troca "ponteiros que a IDE precisa seguir" por **artefatos compilados a partir de uma fonte única**: a IDE lê um arquivo completo e autossuficiente na sua localização nativa, e o CLI garante que todos sejam sempre idênticos porque são *gerados*, nunca editados à mão.
- **D2 — Internals em inglês, conversa em português.** Todas as skills, templates, protocolos e o system prompt passam a ser escritos **em inglês** (economia real de tokens no carregamento recorrente e maior precisão de instrução), enquanto a IA **conversa com o usuário sempre em português** e os dados do negócio (`Pilares/`, `Memoria/`) permanecem no idioma do usuário. O README continua **primariamente em português** (público-alvo brasileiro), com uma versão em inglês opcional.

**Lacunas estruturais:**
1. **O `update` entrega arquivos, mas não atualiza o "cérebro".** Skills novas chegam a `.agents/`, mas o `CEREBRO.md` e os protocolos que *ensinam* a IA a disparar essas skills ficam congelados no onboarding. (Resolvido de graça por D1 — ver 3.1.)
2. **Não há testes nem CI** protegendo a invariante mais importante: *"update nunca toca nos dados do usuário"*.
3. **O valor depende 100% de ter uma sessão de IA aberta** — mesmo para o que é puramente mecânico (completude, pendências).

Nada disso trai a filosofia local-first/Markdown. O plano organiza tudo em quatro fases rumo à **v1.0.0**.

---

## 2. O que preservar (não regredir)

- **Separação framework × dados formalizada no CLI** (`FRAMEWORK_ITEMS` vs `USER_DATA_ITEMS`) — espinha dorsal da segurança.
- **Backup automático antes de `update`** e o **diff transparente** — excelente UX de confiança.
- **Ideia de fonte única do cérebro** — D1 a leva ao limite lógico (compilar em vez de apontar), sem desfazê-la.
- **Frontmatter numérico** e **Protocolo de Memória Viva** — base quantitativa e sustentabilidade.
- **`examples/estudio-lumen/`** — referência de qualidade viva; manter em dia a cada release (3.9).
- **Onboarding humanizado e adaptado por tipo de negócio** — o coração do produto. D2 muda o idioma das *instruções* da skill, **não** o idioma em que a IA fala com o usuário.

---

## 3. Diagnóstico — achados

Cada achado traz evidência (o que o código faz hoje), risco e direção de correção. Priorização na seção 4.

### 3.1 — Cérebro portável: um source, arquivos compilados (não ponteiros) — CRÍTICO / ARQUITETURAL

**Evidência.** Hoje o onboarding grava o conteúdo completo em `Frameworks/CEREBRO.md` e escreve 5 arquivos de raiz com um texto do tipo *"leia agora `Frameworks/CEREBRO.md` e trate como suas instruções"*. Em `bin/cli.js`, `runSync` reescreve esses 5 arquivos com esse ponteiro. Além disso, `cortex update` só toca `.agents/` — logo o `CEREBRO.md` e os protocolos em `Frameworks/` **nunca são atualizados** depois do onboarding.

**Risco (duplo).**
- *Portabilidade frágil:* o ponteiro só funciona se a ferramenta de IA **seguir a indireção** e for de fato ler outro arquivo. Ferramentas que só injetam o próprio arquivo de regras (e não navegam até o alvo) recebem apenas *"vá ler outro arquivo"* — e quebram. Ter 5 arquivos com a mesma promessa multiplica os pontos de falha.
- *Cérebro congelado:* como `CEREBRO.md` é dado do usuário e nunca é regenerado, quem montou na v0.7.0 e roda `update` recebe as skills novas em `.agents/`, mas o cérebro nunca é instruído a usá-las. `update` promete evolução e entrega metade.

**Correção (a mais importante deste relatório).** Trocar o modelo "ponteiro que a IDE precisa seguir" por **"fonte única compilada em artefatos autossuficientes"**:

1. **Fonte única, em duas camadas.** O conteúdo do cérebro passa a viver como *source* com duas partes claramente separadas:
   - **Camada framework** (regras de operação, disparo de skills, protocolos) — vem de um template *atualizável* do framework (ex.: `.agents/cortex/brain.framework.md`), em **inglês** (D2).
   - **Camada de negócio** (nome, setor, datas, mapa de pilares, particularidades) — dado do usuário, intocável, no idioma dele.
2. **Compilação para os alvos.** `cortex sync` (e todo `cortex update`) **gera** cada arquivo de raiz com o **conteúdo completo** (camada framework + camada de negócio concatenadas), não um ponteiro. Cada ferramenta lê um arquivo nativo, completo e autossuficiente — sem depender de seguir indireção.
3. **Zero divergência por construção.** Os arquivos de raiz viram *build artifacts*: levam um cabeçalho `<!-- GENERATED by cortex — edite a fonte, não este arquivo -->` e são sempre regenerados. Como ninguém os edita à mão, não há como divergirem — o benefício que o modelo de ponteiro buscava, agora sem a fragilidade.
4. **Convergir no padrão e gerar o mínimo.** `AGENTS.md` virou a convenção cross-tool de fato (adotada por vários assistentes). Tratar `AGENTS.md` como alvo canônico e **gerar só os arquivos extras que as ferramentas do usuário exigem** (definidos em `.cortex/targets.json`, detectado/perguntado no `init`). Menos arquivos = menos superfície de quebra.

Resultado: `update` passa a **propagar o cérebro inteiro** para todas as ferramentas automaticamente (resolve a lacuna 1 de graça), e a portabilidade deixa de depender de a IDE seguir ponteiro. Ver Fase 2.

### 3.2 — Zero testes e zero CI numa base com operações destrutivas — CRÍTICO

**Evidência.** `package.json` não tem `scripts` nem `devDependencies`; não há `*.test.js`; não há `.github/`. `bin/cli.js` faz `fs.copyFileSync` por cima de arquivos existentes e substitui na `applyFrameworkUpdate`; o `CONTRIBUTING.md` lista *"Melhorias no CLI"* como contribuição desejada.

**Risco.** A invariante que sustenta toda a confiança — *"update jamais sobrescreve `Pilares/`, `Memoria/`, `Ativos/`"* — é garantida só por leitura de código. Um PR que adicione `'Frameworks'` a `FRAMEWORK_ITEMS` por engano apaga o cérebro estratégico do usuário. Nada pega isso antes do merge. Com D1/3.1 mexendo justamente na lógica de geração de arquivos, a rede de segurança vira pré-requisito.

**Correção.** Test harness com `node:test` (nativo, **zero dependências** — respeita a "instalação leve"), cobrindo: `init` cria a estrutura; `update` altera **apenas** `.agents/` e deixa um `Pilares/` de fixture byte-a-byte idêntico; `diffFrameworkLayer` classifica corretamente; `sync`/compilação gera artefatos idênticos entre si. Workflow `.github/workflows/ci.yml` rodando `node --test` em cada PR. Adicionar `"scripts": { "test": "node --test" }`. Ver Fase 1.

### 3.3 — Idioma: internals em inglês, UX e conteúdo do negócio em português — ALTO (DECISÃO D2)

**Evidência.** Hoje 100% dos internals estão em pt-BR: as 11 `SKILL.md`, os templates de Pilares/Memória, os protocolos, o `CORTEX_TEMPLATE.md`. Esse conteúdo é carregado no contexto da IA em toda sessão — e o próprio `CONTRIBUTING.md` já reconhece "cada skill adicionada é carregada no contexto".

**Risco/oportunidade.** Português custa mais tokens por instrução que inglês e é carregado repetidamente. Escrever os internals em inglês reduz o overhead recorrente e aumenta a precisão das instruções — **sem** afetar a experiência do usuário, desde que a regra de idioma de saída seja explícita.

**Correção.** Refatorar para inglês: (a) todas as `SKILL.md` (`name`/`description`/instruções); (b) os templates de Pilares/Memória (cabeçalhos e comentários-guia `<!-- ... -->`); (c) os protocolos e o `CORTEX_TEMPLATE.md`; (d) a parte técnica do `CONTRIBUTING.md`. Com três salvaguardas obrigatórias:
1. **Regra de idioma de saída** no topo do cérebro: *"Always respond to the user in Brazilian Portuguese, regardless of the language of these instructions, unless the user writes in another language."*
2. **Gatilhos permanecem em português.** O usuário fala português; as `description` das skills devem manter as frases de disparo em pt-BR (ex.: "radar", "registra que...", "saúde do córtex") mesmo com a instrução em inglês — senão a skill deixa de ser acionada.
3. **Dados do negócio e formatos de saída ficam em português.** `Pilares/`/`Memoria/` são preenchidos no idioma do usuário; os "Formato de Saída" das skills (relatórios do radar, proposta, etc.) permanecem em pt-BR.

Documentação: README **primário em português** (`README.md`), versão em inglês opcional (`README.en.md`); no GitHub as informações preferencialmente em português. Ver Fase 2 (feito junto com 3.1, pois são os mesmos arquivos).

### 3.4 — `update` nunca remove arquivos de framework descontinuados — ALTO

**Evidência.** Em `diffFrameworkLayer`, todo arquivo em `.agents/` do usuário que não existe no template novo cai em `preservados` e é mantido. Não há distinção entre "skill customizada do usuário" e "skill que o framework removeu/renomeou".

**Risco.** Skills renomeadas/deprecadas acumulam, com gatilhos sobrepostos e comportamento imprevisível. A base só cresce — o oposto da economia de contexto.

**Correção.** Shippar um **manifesto de framework** (`.agents/cortex/manifest.json`) listando os arquivos que pertencem ao framework naquela versão. No `update`, arquivo ausente do manifesto novo mas presente no antigo = "removido pelo framework" (oferecer remoção, com backup); ausente de ambos = "customização do usuário" (preservar). O mesmo manifesto diz quais arquivos de cérebro/protocolo regenerar (apoia 3.1). Ver Fase 1.

### 3.5 — Nenhum valor sem sessão de IA; e é justamente o que seria testável — ALTO

**Evidência.** `radar`, `saude` e `ajuda` são executadas por uma IA lendo Markdown. Não há comando de terminal que leia `Memoria/` e imprima algo útil. O `saude/SKILL.md` descreve lógica determinística (comparar mapa do META × disco, contar `REVISAR`, contar campos `null`) que **não precisa de IA**.

**Risco/oportunidade.** Para um simples "como estou?" o usuário precisa abrir uma IDE e gastar tokens; e a lógica mais mecânica fica presa em prosa de skill, sem poder ser testada.

**Correção.** Portar a parte determinística do `saude` para `cortex doctor` em `bin/cli.js` (completude, pilares faltando, `REVISAR`, campos `null`). A skill `saude` continua para a leitura interpretativa, espelhando o mesmo cálculo. Bônus: `cortex doctor` é trivialmente testável (alimenta 3.2) e dá valor local-first sem IA. Ver Fase 3.

### 3.6 — O "Guardião de Margem" ainda não fecha a conta: falta o custo variável — ALTO

**Evidência.** O Modo 2 do `PROTOCOLO_AUTONOMIA.md` promete `Custo Real → Margem Resultante → Veredito`. O frontmatter deu `margem_alvo`, `margem_minima`, `preco_piso`, `desconto_max`. Mas `03_Financeiro.md` só tem `## Custos Fixos (mensal)` em texto livre — **não há custo variável por item**. Para a margem de um negócio específico, a IA ainda adivinha o custo na prosa.

**Risco.** O modo mais impressionante segue parcialmente "no achismo"; vereditos variam entre sessões.

**Correção.** Estender o frontmatter comercial/financeiro com custo variável canônico por item (ex.: `custos_variaveis:` item→custo, ou `custo_variavel_padrao`). Continua Markdown/YAML legível e torna o cálculo determinístico. Atualizar o Bloco 3 do onboarding para coletar 1 custo por item principal. Ver Fase 3.

### 3.7 — Onboarding não é retomável; Quickstart não tem "continuação" guiada — MÉDIO

**Evidência.** O modo Completo tem ~25 perguntas; parar no Bloco 5 não deixa como retomar. O Quickstart deixa marcadores `REVISAR`, `saude` os mostra, mas quem *completa* é a `cortex-revisao` — enquadrada como ritual "semestral", não "terminar de montar".

**Risco.** Abandono no meio da configuração e cérebros permanentemente pela metade.

**Correção.** Gatilho leve `continuar onboarding` / `completar meu córtex` que lê o META e os `REVISAR` e conduz só os blocos incompletos. De preferência como um "modo continuação" da própria `cortex-onboarding` (detecta Córtex existente), sem inflar o catálogo. Ver Fase 3.

### 3.8 — Colisão de gatilhos entre 11 skills sem regra de desempate — MÉDIO

**Evidência.** Com 11 skills, os gatilhos se sobrepõem: "analisar" (analisador-dre) vs "analisar concorrência" (pesquisa-mercado); "registra que decidi o preço" pode ativar `registrar` *ou* tocar o Guardião de Margem. Não há orientação de precedência.

**Risco.** À medida que o catálogo cresce (o `CONTRIBUTING` já sugere mais 3 skills), a IA escolhe a errada e a confiança cai.

**Correção.** Convenção de gatilhos no `CONTRIBUTING.md` (verbos primários exclusivos por skill) + regra curta de desempate no cérebro ("na dúvida entre duas skills, pergunte uma linha antes de agir"). Ver Fase 4.

### 3.9 — Metadados espalhados; parsing frágil por regex — MÉDIO

**Evidência.** `readBusinessName` extrai o nome via `/\*\*Neg[oó]cio:\*\*\s*(.+)/` do `META.md`. `.cortex/version.json` já existe. Nome, tipo e datas vivem em prosa no META.

**Risco.** Se o formato do META variar, `sync` gera artefato sem nome, sem erro. Dado estruturado tratado como texto livre — e com D1 a compilação passa a depender ainda mais desses metadados.

**Correção.** Consolidar metadados estáveis em `.cortex/` (`businessName`, `type`, `nextReview`, `targets`), escrito pelo onboarding e lido pelo CLI. O `META.md` continua a fonte humana; o `.cortex/` vira a fonte-máquina. Ver Fase 3.

### 3.10 — Exemplo e docs precisam de um "contrato de atualização" por release — BAIXO

**Evidência.** `examples/estudio-lumen/CEREBRO.md` cita as 5 skills novas (está em dia por ter nascido na v0.9.0), mas nada garante que ele, o README e a tabela de comandos sejam atualizados na próxima skill. O `CHANGELOG` traz v0.5–0.9 na mesma data, sinal de escrita em lote.

**Risco.** Drift lento — o mesmo problema que a auditoria anterior já teve com o README da skill.

**Correção.** Checklist de release no `CONTRIBUTING.md` ("ao adicionar skill: atualize README, tabela de comandos, `ajuda`, o exemplo e o CHANGELOG") e um teste que falhe se uma skill em `.agents/skills/` não aparecer na `ajuda`. Ver Fase 4.

---

## 4. Matriz de priorização

Impacto = ganho real para usuário/produto. Esforço = trabalho de implementação. Ordenado por impacto/esforço.

| # | Melhoria | Impacto | Esforço | Risco regressão | Fase |
|---|----------|:-------:|:-------:|:---------------:|:----:|
| 3.2 | Testes (`node:test`) + CI para o CLI | Alto | Baixo | Nenhum | 1 |
| 3.4 | Manifesto de framework + limpeza de descontinuados | Alto | Médio | Baixo | 1 |
| 3.1 | Cérebro portável: fonte única compilada (D1) | Alto | Alto | Médio | 2 |
| 3.3 | Internals em inglês + regra de saída em pt-BR (D2) | Alto | Médio | Baixo | 2 |
| 3.5 | Comando `cortex doctor` (valor sem IA + testável) | Alto | Médio | Baixo | 3 |
| 3.6 | Custo variável no frontmatter (Guardião completo) | Alto | Baixo | Baixo | 3 |
| 3.7 | `continuar onboarding` (retomada guiada) | Médio | Baixo | Baixo | 3 |
| 3.9 | Metadados em `.cortex/` (fim do parsing frágil) | Médio | Baixo | Baixo | 3 |
| 3.8 | Convenção de gatilhos + regra de desempate | Médio | Baixo | Nenhum | 4 |
| 3.10 | Checklist de release + teste "skill ↔ ajuda" | Médio | Baixo | Nenhum | 4 |

---

## 5. Plano de implementação por fases

### Fase 1 — Rede de segurança (v0.10.0)
*Objetivo: nada que vem depois pode quebrar em silêncio. Puramente técnico, sem tocar em conteúdo.*

1. **Test harness + CI (3.2).** `"scripts": { "test": "node --test" }`, pasta `test/` com fixtures de um Córtex fake, casos para `init`, `update` (invariante de dados intocados), `diffFrameworkLayer` e `sync`. Workflow `.github/workflows/ci.yml`. **Primeiro item de tudo** — a Fase 2 reescreve a geração de arquivos e precisa dessa rede.
2. **Manifesto de framework (3.4).** `.agents/cortex/manifest.json` (arquivos do framework + versão). `update` passa a distinguir "removido pelo framework" de "customização do usuário".

**Critério de pronto:** `node --test` verde no CI; um `update` não altera um byte de `Pilares/`/`Memoria/` de fixture; arquivos descontinuados são detectados.

### Fase 2 — Um cérebro, qualquer app, em inglês (v0.11.0)
*Objetivo: as duas decisões de produto (D1 e D2). Feitas juntas porque tocam os mesmos arquivos — reescrever skills/templates uma vez, não duas. Protegidas pela Fase 1.*

1. **Cérebro portável compilado (3.1 / D1).** Separar o source em camada framework (template atualizável, em inglês) + camada de negócio (dado do usuário). `cortex sync`/`update` passam a **compilar** cada arquivo de raiz com conteúdo completo e cabeçalho "GENERATED", em vez de ponteiro. Convergir em `AGENTS.md` como canônico e gerar só os alvos que o usuário usa (`.cortex/targets.json`, perguntado no `init`).
2. **Internals em inglês (3.3 / D2).** Reescrever em inglês: 11 `SKILL.md`, templates de Pilares/Memória, protocolos, `CORTEX_TEMPLATE.md` e a parte técnica do `CONTRIBUTING.md`. Aplicar as três salvaguardas: regra de saída em pt-BR no topo do cérebro, gatilhos mantidos em pt-BR nas `description`, e "Formato de Saída" + dados do negócio em pt-BR.
3. **Propagação verificada.** Como consequência de (1), `cortex update` agora regenera o bloco framework do cérebro e os protocolos — teste que confirme que um Córtex "antigo" passa a conhecer as skills novas após `update`.
4. **README bilíngue.** `README.md` primário em pt-BR (ajustado ao novo modelo de arquivo único/compilado); `README.en.md` opcional.

**Critério de pronto:** um único source gera artefatos idênticos e autossuficientes para cada ferramenta; a IA responde em pt-BR mesmo com instruções em inglês; um Córtex da v0.10.0 que roda `update` passa a disparar todas as skills; nenhum teste falha.

### Fase 3 — Valor sem atrito (v0.12.0)
*Objetivo: utilidade fora da sessão de IA e fechar lacunas quantitativas/de onboarding.*

1. **`cortex doctor` (3.5).** Comando determinístico e testado; a skill `saude` espelha o mesmo cálculo.
2. **Custo variável canônico (3.6).** Estender frontmatter e Bloco 3 do onboarding; `analisador-dre` e `proposta-comercial` passam a usá-lo.
3. **Retomada de onboarding (3.7).** Modo continuação da `cortex-onboarding`.
4. **Metadados em `.cortex/` (3.9).** Onboarding grava `businessName`/`type`/`nextReview`/`targets`; CLI lê de lá.

**Critério de pronto:** `cortex doctor` roda sem IA e bate com a skill `saude`; o Guardião de Margem dá o mesmo veredito entre sessões.

### Fase 4 — Ecossistema e v1.0.0
*Objetivo: catálogo cresce sem virar bagunça; assumir a marca 1.0.*

1. **Convenção de gatilhos + desempate (3.8).**
2. **Checklist de release + teste skill↔ajuda (3.10).**
3. **Corte da v1.0.0.** Congelar contratos (manifesto, âncoras/camadas do cérebro, schema do `.cortex/`, formato dos artefatos compilados) e documentá-los.

**Critério de pronto:** um contribuidor externo adiciona uma skill seguindo o checklist, com CI verde, sem quebrar disparo, docs ou o exemplo.

---

## 6. Princípios que a evolução deve respeitar

1. **Local-first e privado.** Sem telemetria. Testes rodam sobre fixtures, nunca sobre dados reais.
2. **Markdown é a fonte humana; `.cortex/` é a fonte-máquina.** Estruturação leve (frontmatter, manifesto/metadados JSON) é permitida; banco de dados, não.
3. **Economia de contexto é requisito.** É a razão de os internals irem para o inglês (D2) e de `cortex doctor` existir (não gastar tokens no que é mecânico).
4. **Dados do usuário são intocáveis** — agora *provado por teste*, não só por convenção.
5. **A experiência é em português.** D2 muda o idioma das instruções internas, nunca o idioma em que a IA fala com o usuário nem o dos dados do negócio.
6. **Portabilidade por construção.** Arquivos de instrução são artefatos gerados de uma fonte única — nunca editados à mão, nunca dependentes de a IDE seguir um ponteiro.

---

## 7. Próximo passo recomendado

Começar pela **Fase 1 (testes + CI e manifesto)** — baixo esforço, risco zero, e é a rede de segurança para a Fase 2, que reescreve a geração de arquivos. Em seguida, a **Fase 2** entrega as duas decisões de produto (cérebro portável compilado + internals em inglês) num único passo coordenado, já que mexem nos mesmos arquivos.

> A auditoria anterior levou o Córtex de "ideia boa" a "produto que funciona". Esta o leva a "produto portável, confiável e que evolui sozinho": um cérebro só, que qualquer app de IA lê sem depender de indireção, escrito de forma enxuta, sempre atualizado — e que nunca deixa de falar português com quem importa: o usuário.
