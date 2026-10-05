# 🧠 Córtex — o sócio que lembra de tudo

O **Córtex** transforma a sua IA em um **sócio que conhece o seu negócio**. Ele guarda em arquivos simples, no seu computador, tudo o que você já decidiu, aprendeu e planejou — e a IA consulta esses arquivos antes de te responder.

**Não é um CRM. Não é um ERP. É a memória e o bom senso do seu negócio, sempre à mão.**

> **Para quem é:** MEI e autônomos · pequenas empresas com sócios e equipe · associações, clubes e ONGs · negócios de assinatura ou mensalidade. A conversa de montagem se adapta ao seu tipo de negócio.

---

## Comece em 5 minutos

**Você precisa de duas coisas:** o [Node.js](https://nodejs.org) instalado (versão LTS) e uma ferramenta de IA que trabalhe com as pastas do seu computador — [veja qual escolher](#qual-ferramenta-de-ia-escolher).

**1. Instale** — abra o terminal dentro da pasta do seu negócio e rode:

```bash
npx @aksp/cortex init
```

**2. Abra essa mesma pasta na sua ferramenta de IA** e escreva no chat:

> Quero montar meu Córtex

**3. Responda 4 perguntas rápidas.** Pronto: a partir daí, é só conversar.

> 💡 Não sabe abrir o terminal numa pasta? No Windows, abra a pasta no Explorador de Arquivos, clique na barra de endereço, digite `cmd` e aperte Enter. No Mac, abra o aplicativo Terminal, digite `cd ` (com espaço), arraste a pasta para a janela e aperte Enter.

---

## Como é usar

Você conversa em português, do seu jeito. Alguns exemplos reais:

**Você diz `radar`:**

```
📡 RADAR ESTÚDIO LUMEN — 04/10/2026

🔴 ATRASADOS / URGENTES:
   • Enviar orçamento revisado para a Construtora Alfa (venceu ontem)
   • Renovar licença do editor de vídeo (vence sexta)

⏳ AGUARDANDO TERCEIROS:
   • Aprovação do roteiro — cliente Beta

📂 PROJETOS ATIVOS:
   • Vídeo institucional Beta - EXECUÇÃO

🎯 META DO TRIMESTRE: fechar 5 clientes novos — 2 de 5

💡 O que você gostaria de focar hoje?
```

**Você diz `registra que decidi não dar mais de 10% de desconto`:**

```
- [2026-10-04] Desconto máximo de 10%, sem exceção.  ✅
(disse errado? é só falar "desfaz")
```

**Você pergunta `o que você sabe sobre o fornecedor de iluminação?`:**

```
🔎 O que está registrado sobre o fornecedor de iluminação:

• Trocamos para a LuzPro por causa do prazo de entrega — Decisões, 12/03/2026
• Atrasou a entrega do kit em maio; combinar sempre 3 dias de folga — Lições, 20/05/2026
```

**Você pergunta `posso dar 15% de desconto para fechar com esse cliente?`** — e ela responde com base nas *suas* regras de preço e margem, não em conselho genérico:

```
Custo Real: R$ 150 de custo direto + 9% de imposto e taxa
Margem Resultante: 62% — de cada R$ 100 cobrados, sobram R$ 62
Veredito: Aprovar com ressalva — passa do seu desconto máximo (10%); só com contrato recorrente.
```

Se você ainda não sabe a sua margem, ela não trava nem chuta: conduz você a descobrir, com um trabalho que você já fez.

---

## O que dá para pedir

| Situação | Diga | O que acontece |
|---|---|---|
| **No dia a dia** | `radar` | O que está atrasado, parado e em que focar hoje |
| | `registra que...` | Guarda uma decisão, lição, pendência ou pessoa (errou? `desfaz`) |
| | `anota a reunião` | Você cola as anotações; ela separa decisões, pendências e lições |
| | `o que você sabe sobre...` | Diz o que já está registrado, com data |
| | `fechar a semana` | 5 minutos: o que andou, o que ficou e o foco da próxima |
| **Para vender e comunicar** | `gerar proposta para [cliente]` | Proposta pronta, com seus preços e seu tom |
| | `cria um post sobre...` | Post, legenda ou mensagem de WhatsApp do seu jeito |
| | `descobrir minha margem` | Em 5 minutos, com um trabalho seu de verdade, descobrimos quanto sobra de cada venda — não precisa saber nada antes |
| | `analisar DRE` | Compara seus números com as suas metas de margem |
| | `pesquisar concorrência` | Quem são, quanto cobram, onde você se diferencia |
| **Para cuidar do Córtex** | `continuar onboarding` | Completa o que ficou faltando, um bloco de 2–5 minutos por vez |
| | `saúde do córtex` | Mostra o que ainda está em branco |
| | `revisar córtex` | A cada 6 meses, confere o que mudou |
| | `consolidar memória` | Arquiva o que ficou antigo, sem apagar nada |
| | `ajuda` | Mostra esta lista dentro do chat |

Quer ver um Córtex já preenchido? Veja [`examples/estudio-lumen/`](https://github.com/alberthpalhares/cortex/tree/master/examples/estudio-lumen), um estúdio de fotografia fictício.

---

## Qual ferramenta de IA escolher?

O Córtex precisa de uma IA que **leia e escreva arquivos na pasta do seu negócio**. O ChatGPT, o Gemini e o Claude *pelo navegador* não fazem isso — por isso ele usa as ferramentas abaixo.

| Ferramenta | Como é | Para quem |
|---|---|---|
| [**Claude Code**](https://www.anthropic.com/claude-code) | Aplicativo de computador com janela de chat (também funciona no terminal) | Quem nunca usou nada disso e quer o caminho mais simples |
| [**Cursor**](https://cursor.com) | Editor com chat ao lado; você abre a pasta pelo menu | Quem prefere ver os arquivos enquanto conversa |
| [**Gemini CLI**](https://github.com/google-gemini/gemini-cli) | Funciona dentro do terminal | Quem já se vira com terminal |
| OpenAI Codex, OpenCode e outras | Leem o arquivo `AGENTS.md` | Quem já usa uma delas |

**"Abrir a pasta" quer dizer:** no aplicativo ou editor, escolher *Abrir pasta* e apontar para a pasta do negócio; nas ferramentas de terminal, abrir o terminal *dentro* da pasta e digitar o nome da ferramenta (`claude`, `gemini`).

**Quanto custa:** o Córtex é gratuito e de código aberto. A ferramenta de IA é à parte — algumas têm uso gratuito com limite, outras exigem assinatura. Os planos mudam com frequência; confira no site de cada uma antes de decidir.

**O `init` já prepara** o Claude Code e as ferramentas que leem `AGENTS.md`. Para Cursor ou Gemini CLI, rode também (pode ser depois do `init`, antes da conversa de montagem):

```bash
npx @aksp/cortex init --targets=.cursorrules,GEMINI.md
```

---

## Seus dados

- **Os arquivos são seus e ficam no seu computador.** Texto simples (Markdown), que você abre em qualquer editor, copia, faz backup e leva para outra ferramenta quando quiser.
- **Sem conta, sem servidor do Córtex, sem coleta de dados.** O Córtex não envia nada para lugar nenhum.
- **Mas a IA lê os arquivos para responder** — e o que ela lê é enviado ao fornecedor da ferramenta que você escolheu (Anthropic, Google, OpenAI…), como em qualquer conversa com IA. Vale conferir a política de privacidade da sua ferramenta, principalmente se você guarda dados de clientes.
- **Não guarde senhas.** O Córtex registra *onde* um acesso fica guardado, nunca a senha em si.
- Se você usa Git na pasta: o `.gitignore` que vem com o Córtex já deixa de fora `Pilares/`, `Memoria/` e `Ativos/`. Atenção: `Frameworks/CEREBRO.md`, `AGENTS.md` e `.cortex/meta.json` também trazem o nome e dados do negócio — não publique a pasta em repositório aberto.

### Por que não dá para usar no navegador?

| | 🧠 Córtex (na sua pasta) | 🌐 GPT / Gem / Projeto (navegador) |
|---|---|---|
| **Ler seus arquivos** | Lê sozinho, na hora | Você envia manualmente, toda vez |
| **Guardar decisões e lições** | Grava no arquivo certo quando você diz "registra que…" | Responde, mas não guarda nada |
| **Memória entre conversas** | Permanente — está nos arquivos | Limitada, pode se perder |
| **Trocar de ferramenta** | Os mesmos arquivos funcionam em várias | Preso a uma plataforma |

---

## Problemas comuns

**"npx não é reconhecido como comando"** — o Node.js não está instalado (ou o terminal foi aberto antes da instalação). Instale pelo [nodejs.org](https://nodejs.org), feche e abra o terminal de novo.

**No Windows, o PowerShell reclama de "execução de scripts desabilitada"** — use o *Prompt de Comando* (`cmd`) em vez do PowerShell; lá o mesmo comando funciona.

**"A pasta de destino não está vazia"** — o Córtex cria as pastas dele (`Pilares`, `Memoria`, `Frameworks`, `Ativos`, `.agents`) ao lado dos seus arquivos. Se a pasta já tiver um `.gitignore`, `AGENTS.md` ou `CLAUDE.md` seus, o Córtex guarda uma cópia em `.cortex/backups` antes de mexer, mantém as suas regras do `.gitignore` e não sobrescreve o seu `CLAUDE.md`. E não rode o `init` de novo numa pasta onde o Córtex já foi montado: para atualizar, use `update`.

**A IA não começou a conversa de montagem** — confirme que você abriu *a pasta onde rodou o `init`* (e não uma pasta acima). Se usa Cursor ou Gemini CLI, rode o comando com `--targets=` mostrado acima. Em último caso, diga: *"Leia o arquivo `.agents/skills/cortex-onboarding/SKILL.md` e siga as instruções."*

**Como faço backup?** — copie a pasta inteira do negócio para onde você já guarda seus backups (HD externo, nuvem pessoal). Não há nada escondido em outro lugar.

**Quero conferir se está tudo certo, sem gastar com IA** — rode `npx @aksp/cortex doctor` no terminal.

**Tem outra dúvida?** Abra uma [issue no GitHub](https://github.com/alberthpalhares/cortex/issues).

---

## O que fica na sua pasta

```
SeuNegocio/
├── Pilares/                    ← O que o negócio É (muda pouco)
│   ├── 01_Estrategia.md        ← Posicionamento, cliente ideal, metas ✅
│   ├── 02_Cultura.md           ← Valores, equipe, conduta ✅
│   ├── 03_Financeiro.md        ← Custos e margens (opcional)
│   ├── 04_Comercial.md         ← Preços, pagamento, descontos (opcional)
│   ├── 05_Comunicacao.md       ← Canais, tom de voz, conteúdo ✅
│   ├── 06_Operacao.md          ← Rotina e ferramentas ✅
│   ├── 07_Juridico.md          ← Contratos e regras do setor (opcional)
│   ├── 08_Inventario.md        ← Equipamentos e estoque (opcional)
│   ├── 09_Identidade_Visual.md ← Marca (opcional)
│   └── 10_[Seu_Pilar].md       ← Áreas específicas do seu setor (opcional)
├── Memoria/                    ← O que o negócio APRENDE (muda sempre)
│   ├── META.md                 ← Índice — a IA lê primeiro
│   ├── 01_Decisoes.md          ← Regras já batidas
│   ├── 02_Licoes.md            ← Erros e acertos
│   ├── 03_Projetos.md          ← Projetos e a meta do trimestre
│   ├── 04_Pessoas_Pendencias.md← Pessoas-chave e pendências
│   └── 05_Registros_Gerais.md  ← Anotações diversas
├── Ativos/                     ← Seus logos e os documentos que a IA gera (propostas, textos)
├── Frameworks/
│   ├── CEREBRO.md              ← As instruções da IA para o SEU negócio (fonte única)
│   ├── PROTOCOLO_AUTONOMIA.md  ← Como a IA age com pedidos curtos
│   └── PROTOCOLO_MEMORIA.md    ← Como a memória é arquivada sem perder histórico
├── AGENTS.md / CLAUDE.md       ← Gerados a partir do CEREBRO.md — não edite à mão
├── .agents/                    ← O framework (habilidades da IA) — atualizado pelo `update`
└── .cortex/                    ← Versão instalada, ferramentas escolhidas e dados básicos do negócio
```

✅ = criado já na montagem rápida. Os demais entram quando fizerem sentido para você.

Os arquivos `META.md`, `CEREBRO.md`, `AGENTS.md`/`CLAUDE.md` e parte do `.cortex/` só aparecem **depois** da conversa de montagem.

---

## Mantendo o Córtex atualizado

O framework (`.agents/`) e os dados do seu negócio são camadas separadas — atualizar um nunca apaga o outro.

| Comando | Para quê |
|---|---|
| `npx @aksp/cortex@latest update` | Traz habilidades novas e correções. Mostra o que vai mudar, pede confirmação e faz backup antes. **Nunca toca** em `Pilares/`, `Memoria/`, `Ativos/` nem nos dados do negócio dentro do `CEREBRO.md`. |
| `npx @aksp/cortex sync` | Regera `AGENTS.md`/`CLAUDE.md` depois que você editar o `Frameworks/CEREBRO.md` à mão. Com `--targets=` você escolhe para quais ferramentas gerar: liste **todas** as que usa (ex.: `--targets=AGENTS.md,CLAUDE.md,GEMINI.md`), porque a lista substitui a anterior. |
| `npx @aksp/cortex doctor` | Confere a estrutura no terminal, sem usar IA: o que falta preencher, se o cérebro está em ordem e se existe versão nova. |

**Se quem roda o comando é a sua IA:** peça para ela acrescentar `--force` (por exemplo, `npx @aksp/cortex@latest update --force`). Sem terminal para confirmar, o comando só mostra o que faria e não altera nada.

**Como eu fico sabendo que saiu versão nova?** O `doctor` avisa na hora (ele consulta só o número da versão no npm; nada da sua pasta é enviado, e `--offline` desliga a consulta). O `radar` lembra quando faz mais de 3 meses que você não atualiza. E depois de cada `update`, é só dizer **`novidades`** no chat: a IA conta o que mudou e oferece testar o que for mais útil para você.

> Use sempre `@aksp/cortex` — o pacote `cortex`, sem o prefixo, é outro projeto.

<details>
<summary>Detalhes para quem gosta de saber como funciona</summary>

- O `CEREBRO.md` tem duas áreas marcadas: `CORTEX:BUSINESS` (identidade, datas e pilares do seu negócio) e `CORTEX:FRAMEWORK` (regras de funcionamento do Córtex). O `update` regenera só a segunda — é assim que uma habilidade nova passa a funcionar num Córtex antigo.
- `AGENTS.md` recebe o cérebro completo. `CLAUDE.md` contém uma linha `@AGENTS.md`, que o Claude Code importa automaticamente — a fonte continua única.
- As escolhas ficam em `.cortex/targets.json`. Os contratos estáveis do framework estão em [`CONTRACTS.md`](https://github.com/alberthpalhares/cortex/blob/master/CONTRACTS.md).

</details>

### Outras formas de instalar

- **Em uma pasta nova:** `npx @aksp/cortex init "Minha Empresa"`
- **Sem Node.js:** baixe o [ZIP do repositório](https://github.com/alberthpalhares/cortex/archive/refs/heads/master.zip) ou use `git clone https://github.com/alberthpalhares/cortex.git "NomeDaPasta"`. Esses caminhos trazem também arquivos de desenvolvimento do framework (`bin/`, `test/`, `examples/`), que você pode apagar; prefira o `npx`.

---

## Como contribuir

Aceitamos novas habilidades, modelos de pilares para setores específicos e melhorias no instalador. Leia o [Guia de Contribuição](https://github.com/alberthpalhares/cortex/blob/master/CONTRIBUTING.md).

---

## Créditos

Criado por **Alberth Klinsmann** — Mercadólogo e Produtor Audiovisual.
Nasceu como o sistema de gestão da **PALHARES Estúdio & Corporativo** e foi generalizado como framework de código aberto para qualquer negócio.

*"Seu negócio merece um cérebro que não esquece."*
