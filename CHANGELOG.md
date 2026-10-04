# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/), e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

## [1.4.0] - 2026-10-04

O Guardião de Margem passa a funcionar para quem ainda não sabe os próprios números, e o cérebro fica bem mais enxuto.

### Adicionado
- **Guardião de Margem que orienta em vez de travar.** O protocolo agora define a fórmula (preço líquido, custo real com imposto e taxas, margem), a **ordem de checagem** (piso de preço → teto de desconto → margem mínima → margem-alvo) e o veredito em quatro níveis (Aprovar, Aprovar com ressalva, Recusar, Contraproposta com número concreto). Quando faltam dados, ele diz exatamente o que falta e oferece ajuda em uma linha — nunca recusa, nunca inventa número e nunca sugere uma margem "de mercado".
- **Modo guiado "descobrir minha margem":** com um trabalho real que o usuário já fez (quanto o cliente pagou, quanto custou entregar, quanto sobrou), o Córtex mostra "de cada R$ 100, sobraram R$ X", repete com um trabalho bom e um que não valeu a pena, e propõe a margem-alvo e a mínima — sempre com confirmação antes de gravar.
- **Onboarding (Bloco 3) pergunta margem-alvo e mínima**, antes inexistentes (por isso os campos centrais ficavam sempre vazios), com o mesmo caminho guiado para quem não sabe, e pergunta por impostos e taxas (`imposto_pct`, `taxas_pct`, novos campos do frontmatter financeiro).
- **`proposta-comercial` confere a margem antes de salvar** e avisa, com os números, se o valor fica abaixo do mínimo — sem bloquear quando faltam dados. **`registrar`** avisa, em uma linha, quando uma decisão de preço ou desconto conflita com a política já definida.

### Alterado
- **Cérebro 37% mais curto** (1350 → 853 palavras, carregadas a cada sessão): as regras de roteamento viraram uma tabela "frase → skill", sem perder nenhuma; a regra de margem entrou. A data de revisão passa a ter uma única fonte autoritativa, o `META.md`, e o lembrete deixa de dizer "6 meses desde que montamos".
- **`analisador-dre`** deixa de comparar com "médias de mercado" quando o pilar financeiro não existe, e passa a distinguir margem líquida (depois dos custos fixos) de margem por trabalho (a das metas), para não dizer "abaixo da meta" por engano.
- Templates de Memória: as linhas-modelo (`- **[YYYY-MM-DD]** Descrição…`) viraram comentários e não sobram mais nos arquivos gerados; o título "Acessos e Logins" virou "Onde Ficam os Acessos (nunca a senha)".
- **Exemplo `estudio-lumen`** atualizado: datas que não nascem vencidas, pendências no formato que o `registrar` grava, meta do trimestre em formato de meta, chaves de custo iguais aos nomes dos produtos, protocolos atuais.

## [1.3.1] - 2026-10-04

Rodada de confiança: nada que o Córtex faça pode apagar ou confundir os dados do usuário.

### Adicionado
- **Arquivo `LICENSE` (MIT).** O `package.json` já declarava MIT, mas o repositório não tinha o arquivo.
- **`update` recusa voltar no tempo:** se o projeto está numa versão mais nova que o comando, avisa e indica `npx @aksp/cortex@latest update`.

### Corrigido
- **`init` não destrói mais nada.** Em uma pasta onde o Córtex já está montado, recusa e manda usar `update` (antes sobrescrevia o `AGENTS.md` com o texto de inicialização, apagando o cérebro compilado). Em uma pasta com arquivos do usuário, guarda uma cópia em `.cortex/backups/`, **mantém** o `.gitignore` dele e só acrescenta as regras do Córtex, e preserva o `CLAUDE.md` dele acrescentando apenas a linha `@AGENTS.md`.
- **`update` cria o `CLAUDE.md` que faltava** para quem veio de antes da 1.3.0 (só tinha `AGENTS.md`, que o Claude Code não lê sozinho) — sem nunca sobrescrever um `CLAUDE.md` que o usuário já tenha.
- **Backups num lugar só e limitados.** Passam a ficar em `.cortex/backups/` (em vez de `.agents.backup-*` e `CEREBRO.md.backup-*` espalhados na raiz), guardando os 3 mais recentes, e entram no `.gitignore` padrão para não irem para o repositório nem confundirem a IA com skills duplicadas.
- **`doctor` sem alarmes falsos:** o `Memoria/META.md` não aparece mais como "não indexado" (ele é o próprio índice); `custos_variaveis` em YAML de bloco ou objeto em linha deixa de ser lido como vazio; o parser de frontmatter passou a aguentar BOM do Bloco de Notas, `#` dentro de valores e `---` no meio do texto; e as linhas "nenhum faltando"/"sem inconsistências" não usam mais ícone de alerta.
- A mensagem "já está na versão mais recente" deixa de sugerir que o npm foi consultado.

### Migração
- Rode `npx @aksp/cortex@latest update`. Os backups antigos (`.agents.backup-*`) na raiz podem ser apagados à mão.

## [1.3.0] - 2026-10-04

Rodada "mais amigável": primeiro uso sem armadilhas e mais valor no dia a dia.

### Adicionado
- **Skill `lembrar`** — "o que você sabe sobre X?", "o que já decidimos sobre…": busca em Pilares, Memória e no arquivo morto, responde citando arquivo e data, e diz claramente quando não há nada registrado.
- **Skill `semana`** — "fechar a semana": cinco minutos para ver o que foi resolvido, o que ficou para trás, registrar uma lição, definir as 3 prioridades da próxima semana e acompanhar a meta do trimestre (a seção "Metas do Trimestre" do template passa finalmente a ser usada).
- **Skill `conteudo`** — posts, legendas, mensagens de WhatsApp e e-mails curtos no tom de voz do negócio, sempre em duas versões.
- **`registrar` ganha desfazer, lote e pessoas:** "desfaz" / "corrige o último" remove ou corrige o registro recém-feito; "anota a reunião" extrai decisões, pendências e lições de um texto colado e grava tudo com uma única confirmação; "cliente novo" registra uma pessoa em uma linha na seção "Stakeholders". Itens resolvidos e projetos passam a levar data. A skill se recusa a gravar senhas.
- **`radar`** mostra a meta do trimestre e, no máximo, **uma** sugestão por vez (revisão vencida, memória grande, dias sem registro, ou um bloco do onboarding ainda não feito).
- **`CLAUDE.md` por padrão**, como import nativo do Claude Code (`@AGENTS.md`): o cérebro continua em um arquivo só, e quem usa Claude Code deixa de ficar sem arquivo de instrução após o `init`.
- **Aviso de migração** em `sync` e `update` para um `CODEX.md` antigo, com remoção apenas mediante confirmação.

### Alterado
- **Onboarding começa pelo modo Rápido.** A abertura vai direto às 4 perguntas (uma por mensagem); o fluxo Completo só entra se o usuário pedir. O fechamento deixa de ser um inventário de arquivos e vira uma **"primeira vitória"**: três observações específicas sobre o negócio e uma ação pronta para fazer na hora.
- **Continuação em gotas:** "continuar onboarding" passa a ser a única frase oficial de retomada (CLI, `saude`, `radar` e `ajuda` apontam para ela), e o modo continuação faz um bloco de 2–5 minutos por vez.
- **`ajuda` reorganizada por situação** ("No dia a dia", "Para vender e comunicar", "Para cuidar do Córtex"), sem jargão técnico.
- **Cérebro:** diz onde as skills ficam (`.agents/skills/<nome>/SKILL.md`); troca "nunca edite sem perguntar" por uma **política de escrita em dois níveis** — acréscimos na Memória são gravados na hora e mostrados; Pilares, frontmatter, arquivamento e exclusões pedem confirmação — o que resolve a contradição com o `registrar`; "tive uma ideia" passa a ser tratado como ideia do negócio.
- **CLI:** ajuda e exemplos usam sempre `npx @aksp/cortex` (o nome sem escopo é outro pacote no npm) e documentam `doctor` e `--force`; a mensagem pós-`init` explica como abrir a pasta na ferramenta de IA, sem depender do VS Code; o erro do `sync` sem cérebro explica o que fazer.
- **README reescrito para quem nunca usou:** "Comece em 5 minutos" no topo, exemplos reais de uso, guia "Qual ferramenta de IA escolher?" com nota de custo, seção "Seus dados" (a IA envia o que lê ao fornecedor da ferramenta) e "Problemas comuns".
- **Texto de inicialização** (`AGENTS.md` antes do onboarding): qualquer primeira mensagem — "oi", "radar", "ajuda" — oferece começar a montagem.
- Templates de Memória alinhados ao formato que o `registrar` realmente grava.

### Removido
- **`CODEX.md` deixa de ser um alvo.** O Codex lê `AGENTS.md` nativamente, então o arquivo era uma cópia redundante. Registrado como emenda no `CONTRACTS.md`.
- **Skill `ideias` sai da instalação do usuário final.** Ela trata de melhorias do próprio framework e capturava a frase comum "tive uma ideia". Continua disponível para contribuidores em `contrib/skills/ideias/`.

### Migração (de 1.2.0 ou anterior)
- Rode `npx @aksp/cortex@latest update`. Nada precisa ser refeito.
- Se existir um `CODEX.md` na raiz, o comando avisa e pergunta se pode remover; o Codex passa a usar o `AGENTS.md`.
- Instalações que já têm `.cortex/targets.json` mantêm os alvos que escolheram. Quem usa Claude Code e só tinha `AGENTS.md` pode rodar `npx @aksp/cortex sync --targets=AGENTS.md,CLAUDE.md`.
- A skill `ideias` antiga permanece em `.agents/skills/` até você rodar `update --prune`; ela já não é acionada pelo cérebro.

> As versões `0.12.0` e `1.0.0` abaixo não têm *tag* própria no Git: o conteúdo delas entrou no mesmo commit da `1.1.0`.

## [1.2.0] - 2026-08-02

### Adicionado
- **Testes unitários para funções exportadas do CLI:** 40 novos testes em `test/unit/doctor-internals.test.js` cobrindo `parseSimpleFrontmatter` (9 casos), `countRevisarAndBlanks` (7 casos), `calculateCompleteness` (5 casos), `parseMetaHeaders` (3 casos), `parseFileMapFromMeta` (3 casos), `checkBrainHealth` (4 casos), `readCortexMeta`/`writeCortexMeta` (3 casos), e `readBusinessName` (4 casos).
- **Testes de integração para caminhos de erro:** 7 novos testes em `test/integration/cli.test.js` cobrindo `sync` sem `CEREBRO.md`, `update` sem `.agents/`, aliases do doctor (`checkup`, `diagnostico`), `sync --targets=all`, doctor com opcionais não configurados, e `update --force`.

### Alterado
- Total de testes: **31 → 76** (45 novos)
- Cobertura de caminhos de erro do CLI: 0% → 100% dos caminhos documentados

## [1.1.0] - 2026-08-02

### Corrigido
- **Help do `update` corrigido:** o texto dizia que o comando "nunca toca em Frameworks/ ou nos system prompts de raiz", mas desde a v0.11.0 ele regenera `CORTEX:FRAMEWORK` e recompila os arquivos de instrução. O help e o README agora descrevem corretamente o que é e não é tocado.
- **`USER_DATA_ITEMS` corrigido:** o array incluía os 5 arquivos de raiz como "dados do usuário nunca tocados", mas o update os regenera intencionalmente. Corrigido para listar apenas o que realmente é intocável: `Pilares/`, `Memoria/`, `Ativos/`, `Frameworks/` e `.gitignore`.
- **`checkBrainHealth` corrigido:** branch morta (if/else idênticos) removida. Arquivos ponteiro legado não aparecem mais como "compilados" no relatório do doctor.
- **`cortex-revisao` agora tem gatilho direto:** adicionado `'revisar córtex'` à description da skill (o gatilho mais comum, que estava ausente) e regra explícita no `brain.framework.md` (regra 6).
- **Regra 14 do cérebro corrigida:** `04_Comercial.md` agora tem `(if it exists)` — é opcional desde a v1.0.0.
- **`analisador-dre` reestruturado:** branches "arquivo existe" e "não existe" agora são independentes e não aninhados. A contradição "skip steps 3-4" vs "still analyze" foi resolvida.
- **`ideias` não referencia mais arquivo deletado:** substituída a referência a `AUDITORIA_EVOLUCAO_v1.md` por `CONTRACTS.md`.
- **`<!-- REVISAR -->` corrigido no onboarding:** a skill dizia "keep the template's REVISAR comment" mas nenhum template tinha o marcador. Agora instrui a "insert a REVISAR marker".
- **`runInit` corrigido:** prompt de sobrescrita agora aparece sempre (antes pulava quando target era `.`). Argumento posicional agora é buscado corretamente após flags (`--force MinhaPasta` funciona).
- **`--targets=inválido` agora emite warning** listando os targets válidos, em vez de falhar silenciosamente.
- **Lista de pilares obrigatórios unificada** na constante `MANDATORY_PILLAR_PREFIXES`, eliminando 3 duplicatas no `cli.js`.
- **`.gitignore` ampliado:** padrão `/AUDITORIA*.md` cobre qualquer auditoria futura, não só as de evolução.
- **`package.json` `files` inclui `scripts/`** para que `build:manifest` e `verify:manifest` funcionem no pacote npm publicado.

### Alterado
- **`init` agora cria só `AGENTS.md` por padrão.** Os outros 4 arquivos de instrução (`CLAUDE.md`, `GEMINI.md`, `CODEX.md`, `.cursorrules`) só são gerados se o usuário passar `--targets=`. Isso elimina a proliferação de 5 arquivos que o usuário talvez nunca use. `init --targets=all` restaura o comportamento antigo. O onboarding Step 7 continua perguntando quais ferramentas o usuário usa e gerando os arquivos corretos.
- **README totalmente atualizado:** tabela de comandos completa (16 comandos), árvore de diretórios marca `03_Financeiro`/`04_Comercial` como opcionais e inclui `.cortex/meta.json`, referência a "ponteiros" removida, seção "Mantendo o Córtex atualizado" inclui `cortex doctor`, tipos de negócio consolidados em 4 (removido "Profissionais liberais" redundante).
- **`CONTRACTS.md` referenciado** como fonte de contratos na skill `ideias` e nos docs.

## [1.0.0] - 2026-08-02

### Adicionado
- **Contratos congelados (`CONTRACTS.md`):** documento formalizando os 7 contratos estruturais que definem a v1.0.0: manifesto de framework, camadas do cérebro (marcadores `CORTEX:BUSINESS`/`CORTEX:FRAMEWORK`), schema do `.cortex/` (3 arquivos), formato dos artefatos compilados, lista de pilares obrigatórios/opcionais, nomenclatura de skills, e política de versionamento/migração. Quebrar qualquer um desses contratos exige major version bump (v2.0.0).
- **Convenção de gatilhos (`CONTRIBUTING.md`):** tabela de verbos primários exclusivos por skill + regras para evitar colisão de gatilhos entre skills. Cada skill "possui" um verbo principal; skills novas devem verificar a tabela antes de escolher o seu.
- **Regra de desempate no cérebro:** nova instrução no `brain.framework.md` e `CORTEX_TEMPLATE.md`: na dúvida entre duas skills, a IA pergunta em uma linha antes de agir ("Você quer registrar como decisão ou analisar o impacto financeiro?").
- **Teste `skill ↔ ajuda`:** novo teste (`test/unit/skill-ajuda.test.js`) que falha se uma skill em `.agents/skills/` não tiver representação na skill `ajuda`. Roda no CI junto com os demais.
- **Checklist de release (`CONTRIBUTING.md`):** lista de verificação para publicar uma nova versão (14 itens), incluindo sub-checklist para adicionar/remover skills.

### Alterado
- **Pilares financeiro e comercial passam a ser opcionais.** `03_Financeiro.md` e `04_Comercial.md` deixam de ser obrigatórios. Os obrigatórios caem de 6 para 4: `01_Estrategia`, `02_Cultura`, `05_Comunicacao`, `06_Operacao`. Onboarding pergunta antes do Bloco 3, `cortex doctor` mostra como `ℹ️ Opcional não configurado`, skills financeiras têm fallback elegante, Guardião de Margem verifica existência antes de calcular.
- **Skill `cortex-onboarding`** agora aparece na `ajuda` como `montar meu córtex`.

## [0.12.0] - 2026-08-02

### Adicionado
- **Comando `cortex doctor` (aliases: `checkup`, `diagnostico`):** auditoria estrutural determinística do Córtex que roda direto no terminal, sem gastar tokens de IA. Verifica: pilares obrigatórios faltando, marcadores `REVISAR` pendentes, seções em branco, frontmatter com campos `null`/`{}` (incluindo `custos_variaveis`), inconsistências no `META.md` (arquivos quebrados ou não indexados), saúde do cérebro (camadas `CORTEX:BUSINESS`/`CORTEX:FRAMEWORK`, alvos compilados) e índice de completude. A skill `saude` espelha a mesma lógica, agora sugerindo `cortex doctor` como alternativa zero-token.
- **Custo variável canônico no frontmatter:** `Pilares/03_Financeiro.md` ganha dois novos campos no frontmatter: `custos_variaveis` (mapeamento item→custo unitário, ex.: `{"fotografia corporativa": 150}`) e `custo_variavel_padrao` (% do preço quando não há custo por item). Isso fecha a conta do Modo "Guardião de Margem": agora o cálculo `Custo Real → Margem Resultante → Veredito` é determinístico e não depende de a IA adivinhar o custo na prosa. O Bloco 3A do onboarding passou a coletar o custo variável de cada produto/serviço. As skills `analisador-dre`, `proposta-comercial` e `saude` foram atualizadas para usar os novos campos.
- **Modo Continuação no onboarding:** a skill `cortex-onboarding` agora detecta Córtex já existente (via `META.md`) e, quando acionada com "continuar onboarding" ou "completar meu córtex", lê os `REVISAR` e campos `null` pendentes e guia o usuário apenas pelos blocos incompletos — sem recomeçar do zero. Nova regra 17 no `brain.framework.md` para disparar esse modo.
- **Metadados estruturados em `.cortex/meta.json`:** o onboarding agora grava `businessName`, `type`, `onboardedAt` e `nextReview` em `.cortex/meta.json` durante o Passo 7. O CLI (`readBusinessName`, `cortex doctor`) lê desse arquivo primeiro, com fallback para regex no `META.md` — fim do parsing frágil. Novas funções `readCortexMeta`/`writeCortexMeta` exportadas em `bin/cli.js`.
- **Skill `ideias`:** nova skill para capturar e analisar ideias de evolução do próprio framework Córtex. Registra em `IDEIAS.md` (arquivo local gitignored, não versionado) com template estruturado de viabilidade. Três modos: captura rápida, análise de viabilidade contra os 6 princípios do projeto, e priorização. Nova regra 18 no cérebro.

### Alterado
- **Internals do framework passam a ser escritos em inglês.** As 11 skills, os dois protocolos (`PROTOCOLO_AUTONOMIA.md`, `PROTOCOLO_MEMORIA.md`), o template do cérebro (`CORTEX_TEMPLATE.md` / `brain.framework.md`) e os comentários-guia dos templates de Pilares/Memória agora têm sua prosa instrucional em inglês — o que é carregado repetidamente no contexto da IA a cada sessão. Isso reduz o custo de token do carregamento recorrente sem mudar em nada a experiência do usuário: **a conversa com o usuário continua sempre em português**, os gatilhos das skills (`"radar"`, `"registra que..."`, `"saúde do córtex"` etc.) continuam em português nas `description`, os "Formatos de Saída" mostrados ao usuário continuam em português, e os dados do próprio negócio (Pilares/Memória preenchidos, cabeçalhos das seções, comentários do frontmatter YAML) permanecem no idioma do usuário.
- **Nova regra explícita de idioma no cérebro:** a primeira regra do framework agora instrui a IA a sempre responder ao usuário em português, independentemente do idioma das instruções — necessário porque, a partir desta versão, essas instruções passam a ser lidas em inglês.
- **README, CONTRIBUTING e a documentação do onboarding continuam em português** — são conteúdos voltados ao GitHub/usuário final, fora do escopo desta mudança.
- Relatórios de auditoria (`AUDITORIA*.md`) passam a ser sempre excluídos do repositório público via `.gitignore`, com um padrão glob cobrindo futuras versões do relatório.

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
