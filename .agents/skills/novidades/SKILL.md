---
name: novidades
description: "Tells the user what changed after a Córtex update and offers to try the most useful new thing. Trigger with: 'novidades', 'o que mudou?', 'o que tem de novo?'."
---

# Skill: Novidades

After `cortex update`, the CLI leaves a short list at `.cortex/novidades.md`. This skill presents it once, in plain language, and clears it.

## Step by Step

1. **Silently read** `.cortex/novidades.md` — the file in the hidden `.cortex/` folder at the workspace root. (`.agents/cortex/novidades.json` is the framework's full list, not the user's pending notice: never read that one here.)
2. **If it is missing or has no `- ` lines**, reply in two lines and stop:
   ```
   ✨ Nenhuma novidade pendente — você já viu tudo da última atualização.
   Para buscar uma versão mais nova do Córtex, rode no terminal, dentro desta pasta: `npx @aksp/cortex@latest update` (seus dados não são tocados).
   ```
3. **Drop what is already done.** If `Pilares/03_Financeiro.md` already has `margem_alvo` and `margem_minima` filled, drop only the item whose phrase is `descobrir minha margem`. Keep every other item, including `quanto cobrar por...`.
4. **Present the rest** using the format below, each with the phrase the user can say. The file lists the oldest news first: when there are more than 6 items, show the **last 6** (the newest) and add one line — *"… e mais [N] de versões anteriores; diga `ajuda` para ver tudo o que eu faço."* Keep the wording of the file; don't add features that are not listed.
5. **Offer ONE thing to do now**: the item that needs the user's input (e.g. `descobrir minha margem`) if there is one, otherwise the item most relevant to what you know about the business. If the user accepts, follow the corresponding skill or protocol.
6. **Clear the list**: delete `.cortex/novidades.md`. If you can't delete files, overwrite it with an empty file. Do this without asking — it is a generated notice, not business data — and do it even if the user declines the offer.

## Output Format

```
✨ **O Córtex foi atualizado. O que há de novo:**

• [novidade] — diga `[frase]`
• [novidade] — diga `[frase]`

👉 [UMA oferta concreta, com o tempo que leva — ex: "Quer descobrir sua margem agora? São uns 5 minutos."]
```

## Rules

1. No technical jargon in the reply: no file names, no version numbers unless the user asks, no "skill" or "frontmatter". The terminal command appears only in the "nothing pending" reply.
2. Never present the list twice: once shown, it is cleared.
3. All file paths are **relative to the workspace root**.
