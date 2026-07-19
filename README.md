# 🧠 Córtex — Central de Inteligência do Seu Negócio

O **Córtex** é um framework que transforma a IA em um **Sócio Inteligente** para o seu negócio. Ele guarda tudo que você já decidiu, aprendeu e planejou em arquivos locais — e a IA consulta esses arquivos antes de te responder, como se fosse um sócio que lembra de tudo.

**Não é um CRM. Não é um ERP. É o cérebro estratégico do seu negócio.**

---

## O que você ganha

- 📡 **Radar:** Diga "radar" e veja todas as pendências, projetos e atrasos em 10 linhas
- 📝 **Registro rápido:** Diga "registra que decidi X" e a IA grava nos arquivos certos
- 🧠 **Memória viva:** A IA nunca esquece suas regras de preço, lições e decisões
- 🔄 **Revisão semestral:** A cada 6 meses, o sistema te convida a revisar o que mudou

---

## Como instalar

### Pré-requisitos
- Uma ferramenta de chat com IA que leia arquivos locais (ex: Google Antigravity, Gemini CLI, Claude Code, Cursor, etc.)
- A pasta de skills do Córtex copiada para o seu computador

### Passo a passo

1. **Copie a pasta `cortex-onboarding`** para a pasta de skills da sua ferramenta de IA:
   - Antigravity/Gemini: `C:\Users\SEU_USUARIO\.agents\skills\`
   - Claude: siga o padrão de skills do Claude Code

2. **Copie também** as pastas `cortex-revisao`, `radar` e `registrar` para o mesmo local

3. **Abra um chat** com sua ferramenta de IA e diga:
   > "Quero montar meu Córtex"

4. **A IA vai conduzir uma entrevista** com você. São cerca de 25 perguntas divididas em 8 blocos. Dura cerca de 20-30 minutos.

5. **Ao final**, a IA gera automaticamente:
   - Todos os arquivos de Pilares (Estratégia, Comercial, Cultura, etc.)
   - Todos os arquivos de Memória (Decisões, Lições, Projetos, Pendências)
   - O arquivo `CORTEX.md` (as instruções personalizadas da IA para o SEU negócio)
   - O `META.md` (índice de tudo)

6. **Pronto!** A partir de agora:
   - Diga **"radar"** para ver o panorama
   - Diga **"registra que..."** para anotar decisões ou lições
   - Pergunte qualquer coisa sobre o negócio
   - Em 6 meses, diga **"revisar córtex"** para atualizar

---

## Estrutura de pastas gerada

```
SeuNegocio/
├── CORTEX.md                 ← Instruções da IA (gerado pelo onboarding)
├── Pilares/
│   ├── 01_Estrategia.md      ← Posicionamento, ICP, metas
│   ├── 02_Cultura.md         ← Valores, equipe, conduta
│   ├── 03_Financeiro.md      ← Custos fixos, margens
│   ├── 04_Comercial.md       ← Preços, pagamento, descontos
│   ├── 05_Comunicacao.md     ← Canais, tom de voz, conteúdo
│   ├── 06_Operacao.md        ← Fluxos de trabalho, ferramentas
│   ├── 07_Juridico.md        ← Contratos, regulamentações (opcional)
│   ├── 08_Inventario.md      ← Equipamentos, estoque (opcional)
│   └── 09_Identidade_Visual.md ← Manual de marca (opcional)
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

- ✅ Micro-empreendedores (MEI, autônomos, freelancers)
- ✅ Pequenas empresas com poucos sócios
- ✅ Entidades sem fins lucrativos (associações, clubes, ONGs)
- ✅ Profissionais liberais (advogados, médicos, consultores)
- ✅ Qualquer pessoa que toma decisões de negócio e não quer esquecê-las

---

## Créditos

Criado por **Alberth Klinsmann** — Mercadólogo e Produtor Audiovisual.
Desenvolvido originalmente como sistema de gestão da **PALHARES Estúdio & Corporativo** e generalizado como framework open-source para qualquer negócio.

*"Seu negócio merece um cérebro que não esquece."*
