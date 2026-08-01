# Auditoria do Córtex — Diagnóstico e Plano de Evolução

**Versão auditada:** 0.4.0
**Data da auditoria:** 2026-08-01
**Escopo:** `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `package.json`, `bin/cli.js`, os system prompts multi-IDE (`AGENTS.md`, `CLAUDE.md`, `CODEX.md`, `GEMINI.md`, `.cursorrules`), as skills (`cortex-onboarding`, `radar`, `registrar`, `cortex-revisao`), o template de system prompt (`CORTEX_TEMPLATE.md`), o `PROTOCOLO_AUTONOMIA.md` e os templates de Pilares/Memória.

---

## 1. Resumo executivo

O Córtex é um framework maduro na ideia e enxuto na execução: transforma qualquer IA local em um "sócio" que lê Pilares e Memória antes de responder. A proposta é clara, o onboarding é bem desenhado (entrevista humanizada, adaptada por tipo de negócio) e a compatibilidade multi-IDE é um diferencial real.

O framework, porém, está no ponto em que a **primeira versão funciona, mas ainda não sustenta o próprio crescimento**. Três lacunas estruturais aparecem repetidamente na leitura do código:

1. **Não há caminho de atualização.** Framework (`.agents/`, CLI) e dados do usuário (`Pilares/`, `Memoria/`) vivem juntos, sem separação. Quem já montou o Córtex não tem como receber melhorias sem risco de sobrescrever o próprio "cérebro".
2. **A memória cresce sem gestão.** `Decisoes`, `Licoes` e `Pendencias` só acumulam. Isso contradiz, no médio prazo, o principal argumento de venda do produto: economia de contexto/tokens.
3. **A integridade dos dados depende de disciplina humana e de "achismo" da IA** — datas aproximadas, deadlines em texto livre, `META.md` que envelhece sem sincronização.

Nenhuma dessas correções exige trair a filosofia local-first/arquivos-Markdown. Todas cabem dentro da "Regra de Ouro" do `CONTRIBUTING.md`. O plano abaixo organiza as melhorias em quatro fases, da maior alavancagem/menor risco para as mais ambiciosas.

---

## 2. Pontos fortes (o que preservar)

Estes são ativos do projeto e **não devem ser sacrificados** em nenhuma refatoração:

- **Conceito e posicionamento nítidos.** "Não é CRM, não é ERP, é o cérebro estratégico" é uma âncora forte. A tabela comparativa Local × Browser no README é excelente material de convencimento.
- **Onboarding humanizado.** A filosofia "você não é um formulário, é um sócio perguntando" com tradução de jargão, exemplos e ramificação por tipo de negócio (Eu-presa / Pequena empresa / ONG / Recorrente) é o coração do produto e está bem executada.
- **Leitura em camadas via `META.md`.** A ideia de índice-primeiro para economizar contexto é arquiteturalmente correta.
- **Multi-IDE real.** Um mesmo projeto roda em Claude Code, Gemini CLI, Cursor, Codex e OpenCode. Poucos frameworks entregam isso.
- **`PROTOCOLO_AUTONOMIA.md`.** Os 4 modos (Preencher Lacunas / Guardião de Margem / Copys / Zero Enrolação) dão personalidade e utilidade concreta ao agente.
- **Disciplina de privacidade e simplicidade** já declarada no `CONTRIBUTING.md`.

---

## 3. Diagnóstico — achados e recomendações

Cada achado abaixo traz evidência (o que existe hoje), o risco (por que importa) e a direção da correção. A priorização consolidada está na seção 4.

### 3.1 Estrutural — Não existe caminho de atualização (`cortex update`) — CRÍTICO

**Evidência.** A instalação se dá por `git clone` do repositório *dentro* da pasta do negócio, ou por `npx @aksp/cortex init`, que copia `.agents`, `Frameworks`, `Pilares`, etc. O `bin/cli.js` só implementa o comando `init`. Depois de inicializado, não há nenhum mecanismo para trazer skills novas ou correções de framework.

**Risco.** O framework foi feito para evoluir (é a razão desta própria auditoria), mas o usuário que montou o Córtex hoje fica "congelado" na versão 0.4.0. Atualizar manualmente significa re-clonar por cima — arriscando sobrescrever Pilares e Memória preenchidos. Isso trava a distribuição de qualquer melhoria futura.

**Correção.** Separar conceitualmente **código do framework** (`.agents/skills/`, `Frameworks/` templates, CLI) de **dados do usuário** (`Pilares/`, `Memoria/`, `Ativos/`) e criar `cortex update`, que atualiza apenas a camada de framework e nunca toca nos dados. Ver Fase 2.

### 3.2 Estrutural — Memória cresce sem compactação nem arquivamento — CRÍTICO

**Evidência.** `registrar` sempre *injeta* linhas novas em `01_Decisoes.md`, `02_Licoes.md`, `04_Pessoas_Pendencias.md`. `cortex-revisao` move pendências resolvidas para uma seção, mas Decisões e Lições nunca são compactadas. Não há teto de tamanho nem política de arquivamento.

**Risco.** Direto ao contrário da proposta de valor. Em 12–18 meses de uso ativo, esses arquivos ficam grandes; como a IA é instruída a lê-los, o custo de contexto sobe e a "economia de tokens" vira promessa quebrada. Decisões antigas e revogadas continuam sendo lidas como se valessem.

**Correção.** Um protocolo de "memória viva" com (a) arquivamento por data para `Memoria/_Arquivo/` (ex.: lições com mais de 12 meses), (b) marcação de decisões revogadas/superadas em vez de acúmulo cego, e (c) uma skill `consolidar` opcional para fundir duplicatas. Ver Fase 3.

### 3.3 Integridade — Datas por "achismo" da IA — ALTO

**Evidência.** A skill `registrar` instrui: *"Se faltar informação (ex: prazo), insira a data atual aproximada e avise o usuário."* Nada garante que a IA saiba a data real do sistema.

**Risco.** Datas erradas corrompem exatamente o que o Radar usa para calcular atrasos e o que a revisão semestral usa para se agendar. Um "cérebro que não esquece" não pode errar quando as coisas aconteceram.

**Correção.** Instruir explicitamente as skills a obterem a data real do sistema (via terminal/ferramenta de data) antes de qualquer carimbo temporal, e a *perguntar* o deadline quando ele for operacionalmente crítico, em vez de chutar. Ver Fase 1.

### 3.4 Integridade — `META.md` sem template e sem sincronização — ALTO

**Evidência.** O `META.md` é o arquivo que a IA "lê primeiro", mas ele só existe como bloco embutido na skill de onboarding — **não há template em `templates/Memoria/`** como há para os demais arquivos. Além disso, quando pilares customizados (10+) são criados na revisão, nada garante que o mapa em `META.md` seja atualizado.

**Risco.** O índice que sustenta a leitura em camadas envelhece silenciosamente. Se um pilar novo não entra no mapa, a IA não o consulta — e o usuário nem percebe.

**Correção.** Criar `templates/Memoria/META.md` como fonte única e adicionar, ao fim de `registrar` e `cortex-revisao`, um passo obrigatório de "reindexar o META" sempre que arquivos forem criados/renomeados. Ver Fase 1.

### 3.5 Manutenção — Cinco system prompts idênticos, sincronizados à mão — ALTO

**Evidência.** `AGENTS.md`, `CLAUDE.md`, `CODEX.md`, `GEMINI.md` e `.cursorrules` recebem o *mesmo* conteúdo gerado. O `CONTRIBUTING.md` já reconhece o problema: *"se você alterar o system prompt base, replique em todos os arquivos."* Sinais de deriva já existem: o `README.md` da skill de onboarding fala em gerar um único `CORTEX.md` e em "8 blocos", enquanto o fluxo real gera 5 arquivos e tem "9 blocos".

**Risco.** Toda evolução do "cérebro" precisa ser copiada em cinco lugares, manualmente, sem verificação. É a receita para os prompts divergirem entre IDEs — e a promessa "mesmo projeto em qualquer ferramenta" quebra na prática.

**Correção.** Fonte única de verdade: um `Frameworks/CEREBRO.md` (ou `.cortex/system.md`) com o conteúdo real, e os cinco arquivos de raiz reduzidos a um *ponteiro* de uma linha ("leia `Frameworks/CEREBRO.md`"). Onde a IDE não suportar import, o CLI (`cortex sync`) regenera as cópias a partir da fonte. Ver Fase 2.

### 3.6 Segurança — Risco de vazamento dos dados do negócio via Git — ALTO

**Evidência.** O método de instalação recomendado clona o repositório para dentro da pasta do negócio; não há `.gitignore` no projeto. Os Pilares e a Memória (preços, margens, clientes, decisões estratégicas) passam a viver dentro de um diretório versionado.

**Risco.** Um usuário menos técnico pode facilmente inicializar um repositório e dar `push` do próprio cérebro estratégico para um repositório público. Para um produto que vende privacidade como pilar, esse é um ponto sensível.

**Correção.** Shippar um `.gitignore` que, por padrão, exclui `Pilares/`, `Memoria/` e `Ativos/` do controle de versão, e priorizar `npx init` (que não arrasta o histórico `.git` do framework) sobre `git clone` no README. Adicionar um aviso de privacidade explícito. Ver Fase 1.

### 3.7 Confiabilidade — "Guardião de Margem" opera sobre texto livre — MÉDIO

**Evidência.** O Modo 2 do protocolo promete calcular Custo Real → Margem Resultante → Veredito, mas os pilares `03_Financeiro.md` e `04_Comercial.md` são prosa com comentários HTML. Não há campo estruturado para custo, preço-piso ou margem-alvo.

**Risco.** O modo mais "quantitativo" do agente depende de extrair números de texto corrido, o que é frágil e inconsistente entre sessões. É o recurso que mais impressiona e o menos confiável.

**Correção.** Adotar uma convenção leve e ainda 100% Markdown: um pequeno bloco de *frontmatter* YAML (ou uma tabela canônica) no topo dos pilares financeiro/comercial com `margem_alvo`, `margem_minima`, `preco_piso`, `desconto_max`. Continua legível por humanos e não viola a regra "sem banco de dados". Ver Fase 3.

### 3.8 Usabilidade — Tempo até o primeiro valor é alto — MÉDIO

**Evidência.** O onboarding tem ~25 perguntas em 9 blocos e leva 20–30 min. O usuário não obtém nenhum valor até concluir tudo.

**Risco.** Abandono. Muitos micro-empreendedores (o público-alvo) não vão sentar por meia hora antes de ver o produto funcionar.

**Correção.** Um modo **Quickstart** (3–4 perguntas: nome, o que faz, cliente ideal, uma regra de preço) que já gera um Córtex mínimo utilizável em ~5 min, com os demais blocos oferecidos como enriquecimento progressivo ("Quer completar o pilar Financeiro agora ou depois?"). Ver Fase 2.

### 3.9 Usabilidade — Nada revela lacunas de preenchimento — MÉDIO

**Evidência.** O onboarding cria marcadores `<!-- REVISAR -->` para respostas provisórias, mas nenhuma skill os expõe depois. Não há como o usuário saber o que ficou incompleto.

**Risco.** Buracos silenciosos no cérebro. A IA responde com confiança sobre pilares que estão pela metade.

**Correção.** Uma skill `saude` / comando `cortex doctor` que valida a estrutura, lista pilares faltantes ou marcados como `REVISAR`, e dá um "índice de completude". Ver Fase 2/4.

### 3.10 Usabilidade — Comandos são descobríveis só pela documentação — BAIXO

**Evidência.** `radar`, `registrar`, `revisar córtex` são disparados por linguagem natural, mas não há um comando de ajuda que a própria IA apresente em sessão.

**Risco.** O usuário esquece o que dá para fazer e subutiliza o framework.

**Correção.** Um gatilho `ajuda` / `o que você faz?` que lista os comandos disponíveis e uma linha de "próximo passo sugerido". Ver Fase 1.

### 3.11 Ecossistema — Catálogo de skills raso — MÉDIO

**Evidência.** Existem 4 skills. O próprio `CONTRIBUTING.md` lista como "ideias para começar" skills que ainda não existem: `proposta-comercial`, `analisador-dre`, `pesquisa-mercado`, `post-social-media`.

**Risco.** O valor de um "sócio inteligente" cresce com o número de ações úteis que ele executa. Com poucas skills, o teto de utilidade percebida é baixo.

**Correção.** Priorizar 2–3 skills de alto valor que reaproveitam os pilares já preenchidos (a `proposta-comercial` é a de maior alavancagem: usa Comercial + Comunicação + Identidade Visual). Manter cada skill curta pela regra de economia de contexto. Ver Fase 4.

### 3.12 Higiene de repositório — Artefatos de build versionados — BAIXO

**Evidência.** A pasta `graphify-out/` (~dezenas de JSONs de cache/AST, ~800 KB) está no diretório do projeto e não há `.gitignore`. O `package.json` corretamente a exclui do pacote npm (via `files`), mas ela ainda polui o repositório Git.

**Risco.** Ruído no repo, diffs enormes, confusão para contribuidores sobre o que faz parte do framework.

**Correção.** `.gitignore` cobrindo `graphify-out/`, `node_modules/` e afins. Ver Fase 1.

### 3.13 Consistência de documentação — README da skill desatualizado — BAIXO

**Evidência.** `.agents/skills/cortex-onboarding/README.md` descreve um único `CORTEX.md`, "8 blocos" e "25 perguntas", divergindo do fluxo real (5 system prompts, 9 blocos). O CHANGELOG tem links `file:///` com caminhos de máquina (`E:/...`, `D:/...`) que não fazem sentido no repositório público.

**Risco.** Contribuidores e usuários se confundem; passa impressão de desatualização.

**Correção.** Alinhar o README da skill ao fluxo atual e limpar os links absolutos do CHANGELOG. Ver Fase 1.

---

## 4. Matriz de priorização

Impacto = ganho real para o usuário/produto. Esforço = trabalho de implementação. Ordenado por relação impacto/esforço.

| # | Melhoria | Impacto | Esforço | Risco de regressão | Fase |
|---|----------|:-------:|:-------:|:------------------:|:----:|
| 3.6 | `.gitignore` protegendo dados do negócio | Alto | Baixo | Nenhum | 1 |
| 3.3 | Datas reais do sistema nas skills | Alto | Baixo | Baixo | 1 |
| 3.4 | Template + reindexação do `META.md` | Alto | Baixo | Baixo | 1 |
| 3.13 | Alinhar docs (README skill, CHANGELOG) | Médio | Baixo | Nenhum | 1 |
| 3.12 | `.gitignore` de artefatos de build | Baixo | Baixo | Nenhum | 1 |
| 3.10 | Comando `ajuda` | Médio | Baixo | Nenhum | 1 |
| 3.1 | `cortex update` (caminho de atualização) | Alto | Médio | Médio | 2 |
| 3.5 | System prompt de fonte única + `cortex sync` | Alto | Médio | Médio | 2 |
| 3.8 | Modo Quickstart no onboarding | Alto | Médio | Baixo | 2 |
| 3.9 | Skill `saude` / `cortex doctor` | Médio | Médio | Baixo | 2 |
| 3.2 | Protocolo de memória viva (arquivamento) | Alto | Médio | Médio | 3 |
| 3.7 | Frontmatter de margem em pilares financeiros | Médio | Médio | Baixo | 3 |
| 3.11 | Novas skills (`proposta-comercial` etc.) | Médio | Alto | Baixo | 4 |

---

## 5. Plano de implementação por fases

### Fase 1 — Fundação e correções de baixo risco (v0.5.0)
*Objetivo: fechar buracos de integridade e segurança sem tocar na arquitetura. Tudo aqui é aditivo ou de documentação.*

1. **`.gitignore` de proteção de dados.** Criar `.gitignore` na raiz do template que ignora, por padrão, `Pilares/`, `Memoria/`, `Ativos/`, além de `graphify-out/` e `node_modules/`. Adicionar no README uma nota de privacidade e recomendar `npx init` como método principal.
2. **Datas reais nas skills.** Editar `registrar`, `radar` e `cortex-revisao` para obter a data do sistema antes de qualquer carimbo e para perguntar deadlines críticos em vez de estimar. Uma linha de regra em cada `SKILL.md`.
3. **Template e reindexação do `META.md`.** Criar `templates/Memoria/META.md`. Adicionar em `registrar` e `cortex-revisao` um passo final "atualize o mapa de arquivos do META se algo novo foi criado".
4. **Comando `ajuda`.** Nova skill `ajuda` (curtíssima) que lista comandos e sugere o próximo passo; referenciá-la no `CORTEX_TEMPLATE.md`.
5. **Higiene de documentação.** Sincronizar `cortex-onboarding/README.md` com o fluxo real (9 blocos, 5 system prompts) e limpar links `file:///` do CHANGELOG.

**Entregáveis:** `.gitignore`, `templates/Memoria/META.md`, `.agents/skills/ajuda/SKILL.md`, edições nas 3 skills existentes, docs corrigidas.
**Critério de pronto:** um Córtex recém-criado nunca versiona dados por acidente; toda data registrada é real; `META.md` reflete 100% dos arquivos existentes.

### Fase 2 — Sustentabilidade e onboarding (v0.6.0)
*Objetivo: dar ao framework a capacidade de evoluir e reduzir o atrito de entrada.*

1. **Separação framework × dados + `cortex update`.** Definir formalmente que `.agents/`, CLI e templates de `Frameworks/` são "camada de framework" e `Pilares/`, `Memoria/`, `Ativos/` são "camada de usuário". Implementar `cortex update` em `bin/cli.js`: baixa a versão nova e substitui **apenas** a camada de framework, com backup e diff antes de aplicar. Registrar a versão instalada em um `.cortex/version` para permitir migrações.
2. **System prompt de fonte única.** Mover o conteúdo real para `Frameworks/CEREBRO.md`; transformar os 5 arquivos de raiz em ponteiros. Adicionar `cortex sync` para regenerar as cópias onde a IDE não suportar import. Isso elimina a manutenção quíntupla.
3. **Modo Quickstart no onboarding.** Adicionar, na abertura da skill, a escolha "montar completo (20–30 min)" vs "quickstart (5 min)". O quickstart cobre Identidade + um mínimo de Comercial e agenda o resto como enriquecimento progressivo.
4. **Skill `saude` / `cortex doctor`.** Valida estrutura de pastas, lista pilares ausentes e marcadores `REVISAR`, e exibe um índice de completude do cérebro.

**Entregáveis:** `bin/cli.js` com `update`/`sync`/`doctor`, `Frameworks/CEREBRO.md`, refatoração dos system prompts, ramo Quickstart na onboarding, skill `saude`.
**Critério de pronto:** um usuário na v0.5.0 consegue chegar à v0.6.0 sem perder dados; alterar o cérebro exige editar um só arquivo; onboarding entrega valor em 5 min.

### Fase 3 — Inteligência e escala da memória (v0.7.0)
*Objetivo: manter a promessa de economia de contexto ao longo do tempo e tornar os modos quantitativos confiáveis.*

1. **Protocolo de memória viva.** Criar `Frameworks/PROTOCOLO_MEMORIA.md` e a skill `consolidar`: arquiva itens antigos em `Memoria/_Arquivo/AAAA.md`, marca decisões revogadas em vez de acumular, e funde duplicatas. Integrar à `cortex-revisao` (rodar consolidação a cada revisão) e sugerir no Radar quando um arquivo passar de um limite de tamanho.
2. **Frontmatter de margem.** Adicionar aos templates `03_Financeiro.md` e `04_Comercial.md` um bloco YAML canônico (`margem_alvo`, `margem_minima`, `preco_piso`, `desconto_max`) e apontar o "Guardião de Margem" para lê-lo primeiro. Mantém legibilidade humana e não introduz banco de dados.
3. **Índice com âncoras no `META.md`.** Evoluir o mapa de arquivos para apontar seções/âncoras específicas, aprofundando a leitura em camadas.

**Entregáveis:** skill `consolidar`, `PROTOCOLO_MEMORIA.md`, templates financeiros com frontmatter, `META.md` com âncoras.
**Critério de pronto:** arquivos de memória permanecem enxutos após uso prolongado; o Guardião de Margem produz o mesmo veredito de forma consistente entre sessões.

### Fase 4 — Ecossistema de skills (v0.8.0+)
*Objetivo: multiplicar a utilidade percebida reaproveitando os pilares já preenchidos.*

1. **`proposta-comercial`** — gera proposta em Markdown/PDF a partir de Comercial + Comunicação + Identidade Visual (maior alavancagem; usa o Modo "Preencher Lacunas").
2. **`analisador-dre`** — lê uma planilha/DRE fornecida pelo usuário e cruza com metas de margem do pilar Financeiro (respeitando o escopo "não é ERP": só analisa dados que o usuário trouxer).
3. **`pesquisa-mercado`** — deep research de concorrência alimentando o pilar Estratégia.
4. **Um Córtex-exemplo** (`examples/`) totalmente preenchido de um negócio fictício, que serve de referência de qualidade para a IA e de demo para novos usuários.

**Critério de pronto:** cada skill nova entrega um resultado "90% pronto" consumindo os pilares existentes, e permanece dentro do orçamento de contexto (instruções curtas, sem inflar o carregamento).

---

## 6. Princípios que a evolução deve respeitar

Para não fugir da proposta do Córtex, toda mudança deve passar por estes filtros — herdados do `CONTRIBUTING.md` e reforçados por esta auditoria:

1. **Local-first e privado.** Nada sai do disco do usuário sem consentimento explícito. Sem telemetria.
2. **Markdown é a fonte da verdade.** Nada de banco de dados. Estruturação leve (frontmatter, tabelas) é permitida; peso não.
3. **Economia de contexto é requisito, não enfeite.** Toda skill e todo arquivo carregado precisa "pagar" seu custo de tokens. Memória que só cresce é uma regressão de produto.
4. **Dados do usuário são intocáveis.** Nenhuma atualização de framework pode sobrescrever Pilares ou Memória.
5. **Zero atrito.** Cada passo deve reduzir o tempo até o valor, não aumentá-lo.

---

## 7. Próximo passo recomendado

Começar pela **Fase 1**: é inteiramente aditiva, elimina os dois riscos mais sérios de baixo esforço (vazamento de dados por Git e datas incorretas) e prepara o terreno (`META.md` sincronizado, docs alinhadas) para as fases estruturais. Sugiro fechá-la como release **v0.5.0** antes de abrir a refatoração de arquitetura da Fase 2.
