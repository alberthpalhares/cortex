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
- Uma ferramenta de chat com IA que leia arquivos locais (ex: Google Antigravity, Gemini CLI, Claude Code, Cursor, OpenCode, etc.)
- Git instalado (opcional, mas recomendado)

### Passo a Passo (Via Terminal)

Abra o terminal na pasta onde deseja instalar e execute o comando correspondente ao seu sistema operacional:

> 💡 **Obs:** Substitua `"NomeDaPasta"` pelo nome real da pasta do seu negócio (mantenha as aspas para evitar erros se o nome tiver espaços!).

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

3. **A IA vai conduzir uma entrevista** com você. São cerca de 25 perguntas divididas em 9 blocos. Dura cerca de 20-30 minutos.

> 💡 **Já tem documentos sobre o negócio?** (PDFs, planilhas, arquivos antigos) — Não precisa organizar nada. Na abertura, o Agente vai te perguntar se você tem algo pronto e, se indicar onde estão, ele lê tudo e já pré-preenche a entrevista pra você. Vai ser bem mais rápido!

4. **Ao final**, a IA gera automaticamente:
   - Todos os arquivos de Pilares (Estratégia, Comercial, Cultura, etc.)
   - Todos os arquivos de Memória (Decisões, Lições, Projetos, Pendências)
   - O system prompt personalizado para a sua IA
   - O `META.md` (índice de tudo)

5. **Pronto!** A partir de agora:
   - Diga **"radar"** para ver o panorama
   - Diga **"registra que..."** para anotar decisões ou lições
   - Pergunte qualquer coisa sobre o negócio
   - Em 6 meses, diga **"revisar córtex"** para atualizar

---

## Funciona em qualquer IDE

O Córtex gera automaticamente system prompts compatíveis com múltiplas ferramentas:

| Arquivo | Compatível com |
|---|---|
| `GEMINI.md` | Gemini CLI, Google Antigravity |
| `CLAUDE.md` | Claude Code |
| `CODEX.md` | OpenAI Codex, Codex CLI, ChatGPT CLI |
| `AGENTS.md` | OpenCode, Hermes, Roo Code |
| `.cursorrules` | Cursor, Windsurf |

Você pode alternar entre ferramentas no mesmo projeto sem reconfigurar nada.

---

## Estrutura de pastas gerada

```
SeuNegocio/
├── GEMINI.md / CLAUDE.md / CODEX.md / AGENTS.md  ← System prompts (gerados pelo onboarding)
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
│   └── PROTOCOLO_AUTONOMIA.md ← Protocolo de Ação Automática da IA
└── Ativos/                    ← Seus logos, templates, etc.
```

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

---

## Para quem é

O Córtex se adapta automaticamente ao tipo de negócio durante a entrevista:

- ✅ **Eu-presas** — MEI, autônomos, freelancers
- ✅ **Pequenas empresas** — com sócios e equipe
- ✅ **Entidades sem fins lucrativos** — associações, clubes, ONGs, projetos sociais
- ✅ **Negócios recorrentes** — academias, SaaS, consultorias mensais, escolas
- ✅ **Profissionais liberais** — advogados, médicos, consultores

---

## Créditos

Criado por **Alberth Klinsmann** — Mercadólogo e Produtor Audiovisual.
Desenvolvido originalmente como sistema de gestão da **PALHARES Estúdio & Corporativo** e generalizado como framework open-source para qualquer negócio.

*"Seu negócio merece um cérebro que não esquece."*
