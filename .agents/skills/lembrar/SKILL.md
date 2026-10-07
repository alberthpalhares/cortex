---
name: lembrar
description: "Answers 'what do we already know / what did we decide about X' by searching Pilares, Memoria and the archive, citing where and when each fact was recorded. Also prepares the user for a meeting or a call with someone, from what is on record about that person. Trigger with: 'o que você sabe sobre', 'você lembra de', 'qual era o combinado com', 'o que já decidimos sobre', 'procura na memória', 'tem algo registrado sobre', 'preparar reunião com', 'briefing da reunião com'."
---

# Skill: Lembrar

The core promise of Córtex is that nothing the owner decided or learned gets lost. This skill makes that promise visible: the user asks about a subject and gets back exactly what is on record, with its source and date — and an honest "nothing recorded" when that is the case.

**This skill answers questions about what is already recorded.** A request to be reminded of something in the future ("me lembra de ligar para o João na sexta") is not a search: it is a reminder, and belongs to the `registrar` skill.

## Step by Step

1. **Identify the subject** (a client, supplier, price, product, policy, project, person, period). If the question is too vague to search ("o que você sabe?"), ask for the subject in one line.
2. **Read `Memoria/META.md`** to learn the files and anchors. The index does not narrow this search: a client, a person or a project is usually recorded in more than one file at once (a project in `03_Projetos.md`, a pending item in `04_Pessoas_Pendencias.md`, a mention inside the quarterly goal).
3. **Search every one of these, in this order — never stop at the first hit** — reading in full only the sections that mention the subject (this skill is the one exception to "read only that section"):
   - `Memoria/01_Decisoes.md`, `02_Licoes.md`, `03_Projetos.md`, `04_Pessoas_Pendencias.md`, `05_Registros_Gerais.md`
   - the relevant files in `Pilares/`
   - `Memoria/_Arquivo/*.md`, if that folder exists — archived items still count, but say they are archived
   - when the subject is a client: the file names in `Ativos/Propostas/`, if that folder exists — a file with the client's name is "proposta gerada em [data do nome do arquivo]" (generated, not necessarily sent)

   **A person or a company is recorded in pieces — bring all of them:** who they are (the 👥 line under "Stakeholders"; suppliers and partners that older versions listed under "Parceiros e Fornecedores" in `05_Registros_Gerais.md` count just the same, usually with no date), what was agreed with them (lines in `01_Decisoes.md` that start with or mention their name, and an agreement kept inside the person's note), and what is open with them (pending and `[AGUARDANDO: Nome]` lines, a `Resposta da proposta` line, a `🔁` routine that names them, projects, a mention in the quarterly goal), and how earlier proposals to them ended (`Proposta fechada` / `Proposta perdida` lines under "Pendências Resolvidas", with the `motivo:` when there is one).
4. **Match by meaning, not only by exact word** (e.g. "desconto" also matches "abatimento", a client's nickname matches the full name).
5. **Answer in the format below.** Quote or closely paraphrase what is written; never add facts that are not in the files. When the subject is a person or a company and who they are is on record, that is the first item, even when the question asks only for what was agreed. When a decision line ends with `— porque …` (and `— descartado: …`), keep them in the item: the reason is part of what was decided. A decision with no reason on its line is shown as it is — never supply one.
6. If a decision found is marked `[REVOGADA ...]`, show it as revoked and show what replaced it.
7. A `🔁` line under `## Rotinas` of `04_Pessoas_Pendencias.md` is a routine, something that repeats: show it in plain words — "todo mês, no dia 20: [texto]" — with the last time it was done (`feito em`) and the next date (`próxima`) when the line has them, never as a pending item or a decision. A `Rotina encerrada` line under "Pendências Resolvidas" is a routine that ended: say so, with its date.
8. A `📊` line under `## Resultado Mês a Mês` of `05_Registros_Gerais.md` is the result of one month (`**[YYYY-MM]**` is the month, `analisado em` the day it was recorded): show it as it is written — "setembro/2026: receita …, resultado …, margem líquida …" — never as a decision or a lesson, never recomputed, and add: *"Para comparar meses, pergunte 'como foi setembro?' ou 'como está o ano?'."*

## Output Format

```
🔎 **O que está registrado sobre [assunto]:**

• [fato ou decisão, em uma linha] — *[Arquivo], [data do registro]*
• [fato ou decisão, em uma linha] — *[Arquivo], [data do registro]*
• ~~[decisão revogada]~~ → substituída por [nova decisão] — *[Arquivo], [data]*

[🗄️ Do arquivo morto: • [item] — *Memoria/_Arquivo/AAAA.md* — SOMENTE se houver]

💡 [Uma linha de leitura conjunta, se os itens se conectam — ex: "as três lições apontam para o mesmo problema de prazo". Omita se não houver nada a dizer.]
```

When nothing is found:

```
🔎 Não encontrei nada registrado sobre [assunto].

Se quiser guardar algo agora, é só dizer: "registra que ..."
```

## Before a meeting ("preparar reunião com…", "briefing da reunião com…")

Same search, same rules, for the person or company named — and one more read: `Pilares/04_Comercial.md` (frontmatter `preco_piso`, `desconto_max`, payment and discount rules), if it exists. If no name was given, ask who the meeting is with, in one line. Answer in this format instead, omitting any block that has nothing on record:

```
🤝 **Antes de falar com [Nome]:**

**Quem é:** [papel ou empresa, preferências] — *[Arquivo], [data]*

**Em aberto:**
• [pendência, espera, proposta sem resposta ou projeto, com prazo ou "há N dias"] — *[Arquivo], [data]*

**Já combinado com [Nome]:**
• [combinado ou decisão] — *[Arquivo], [data]*

**Propostas anteriores:**
• [fechada | perdida] — [o que foi proposto] — R$ [valor][ — motivo: como está escrito] — *[Arquivo], [data]*

**Até onde você pode ir:** [todas as suas regras que valem nessa conversa: preço mínimo, desconto máximo e condição, sinal, parcelamento] — *[Arquivo]*

Depois da conversa, diga "anota a reunião" que eu guardo o que ficou combinado.
```

Every line that has `(desde …)` shows "há N dias", computed with the date tool. "Quem é" comes only from a line that says who they are (👥, or an old "Parceiros e Fornecedores" line) — never deduce it from a project or a pending item. A proposal that was won or lost goes only under "Propostas anteriores", never under "Em aberto" or "Já combinado". Do not suggest what to say, predict what the person wants or add advice that is not on record; "Até onde você pode ir" only repeats rules that are written. When nothing at all is recorded about that name, say so with the "nothing found" reply above, then show only the "Até onde você pode ir" block and the closing line.

## Rules

1. **Never invent.** If it is not written in `Pilares/` or `Memoria/`, it is not known. General knowledge about the sector is not an answer to this skill.
2. **Always cite file and date.** The date is the one written on that same line — never borrow it from a neighbouring line or from another item. An item with no date is cited by file only. A general rule that applies to the subject but does not name it (e.g. the deposit policy) is a separate item with its own source, never a detail slipped into another item.
3. **This skill only reads.** It never writes or edits anything.
4. **Keep it short.** At most 8 items; if there are more, show the most recent and say how many others exist.
5. **Relative paths.** All paths are relative to the workspace root.
