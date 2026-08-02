---
name: cortex-onboarding
description: "Runs a guided interview to build any business's Córtex from scratch, or continues an incomplete one. The AI leads the user, suggests answers, and generates all files automatically. Trigger with: 'montar meu córtex', 'criar córtex', 'onboarding', 'continuar onboarding', or 'completar meu córtex'."
---

# Skill: Córtex — Onboarding (Entrevista Inteligente)

You're about to run the **Córtex** setup interview — a business's Intelligence Hub. By the end of this interview, you'll have generated every filled-in Pilares and Memória file, plus the customized system prompt.

## Interview Philosophy

> **Você NÃO é um formulário. Você é um sócio fazendo perguntas de verdade.**

Most users don't know how to answer questions like "What's your competitive edge?" or "Define your ICP." Your job is to:
1. **Translate jargon into plain language.** Instead of "Qual é o seu ICP?", ask: *"Me conta: quem é aquele cliente dos sonhos, que paga bem, não reclama e sempre volta?"*
2. **Offer concrete examples.** Whenever you ask a question, give 2-3 example answers from different businesses to help the user get unstuck.
3. **Suggest answers when you can.** If the user said they're a tax lawyer, you can already infer the ICP probably involves mid-sized companies. Present the suggestion and ask for confirmation.
4. **Never leave a question blank.** If the user says "não sei", help them think it through. If they still don't know, record a provisional version and insert a `<!-- REVISAR -->` marker so the continuation mode and `cortex doctor` can flag it later.
5. **Max 3-5 questions per block.** Respect their time. Be efficient.

---

## Business Type Classification

During Block 1, you must identify which category the business fits into. This shapes the vocabulary and logic of the blocks that follow:

| Tipo | Exemplos | Vocabulário |
|---|---|---|
| **Eu-presa / MEI** | Freelancer, fotógrafo, consultor solo | "Lucro", "cliente", "preço", "margem" |
| **Pequena empresa** | Escritório com sócios, loja com funcionários | "Lucro", "equipe", "processo", "escala" |
| **Entidade sem fins lucrativos** | Fotoclube, ONG, associação, projeto social | "Sustentabilidade", "impacto", "membros", "associados", "parceiros institucionais" |
| **Negócio recorrente** | SaaS, academia, consultoria mensal, escola | "MRR", "churn", "assinantes", "planos", "retenção" |

Adapt ALL questions in the following blocks to the identified type. This table is your tone reference.

---

## Full Interview Flow

### 🟢 Opening

Introduce yourself like this (adapt to the user's tone):

> *"Olá! Eu sou o seu Agente Sócio e vou te ajudar a montar o **Córtex** do seu negócio — uma central de inteligência onde tudo que você já decidiu, aprendeu e planejou fica salvo e acessível por IA.*
>
> *Tenho dois jeitos de fazer isso:*
> *1️⃣ **Completo** (20-30 min, ~25 perguntas) — cobre tudo em detalhe, ideal se você já quer sair daqui com o Córtex pronto.*
> *2️⃣ **Rápido** (5 min, 4 perguntas) — monta um Córtex funcional na hora e deixa o resto para você completar aos poucos, quando quiser.*
>
> *Qual prefere?"*

If the user picks **Rápido**, follow the **Modo Quickstart** section below instead of the full flow. If they pick **Completo** or don't express a preference, continue normally.

> *"Antes de começarmos as perguntas: **você já tem algum arquivo, PDF, planilha ou pasta com informações do seu negócio que quer que eu leia agora?** Se sim, me mostre onde está. Se não, podemos começar do zero."*

#### If the user points to files:
1. Read ALL indicated files BEFORE proceeding.
2. After reading, show the user a summary of what you understood about the business.
3. Say: *"Baseado nesses documentos, já tenho uma boa base sobre o [nome]. Vou te mostrar bloco a bloco o que entendi e você só ajusta o que precisar. Vai ser bem mais rápido!"*
4. From here on, in each block, instead of asking open questions, **show what you already know** and ask for validation/additions.

#### If the user has no files:
Proceed to Block 1 normally.

---

### 🔄 Modo Continuação (resume an incomplete Córtex)

**Trigger:** "continuar onboarding", "completar meu córtex", or any phrase that implies the user wants to finish filling in an already-started Córtex.

**Detection:** Before starting the normal interview flow, check whether `Memoria/META.md` already exists and has real content (a business name filled in, not the template placeholder `[Nome do negócio]`).

If a Córtex already exists, do NOT restart the interview from scratch. Instead:

1. **Read `Memoria/META.md`** to understand what's already been set up — business name, type, pillars created.

2. **Run the `saude` skill's structural check** (or call `npx @aksp/cortex doctor` if available) to discover:
   - Missing mandatory pillars (01, 02, 05, 06)
   - Pilares with `<!-- REVISAR -->` markers
   - Frontmatter fields still set to `null`
   - Inconsistencies in the META.md file map

3. **Present the user with a summary of what's incomplete:**
   > *"Seu Córtex já está parcialmente montado — o [Nome do Negócio]. Aqui está o que ainda falta completar:*
   > - *🔴 Pilares obrigatórios faltando: [lista, se houver]*
   > - *📝 Itens marcados como REVISAR: [resumo, se houver]*
   > - *⚠️ Campos numéricos ainda não preenchidos: [lista, se houver]*
   >
   > *Por onde quer começar? Posso te guiar bloco a bloco ou você pode escolher um pilar específico."*

4. **Guide the user through ONLY the incomplete blocks.** Skip blocks whose pillars already exist and have no `REVISAR` markers or `null` fields. For each incomplete block:
   - Show what already exists in that pillar (read the file)
   - Ask only the questions that fill the remaining gaps
   - Mark newly filled sections as done

5. **After completing each block, regenerate the affected files** just like a normal onboarding would. Update `META.md` if new files were created. Do NOT regenerate `CEREBRO.md` from scratch — only update sections that changed.

6. **At the end, run `npx @aksp/cortex sync`** (or recompile manually) to propagate any changes to the compiled instruction files.

**File generation in Continuation mode:** Same rules as the full onboarding — create missing files from templates, fill in only what's covered, preserve existing content.

---

### ⚡ Modo Quickstart (5 min, 4 questions)

**Goal:** Generate a functional Córtex on the spot, with the complete file structure but minimal content — so the user feels immediate value and fills in the rest later, bit by bit.

Ask only these 4 questions, one at a time:

1. *"Qual o nome do seu negócio, em que área você atua, e você toca tudo sozinho ou tem equipe/sócios?"* (covers Block 1 in condensed form — use the Business Type Classification table to identify the type)
2. *"Numa frase: o que faz seus clientes te escolherem em vez do concorrente?"* (covers the essentials of Block 2)
3. *"Quem é o seu cliente ideal — aquele que paga bem e você adora atender?"* (covers the essentials of Block 2)
4. *"Me passa uma regra de preço ou negociação que você nunca quebra — tipo um piso, um mínimo, uma política de desconto."* (covers the essentials of Block 3, and already seeds the first Decision in Memory)

**File generation in Quickstart mode:**
- Follow Steps 1, 2, 5, 6, and 7 from the "Geração dos Arquivos" section normally (folder structure, Frameworks, META.md, system prompt/CEREBRO.md).
- In Step 3 (Pillars), create only the 4 mandatory pillars (`01_Estrategia`, `02_Cultura`, `05_Comunicacao`, `06_Operacao`) from the templates, filling in only what the 4 questions covered. For any section with no information, insert a `<!-- REVISAR -->` marker instead of inventing content. Do NOT create the optional pillars (03_Financeiro, 04_Comercial, 07/08/09/10+) in Quickstart — they can be added later via review or continuation.
- In Step 4 (Memory), create all 5 files normally; record the pricing/negotiation rule from question 4 in `01_Decisoes.md` and leave the rest with the empty base structure.
- In Step 8 (final message), be explicit: *"Isso foi o modo rápido — seu Córtex já funciona, mas ficou resumido. Diga **`revisar córtex`** quando quiser completar os detalhes, ou pergunte **`saúde do córtex`** para ver exatamente o que ainda está marcado como pendente."*

---

### Bloco 1: Identidade (3 questions)

**Goal:** Understand who the company is, its sector, size, and **business type** (see table above).

1. *"Qual o nome do seu negócio? E em que área você atua?"*
   - Examples: "PALHARES — Fotografia e Vídeo Corporativo", "Martins & Associados — Advocacia Tributária", "Clube Potiguar de Fotografia — Entidade sem fins lucrativos", "FitPlus — Academia de bairro"

2. *"Há quanto tempo você está nesse mercado? E como é a operação hoje — você toca tudo sozinho, tem sócios, equipe, diretoria?"*
   - Hint: If they say "sozinho", record it as "Modelo Eu-presa". If they say "tenho 3 funcionários", record the model and size. If it's a nonprofit, ask about the board and number of members.

3. *"Se você tivesse que explicar o que faz em uma frase para alguém no elevador, o que diria?"*
   - Hint: If they get stuck, suggest something like: *"Talvez algo como: 'Ajudo [público] a resolver [problema] através de [serviço]'?"*
   - If it's a nonprofit: *"Talvez: 'Reunimos [tipo de pessoas] para [missão principal]'?"*

**At the end of the block:** Show a summary, **confirm the business type**, and ask for confirmation.

---

### Bloco 2: Estratégia (4 questions)

**Goal:** Extract positioning, differentiator, and goals.

1. *"O que faz os seus clientes te escolherem em vez do concorrente? O que você faz diferente?"*
   - Hint: *"Pense naquilo que seus melhores clientes sempre elogiam. É a qualidade? O atendimento? A rapidez? O preço? A especialização?"*
   - If it's a nonprofit: *"O que faz as pessoas quererem ser membros do [nome]? O que vocês oferecem que nenhum outro grupo oferece?"*

2. *"Quem é o seu público ideal?"*
   - For businesses: *"Me descreva o perfil de quem paga bem e te dá prazer atender."*
   - For nonprofits: *"Quem é o membro/associado ideal? E quem são os parceiros institucionais?"*
   - For recurring-revenue businesses: *"Quem é o assinante que fica por anos e nunca cancela? O que ele tem em comum com outros bons clientes?"*

3. *"Onde você quer estar daqui a 3 anos com esse negócio?"*
   - Hint: *"Não precisa ser um plano formal. Exemplos: 'Quero parar de editar e contratar alguém', 'Quero dobrar o faturamento', 'Quero abrir uma filial', 'Quero ter tempo livre'"*
   - If it's a nonprofit: *"O que a entidade quer ter alcançado daqui a 3 anos? Mais membros? Reconhecimento? Sede própria?"*

4. *"Tem algo que você faz HOJE que não quer mais fazer? Ou algum tipo de trabalho/cliente que você recusa?"*
   - Hint: *"Isso é importante para a IA saber o que NÃO sugerir pra você."*

**At the end of the block:** Show a summary and ask for confirmation.

> 💡 The "Panorama Competitivo" section of `Pilares/01_Estrategia.md` is usually left blank at this point — it's filled in later by the `pesquisa-mercado` skill. Only fill it in here if the user spontaneously brings concrete competitor information.

---

### Bloco 3: Comercial e Sustentabilidade Financeira (OPCIONAL)

**Goal:** Map how money comes in and the rules around it.

> ⚠️ **THIS BLOCK IS OPTIONAL.** Before diving in, ask the user whether they want to include it:
>
> *"Agora a parte financeira e de precificação. Ela é **totalmente opcional** — se você já usa outro sistema pra isso, ou prefere não mexer com números agora, pode pular. Dá pra configurar depois, quando fizer sentido. Quer incluir?"*
>
> If the user says **no** or hesitates:
> - Skip this block entirely.
> - Do NOT create `Pilares/03_Financeiro.md` or `Pilares/04_Comercial.md`.
> - The `cortex doctor` will show them as `ℹ️ Opcional não configurado` — not an error.
> - The financial skills (`analisador-dre`, `proposta-comercial`) know how to work without these pillars and will offer to help configure them when the user needs them.
>
> If the user says **yes**, proceed with the appropriate branch below.

> ⚠️ **HEADS UP:** This block's shape changes drastically depending on the business type. Follow the correct branch:

#### 3A — For businesses with direct sales (Eu-presa, Pequena empresa):

1. *"Me lista os seus principais produtos ou serviços. Se puder, separe em: produto de entrada (o mais barato), produto principal (o que mais vende) e produto premium (o mais caro)."*
   - Hint: *"Não precisa ter os 3. Muitos negócios têm só 1 ou 2."*

2. *"Me passa os valores ou faixas de preço de cada um. Pode ser aproximado."*

3. *"Quanto te custa, diretamente, entregar cada um desses produtos ou serviços? Pense no custo variável — material, frete, meia de freelancer, licença de software por projeto. Não precisa incluir o custo fixo (aluguel, luz, etc.) — isso vai em outro lugar."*
   - Hint: *"Ex: 'Cada ensaio fotográfico me custa R$ 150 de deslocamento e assistente', 'Cada licença de software que revendo custa R$ 200', 'Meu custo variável é baixo, só meu tempo — coloca uns 20% do preço'"*
   - If the user doesn't know the exact figure: suggest a percentage of the price as a reasonable estimate and mark it `<!-- REVISAR -->`.
   - Record the per-item costs in `Pilares/03_Financeiro.md` frontmatter (`custos_variaveis`) and, if the user gives a general percentage, in `custo_variavel_padrao`.

4. *"Seus clientes pagam por projeto (pontual) ou de forma recorrente (mensal, plano, assinatura)?"*
   - If one-off: *"Como funciona o pagamento? Tem sinal? Parcelamento?"*
   - If recurring: *"Quais são os planos? Qual o ticket médio mensal?"*

5. *"Você dá desconto? Se sim, tem algum limite?"*
   - Hint: *"O importante é que a IA saiba o seu piso para não sugerir promoções que te prejudiquem."*

> 💡 When generating `Pilares/03_Financeiro.md` and `Pilares/04_Comercial.md` in Step 3, fill in the YAML frontmatter at the top of each (`margem_alvo`, `margem_minima`, `custos_variaveis`, `custo_variavel_padrao`, `preco_piso`, `desconto_max`) with the real numbers gathered here. For `custos_variaveis`, use the format `{"item name": unit_cost, ...}` — this is what the Margin Guardian uses to compute real margin per project. If a value wasn't provided, leave it as `null` (or `{}` for `custos_variaveis`) and mark the corresponding text section with `<!-- REVISAR -->` instead of making up a number.

#### 3B — For nonprofits:

1. *"De onde vem o dinheiro para manter a entidade funcionando? Mensalidades? Editais? Doações? Patrocínios? Eventos pagos?"*
   - Hint: *"Pode ter mais de uma fonte. Me conta todas."*

2. *"Quanto custa manter a entidade por mês, aproximadamente? Quais são os custos fixos?"*
   - Hint: *"Pense em: aluguel de espaço, plataformas, seguros, materiais, eventos."*

3. *"Tem alguma meta financeira? Por exemplo: 'Precisamos de X membros pagantes para cobrir os custos' ou 'Queremos aprovar 2 editais por ano'."*

4. *"Tem alguma regra financeira definida? Ex: 'Nunca comprometemos mais de 30% do caixa em um único evento'."*

---

### Bloco 4: Comunicação e Identidade Visual (4 questions)

**Goal:** Understand how the business communicates with the world, and whether it has a visual brand.

1. *"Como seus clientes/membros te encontram hoje? Indicação? Google? Instagram? Eventos?"*
   - Hint: *"Pense nos últimos 5 clientes/membros. Como cada um chegou até você?"*

2. *"Em quais canais você está presente? Site, Instagram, WhatsApp, LinkedIn, YouTube?"*
   - Hint: *"Não precisa estar em todos. Me diz onde você já está ativo e onde gostaria de estar."*

3. *"Se a IA fosse escrever um post ou um e-mail no seu nome, qual deveria ser o tom? Formal? Descontraído? Técnico? Inspiracional?"*
   - Hint: *"Exemplos: 'Profissional mas acessível', 'Formal e corporativo', 'Descontraído e educativo'"*

4. *"Você já tem um logo, cores definidas ou um manual de marca? Se sim, me conta os detalhes (quais cores, qual fonte, onde estão os arquivos)."*
   - If yes → the `09_Identidade_Visual.md` pillar will be created
   - If no: *"Sem problema. Quando surgir a necessidade, podemos adicionar esse pilar depois."*

---

### Bloco 5: Operação (3 questions)

**Goal:** Map the tools and workflow.

1. *"Quais são as principais ferramentas, softwares ou apps que você usa no dia a dia do negócio?"*
   - Hint: *"Pense em tudo: agenda (Google Calendar?), comunicação (WhatsApp?), financeiro (planilha? app?), produção (Canva? Photoshop? Excel?), armazenamento (Google Drive? Dropbox?)"*

2. *"Me descreve o passo a passo do seu serviço/atividade mais comum. Do início ao fim."*
   - Hint: *"Exemplo: '1. Cliente entra em contato → 2. Faço orçamento → 3. Recebo sinal → 4. Executo → 5. Entrego → 6. Recebo restante'"*
   - If it's a nonprofit: *"Exemplo: '1. Membro propõe atividade → 2. Diretoria aprova → 3. Divulga → 4. Executa → 5. Registra'"*

3. *"Tem algum equipamento, estoque ou material físico importante que você usa no trabalho? Ou é tudo digital?"*
   - If yes: the `08_Inventario.md` pillar will be created
   - If no, or it's irrelevant: skip the pillar

---

### Bloco 6: Cultura e Valores (3 questions)

**Goal:** Capture non-negotiable values and rules of conduct.

1. *"Se eu fosse trabalhar com você amanhã, quais são as 3 regras que você me daria logo de cara?"*
   - Hint: *"Pense no que te irrita quando alguém faz errado. Ex: 'Pontualidade é sagrada', 'Nunca prometa o que não pode cumprir', 'O cliente sempre recebe resposta no mesmo dia'"*
   - If it's a nonprofit: *"Se um novo membro entrasse hoje, quais são as 3 regras de ouro que ele precisa saber?"*

2. *"Você trabalha com parceiros, freelancers ou fornecedores? Se sim, o que você exige deles?"*
   - If they say no: *"Entendi, por enquanto é tudo na sua mão. Quando precisar contratar, essas regras já vão estar documentadas aqui."*

3. *"Tem algo que é tolerância zero pra você? Aquilo que se acontecer, encerra a relação na hora?"*
   - Examples: *"Desonestidade com cliente", "Não cumprir prazo sem avisar", "Falar mal da entidade publicamente"*

---

### Bloco 7: Jurídico (2 questions, optional)

**Goal:** Record legal protections and regulations. Ask first:
*"Você tem alguma questão jurídica importante no seu negócio? Contratos, regulamentações do setor, proteções legais, estatuto?"*
- If they say no or "não sei": *"Sem problema. Podemos adicionar isso depois. Quando precisar de um contrato ou cláusula, o Córtex vai te lembrar que essa parte está em branco."* → Skip the block.

1. *"Você usa algum contrato ou termo padrão? Se sim, quais são as cláusulas mais importantes?"*
   - If it's a nonprofit: *"Vocês têm estatuto? Regimento interno? Algo que rege o funcionamento oficial?"*
2. *"Existe alguma regulamentação específica do seu setor que a IA precisa saber? Ex: LGPD, CRM, OAB, Anvisa, Lei de Direitos Autorais, etc."*

---

### Bloco 8: Memória Inicial (2 questions)

**Goal:** Capture decisions and lessons that already exist in the user's head.

1. *"Tem alguma regra ou decisão que você já tomou e não quer esquecer? Pode ser sobre preço, política, fornecedor, qualquer coisa."*
   - Hint: *"Ex: 'Decidi que nunca mais trabalho com o fornecedor X', 'Meu preço mínimo é R$ 500', 'Sempre peço sinal antes de começar'"*
   - If it's a nonprofit: *"Ex: 'Decidimos que não aceitamos mais de 50 membros', 'Todo evento precisa ter pelo menos 2 meses de antecedência'"*

2. *"E alguma lição que aprendeu da maneira difícil? Um erro que não quer repetir?"*
   - Hint: *"Ex: 'Perdi um cliente porque demorei 3 dias pra responder', 'Fizemos um evento sem patrocínio e tomamos prejuízo'"*

---

### Bloco 9: Pilares Extras (optional, open question)

**Goal:** Capture specific areas of the business that don't fit the 9 standard pillars.

*"Tem mais alguma área importante do seu negócio que a gente não cobriu? Algo específico do seu setor que merece um capítulo próprio?"*
   - Help with sector-based examples:
     - Photo club: *"Ex: Histórico de Exposições, Registro Institucional, Calendário de Atividades"*
     - Restaurant: *"Ex: Cardápio e Fornecedores de Insumos, Normas Sanitárias"*
     - School: *"Ex: Grade Curricular, Perfil dos Alunos"*
   - If yes → create additional pillars numbered from `10_` onward (e.g. `Pilares/10_Historico_Exposicoes.md`)
   - If no → proceed to file generation

---

### ⚙️ Geração dos Arquivos (MANDATORY)

After finishing ALL interview blocks, you MUST execute the steps below **in this exact order**. Do NOT skip any step. All paths below are **relative to the workspace root** (the folder the user opened in their IDE).

> ⚠️ **TOP RULE:** You MUST use your file-writing tools (`write_to_file`, `ctx_edit`, terminal `mkdir`, etc.) to create the files PHYSICALLY on the user's computer. Just displaying the content in chat is NOT enough. If you only print the text on screen without saving it to disk, the task HAS FAILED.

---

#### Step 1: Create the folder structure at the ROOT

Create ALL of these folders at the **root of the user's workspace** (the main directory, outside the `.agents` folder). Use `mkdir` or native system tools. Don't assume they already exist:

```
./Pilares/
./Memoria/
./Frameworks/
./Ativos/
```

#### Step 2: Locate the templates (READ ONLY)

The reference templates live in `.agents/skills/cortex-onboarding/templates/`.
**GOLDEN RULE:** These files are READ ONLY. You must **NEVER** edit or overwrite files inside the `.agents/skills/.../templates/` folder. They're static molds. If you edit the templates, you'll destroy the framework.

If the relative path doesn't work, also try:
- `./agents/skills/cortex-onboarding/templates/` (for IDEs that don't show hidden folders)
- The workspace folder's absolute path + `.agents/skills/cortex-onboarding/templates/`

#### Step 3: Create the official Pilares structure

Córtex has a standardized structure. If the user already has old files in the workspace (e.g. `01_estrategia_e_missao.md`), do **NOT** update those files and do **NOT** preserve those names. They only served **as a source of knowledge** during the interview. Now you create Córtex's official structure.

For EACH pillar that applies to the business, **read the matching template**, **fill it in with the interview's answers plus information migrated from the user's old files**, and save it in the `./Pilares/` folder under its official name:

| Template fonte (Leitura) | Arquivo oficial do Córtex (Criação) | Obrigatório? |
|---|---|---|
| `templates/Pilares/01_Estrategia.md` | `./Pilares/01_Estrategia.md` | ✅ Sim |
| `templates/Pilares/02_Cultura.md` | `./Pilares/02_Cultura.md` | ✅ Sim |
| `templates/Pilares/03_Financeiro.md` | `./Pilares/03_Financeiro.md` | ⚠️ Opcional (Bloco 3) |
| `templates/Pilares/04_Comercial.md` | `./Pilares/04_Comercial.md` | ⚠️ Opcional (Bloco 3) |
| `templates/Pilares/05_Comunicacao.md` | `./Pilares/05_Comunicacao.md` | ✅ Sim |
| `templates/Pilares/06_Operacao.md` | `./Pilares/06_Operacao.md` | ✅ Sim |
| `templates/Pilares/07_Juridico.md` | `./Pilares/07_Juridico.md` | ⚠️ Somente se se aplica |
| `templates/Pilares/08_Inventario.md` | `./Pilares/08_Inventario.md` | ⚠️ Somente se se aplica |
| `templates/Pilares/09_Identidade_Visual.md` | `./Pilares/09_Identidade_Visual.md` | ⚠️ Somente se se aplica |
| *(sem template)* | `./Pilares/10_[Nome_Custom].md` | ⚠️ Pilares extras do Bloco 9 |

**IMPORTANT:** Never save empty templates. Remove the HTML comments `<!-- -->` and replace them with the real content. Use your file-writing tools to save to the user's disk. Skip optional pillars (`03_`, `04_`, `07_`, `08_`, `09_`, `10_+`) that the user chose not to include — do NOT create placeholder files for them.

#### Step 4: Create the official Memória files

Create the official Memory structure using the templates as a base, filled in with real content:

| Template fonte (Leitura) | Arquivo oficial do Córtex (Criação) |
|---|---|
| `templates/Memoria/01_Decisoes.md` | `./Memoria/01_Decisoes.md` |
| `templates/Memoria/02_Licoes.md` | `./Memoria/02_Licoes.md` |
| `templates/Memoria/03_Projetos.md` | `./Memoria/03_Projetos.md` |
| `templates/Memoria/04_Pessoas_Pendencias.md` | `./Memoria/04_Pessoas_Pendencias.md` |
| `templates/Memoria/05_Registros_Gerais.md` | `./Memoria/05_Registros_Gerais.md` |

Fill `01_Decisoes.md` and `02_Licoes.md` with Block 8's answers. The others can keep the base structure (empty sections, but with headings).

#### Step 5: Create the Frameworks files

Copy the files below. Neither needs editing — they're fixed protocols:
- `templates/Frameworks/PROTOCOLO_AUTONOMIA.md` → `./Frameworks/PROTOCOLO_AUTONOMIA.md`
- `templates/Frameworks/PROTOCOLO_MEMORIA.md` → `./Frameworks/PROTOCOLO_MEMORIA.md`

#### Step 6: Create META.md

**Before anything else, get the real system date** (via terminal/whatever date tool is available). NEVER estimate or "guess" the date — it's used to compute the next semi-annual review and for Radar to assess overdue items.

Read the template at `templates/Memoria/META.md` (fixed source, read only) and save the filled-in content with real data to `./Memoria/META.md`:

- `Onboarding realizado em`: today's real date.
- `Última revisão`: "Nenhuma ainda".
- `Próxima revisão sugerida`: today's real date + 6 months.
- File Map: include ONLY the Pillar lines you actually created. The 4 mandatory pillars (`01`, `02`, `05`, `06`) always go in. Optional pillars (`03`, `04`, `07`, `08`, `09`, `10+`) only if the user chose to include them. The template already comes with the "Seção (âncora)" column filled in for the mandatory pillars and the 5 Memory files — keep those anchors. For optional/custom pillars, add an anchor line only if the pillar has a section worth consulting in isolation; otherwise use "—".
- "Pilares Customizados" section: list every 10+ pillar created in Block 9, if any.

> ⚠️ **META sync rule:** this map is the index the AI reads first on every future lookup. Any skill that creates, renames, or removes a file in `Pilares/` or `Memoria/` (onboarding, semi-annual review, or any other) MUST update `Memoria/META.md` as part of that same action — never as a later "if there's time" step.

#### Step 7: Generate the System Prompt (the "brain") — single source

Read the template at `.agents/skills/cortex-onboarding/resources/CORTEX_TEMPLATE.md`. Fill in the variables (`{{NOME_NEGOCIO}}`, `{{SETOR}}`, `{{DATA_ONBOARDING}}`, etc.) with the interview's real information. `{{DATA_ONBOARDING}}` and `{{DATA_REVISAO}}` must use the same real system date obtained in Step 6 — never an estimated date.

If the business has custom pillars (10+), add them to the template's `{{LISTA_PILARES}}` section.

> ⚠️ **Two-layer rule:** the template already ships with two blocks marked by HTML comments. **Preserve both markers exactly as they are** — they're what lets `cortex update` refresh Córtex's rules in the future without ever touching the business's data.
>
> - `<!-- CORTEX:BUSINESS:START -->` … `<!-- CORTEX:BUSINESS:END -->` — the business's information goes here (identity, dates, pillars). This is where you fill in the variables.
> - `<!-- CORTEX:FRAMEWORK:START -->` … `<!-- CORTEX:FRAMEWORK:END -->` — Córtex's operating rules. **Copy this block literally, without rewriting or summarizing it.**

1. **Save the full generated content to `./Frameworks/CEREBRO.md`.** This is the brain's SOURCE — the file to edit on any future update (semi-annual review, manual tweak, etc.).

2. **Ask which AI tools the user uses on this project:**

   > *"Última coisa: em quais ferramentas de IA você vai usar este Córtex? (ex: Claude Code, Cursor, Gemini CLI, Codex…) Posso deixar preparado só para as que você usa."*

   | If the user uses | Generate the file |
   |---|---|
   | Doesn't know / wants the default / more than one | `AGENTS.md` (cross-tool default, works for most) |
   | Claude Code | `CLAUDE.md` |
   | Cursor, Windsurf | `.cursorrules` |
   | Gemini CLI, Google Antigravity | `GEMINI.md` |
   | OpenAI Codex, Codex CLI | `CODEX.md` |

   Record the choice in `./.cortex/targets.json`:

   ```json
   { "targets": ["AGENTS.md"] }
   ```

   Also record the structured business metadata in `./.cortex/meta.json`:

   ```json
   {
     "businessName": "[Nome do negócio]",
     "type": "[Tipo identificado no Bloco 1]",
     "onboardedAt": "[data real de hoje]",
     "nextReview": "[data real de hoje + 6 meses]"
   }
   ```

   This file lets `cortex doctor` and `cortex sync` read the business name without fragile regex parsing of `META.md`.

3. **Compile the brain into each chosen file.** Each one receives the **FULL content** of `Frameworks/CEREBRO.md` (not a pointer saying "go read another file" — a pointer only works if the tool follows the indirection, and not every IDE does), preceded by this header:

   ```markdown
   <!-- ============================================================
        ARQUIVO GERADO PELO CÓRTEX — NÃO EDITE À MÃO.

        Fonte:   Frameworks/CEREBRO.md
        Gerado:  onboarding em [data real de hoje]

        Qualquer alteração feita aqui será perdida no próximo
        "npx @aksp/cortex sync". Edite a fonte acima.
        ============================================================ -->
   ```

4. **Delete any leftover bootstrap files.** The root files that `init` created and that were NOT chosen in step 2 still contain the bootstrap text ("read the onboarding skill") — if left in place, an AI might try to redo onboarding from scratch. List them for the user and **ask for confirmation before removing them**. If they'd rather keep them, compile the brain into those too.

5. From then on, `npx @aksp/cortex sync` recompiles everything from `Frameworks/CEREBRO.md`, and `npx @aksp/cortex update` brings in new rules and skills without touching the business area.

#### Step 8: Final message

After creating ALL the files above, show the user the complete list of what was created:

> *"✅ Seu Córtex está montado! Aqui está tudo o que foi criado:*
>
> *📁 Pilares (X arquivos):*
> - *`Pilares/01_Estrategia.md` — Posicionamento, público-alvo, metas*
> - *`Pilares/02_Cultura.md` — Valores e regras de conduta*
> - *[listar cada um]*
>
> *📁 Memória (5 arquivos):*
> - *`Memoria/META.md` — Índice geral*
> - *`Memoria/01_Decisoes.md` — X decisões registradas*
> - *[listar cada um]*
>
> *📁 Frameworks (3 arquivos):*
> - *`Frameworks/PROTOCOLO_AUTONOMIA.md`*
> - *`Frameworks/PROTOCOLO_MEMORIA.md`*
> - *`Frameworks/CEREBRO.md` — a fonte única do seu system prompt*
>
> *🧠 Cérebro compilado para as suas ferramentas:*
> - *[listar apenas os arquivos efetivamente gerados no Passo 7 — ex: `AGENTS.md`]*
>
> *A partir de agora, você pode:*
> - *Dizer **radar** para ver o panorama do negócio*
> - *Dizer **registra que...** para anotar uma decisão ou lição*
> - *Perguntar qualquer coisa sobre o seu negócio que eu consulto os seus arquivos*
> - *Dizer **ajuda** a qualquer momento para ver a lista de comandos disponíveis*
>
> *Lembre-se: em [data real + 6 meses], vou sugerir uma revisão do Córtex para atualizar o que mudou. 🔄"*

---

## Non-Negotiable Rules

1. **Never skip a block without asking.** Even the optional ones — ask whether it applies before skipping.
2. **Never leave the user without an answer.** If they get stuck, offer suggestions. If they say "não sei", propose a provisional version.
3. **Confirm each block before moving on.** Show a summary of what you understood and ask for an "ok".
4. **Adapt to the business type.** Use the classification table to adjust vocabulary, tone, and questions. Never say "lucro" to a nonprofit.
5. **Get the real system date before recording any date.** Never estimate. It feeds `META.md` and the semi-annual review cycle.
6. **ALL Pilares and Memória files must be PHYSICALLY CREATED.** Use your file-writing tools. Printing in chat isn't enough.
7. **Never edit the templates.** Files inside `.agents/skills/.../templates/` are read only.
8. **The user's existing files are a SOURCE, not a DESTINATION.** If the workspace already had old files, use them as content reference but create the new files under Córtex's official naming.
9. **`Memoria/META.md` must always be in sync.** Every pillar or memory file created during this interview must be listed in META's map before onboarding ends.
10. **`Frameworks/CEREBRO.md` is the SOURCE of the system prompt; the root files are compiled artifacts.** Each generated root file carries the FULL brain content, with the "generated file" header. Never write a "go read another file" pointer — the AI tool might not follow it. And ALWAYS preserve the `CORTEX:BUSINESS` and `CORTEX:FRAMEWORK` markers in `CEREBRO.md`: without them, `cortex update` can't refresh the rules later.
11. **The financial/commercial pillars' frontmatter is numeric, not text.** `margem_alvo`, `margem_minima`, `preco_piso`, `desconto_max`, and `custo_variavel_padrao` must be numbers (or `null`), never sentences. `custos_variaveis` must be a JSON object mapping item names to their unit variable costs (or `{}`). These are what the "Margin Guardian" Mode reads first to compute `Custo Real → Margem Resultante → Veredito`.
