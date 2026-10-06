---
name: lembrar
description: "Answers 'what do we already know / what did we decide about X' by searching Pilares, Memoria and the archive, citing where and when each fact was recorded. Trigger with: 'o que você sabe sobre', 'você lembra de', 'qual era o combinado com', 'o que já decidimos sobre', 'procura na memória', 'tem algo registrado sobre'."
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
4. **Match by meaning, not only by exact word** (e.g. "desconto" also matches "abatimento", a client's nickname matches the full name).
5. **Answer in the format below.** Quote or closely paraphrase what is written; never add facts that are not in the files.
6. If a decision found is marked `[REVOGADA ...]`, show it as revoked and show what replaced it.

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

## Rules

1. **Never invent.** If it is not written in `Pilares/` or `Memoria/`, it is not known. General knowledge about the sector is not an answer to this skill.
2. **Always cite file and date.** The date is the one written on that same line — never borrow it from a neighbouring line or from another item. An item with no date is cited by file only. A general rule that applies to the subject but does not name it (e.g. the deposit policy) is a separate item with its own source, never a detail slipped into another item.
3. **This skill only reads.** It never writes or edits anything.
4. **Keep it short.** At most 8 items; if there are more, show the most recent and say how many others exist.
5. **Relative paths.** All paths are relative to the workspace root.
