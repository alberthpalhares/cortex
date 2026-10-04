---
name: conteudo
description: "Writes ready-to-publish content in the business's own voice: social posts, captions, WhatsApp messages, short emails. Trigger with: 'cria um post', 'escreve uma legenda', 'mensagem de WhatsApp', 'escreve um texto sobre', 'ideias de conteúdo'."
---

# Skill: Conteúdo

Produces text the user can copy and publish, written the way this business actually talks — never generic marketing copy. It is the "Copy & Comms" mode of `Frameworks/PROTOCOLO_AUTONOMIA.md` turned into a concrete routine.

## Step by Step

1. **Identify the request:** the format (post, caption, WhatsApp message, email, list of ideas) and the subject. If either is missing, infer the most likely one from the request; ask only if you truly cannot.
2. **Silently read:**
   - `Pilares/05_Comunicacao.md` — tone of voice, active channels, content strategy
   - `Pilares/01_Estrategia.md` — positioning and ideal client, so the text speaks to the right person
   - `Pilares/09_Identidade_Visual.md`, if it exists — verbal guidelines and brand rules
   - `Memoria/02_Licoes.md`, section "Acertos e Casos de Sucesso" — what already worked
   - `Memoria/03_Projetos.md` — if the subject is a current project or delivery
3. **Write two versions:** the main one, and a shorter or more casual alternative.
4. **Respect the channel.** A WhatsApp message is short and direct; an Instagram caption opens with a hook and may end with a call to action; an email has a subject line.
5. **Mark what needs the user's input** between `[COLCHETES]` (a date, a price, a client's name you do not have). Never invent a price, a deadline, or a result.
6. If asked for **ideas** rather than a finished text, give 5 one-line ideas tied to the positioning and to what already worked, then offer to write any of them.

## Output Format

```
✍️ **[Formato] — [assunto]**

**Versão 1**
[texto pronto para copiar]

**Versão 2 (mais curta)**
[texto pronto para copiar]

[💡 Uma linha opcional: melhor dia/horário ou canal, SOMENTE se o Pilar de Comunicação disser algo sobre isso]
```

## Rules

1. **The tone of voice in `05_Comunicacao.md` is mandatory.** If that section is empty, write in a neutral, warm tone and say in one line that defining the tone ("continuar onboarding") will make the texts sound more like the business.
2. **No generic AI phrasing.** No "Você sabia que...?", no "Em um mundo cada vez mais...", no stacked emojis or hashtags unless the pillar asks for them.
3. **Never invent facts** — prices, results, testimonials, deadlines. Use what is recorded or a bracketed placeholder.
4. **Do not publish or send anything.** This skill only writes the text.
5. **Save only if asked.** If the user wants to keep it, save to `Ativos/Conteudo/AAAA-MM-DD_assunto.md` using the real system date.
6. **Relative paths.** All paths are relative to the workspace root.
