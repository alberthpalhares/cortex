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

## Para conversar com este exemplo

1. Baixe o [exemplo pronto (ZIP)](https://github.com/alberthpalhares/cortex/releases/latest/download/cortex-exemplo-estudio-lumen.zip) e descompacte.
2. Abra a pasta descompactada na sua ferramenta de IA (Claude Code, Gemini CLI ou outra que leia o arquivo `AGENTS.md`).
3. Diga `radar`, ou pergunte "quem é o cliente ideal do Estúdio Lumen?" ou "posso dar 15% de desconto na cobertura de evento?".

O ZIP traz estes mesmos dados e mais as habilidades da IA (a pasta `.agents/`, com as skills e os protocolos), já prontos para o Claude Code, o Gemini CLI e as ferramentas que leem `AGENTS.md`. Não precisa de Node.js nem de terminal. Dentro dele vai um `README.md` próprio, mais curto, para quem já baixou.

**Nesta pasta do repositório ficam só os dados** do negócio de exemplo: a pasta `.agents/` não é copiada para cá, para não duplicar o framework. Por isso, abrir esta pasta direto do repositório não basta: sem as habilidades, a IA não tem as instruções para seguir. O ZIP é montado a cada versão por `npm run build:zip`, que junta as duas partes.

Nesta pasta do repositório as datas são fixas e foram escritas para a semana de 05/10/2026, uma segunda-feira (o único prazo é 20/10/2026, a rotina de todo dia 10 está em aberto a partir de 10/10/2026, e há dois meses de resultado guardados, julho e agosto de 2026: a pergunta seria `como foi agosto?`). No ZIP elas não envelhecem: ao gerá-lo, `npm run build:zip` anda todas as datas o mesmo número de semanas inteiras, até a semana em que o ZIP é gerado, e o `README.md` de dentro dele diz quais datas valem. O ZIP da última versão é gerado de novo todo mês.
