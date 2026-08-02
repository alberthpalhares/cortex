# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/), e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

## [0.11.0] - 2026-08-02

### Adicionado
- **Cérebro em duas camadas:** `Frameworks/CEREBRO.md` passa a ter duas regiões marcadas — `CORTEX:BUSINESS` (identidade, datas de revisão e pilares do negócio, **nunca** tocada por uma atualização) e `CORTEX:FRAMEWORK` (regras de operação e disparo de skills, regenerável). O texto da camada de framework agora é shippado em `.agents/cortex/brain.framework.md`, dentro da camada atualizável.
- **`cortex update` passa a propagar o cérebro.** Até aqui, `update` instalava as skills novas em `.agents/` mas nada ensinava a IA a acioná-las: a skill chegava ao disco e ficava invisível. Agora o comando regenera a região `CORTEX:FRAMEWORK` do cérebro e recompila os arquivos de instrução, preservando a região do negócio byte a byte (com backup do `CEREBRO.md` antes de qualquer escrita).
- **`--targets` no `cortex sync`:** escolhe quais arquivos de instrução gerar (`--targets=CLAUDE.md,GEMINI.md` ou `--targets=all`), gravando a escolha em `.cortex/targets.json`.

### Alterado
- **Os arquivos de instrução deixam de ser "ponteiros" e passam a ser compilados.** `AGENTS.md` e companhia agora contêm o **conteúdo completo** do cérebro, com um cabeçalho de "arquivo gerado — não edite à mão", em vez de um texto pedindo à IA que fosse ler `Frameworks/CEREBRO.md`. O modelo de ponteiro só funcionava se a ferramenta seguisse a indireção — e nem toda IDE faz isso. Como os arquivos passam a ser gerados, e não editados, eles também não têm como divergir entre si.
- **`AGENTS.md` é o alvo padrão, os demais são sob demanda.** Em vez de manter cinco arquivos de instrução na raiz por padrão, o Córtex gera apenas `AGENTS.md` (a convenção cross-tool) e cria os outros só quando o usuário pede — menos arquivos, menos superfície de erro. O onboarding pergunta quais ferramentas o usuário usa.
- **Fim de linha preservado:** a comparação e a escrita do cérebro respeitam o estilo do arquivo (CRLF/LF), evitando que uma atualização reescrevesse o arquivo inteiro só por causa de quebra de linha.
- **`cortex-onboarding`, `cortex-revisao` e `saude`** atualizadas para o modelo compilado, incluindo o caminho de migração para Córtex das versões 0.7–0.10 (cérebro sem marcadores) e anteriores à 0.7.

## [0.10.0] - 2026-08-01

### Adicionado
- **Testes automatizados (`node --test`) e CI:** `bin/cli.js` ganha uma suíte de testes (`test/unit/`, `test/integration/`) cobrindo `init`, `update` e `sync` de ponta a ponta, incluindo a invariante central do projeto — `cortex update` nunca altera `Pilares/`, `Memoria/`, `Ativos/`, `Frameworks/` ou os arquivos de raiz. Workflow `.github/workflows/ci.yml` roda a suíte em Node 18/20 no Linux e no Windows a cada PR.
- **Manifesto de framework (`.agents/manifest.json`):** lista, versionada e gerada por `scripts/build-manifest.js`, de todos os arquivos que pertencem à camada de framework nesta release. `npm run build:manifest` regenera; `npm run verify:manifest` (rodado no CI) falha se o manifesto commitado ficar desatualizado.
- **`cortex update --prune`:** o comando `update` agora distingue, dentro de `.agents/`, arquivos que o usuário criou por conta própria (sempre preservados) de arquivos que o próprio framework já possuiu e descontinuou nesta versão (mantidos por padrão, removidos apenas com a nova flag `--prune`, sempre com backup prévio). Instalações anteriores à v0.10.0 — sem manifesto instalado — continuam com o comportamento anterior: tudo é preservado.
- `bin/cli.js` passa a exportar suas funções internas puras (`diffFrameworkLayer`, `classifyPreserved`, `applyFrameworkUpdate`, etc.) quando importado como módulo, para permitir os testes unitários sem depender de `process.argv`. O comportamento como CLI (`node bin/cli.js ...`) não muda.


## [0.9.0] - 2026-08-01

### Adicionado
- **Skill `proposta-comercial`:** monta uma proposta comercial 90% pronta a partir de `Pilares/04_Comercial.md`, `05_Comunicacao.md` e `09_Identidade_Visual.md`, respeitando piso e teto de desconto do frontmatter. Salva em `Ativos/Propostas/`.
- **Skill `analisador-dre`:** lê planilhas/DRE fornecidas pelo usuário e cruza com `margem_alvo`/`margem_minima` de `Pilares/03_Financeiro.md`. Nunca calcula números que o usuário não forneceu.
- **Skill `pesquisa-mercado`:** mapeia concorrentes (via busca web, quando disponível, ou informações fornecidas pelo usuário) e propõe atualização do novo "Panorama Competitivo" em `Pilares/01_Estrategia.md`.
- **Seção "Panorama Competitivo"** adicionada ao template `Pilares/01_Estrategia.md`, com âncora correspondente no `META.md`.
- **Córtex de exemplo (`examples/estudio-lumen/`):** negócio fictício totalmente preenchido — Pilares, Memória e `CEREBRO.md` completos — como referência de qualidade e demonstração do framework.

### Alterado
- **CONTRIBUTING.md** atualizado: `proposta-comercial`, `analisador-dre` e `pesquisa-mercado` saem da lista de "ideias" (já existem) e novas sugestões entram no lugar.

## [0.8.0] - 2026-08-01

### Adicionado
- **Protocolo de Memória Viva (`Frameworks/PROTOCOLO_MEMORIA.md`) e skill `consolidar`:** itens de `Memoria/02_Licoes.md` com mais de 12 meses, decisões marcadas como revogadas e duplicatas passam a ser arquivados (nunca apagados) em `Memoria/_Arquivo/AAAA.md`. Integrado ao Fechamento da `cortex-revisao` e sugerido pelo `radar` quando a Memória cresce demais.
- **Convenção de decisão revogada:** `registrar` agora marca decisões superadas com `[REVOGADA em YYYY-MM-DD: motivo]` em vez de apagá-las, preservando o histórico até a próxima consolidação.
- **Frontmatter de margem nos pilares financeiro/comercial:** `Pilares/03_Financeiro.md` (`margem_alvo`, `margem_minima`) e `Pilares/04_Comercial.md` (`preco_piso`, `desconto_max`) ganham um bloco YAML canônico e numérico, lido primeiro pelo Modo "Guardião de Margem" do `PROTOCOLO_AUTONOMIA.md`.
- **Índice com âncoras no `META.md`:** o Mapa de Arquivos ganha uma coluna "Seção (âncora)" apontando para o cabeçalho exato dentro de cada arquivo, aprofundando a leitura em camadas.

### Alterado
- **Skill `saude`** passa a contar campos de frontmatter (`margem_alvo`, `margem_minima`, `preco_piso`, `desconto_max`) ainda `null` como pendências de preenchimento.

## [0.7.0] - 2026-08-01

### Adicionado
- **`Frameworks/CEREBRO.md` (fonte única do system prompt):** O onboarding agora salva o conteúdo completo do "cérebro" em um único arquivo. Os 5 arquivos de raiz (`GEMINI.md`, `CLAUDE.md`, `CODEX.md`, `AGENTS.md`, `.cursorrules`) viram ponteiros curtos que instruem a IA a ler `Frameworks/CEREBRO.md`, eliminando o risco de divergência entre ferramentas.
- **Comando `cortex sync`:** Regenera os 5 ponteiros de raiz a partir de `Frameworks/CEREBRO.md`, para quando um deles for sobrescrito ou corrompido.
- **Modo Quickstart no onboarding:** Além do fluxo Completo (~25 perguntas, 20-30 min), o usuário agora pode escolher o modo Rápido (4 perguntas, ~5 min), que gera um Córtex funcional na hora com marcadores `REVISAR` nas lacunas, para completar depois.
- **Skill `saude`:** Novo comando ("saúde do córtex", "diagnóstico") que audita a estrutura do Córtex — pilares obrigatórios faltando, marcadores `REVISAR` pendentes, inconsistências no `META.md` e um índice de completude estimado.

### Alterado
- **`cortex-revisao` migra instalações antigas:** Se o Córtex ainda usa o formato antigo (conteúdo duplicado nos 5 arquivos de raiz, sem `Frameworks/CEREBRO.md`), a revisão semestral agora oferece migrar para a fonte única.

## [0.6.0] - 2026-08-01

### Adicionado
- **Comando `cortex update`:** Atualiza apenas a camada de framework (`.agents/`) para a versão instalada do CLI, sem nunca tocar em `Pilares/`, `Memoria/`, `Ativos/`, `Frameworks/` ou nos system prompts de raiz. Mostra o que vai mudar (arquivos novos, atualizados e preservados) e pede confirmação antes de aplicar.
- **Backup automático:** Antes de qualquer atualização, `.agents/` é copiado para `.agents.backup-<timestamp>/`, protegendo eventuais personalizações feitas pelo usuário nas skills padrão.
- **`.cortex/version.json`:** Novo arquivo de metadados que registra a versão do framework instalada no projeto, criado por `init` e atualizado por `update`.

### Alterado
- **Separação formal framework × dados do usuário:** `init` e `update` agora tratam `.agents/` como camada de framework (atualizável) e `Pilares/`, `Memoria/`, `Ativos/`, `Frameworks/` e os system prompts de raiz como camada de dados do usuário (nunca sobrescrita por uma atualização).

## [0.5.0] - 2026-08-01

### Adicionado
- **Auditoria estrutural (`AUDITORIA.md`):** Diagnóstico completo do framework com plano de evolução em 4 fases.
- **`.gitignore` de proteção de dados:** Novo arquivo, copiado por `cortex init`, que evita que `Pilares/`, `Memoria/` e `Ativos/` (os dados privados do negócio) sejam versionados por acidente. Também ignora `graphify-out/` e `node_modules/`.
- **Template `Memoria/META.md`:** O índice mestre agora tem um template próprio em `templates/Memoria/META.md`, em vez de ficar embutido só na skill de onboarding.
- **Skill `ajuda`:** Novo comando (`ajuda`, `o que você faz?`) que lista os comandos disponíveis do Córtex.

### Alterado
- **Datas reais do sistema:** As skills `registrar`, `radar`, `cortex-revisao` e `cortex-onboarding` agora exigem a data real do sistema para qualquer carimbo temporal, em vez de permitir datas estimadas/aproximadas.
- **Sincronização do `META.md`:** `registrar` e `cortex-revisao` agora atualizam o Mapa de Arquivos do `META.md` sempre que um arquivo é criado, como parte da mesma ação — evitando que o índice fique desatualizado.
- **Radar sugere revisão semestral:** A skill `radar` agora verifica a data de próxima revisão no `META.md` e sugere `revisar córtex` quando aplicável.
- **Documentação alinhada:** [`.agents/skills/cortex-onboarding/README.md`](.agents/skills/cortex-onboarding/README.md) deixou de duplicar o README raiz (que estava desatualizado, falando em "8 blocos" e um único `CORTEX.md`) e agora aponta para ele como fonte única.
- **Links do Changelog:** Removidos links `file:///` com caminhos absolutos de máquina local; substituídos por caminhos relativos ao repositório.

## [0.4.0] - 2026-07-22

### Adicionado
- **Instalador NPX CLI (`npx @aksp/cortex init`):** Utilitário CLI nativo em Node.js ([bin/cli.js](bin/cli.js)) para inicializar a estrutura completa do Córtex em qualquer diretório com um único comando.
- **Configuração de Pacote NPM (`@aksp/cortex`):** Arquivo [package.json](package.json) configurado com o nome de pacote `@aksp/cortex` e atalhos de binários `cortex-framework`, `cortex` e `cortex-ai`.
- **Guia de Contribuição Open-Source:** Criado [CONTRIBUTING.md](CONTRIBUTING.md) estabelecendo as diretrizes de desenvolvimento da comunidade, regras de economia de tokens e passo a passo para Pull Requests.

## [0.3.0] - 2026-07-20

### Adicionado
- **Seção "Por que a IA precisa ser local?":** Comparativo detalhado entre Córtex (Local/IDE) e soluções baseadas em navegador (ChatGPT/Gemini/Claude).
- **Protocolo de Autonomia (`PROTOCOLO_AUTONOMIA.md`):** Evolução dos blocos fundamentais introduzindo os 4 modos de ação da IA para execução autônoma.
- **Suporte nativo ao OpenAI Codex / ChatGPT CLI:** Adicionado [CODEX.md](CODEX.md) para integração com assistentes CLI.
- **Comandos de instalação cross-platform:** Instruções parametrizadas para macOS, Linux e Windows (PowerShell/CMD).

## [0.2.0] - 2026-07-19

### Adicionado
- **Skills Agnósticas:** Migração das habilidades para a pasta `.agents/skills` garantindo compatibilidade multiplataforma.
- **Ramificação por Modelo de Negócio:** Entrevista adaptativa de onboarding conforme a modalidade da empresa (B2B, B2C, SaaS, E-commerce, Infoprodutos, Serviços).
- **Pilares Customizados:** Capacidade de gerar pilares estratégicos adicionais sob medida além dos 9 padrão.
- **Pré-preenchimento Inteligente:** Leitura prévia de documentos do cliente (PDFs, planilhas) para agilizar o onboarding.
- **Skill de Revisão Semestral:** Skill [cortex-revisao](.agents/skills/cortex-revisao/SKILL.md) para auditoria periódica dos pilares do negócio.

### Alterado
- **Blindagem de Estrutura:** Utilização de arquivos antigos estritamente como contexto sem corromper a estrutura padrão do Córtex.

## [0.1.1] - 2026-07-19

### Adicionado
- **Arquivos `.gitkeep`:** Garantia de persistência de diretórios vazios ao clonar o repositório.
- **Refinamento do Guia de Instalação:** Ajustes nos comandos `git clone` no [README.md](README.md) com aspas e ponto-e-vírgula para evitar erros no terminal.

## [0.1.0] - 2026-07-19

### Adicionado
- **Lançamento Inicial do Córtex:** Estrutura base de Pilares, Memória, Ativos e Frameworks.
- **Skill de Onboarding (`cortex-onboarding`):** Entrevista guiada em 9 blocos para inicialização do negócio.
- **Skills de Operação Diária:** Habilidades [radar](.agents/skills/radar/SKILL.md) e [registrar](.agents/skills/registrar/SKILL.md).
- **System Prompts Multi-IDE:** Suporte inicial para [AGENTS.md](AGENTS.md), [GEMINI.md](GEMINI.md), [CLAUDE.md](CLAUDE.md) e [.cursorrules](.cursorrules).
