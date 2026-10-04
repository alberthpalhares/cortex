# 🧠 Córtex — Skill de Onboarding

Esta pasta contém a skill `cortex-onboarding`, parte do framework **Córtex**.

> 📖 **Documentação completa do framework:** veja o [`README.md`](../../../README.md) na raiz do repositório — instalação, estrutura de pastas gerada, comandos rápidos e para quem é o Córtex.

Este arquivo existe apenas para localizar rapidamente esta skill dentro de `.agents/skills/`. Para evitar divergência entre documentações, todo o conteúdo detalhado (fluxo de instalação, tabela de comandos, estrutura de pastas) vive **somente** no README raiz — não duplique aqui.

## O que esta skill faz

Conduz a conversa de montagem do Córtex e gera fisicamente os arquivos de `Pilares/`, `Memoria/` e `Frameworks/`, além dos arquivos de instrução da raiz (`AGENTS.md` e `CLAUDE.md` por padrão; `GEMINI.md` e `.cursorrules` sob demanda). Tem três modos:

- **Rápido (padrão):** 4 perguntas, cerca de 5 minutos.
- **Completo:** 9 blocos, cerca de 25 perguntas, 20–30 minutos — só quando o usuário pede.
- **Continuação:** retoma um Córtex já montado, um bloco por vez (`continuar onboarding`).

Ver `SKILL.md` nesta mesma pasta para as instruções completas que a IA segue.
