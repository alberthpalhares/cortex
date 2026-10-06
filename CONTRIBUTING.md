# Contribuindo para o Córtex

Você está ajudando a construir o **Sócio Inteligente** do futuro para milhares de negócios.

O **Córtex** existe para transformar a Inteligência Artificial em uma parceira estratégica viva para qualquer negócio. Cada skill que você cria, cada pilar que você refina e cada framework que você adiciona permite que empreendedores e profissionais foquem naquilo que as máquinas não conseguem fazer: criatividade, liderança, relacionamentos e visão de longo prazo.

---

## Bem-vindo(a)

Buscamos contribuidores que compartilhem da nossa missão: **dar a qualquer pequeno negócio uma memória organizada, em arquivos que ficam no computador do dono, para a ferramenta de IA que ele escolher.**

### Quem pode contribuir
- **Designers de IA & Prompt Engineers:** Entendem a estrutura de system prompts, instruções concisas e orquestração de assistentes.
- **Empreendedores & Especialistas de Nicho:** Trazem frameworks reais de mercado (vendas, finanças, jurídico, marketing, operações).
- **Desenvolvedores:** Criam automações, skills agnósticas e melhorias para a CLI (`npx @aksp/cortex init`).

Antes de começar, leia o [README.md](README.md) para entender a arquitetura do projeto.

---

## A Regra de Ouro: Arquivos Locais & Simplicidade

O Córtex foi desenhado para ser **leve e feito de arquivos locais**: sem servidor, sem banco de dados e sem dependências. (Os arquivos ficam no computador do usuário; o que a IA lê para responder passa pelo fornecedor da ferramenta que ele usa — nunca prometa "IA local".) Ele roda com um único comando:

```bash
npx @aksp/cortex init
```

**Arquivos Markdown locais são a fonte da verdade por design.**

---

## 🔒 Segurança e Privacidade em Primeiro Lugar

Segurança é um requisito inegociável no Córtex. Ao submeter qualquer código, skill ou template:

1. **NUNCA inclua chaves de API, senhas ou segredos:** Todas as credenciais devem ser solicitadas dinamicamente ao usuário ou lidas de variáveis de ambiente locais.
2. **Respeite os limites do disco local:** Skills não devem tentar ler ou alterar arquivos fora do diretório do projeto do usuário sem consentimento explícito.
3. **NENHUM envio oculto de dados:** É proibido incluir scripts de telemetria, rastreamento ou envio de dados do negócio para servidores de terceiros.

---

## 🛠️ Padrão e Anatomia de Skills (`.agents/skills/`)

Skills são o principal formato de contribuição no Córtex. Elas devem ser salvas na pasta `.agents/skills/<nome-da-skill>/SKILL.md`.

### Estrutura obrigatória de uma Skill:

```markdown
---
name: nome-da-skill-kebab-case
description: Descrição curta em 1 ou 2 frases sobre o que a skill faz e quando acioná-la.
---

# Nome da Skill

## Quando Usar
Descreva os gatilhos de linguagem natural que acionam esta skill (ex: "gerar proposta", "analisar concorrente").

## Instruções para a IA
1. Passo 1 curto e objetivo.
2. Passo 2 com regras de formatação.

## Formato de Saída
Defina a estrutura esperada do resultado gerado.
```

### Economia de Tokens (Context Overhead)
> ⚠️ **IMPORTANTE:** Cada skill adicionada é carregada no contexto da IA. Mantenha as instruções **curtas, diretas e extremamente objetivas**. Prefira bullet points a parágrafos longos.

### Convenção de Gatilhos (Trigger Discipline)

Com mais de uma dúzia de skills convivendo no mesmo cérebro, a IA precisa saber qual acionar sem hesitar. Siga estas regras ao escrever a `description` de qualquer skill:

**1. Verbo primário exclusivo.** Cada skill "possui" um verbo ou frase curta que nenhuma outra skill usa como gatilho principal:

| Skill | Verbo primário | Gatilhos secundários |
|-------|---------------|---------------------|
| `radar` | `radar` | `status`, `como estamos?`, `briefing` |
| `registrar` | `registra` | `nova lição`, `nova pendência`, `decidi que`, `resolvido`, `me lembra de`, `lembrete`, `desfaz`, `corrige o último`, `anota a reunião`, `cliente novo`, `a meta do trimestre é` |
| `lembrar` | `o que você sabe sobre` | `você lembra de`, `qual era o combinado com`, `o que já decidimos sobre`, `procura na memória` |
| `semana` | `fechar a semana` | `revisão da semana`, `resumo da semana` |
| `conteudo` | `cria um post` | `escreve uma legenda`, `mensagem de WhatsApp`, `ideias de conteúdo` |
| `cortex-onboarding` | `montar meu córtex` | `criar córtex`, `continuar onboarding` (frase oficial de retomada), `completar meu córtex` |
| `cortex-revisao` | `revisar córtex` | `revisar pilares` |
| `saude` | `saúde do córtex` | `diagnóstico do córtex`, `o que falta preencher` |
| `ajuda` | `ajuda` | `o que você faz?`, `comandos` |
| `novidades` | `novidades` | `o que mudou?`, `o que tem de novo?` |
| `consolidar` | `consolidar memória` | `arquivar memória`, `a memória está grande` |
| `proposta-comercial` | `gerar proposta` | `monta uma proposta`, `proposta comercial`, `orçamento para`, `cotação para` |
| *(modo do protocolo)* Guardião de Margem | `descobrir minha margem` | `posso dar desconto?`, `quanto cobrar por`, `como está minha margem?`, `vale a pena?` |
| `analisador-dre` | `analisar DRE` | `analisa essa planilha`, `analisa esses números` (sempre com dados que o usuário traz) |
| `pesquisa-mercado` | `pesquisar concorrência` | `mapear concorrentes`, `quem são meus concorrentes` |
| `cortex doctor` (CLI) | `cortex doctor` | `npx @aksp/cortex doctor` |

> **Pergunta é consulta, ordem é registro.** "Quais são minhas pendências?" vai para o `radar`; "nova pendência: …" vai para o `registrar`. "Você lembra do combinado com o João?" é do `lembrar`; "me lembra de ligar para o João na sexta" é um lembrete, do `registrar`. Ao escrever um gatilho, prefira a forma de ordem inteira a uma palavra solta.
>
> **"Tive uma ideia"** não dispara skill: o cérebro trata como ideia *do negócio* (avalia contra a Estratégia e oferece registrar).
>
> **Skill só para contribuidores:** `contrib/skills/ideias/SKILL.md` captura ideias de melhoria *do próprio framework* em `IDEIAS.md` (não versionado). Ela não vai no pacote nem é roteada pelo cérebro — para usar, peça à sua IA que leia esse arquivo.

**2. Verbo novo = verbo livre.** Antes de propor uma skill, verifique se o verbo primário dela já não é usado por outra skill nesta tabela. Se for, escolha outro.

**3. Gatilho sobreposto = a IA pergunta.** O `brain.framework.md` instrui a IA: na dúvida entre duas skills, pergunte em uma linha antes de agir ("Você quer registrar essa decisão ou quer que eu analise o impacto financeiro dela?").

**4. `description` no frontmatter é o que dispara.** A IA lê o campo `description` do frontmatter de cada `SKILL.md` para decidir qual acionar. Se o gatilho não estiver ali, a skill não dispara. Mantenha-o atualizado.

### Manifesto do Framework (`.agents/manifest.json`)

Toda skill ou template novo/removido em `.agents/` deve ser refletido no manifesto, que é o que permite ao `cortex update` diferenciar arquivos do framework de customizações do usuário:

```bash
npm run build:manifest   # regenera .agents/manifest.json
npm run verify:manifest  # falha se o manifesto commitado estiver desatualizado (rodado no CI)
```

Rode `npm run build:manifest` sempre que adicionar, remover ou renomear um arquivo dentro de `.agents/`, e commite o `manifest.json` atualizado junto com o PR.

### Testes (`bin/cli.js`)

O CLI executa operações que tocam o disco do usuário (`init`, `update`, `sync`), então qualquer mudança em `bin/cli.js` precisa vir acompanhada de teste:

```bash
npm test   # node --test — roda os testes em test/unit e test/integration
```

A invariante mais importante do projeto — **`cortex update` nunca altera `Pilares/`, `Memoria/`, `Ativos/` nem a área `CORTEX:BUSINESS` do cérebro** — é coberta por `test/integration/cli.test.js`. (O `update` regenera, de propósito, a área `CORTEX:FRAMEWORK` de `Frameworks/CEREBRO.md` e os arquivos de instrução compilados na raiz.) PRs que tocam `bin/cli.js` sem teste correspondente não serão aceitos.

---

## 💻 Compatibilidade Multi-IDE

Cada ferramenta de IA lê um arquivo de instrução diferente. O Córtex gera esses arquivos a partir de uma fonte única:

| Arquivo | Quem lê | Como é gerado |
|---|---|---|
| `AGENTS.md` | OpenAI Codex, OpenCode e demais ferramentas do padrão AGENTS.md | cérebro completo |
| `CLAUDE.md` | Claude Code | uma linha `@AGENTS.md` (import nativo) |
| `GEMINI.md` | Gemini CLI, Google Antigravity | cérebro completo (padrão desde a v1.6.0) |
| `.cursorrules` | Cursor, Windsurf | cérebro completo, sob demanda |

- **As regras do cérebro vivem em dois arquivos, sempre idênticos:** `.agents/cortex/brain.framework.md` e a região `CORTEX:FRAMEWORK` de `.agents/skills/cortex-onboarding/resources/CORTEX_TEMPLATE.md`. Um teste falha se divergirem — nunca edite os arquivos de raiz para mudar o comportamento da IA.
- **Os arquivos de raiz deste repositório** (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.cursorrules`) são o texto de *inicialização* que vai para o usuário antes do onboarding ("este Córtex ainda não foi montado"). O `init` usa o `AGENTS.md` como molde único para todos.

---

## O que aceitamos

- 🛠️ **Novas Skills Agnósticas (`.agents/skills/`):** Habilidades operacionais reutilizáveis.
- 🏛️ **Pilares Específicos por Setor (`Pilares/`):** Templates customizados de pilares para nichos (ex: *Saúde & Clínicas, Imobiliárias, E-commerce, Advocacia, Infoprodutos*).
- 📐 **Novos Frameworks Estratégicos (`Frameworks/`):** Métodos e protocolos de gestão (ex: *OKRs, Matriz Eisenhower, Funil de Vendas*).
- 🚀 **Melhorias no CLI (`bin/cli.js`):** Aprimoramentos para `npx @aksp/cortex init` e `npx @aksp/cortex update`.
- 📚 **Documentação & Exemplos:** Melhorias no README, guias e traduções.

---

## O que NÃO se encaixa

- ❌ Substituir arquivos Markdown por bancos de dados pesados (PostgreSQL, SQLite, Redis, etc.).
- ❌ Exigir servidores externos ou dependências pagas obrigatórias para o funcionamento básico.
- ❌ Adicionar frameworks complexos no CLI que inflem a instalação.

---

## Como enviar sua contribuição (Passo a Passo)

1. **Abra uma Issue primeiro:** Para mudanças grandes ou novas skills complexas, [abra uma issue](https://github.com/alberthpalhares/cortex/issues) para discutir com a comunidade antes de começar.
2. **Faça um Fork** deste repositório para o seu GitHub.
3. **Crie uma Branch** para a sua funcionalidade:
   ```bash
   git checkout -b feature/minha-nova-skill
   ```
4. **Faça as alterações e teste localmente** na sua IDE.
5. **Faça o Commit** das suas mudanças com mensagens claras (padrão Conventional Commits):
   ```bash
   git commit -m "feat(skill): adiciona skill de proposta-comercial"
   ```
6. **Envie para o seu Fork (Push):**
   ```bash
   git push origin feature/minha-nova-skill
   ```
7. **Abra um Pull Request (PR)** detalhando as mudanças e como testar.

---

## Checklist de Release

Ao publicar uma nova versão (adicionar/remover/renomear skill, ou qualquer mudança que afete o comportamento do framework), siga esta lista. O CI (`npm test && npm run verify:manifest`) cobre os itens marcados com ⚙️ automaticamente, e o `npm publish` roda os dois antes de publicar (`prepublishOnly`).

- ⚙️ `npm test` passa (toda a suíte). Ela inclui `test/integration/package.test.js`, que empacota o projeto, instala o pacote e roda o CLI instalado — é o que pega diferenças entre o repositório e o que chega pelo `npx` (ex.: o npm não publica arquivos chamados `.gitignore`).
- ⚙️ `npm run verify:manifest` passa (manifesto em dia)
- [ ] **O CI está verde** no commit que vai ser publicado (Ubuntu, Windows e macOS). Como o `master` só é enviado depois da tag, rode o CI por um Pull Request; a tag roda a mesma matriz de novo antes de publicar
- [ ] **Roteiro de conversa** rodado numa ferramenta de IA de verdade (veja abaixo) — obrigatório quando a versão mexe no cérebro, numa skill ou num protocolo
- [ ] **O cérebro continua dentro do orçamento** (`brain.framework.md` com no máximo 900 palavras; `test/unit/dia-a-dia.test.js` confere). Ele é carregado em toda conversa: para acrescentar uma regra, corte outra
- [ ] **Publicar é criar a tag** (veja "Publicar pela tag" abaixo) — não rode `npm publish` à mão
- [ ] **O `README.md` novo e a tag saem juntos:** não dê `git push` no `master` antes da tag. O README aponta para `releases/latest/download/cortex.zip` e `cortex-exemplo-estudio-lumen.zip`, e esses links só entregam a versão nova (na primeira versão com ZIPs, só passam a existir) quando a Release sai. A ordem está em "Publicar pela tag"
- [ ] **Depois de publicar:** `npx @aksp/cortex@latest init` numa pasta nova e vazia termina sem erro, e os dois links de download do README (`cortex.zip` e `cortex-exemplo-estudio-lumen.zip`) baixam a versão nova
- [ ] **`COMECE-AQUI.txt`** (`.agents/cortex/`) continua valendo: se uma frase do dia a dia mudou de nome, mude lá também (um teste confere contra a skill `ajuda`)
- [ ] `npm run build:manifest` foi rodado e commitado (se arquivos em `.agents/` mudaram)
- [ ] **Tabela de gatilhos** no `CONTRIBUTING.md` está atualizada (skill nova = nova linha na tabela)
- [ ] **Skill `ajuda`** lista o novo comando (se for skill acionável pelo usuário)
- [ ] **`brain.framework.md` + `CORTEX_TEMPLATE.md`** têm a regra de disparo da nova skill
- [ ] **CHANGELOG.md** está atualizado com as mudanças desta versão
- [ ] **`examples/estudio-lumen/`** reflete as mudanças (se o exemplo for afetado — ex: novo pilar opcional, nova skill que o cérebro do exemplo deveria conhecer)
- [ ] **`package.json`** — versão incrementada conforme SemVer
- [ ] **`README.md`** — tabela de comandos do CLI atualizada, se houve mudança em `init`/`update`/`sync`/`backup`/`doctor`

### Publicar pela tag

Com tudo acima conferido e commitado no `master` **local**, ainda sem `git push` do `master`:

```bash
git tag v1.6.0            # exatamente "v" + a versão do package.json
git push origin v1.6.0    # envia a tag (e os commits dela) e dispara a publicação
# espere o job "Release no GitHub (com os ZIPs)" ficar verde e confira que
# https://github.com/alberthpalhares/cortex/releases/latest/download/cortex.zip baixa. Só então:
git push origin master
```

O `master` vai por último para o README novo nunca aparecer no GitHub apontando para um ZIP que ainda não existe. Se a publicação falhar, o `master` do GitHub continua com o README antigo, que segue valendo. Falha passageira ou cadastro do npm que faltava: resolva e use **Re-run failed jobs**. Erro no conteúdo (CHANGELOG sem a seção, teste quebrado): corrija num commit novo, apague a tag (`git tag -d v1.6.0` e `git push origin :refs/tags/v1.6.0`) e crie de novo.

O push da tag dispara o `.github/workflows/release.yml`, que:

1. roda a matriz de testes inteira (a mesma do CI: Ubuntu, Windows e macOS);
2. confere que a tag é a versão do `package.json` e que o `CHANGELOG.md` tem a seção `## [x.y.z]` — se não, para antes de publicar qualquer coisa;
3. publica no npm, sem token guardado e com atestado de procedência (npm *Trusted Publishing*). Se a versão já estiver no npm, avisa e termina sem erro;
4. só com o npm no ar, gera os ZIPs (`npm run build:zip`) e publica a Release do GitHub com o texto dessa seção do CHANGELOG, já com `cortex.zip` (a pasta pronta: o que o `init` instala) e `cortex-exemplo-estudio-lumen.zip` (o exemplo com as habilidades) anexados — a Release não aparece sem os ZIPs. Se a Release da tag já existir (ou tiver ficado como rascunho numa execução que falhou), troca os anexos e publica.

A Release espera o npm de propósito: a pasta pronta traz o comando `npx @aksp/cortex@latest update`, e ele precisa encontrar no npm a mesma versão do ZIP (com o npm atrasado, o `update` recusaria a pasta ou, com `--force`, voltaria o framework para a versão anterior). Se um passo falhar, resolva e use **Re-run failed jobs**: o que já saiu não é publicado de novo.

Os anexos têm nome fixo de propósito: o README aponta para `releases/latest/download/cortex.zip`, que sempre entrega a última versão.

**Cadastro único no npm (antes da primeira publicação pela tag).** Enquanto ele não for feito, o job "Publicar no npm" falha com um aviso apontando para cá, e a Release com os ZIPs fica esperando (nada sai pela metade):

1. Entre em [npmjs.com](https://www.npmjs.com) com a conta dona do pacote e abra `https://www.npmjs.com/package/@aksp/cortex/access` (aba **Settings** do pacote).
2. Em **Trusted Publisher**, escolha **GitHub Actions**.
3. Preencha: *Organization or user* = `alberthpalhares`; *Repository* = `cortex`; *Workflow filename* = `release.yml` (só o nome do arquivo, com a extensão); *Environment name* = deixe em branco.
4. Salve. Não é preciso criar token nem segredo no GitHub.
5. Opcional, depois que a primeira publicação pela tag der certo: na mesma página, em **Publishing access**, marque a opção que exige 2FA e não aceita tokens — a partir daí só o workflow publica.

Requisitos que o workflow já cumpre: repositório público, runner do próprio GitHub, permissão `id-token: write` e npm 11.5.1 ou mais novo.

Para testar os ZIPs antes de criar a tag: `npm run build:zip` grava os dois em `dist/` (pasta ignorada pelo git e fora do pacote do npm), com a versão no nome.

### Roteiro de conversa (12 frases)

Os testes automáticos conferem o texto das skills, não o que a IA faz com ele. Antes de publicar uma versão que mexe no cérebro, numa skill ou num protocolo, rode este roteiro numa ferramenta de IA de verdade.

**Preparação:** rode `npm run build:zip` e descompacte `dist/cortex-exemplo-estudio-lumen-<versão>.zip` numa pasta fora do repositório (é o exemplo já com a pasta `.agents/` desta versão); abra essa pasta na ferramenta. Guarde uma segunda cópia intocada para comparar os arquivos depois. O ZIP vem compilado para `AGENTS.md`, `CLAUDE.md` e `GEMINI.md`; para testar no Cursor, rode antes `node <repositório>/bin/cli.js sync <cópia> --targets=all --force`. As datas do exemplo são fixas (o único prazo é 20/10/2026), então em que bloco do radar cada item aparece depende do dia em que você roda.

| # | Você diz | O que tem de acontecer |
|---|---|---|
| 1 | `radar` | Mostra o item aguardando com o nome de quem se espera e "há N dias". A pendência com prazo aparece em "Atrasados / urgentes" se já venceu ou vence nesta semana; se vence mais adiante, aparece pelo nome, com a data, em "Depois / sem prazo", junto de "Sem prazo: 1 item". No máximo uma sugestão. Nenhum arquivo muda. |
| 2 | `quais são minhas pendências?` | Responde como consulta (radar), citando as três pendências ativas pelo nome. Nada é gravado. |
| 3 | `me lembra de ligar para o Rafael na sexta` | Grava uma pendência com a data da próxima sexta, confirma com dia da semana e diz que aparece no radar, sem prometer aviso no celular. |
| 4 | `desfaz` | Remove exatamente a linha do item 3. O arquivo volta a ser igual ao da cópia intocada. |
| 5 | `você lembra do combinado com o Grupo Andradas?` | Busca na memória e cita arquivo e data. Nada é gravado. |
| 6 | `registra que decidi cobrar deslocamento fora da capital` | Uma linha nova em Decisões, com a data real de hoje. |
| 7 | `posso dar 15% de desconto na cobertura de evento?` | Custo real de R$ 541,25, margem de 74,5%, e contraproposta com 10% (R$ 2.250), porque passa do desconto máximo. |
| 8 | `quanto cobrar por um trabalho que me custa R$ 1.000?` | Preço mínimo de R$ 1.408,45 e preço-alvo de R$ 1.785,71. Nunca R$ 1.350. |
| 9 | `anota a reunião:` seguido de 4 linhas com uma decisão, duas pendências (uma sem data) e uma lição | Mostra uma lista só, pede uma confirmação, grava tudo; a pendência sem data sai como `[SEM PRAZO]` com `(desde …)`. |
| 10 | `desfaz` | Remove todas as linhas do item 9 e lista o que saiu. |
| 11 | `fechar a semana` | Olhar para trás, duas perguntas (a segunda já diz até que sexta), meta do trimestre; fecha mostrando o prazo de cada prioridade. Um prazo que ainda está no futuro (o vídeo, 20/10) não é alterado, e a linha "aguardando" do Grupo Andradas continua lá, intacta. |
| 12 | `como está minha margem?` | Responde com as margens do pilar financeiro (Guardião de Margem), sem pedir planilha. |

Anote no PR o que falhou e em qual ferramenta. Falha de roteamento (a frase caiu na skill errada) quase sempre se corrige na tabela do cérebro ou na `description` da skill.

### Ao adicionar uma skill nova:

- [ ] Criar `.agents/skills/<nome>/SKILL.md` com frontmatter (`name`, `description`)
- [ ] `description` inclui os gatilhos em português (mesmo com o corpo em inglês)
- [ ] Verbo primário não conflita com nenhuma skill existente (ver tabela de gatilhos)
- [ ] Templates associados (se houver) em `.agents/skills/<nome>/templates/`
- [ ] Adicionar ao manifesto: `npm run build:manifest`
- [ ] Adicionar regra de disparo no `brain.framework.md` e `CORTEX_TEMPLATE.md`
- [ ] Adicionar à skill `ajuda`
- [ ] Adicionar à tabela de gatilhos neste arquivo

### Ao remover/renomear uma skill:

- [ ] Remover/renomear a pasta em `.agents/skills/`
- [ ] Remover a regra de disparo do `brain.framework.md` e `CORTEX_TEMPLATE.md`
- [ ] Remover da skill `ajuda`
- [ ] Atualizar a tabela de gatilhos neste arquivo
- [ ] Atualizar o manifesto: `npm run build:manifest`
- [ ] O arquivo antigo será detectado como "removido pelo framework" no próximo `cortex update` do usuário (via manifesto) e removido apenas com `--prune`

## Ideias de Contribuição para Começar

**Skills Recomendadas (`.agents/skills/`):**
- `post-social-media`: Gerador de posts para redes sociais alinhado ao Pilar de Comunicação.
- `analisador-contrato`: Leitor de contratos que aponta cláusulas fora do padrão registrado em `07_Juridico.md`.
- `onboarding-cliente`: Roteiro de boas-vindas para clientes recorrentes, reaproveitando Comunicação + Identidade Visual.

> ✅ `proposta-comercial`, `analisador-dre` e `pesquisa-mercado` já existem em `.agents/skills/` — confira o [Córtex de exemplo](examples/estudio-lumen/) para ver todas as skills em ação num negócio fictício.

---

*Obrigado por ajudar a tornar o Córtex o melhor sócio estratégico impulsionado por IA!*
