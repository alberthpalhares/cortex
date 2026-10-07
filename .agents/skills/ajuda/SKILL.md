---
name: ajuda
description: "Shows what Córtex can do, organized by everyday situation, and suggests the next step; also writes a short note to the maker of Córtex, with no business data, when something did not work or the owner has a suggestion. Trigger with: 'ajuda', 'o que você faz?', 'comandos', 'help', 'tenho uma sugestão para o Córtex', 'deu problema no Córtex', 'isso não funcionou no Córtex', 'falar com o criador'."
---

# Skill: Ajuda

This skill quickly answers "what can I do here" without requiring the user to memorize commands. It is organized by the situation the owner is in, not by feature.

## Step by Step

1. **Silently read** `Memoria/META.md`, if it exists, to find out the business name and whether there are custom pillars.
2. Reply with the list below, adapting the closing line to the Córtex's current state.
3. Be direct — no long intro, and do not explain how Córtex works internally.
4. Omit the "Para vender" lines about proposals, margin and pricing if `Pilares/04_Comercial.md` and `Pilares/03_Financeiro.md` do not exist; in that case add one line: `🧩 continuar onboarding — para eu aprender seus preços e poder montar propostas`.

## Output Format

```
🧠 **O que eu faço pelo [Nome do Negócio]:**

**No dia a dia**
📡 `radar` — o que está atrasado, o que está parado e em que focar hoje
📝 `registra que...` — guardo uma decisão, lição, pendência ou pessoa (errou? diga `desfaz`)
⏰ `me lembra de...` — anoto com data e mostro no radar (não mando aviso no celular)
📋 `anota a reunião` — cole suas anotações e eu separo decisões, pendências e lições
📱 `anota isso` — cole o que você ditou ou mandou para si mesmo no WhatsApp; cada anotação fica com a data do dia dela
⚖️ `estou em dúvida entre A e B` — peso as duas opções com o que você já decidiu e aprendeu, e guardo a escolha com o porquê
🔎 `o que você sabe sobre...` — digo o que já está registrado, com data
🗓️ `fechar a semana` — 5 minutos: o que andou, o que ficou e o foco da próxima

**Para vender e comunicar**
🧾 `gerar proposta para [cliente]` — proposta pronta, com seus preços e seu tom
📨 `enviei a proposta para [cliente]` — acompanho o retorno no radar; depois é só dizer `a proposta fechou` ou `perdemos a proposta`
✍️ `cria um post sobre...` — post, legenda ou mensagem de WhatsApp do seu jeito
✉️ `responde esse cliente` ou `cobra o [cliente]` — mensagem pronta, dentro das suas regras de preço e pagamento
🤝 `preparar reunião com [pessoa]` — o que está em aberto, o que já foi combinado e até onde você pode ir
💰 `descobrir minha margem` — em 5 minutos descobrimos quanto sobra de verdade nos seus trabalhos
💵 `quanto cobrar por...` — do custo ao preço mínimo e ao preço-alvo, respeitando a sua margem
📊 `analisar DRE` — comparo seus números com as suas metas de margem
🔍 `pesquisar concorrência` — quem são, quanto cobram e onde você se diferencia

**Para cuidar do Córtex**
🧩 `continuar onboarding` — completo o que ficou faltando, um bloco por vez
🩺 `saúde do córtex` — mostro o que ainda está em branco
🔄 `revisar córtex` — a cada 6 meses, conferimos o que mudou
🗄️ `consolidar memória` — arquivo o que ficou antigo, sem apagar nada
✨ `novidades` — o que mudou na última atualização do Córtex
💌 `tenho uma sugestão para o Córtex` ou `deu problema no Córtex` — escrevo um recado para o criador, sem nenhum dado do seu negócio; quem envia é você

💬 E pode perguntar qualquer coisa sobre o negócio — "posso dar 15% de desconto?", "qual era o combinado com o fornecedor?" — eu consulto o que está registrado antes de responder.

👉 [Um próximo passo concreto, tirado do estado atual — ex: uma pendência vencida, uma revisão atrasada, ou um bloco ainda não preenchido]
```

## A Note to the Maker ("tenho uma sugestão para o Córtex", "deu problema no Córtex", "falar com o criador")

Córtex collects nothing, so its maker only learns what works when the owner tells them. For these phrases, do not show the list: write a short note the owner can send.

- **Only about Córtex itself.** The phrase carries "Córtex" or "criador". An idea or a problem of the user's business ("tive uma ideia", "a campanha não funcionou") is not this. When you cannot tell, ask ONE question: *"É sobre o Córtex (a ferramenta) ou sobre o seu negócio?"*
- **What to put in.** If the user has not yet said what happened or what they would like, ask in one line — *"Me conta em uma ou duas frases: o que você pediu e o que aconteceu?"* (for a suggestion: *"O que você gostaria que o Córtex fizesse?"*). Read the version in `.cortex/version.json`. Name the AI tool only if you know for sure which one you are running in. Whatever you do not know is written `não sei` — never guess.
- **Nothing from the business goes in.** No business name, no name of a person, client or supplier, no price, value or other number of the business, and no line or excerpt of anything in `Pilares/`, `Memoria/` or `Ativos/`. Describe in general terms ("uma pendência com prazo", "um cliente", "um valor"). A detail enters only when the user, after seeing the note, tells you to put it in — and then only that detail, reminding them in the same reply that the page they will paste it on is public. The two optional lines are left blank for the user to fill by hand.
- **You send nothing.** No e-mail, no browser, no command: show the note inside a code block, ready to copy, and then the hand-over lines below. Write nothing in `Memoria/` and change no file. If what went wrong has a way out you know (the right phrase from the list above, `desfaz`, `continuar onboarding`), say it in one line before the note.

```
Recado para o criador do Córtex
Tipo: [Não funcionou | Sugestão | Dúvida]
Versão do Córtex: [x.y.z ou "não sei"]
Ferramenta de IA: [nome ou "não sei"]
O que pedi: [o pedido, em termos gerais]
O que aconteceu: [o que a IA fez, em termos gerais]
O que eu esperava: [uma linha]
Meu setor (opcional):
O que mais uso no Córtex (opcional):
```

Then, outside the code block:

```
🔒 Não pus nome, valor nem trecho dos seus arquivos. Confira antes de mandar; eu não envio nada.
🌐 Atenção: o envio é numa página pública do GitHub — qualquer pessoa na internet pode ler o que você colar lá. Não acrescente nada do seu negócio que não possa ser público.
📮 Para enviar: copie o recado e cole em https://github.com/alberthpalhares/cortex/issues/new (pede uma conta gratuita no GitHub). Se você não tem conta, mande o texto para quem instalou o Córtex para você.
```

## Rules

1. If the Córtex hasn't been set up yet (no `Memoria/META.md`), don't show the list — say in one line that the first step is a 5-minute conversation, and offer to start it now (`montar meu córtex`). This rule is about the list only: the note to the maker is written even before the setup, and the setup is offered after it.
2. Don't invent commands that don't exist in the other skills.
3. No technical jargon in the reply: no file names, no terminal commands, no "skill", "token" or "frontmatter" — the link in the note to the maker is the one exception.
4. All file paths are **relative to the workspace root**.
