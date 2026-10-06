# Exemplo: Estúdio Lumen — Fotografia e Vídeo Corporativo

Este é um **Córtex de referência**, totalmente preenchido para um negócio fictício (Estúdio Lumen). Ele existe para dois propósitos:

1. **Servir de padrão de qualidade** para a IA entender o nível de detalhe e o tom esperado ao preencher um Córtex real durante o onboarding.
2. **Servir de demonstração** para quem está decidindo se o framework serve para o seu negócio — leia os arquivos abaixo para ver como fica um Córtex maduro, com Pilares, Memória e o "cérebro" completos.

**Estúdio Lumen** é um Eu-presa fictício de fotografia e vídeo corporativo, com 4 anos de operação, que atende empresas de médio porte. Nenhum dado aqui é real.

## Estrutura

```
estudio-lumen/
├── Pilares/       ← 01, 02, 05, 06 (obrigatórios) + 03, 04, 09 (opcionais)
├── Memoria/       ← META.md + 5 arquivos, com decisões, lições e projetos de exemplo
├── Frameworks/    ← CEREBRO.md (o system prompt completo deste negócio)
└── AGENTS.md / CLAUDE.md      ← cérebro compilado a partir de Frameworks/CEREBRO.md (artefatos gerados)
```

Esta pasta guarda só os **dados** do negócio de exemplo. As habilidades da IA (a pasta `.agents/`, com as skills e os protocolos) não ficam aqui, para não duplicar o framework dentro do repositório.

**Para conversar com este exemplo:** copie esta pasta para fora do repositório, copie também a pasta `.agents/` da raiz do repositório para dentro da cópia, abra a cópia na sua ferramenta de IA (Claude Code, Gemini CLI, Cursor etc.) e diga "radar" ou pergunte "quem é o cliente ideal do Estúdio Lumen?". Sem a pasta `.agents/`, a IA não tem as instruções das skills para seguir.
