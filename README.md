# 🧠 Córtex — o sócio que lembra de tudo

O **Córtex** transforma a sua IA em um **sócio que conhece o seu negócio**. Ele guarda em arquivos simples, no seu computador, tudo o que você já decidiu, aprendeu e planejou — e a IA consulta esses arquivos antes de te responder.

**Não é um CRM. Não é um ERP. É a memória e o bom senso do seu negócio, sempre à mão.**

> **Para quem é:** MEI e autônomos · pequenas empresas com sócios e equipe · associações, clubes e ONGs · negócios de assinatura ou mensalidade. A conversa de montagem se adapta ao seu tipo de negócio.

---

## Comece em 5 minutos

Você precisa de uma ferramenta de IA que trabalhe com as pastas do seu computador — [veja qual escolher](#qual-ferramenta-de-ia-escolher). Há dois jeitos de começar; o resultado é o mesmo.

### Sem terminal (baixar e abrir)

**1. Baixe a [pasta pronta do Córtex (ZIP)](https://github.com/alberthpalhares/cortex/releases/latest/download/cortex.zip)** e descompacte (no Windows: botão direito no arquivo → *Extrair tudo*; no Mac: dois cliques). Dê à pasta o nome do seu negócio e guarde onde preferir.

**2. Abra essa pasta na sua ferramenta de IA** e escreva no chat:

> Quero montar meu Córtex

**3. Responda 4 perguntas rápidas.** Pronto: a partir daí, é só conversar. Dentro da pasta há um arquivo `COMECE-AQUI.txt` com estes passos e as frases do dia a dia.

Para **começar** não é preciso instalar mais nada. Para **atualizar** o Córtex quando sair versão nova, aí sim é preciso o [Node.js](https://nodejs.org) — veja [Mantendo o Córtex atualizado](#mantendo-o-córtex-atualizado). Seus dados continuam funcionando mesmo sem atualizar.

### Com o Node.js (pelo terminal)

Você precisa do [Node.js](https://nodejs.org) instalado (versão LTS).

**1. Instale** — abra o terminal dentro da pasta do seu negócio e rode:

```bash
npx @aksp/cortex init
```

Na primeira vez, o próprio `npx` pergunta em inglês `Ok to proceed? (y)` — ele só quer saber se pode baixar o Córtex. Digite `y` e aperte Enter.

A pasta pode já ter os seus arquivos: o Córtex cria as pastas dele ao lado e não apaga nada seu. Só evite instalar direto na Área de Trabalho, em Documentos ou na sua pasta pessoal — para criar uma pasta só para o negócio, rode `npx @aksp/cortex init "Meu Negocio"`.

**2. Abra essa mesma pasta na sua ferramenta de IA** e escreva no chat:

> Quero montar meu Córtex

**3. Responda 4 perguntas rápidas.** Pronto: a partir daí, é só conversar. O `init` deixa na pasta um `COMECE-AQUI.txt` com estes passos e as frases do dia a dia, para ler ou imprimir.

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
   • Cliente Beta — aprovação do roteiro — há 6 dias

🗂️ DEPOIS / SEM PRAZO:
   • Entregar o vídeo institucional da Beta — 20/10
   • Sem prazo: 2 itens, o mais antigo há 19 dias

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

**Você pergunta `posso dar 15% de desconto na cobertura de evento para fechar com esse cliente?`** — e ela responde com base nas *suas* regras de preço e margem, não em conselho genérico:

```
Custo Real: R$ 350 de custo direto + 9% de imposto e taxas (R$ 191,25) = R$ 541,25
Margem Resultante: 74,5% — de cada R$ 100 cobrados, sobram R$ 74,50
Veredito: Contraproposta — 15% passa do desconto máximo que você definiu (10%).
          Com 10% fica R$ 2.250 e continua dentro da sua regra. Abrir exceção é decisão sua.
```

**Você pergunta `quanto cobrar por um trabalho que me custa R$ 1.000?`:**

```
Custo: R$ 1.000 de custo direto + 9% de imposto e taxas sobre o preço
Preço mínimo: R$ 1.408,45 (margem de 20%)
Preço-alvo: R$ 1.785,71 (margem de 35% — de cada R$ 100, sobram R$ 35)
```

Se você ainda não sabe a sua margem, ela não trava nem chuta: conduz você a descobrir, com um trabalho que você já fez. As contas usam os seus números; imposto e regime tributário continuam com o seu contador.

---

## O que dá para pedir

| Situação | Diga | O que acontece |
|---|---|---|
| **No dia a dia** | `radar` | O que está atrasado, parado e em que focar hoje |
| | `registra que...` | Guarda uma decisão, lição, pendência ou pessoa (errou? `desfaz`) |
| | `me lembra de...` | Vira uma pendência com data, que aparece no radar (ela não manda aviso no celular) |
| | `todo dia 20...` ou `toda segunda...` | Guarda o que se repete (imposto, aluguel, relatório, renovação anual): volta ao radar na semana de cada data, e `feito` só marca a vez e espera a próxima |
| | `anota a reunião` | Você cola as anotações; ela separa decisões, pendências e lições |
| | `anota isso` | Você cola o que ditou ou mandou para si mesmo no WhatsApp; cada anotação fica com a data do dia dela |
| | `estou em dúvida entre A e B` | Pesa as duas opções com o que você já decidiu e aprendeu, e guarda a escolha com o porquê |
| | `o que você sabe sobre...` | Diz o que já está registrado, com data |
| | `fechar a semana` | 5 minutos: o que andou, o que ficou e o foco da próxima |
| **Para vender e comunicar** | `gerar proposta para [cliente]` | Proposta pronta, com seus preços e seu tom |
| | `enviei a proposta para [cliente]` | Acompanha o retorno no radar; depois, `a proposta fechou` ou `perdemos a proposta` guarda o desfecho e o motivo |
| | `cria um post sobre...` | Post, legenda ou mensagem de WhatsApp do seu jeito |
| | `responde esse cliente` ou `cobra o [cliente]` | Mensagem pronta para uma pessoa, dentro das suas regras de preço e pagamento |
| | `preparar reunião com [pessoa]` | O que está em aberto, o que já foi combinado e até onde você pode ir |
| | `descobrir minha margem` | Em 5 minutos, com um trabalho seu de verdade, descobrimos quanto sobra de cada venda — não precisa saber nada antes |
| | `quanto cobrar por...` | A partir do custo, calcula o preço mínimo e o preço-alvo que respeitam a sua margem |
| | `analisar DRE` | Compara seus números com as suas metas de margem e guarda o resultado do mês (receita, custos, resultado e margem) |
| | `como foi setembro?` ou `como está o ano?` | Compara os meses que você já trouxe: com o mês anterior, com o mesmo mês do ano passado e o acumulado do ano |
| | `pesquisar concorrência` | Quem são, quanto cobram, onde você se diferencia |
| **Para cuidar do Córtex** | `continuar onboarding` | Completa o que ficou faltando, um bloco de 2–5 minutos por vez |
| | `saúde do córtex` | Mostra o que ainda está em branco |
| | `revisar córtex` | A cada 6 meses, confere o que mudou (guarda uma cópia antes de alterar) |
| | `consolidar memória` | Arquiva o que ficou antigo, sem apagar nada (guarda uma cópia antes de mexer) |
| | `tenho uma sugestão para o Córtex` ou `deu problema no Córtex` | Ela escreve um recado curto para o criador, sem nenhum dado do seu negócio; quem envia é você |
| | `ajuda` | Mostra esta lista dentro do chat |

Quer ver um Córtex já preenchido, sem responder nenhuma pergunta? Baixe o [exemplo pronto (ZIP)](https://github.com/alberthpalhares/cortex/releases/latest/download/cortex-exemplo-estudio-lumen.zip), de um estúdio de fotografia fictício, descompacte, abra a pasta na sua ferramenta de IA e diga `radar`. Para só ler os arquivos, veja [`examples/estudio-lumen/`](https://github.com/alberthpalhares/cortex/tree/master/examples/estudio-lumen).

---

## Longe do computador

O Córtex mora na pasta do computador, mas as decisões acontecem na rua, no cliente, no carro. Duas receitas simples, sem instalar nada:

**1. Anote no celular e cole depois.** No WhatsApp, crie um grupo só com você (ou use a conversa "Você") e mande para lá o que for acontecendo, digitando ou ditando pelo microfone do teclado: *"fechei com a Clínica Vértice por R$ 2.500"*, *"cobrar o sinal do João até sexta"*. No computador, abra o WhatsApp Web, selecione as mensagens, copie, cole no chat e escreva `anota isso`. A IA separa decisões, pendências e lições e usa **o dia de cada anotação** (o carimbo do WhatsApp, ou um "ontem", "segunda"), não o dia em que você colou. Antes de gravar, ela mostra a lista e as datas que entendeu.

**2. Dite em vez de digitar.** No computador, o ditado do sistema escreve o que você fala direto no chat: `Win + H` no Windows; no Mac, a tecla do microfone (ou *Ajustes do Sistema → Teclado → Ditado*).

Com franqueza: áudio gravado não é lido (mande texto, ou dite), e a IA não avisa no celular. Para não esquecer dos dois momentos da semana, crie na sua agenda dois compromissos que se repetem: **segunda de manhã, "radar"** e **sexta à tarde, "fechar a semana"**. Na Google Agenda, estes links já abrem cada um preenchido, é só ajustar o horário e salvar (a data de janeiro de 2026 que aparece é só o ponto de partida da repetição: deixe como está): [radar na segunda](https://calendar.google.com/calendar/render?action=TEMPLATE&text=Radar+do+C%C3%B3rtex&details=Abrir+a+pasta+do+neg%C3%B3cio+na+ferramenta+de+IA+e+dizer%3A+radar&dates=20260105T090000/20260105T091500&recur=RRULE%3AFREQ%3DWEEKLY%3BBYDAY%3DMO) · [fechar a semana na sexta](https://calendar.google.com/calendar/render?action=TEMPLATE&text=Fechar+a+semana+no+C%C3%B3rtex&details=Abrir+a+pasta+do+neg%C3%B3cio+na+ferramenta+de+IA+e+dizer%3A+fechar+a+semana&dates=20260109T160000/20260109T161500&recur=RRULE%3AFREQ%3DWEEKLY%3BBYDAY%3DFR). No primeiro `fechar a semana`, a própria IA sugere isso, uma vez só.

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

**Qual modelo usar:** dentro da ferramenta, prefira o modelo padrão ou o mais capaz, não o menor e mais barato. Nos nossos testes de conversa, os modelos menores erram datas, inventam detalhes e às vezes não seguem as regras do Córtex.

**Quanto custa:** o Córtex é gratuito e de código aberto. A ferramenta de IA é à parte — algumas têm uso gratuito com limite, outras exigem assinatura. Os planos mudam com frequência; confira no site de cada uma antes de decidir.

**O `init` e a pasta pronta (ZIP) já vêm preparados** para o Claude Code, o Gemini CLI e as ferramentas que leem `AGENTS.md`. Para o Cursor, rode também (pede o Node.js; pode ser depois do `init` ou de descompactar a pasta, antes da conversa de montagem):

```bash
npx @aksp/cortex init --targets=.cursorrules
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

**Posso instalar numa pasta que já tem arquivos?** — pode, é o caso normal. O Córtex cria as pastas dele (`Pilares`, `Memoria`, `Frameworks`, `Ativos`, `.agents`) ao lado dos seus arquivos. Ele só pergunta antes de continuar se você já tiver uma pasta com um desses nomes, um `AGENTS.md` ou `GEMINI.md` seu (que seria substituído pelo do Córtex), ou se estiver instalando direto na Área de Trabalho, em Documentos, em Downloads, na sua pasta pessoal ou numa pasta do sistema, como a do Windows (aí ele sugere criar uma pasta só para o negócio). Em qualquer caso, se a pasta já tiver um `.gitignore`, `AGENTS.md`, `CLAUDE.md` ou `GEMINI.md` seus, o Córtex guarda uma cópia em `.cortex/backups` antes de mexer; ele mantém as suas regras do `.gitignore` e o texto do seu `CLAUDE.md`, que só ganha uma linha no fim. Se existir um arquivo seu chamado `Pilares`, `Memoria`, `Frameworks` ou `Ativos`, ele para antes de gravar e pede para você renomear o arquivo. E não rode o `init` de novo numa pasta onde o Córtex já foi montado: para atualizar, use `update`.

**A IA não começou a conversa de montagem** — confirme que você abriu *a pasta onde rodou o `init`* (e não uma pasta acima). Se usa o Cursor, rode o comando com `--targets=` mostrado acima. Em último caso, diga: *"Leia o arquivo `.agents/skills/cortex-onboarding/SKILL.md` e siga as instruções."*

**Como faço backup?** — rode `npx @aksp/cortex@latest backup` (ou peça para a sua IA rodar): ele guarda uma cópia de `Pilares`, `Memoria`, `Ativos` e do `CEREBRO.md` em `.cortex/backups/dados-<data>`, sem alterar nada. Vale fazer antes de uma arrumação grande na memória. Para restaurar, rode `npx @aksp/cortex@latest restore` (ele mostra o que vai mudar, guarda antes uma cópia de como está e diz como desfazer; `restore --list` mostra as cópias que existem). Para recuperar um arquivo só, copie de volta o arquivo ou a pasta que quiser; essas cópias nunca são apagadas sozinhas. Como elas ficam dentro da própria pasta, para se proteger de perder o computador copie também a pasta inteira do negócio para onde você já guarda seus backups (HD externo, nuvem pessoal). Não há nada escondido em outro lugar.

**Só os dados vieram para o computador novo (a `Memoria`, talvez os `Pilares`), sem o resto** — rode `npx @aksp/cortex@latest update` nessa pasta. Ele repõe as habilidades e reconstrói o cérebro a partir do que está escrito nos seus arquivos, sem alterar nenhum deles; o que não der para saber (o nome do negócio, uma data) fica marcado com `<!-- REVISAR -->`. Depois abra a pasta na sua IA e diga `revisar córtex`.

**Quero conferir se está tudo certo, sem gastar com IA** — rode `npx @aksp/cortex doctor` no terminal.

**Algo não funcionou, ou tem uma sugestão?** Diga no chat `deu problema no Córtex` ou `tenho uma sugestão para o Córtex`: a IA escreve um recado curto, sem nenhum dado do seu negócio, e você decide se envia. O recado (ou qualquer outra dúvida) vai numa [issue no GitHub](https://github.com/alberthpalhares/cortex/issues/new), que pede uma conta gratuita. Atenção: essa página é pública, qualquer pessoa na internet pode ler o que você colar lá; a IA avisa disso antes de você copiar. O Córtex não coleta nada sozinho: o criador só fica sabendo do que você contar.

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
│   └── CEREBRO.md              ← As instruções da IA para o SEU negócio (fonte única)
├── AGENTS.md / CLAUDE.md / GEMINI.md ← O que a IA lê primeiro; depois da montagem, gerados a partir do CEREBRO.md — não edite à mão
├── COMECE-AQUI.txt             ← Como começar e as frases do dia a dia (para ler ou imprimir)
├── .agents/                    ← O framework (habilidades da IA e protocolos) — atualizado pelo `update`
└── .cortex/                    ← Versão instalada, ferramentas escolhidas, dados básicos do negócio e as cópias de segurança (backups/)
```

✅ = criado já na montagem rápida. Os demais entram quando fizerem sentido para você.

Os arquivos `META.md`, `CEREBRO.md` e parte do `.cortex/` só aparecem **depois** da conversa de montagem. `AGENTS.md`, `CLAUDE.md` e `GEMINI.md` já vêm na instalação com um texto de inicialização (é ele que faz a IA começar a conversa) e passam a levar o cérebro do seu negócio ao final da montagem.

---

## Mantendo o Córtex atualizado

O framework (`.agents/`) e os dados do seu negócio são camadas separadas — atualizar um nunca apaga o outro.

| Comando | Para quê |
|---|---|
| `npx @aksp/cortex@latest update` | Traz habilidades novas e correções. Mostra o que vai mudar, pede confirmação e faz backup antes. **Nunca toca** em `Pilares/`, `Memoria/`, `Ativos/` nem nos dados do negócio dentro do `CEREBRO.md`. No fim, diz onde ficou o backup e mostra como voltar à versão anterior, caso algo fique estranho. |
| `npx @aksp/cortex sync` | Regera os arquivos que a IA lê (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`) depois que você editar o `Frameworks/CEREBRO.md` à mão. Com `--targets=` você escolhe para quais ferramentas gerar: liste **todas** as que usa (ex.: `--targets=AGENTS.md,CLAUDE.md,GEMINI.md`), porque a lista substitui a anterior. |
| `npx @aksp/cortex@latest backup` | Guarda uma cópia dos dados do negócio (`Pilares/`, `Memoria/`, `Ativos/` e o `CEREBRO.md`) em `.cortex/backups/dados-<data>`. Não altera nada, e essas cópias nunca são apagadas sozinhas. Atalhos para outras pastas não são seguidos: a cópia avisa quais ficaram de fora. |
| `npx @aksp/cortex@latest restore` | Traz de volta os dados de uma cópia feita pelo `backup` (a mais recente, ou a escolhida com `--from=<nome>`; `--list` mostra as que existem). Antes de mexer, guarda uma cópia de como está agora e, no fim, mostra o comando que desfaz; essa cópia de "antes" aparece marcada na lista e só é usada quando você a indica em `--from`. Só copia por cima: um arquivo que existe hoje e não está na cópia fica como está. Depois recompila os arquivos de instrução. |
| `npx @aksp/cortex doctor` | Confere a estrutura no terminal, sem usar IA: o que falta preencher, número de margem ou preço escrito de um jeito que muda o valor (como `1.500` ou `30%`), se o cérebro está em ordem, se falta algum arquivo do próprio Córtex na pasta `.agents/` (uma habilidade apagada por engano, por exemplo, com o comando que repõe) e se existe versão nova. |

**Se quem roda o comando é a sua IA:** peça para ela acrescentar `--force` (por exemplo, `npx @aksp/cortex@latest update --force`). Sem terminal para confirmar, o comando só mostra o que faria e não altera nada.

**Baixou a pasta pronta (ZIP)?** Ela é uma instalação igual à do `init`: os comandos acima funcionam nela do mesmo jeito, depois que o Node.js estiver instalado. Não baixe um ZIP novo por cima da sua pasta para atualizar — use o `update`, que preserva os seus dados.

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
- **Sem Node.js e sem terminal:** a [pasta pronta (ZIP)](https://github.com/alberthpalhares/cortex/releases/latest/download/cortex.zip), como no começo desta página. Ela traz exatamente o que o `init` instala.

---

## Como contribuir

Aceitamos novas habilidades, modelos de pilares para setores específicos e melhorias no instalador. Leia o [Guia de Contribuição](https://github.com/alberthpalhares/cortex/blob/master/CONTRIBUTING.md).

---

## Créditos

Criado por **Alberth Klinsmann** — Mercadólogo e Produtor Audiovisual.
Nasceu como o sistema de gestão da **PALHARES Estúdio & Corporativo** e foi generalizado como framework de código aberto para qualquer negócio.

*"Seu negócio merece um cérebro que não esquece."*
