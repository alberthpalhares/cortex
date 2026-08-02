# 🧠 Córtex — Central de Inteligência do Seu Negócio

O **Córtex** é um framework que transforma a IA em um **Sócio Inteligente** para o seu negócio. Ele guarda tudo que você já decidiu, aprendeu e planejou em arquivos locais — e a IA consulta esses arquivos antes de te responder, como se fosse um sócio que lembra de tudo.

**Não é um CRM. Não é um ERP. É o cérebro estratégico do seu negócio.**

---

## O que você ganha

- 📡 **Radar:** Diga "radar" e veja todas as pendências, projetos e atrasos em 10 linhas
- 📝 **Registro rápido:** Diga "registra que decidi X" e a IA grava nos arquivos certos
- 🧠 **Memória viva:** A IA nunca esquece suas regras de preço, lições e decisões
- 🔄 **Revisão semestral:** A cada 6 meses, o sistema te convida a revisar o que mudou
- 🏗️ **Pilares customizados:** Se o seu negócio tem áreas específicas que não se encaixam nos 9 pilares padrão, o Córtex cria pilares extras sob medida

---

## Por que a IA precisa ser local?

O Córtex **não funciona dentro do ChatGPT, Gemini ou Claude pelo navegador** (GPTs, Gems, Projects). Ele precisa de uma ferramenta de IA que rode no seu computador e tenha acesso ao seu disco local. Aqui está o porquê:

| Capacidade | 🧠 Córtex (Local) | 🌐 GPT / Gem (Browser) |
|---|---|---|
| **Ler seus arquivos automaticamente** | ✅ Lê Pilares, Memória e Frameworks direto do disco | ❌ Você precisa copiar e colar ou fazer upload manual toda vez |
| **Gravar decisões e lições** | ✅ Diga "registra que..." e a IA grava no arquivo certo | ❌ A IA responde, mas não salva nada. Você precisa anotar por conta |
| **Memória entre sessões** | ✅ Permanente — os arquivos ficam no seu computador para sempre | ⚠️ Limitada — depende da memória do chat, que pode ser apagada ou esquecida |
| **Radar de pendências** | ✅ A IA cruza projetos, pendências e prazos em tempo real | ❌ Não tem acesso aos seus dados atualizados |
| **Atualização automática** | ✅ A IA edita os arquivos quando você autoriza | ❌ Você precisa re-enviar os arquivos toda vez que algo muda |
| **Privacidade dos dados** | ✅ Tudo fica no seu disco, sem upload para nuvem | ⚠️ Seus dados ficam nos servidores da OpenAI, Google ou Anthropic |
| **System prompt persistente** | ✅ O "cérebro" fica salvo em arquivo e nunca se perde | ⚠️ Pode ser sobrescrito por atualizações da plataforma |
| **Multi-ferramenta** | ✅ Mesmo projeto funciona no Gemini CLI, Claude Code, Cursor, etc. | ❌ Preso a uma única plataforma (seu GPT não funciona no Claude) |

> 💡 **Resumindo:** Um GPT ou Gem é como um estagiário que lê suas anotações uma vez e depois esquece. O Córtex é um sócio que tem acesso permanente ao escritório, lê os arquivos sempre que precisa, e ainda anota as coisas novas pra você.

---

## Como instalar

### Pré-requisitos
- Node.js instalado (recomendado) ou Git
- Uma ferramenta de chat com IA que leia arquivos locais (ex: Google Antigravity, Gemini CLI, Claude Code, Cursor, OpenCode, Codex, etc.)

> 🔒 **Privacidade:** prefira o Método 1 (NPX) — ele copia o framework sem o histórico Git. Se usar `git clone`, lembre-se de que o Córtex já inclui um `.gitignore` que impede `Pilares/`, `Memoria/` e `Ativos/` (os dados do seu negócio) de serem versionados por acidente.

---

### Método 1: Via NPX (Recomendado 🚀)

Abra o terminal na pasta do seu negócio e execute:

```bash
npx @aksp/cortex init
```

> 💡 **Dica:** Se quiser criar uma nova pasta para o negócio, basta passar o nome no final: `npx @aksp/cortex init MinhaEmpresa`.

Depois de montado, sempre que sair uma versão nova do framework, atualize as skills sem tocar nos seus dados:

```bash
npx @aksp/cortex update
```

`update` atualiza **apenas** `.agents/` (as skills e templates do framework) — nunca mexe em `Pilares/`, `Memoria/`, `Ativos/`, `Frameworks/` ou nos seus system prompts de raiz. Antes de aplicar qualquer mudança, ele mostra o que vai mudar e cria um backup automático de `.agents/`.

---

### Método 2: Via Git Clone

#### 🍎 macOS & 🐧 Linux (Bash / Zsh)
```bash
git clone https://github.com/alberthpalhares/cortex.git "NomeDaPasta" && cd "NomeDaPasta"
```

#### 🪟 Windows (PowerShell)
```powershell
git clone https://github.com/alberthpalhares/cortex.git "NomeDaPasta"; cd "NomeDaPasta"
```

#### 🪟 Windows (Prompt de Comando / CMD)
```cmd
git clone https://github.com/alberthpalhares/cortex.git "NomeDaPasta" && cd "NomeDaPasta"
```

### Alternativa (Sem Terminal)
1. Acesse o [repositório no GitHub](https://github.com/alberthpalhares/cortex)
2. Clique no botão verde **"Code"** e depois em **"Download ZIP"**
3. Extraia o ZIP na pasta do seu negócio

### Iniciando o Córtex

Independentemente de como você baixou:
1. Abra a pasta do seu negócio na sua ferramenta de IA (IDE)
2. Diga no chat:
   > "Quero montar meu Córtex"

3. **A IA oferece dois ritmos:** o **Completo** (~25 perguntas em 9 blocos, 20-30 min) ou o **Rápido** (4 perguntas, ~5 min — gera um Córtex funcional na hora e deixa o resto para completar depois).

> 💡 **Já tem documentos sobre o negócio?** (PDFs, planilhas, arquivos antigos) — Não precisa organizar nada. Na abertura, o Agente vai te perguntar se você tem algo pronto e, se indicar onde estão, ele lê tudo e já pré-preenche a entrevista pra você. Vai ser bem mais rápido!

4. **Ao final**, a IA gera automaticamente:
   - Todos os arquivos de Pilares (Estratégia, Comercial, Cultura, etc.)
   - Todos os arquivos de Memória (Decisões, Lições, Projetos, Pendências)
   - O system prompt personalizado, na fonte única `Frameworks/CEREBRO.md`
   - O `META.md` (índice de tudo)

5. **Pronto!** A partir de agora:
   - Diga **"radar"** para ver o panorama
   - Diga **"registra que..."** para anotar decisões ou lições
   - Diga **"saúde do córtex"** para ver o que ainda falta preencher (útil depois do modo Rápido)
   - Pergunte qualquer coisa sobre o negócio
   - Em 6 meses, diga **"revisar córtex"** para atualizar

---

## Funciona em qualquer IDE

O cérebro vive em um único lugar — `Frameworks/CEREBRO.md` — e o Córtex **compila** esse conteúdo para o arquivo de instrução que a sua ferramenta lê. Cada arquivo gerado carrega o cérebro **completo**, então a IA nunca precisa "seguir um atalho" até outro arquivo para saber as regras:

| Arquivo gerado | Compatível com |
|---|---|
| `AGENTS.md` *(padrão)* | OpenCode, Hermes, Roo Code e demais ferramentas que seguem o padrão AGENTS.md |
| `CLAUDE.md` | Claude Code |
| `.cursorrules` | Cursor, Windsurf |
| `GEMINI.md` | Gemini CLI, Google Antigravity |
| `CODEX.md` | OpenAI Codex, Codex CLI, ChatGPT CLI |

Por padrão só o `AGENTS.md` é gerado. Se você usa outra ferramenta, o onboarding pergunta — ou você mesmo escolhe a qualquer momento:

```bash
npx @aksp/cortex sync --targets=CLAUDE.md,.cursorrules
```

> ⚠️ Esses arquivos são **artefatos gerados**: edite sempre `Frameworks/CEREBRO.md` e rode `npx @aksp/cortex sync`. Como eles nunca são editados à mão, também não têm como ficar divergentes entre si.

---

## Estrutura de pastas gerada

```
SeuNegocio/
├── CHANGELOG.md               ← Histórico de versões e melhorias do framework
├── .gitignore                  ← Protege Pilares/Memoria/Ativos de irem para um repositório Git
├── .cortex/version.json        ← Versão do framework instalada (usado por `cortex update`)
├── AGENTS.md                   ← Cérebro compilado (gerado; outros alvos sob demanda)
├── .cortex/targets.json        ← Quais arquivos de instrução gerar
├── Pilares/
│   ├── 01_Estrategia.md      ← Posicionamento, público-alvo, metas
│   ├── 02_Cultura.md         ← Valores, equipe, conduta
│   ├── 03_Financeiro.md      ← Custos fixos, margens
│   ├── 04_Comercial.md       ← Preços, pagamento, descontos
│   ├── 05_Comunicacao.md     ← Canais, tom de voz, conteúdo
│   ├── 06_Operacao.md        ← Fluxos de trabalho, ferramentas
│   ├── 07_Juridico.md        ← Contratos, regulamentações (opcional)
│   ├── 08_Inventario.md      ← Equipamentos, estoque (opcional)
│   ├── 09_Identidade_Visual.md ← Manual de marca (opcional)
│   └── 10_[Custom].md        ← Pilares extras do seu setor (opcional)
├── Memoria/
│   ├── META.md               ← Índice rápido (a IA lê primeiro)
│   ├── 01_Decisoes.md        ← Regras já batidas
│   ├── 02_Licoes.md          ← Erros e acertos
│   ├── 03_Projetos.md        ← Projetos ativos
│   ├── 04_Pessoas_Pendencias.md ← Pendências e stakeholders
│   └── 05_Registros_Gerais.md ← Anotações diversas
├── Frameworks/
│   ├── PROTOCOLO_AUTONOMIA.md ← Protocolo de Ação Automática da IA
│   ├── PROTOCOLO_MEMORIA.md   ← Como a Memória é arquivada com o tempo, sem perder histórico
│   └── CEREBRO.md             ← Fonte única do system prompt (os 5 arquivos acima só apontam pra cá)
└── Ativos/                    ← Seus logos, templates, etc.
```

`Memoria/_Arquivo/AAAA.md` aparece automaticamente assim que a skill `consolidar` arquivar o primeiro item — não é criado no onboarding.

---

## Mantendo o Córtex atualizado

O framework (`.agents/`) e os dados do seu negócio (`Pilares/`, `Memoria/`, `Ativos/`, `Frameworks/` e os system prompts de raiz) são camadas separadas.

- `npx @aksp/cortex update` — traz skills novas e correções do framework sem nunca sobrescrever o que você já preencheu, com backup automático de `.agents/` antes de qualquer mudança.
- `npx @aksp/cortex sync` — recompila os arquivos de instrução a partir de `Frameworks/CEREBRO.md`. Use depois de editar o cérebro à mão, ou com `--targets=` para incluir uma ferramenta nova.

> 💡 Desde a v0.11.0, o `update` também **atualiza as regras de operação dentro do seu cérebro** (a área `CORTEX:FRAMEWORK`) e recompila os arquivos de instrução — é isso que faz uma skill nova realmente passar a funcionar num Córtex antigo, em vez de só aparecer no disco. A área `CORTEX:BUSINESS`, com os dados do seu negócio, nunca é tocada.

---

## Comandos rápidos

| Comando | O que faz |
|---------|-----------|
| `radar` | Mostra panorama do negócio (pendências, projetos, atrasos) |
| `registra que...` | Grava uma decisão, lição ou pendência no arquivo correto |
| `lição: ...` | Registra um aprendizado |
| `pendência: ...` | Adiciona uma tarefa pendente |
| `resolvido: ...` | Move uma pendência para "resolvidas" |
| `revisar córtex` | Inicia a revisão semestral dos pilares |
| `saúde do córtex` | Raio-x do que ainda falta preencher |
| `consolidar memória` | Arquiva itens antigos sem apagar histórico |
| `gerar proposta para [cliente]` | Monta uma proposta comercial pronta para envio |
| `analisar DRE` | Cruza uma planilha financeira com suas metas de margem |
| `pesquisar concorrência` | Mapeia concorrentes e atualiza o Panorama Competitivo |
| `ajuda` | Lista todos os comandos disponíveis |

---

## Veja um Córtex pronto

Quer ver como fica um Córtex maduro antes de montar o seu? [`examples/estudio-lumen/`](examples/estudio-lumen/) é um negócio fictício (um estúdio de fotografia e vídeo corporativo) com todos os Pilares, a Memória e o "cérebro" completos — inclusive com o Panorama Competitivo e as skills de proposta comercial em ação.

---

## Para quem é

O Córtex se adapta automaticamente ao tipo de negócio durante a entrevista:

- ✅ **Eu-presas** — MEI, autônomos, freelancers
- ✅ **Pequenas empresas** — com sócios e equipe
- ✅ **Entidades sem fins lucrativos** — associações, clubes, ONGs, projetos sociais
- ✅ **Negócios recorrentes** — academias, SaaS, consultorias mensais, escolas
- ✅ **Profissionais liberais** — advogados, médicos, consultores

---

## Como contribuir

Quer ajudar a evoluir o Córtex? Aceitamos contribuições de novas skills, templates de pilares para setores específicos, novos frameworks estratégicos e melhorias no CLI.

Leia o nosso [Guia de Contribuição (CONTRIBUTING.md)](CONTRIBUTING.md) para saber como enviar o seu Pull Request.

---

## Créditos

Criado por **Alberth Klinsmann** — Mercadólogo e Produtor Audiovisual.
Desenvolvido originalmente como sistema de gestão da **PALHARES Estúdio & Corporativo** e generalizado como framework open-source para qualquer negócio.

*"Seu negócio merece um cérebro que não esquece."*
