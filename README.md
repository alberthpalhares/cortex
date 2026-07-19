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

## Como instalar

### Pré-requisitos
- Uma ferramenta de chat com IA que leia arquivos locais (ex: Google Antigravity, Gemini CLI, Claude Code, Cursor, OpenCode, etc.)
- Git instalado (opcional, mas recomendado)

### Passo a passo (Via Terminal)

Se você já usa o terminal, abra na pasta onde quer instalar e cole o comando abaixo de uma vez só. 
*(Obs: substitua "NomeDaPasta" pelo nome real do seu projeto. Mantenha as aspas!)*

```bash
git clone https://github.com/alberthpalhares/cortex.git "NomeDaPasta"; cd "NomeDaPasta"
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
| `AGENTS.md` | OpenCode, Hermes, Roo Code |
| `.cursorrules` | Cursor, Windsurf |

Você pode alternar entre ferramentas no mesmo projeto sem reconfigurar nada.

---

## Estrutura de pastas gerada

```
SeuNegocio/
├── GEMINI.md / CLAUDE.md / AGENTS.md  ← System prompts (gerados pelo onboarding)
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
│   └── BLOCOS_FUNDAMENTAIS.md ← Motor de engenharia de prompt
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
