# Contribuindo para o Córtex

Você está ajudando a construir o **Sócio Inteligente** do futuro para milhares de negócios.

O **Córtex** existe para transformar a Inteligência Artificial em uma parceira estratégica viva para qualquer negócio. Cada skill que você cria, cada pilar que você refina e cada framework que você adiciona permite que empreendedores e profissionais foquem naquilo que as máquinas não conseguem fazer: criatividade, liderança, relacionamentos e visão de longo prazo.

---

## Bem-vindo(a)

Buscamos contribuidores que compartilhem da nossa missão: **democratizar a inteligência de negócios com IA local, privada e autônoma.**

### Quem pode contribuir
- **Designers de IA & Prompt Engineers:** Entendem a estrutura de system prompts, instruções concisas e orquestração de assistentes.
- **Empreendedores & Especialistas de Nicho:** Trazem frameworks reais de mercado (vendas, finanças, jurídico, marketing, operações).
- **Desenvolvedores:** Criam automações, skills agnósticas e melhorias para a CLI (`npx cortex init`).

Antes de começar, leia o [README.md](README.md) para entender a arquitetura do projeto.

---

## A Regra de Ouro: Arquivos Locais & Simplicidade

O Córtex foi desenhado para ser **100% local, privado e leve**. Ele roda com um único comando:

```bash
npx cortex init
```

**Arquivos Markdown locais são a fonte da verdade por design.**

---

## 🔒 Segurança e Privacidade em Primeiro Lugar

Segurança é um requisito inegociável no Córtex. Ao submeter qualquer código, skill ou template:

1. **NUNCA inclua chaves de API, senhas ou segredos:** Todas as credenciais devem ser solicitadas dinamicamente ao usuário ou lidas de variáveis de ambiente locais.
2. **Respeite os limites do disco local:** Skills não devem tentar ler ou alterar arquivos fora do diretório do projeto do usuário sem consentimento explícito.
3. **NENHUM envio oculto de dados:** É proibido incluir scripts de telemetria, rastreamento ou envio de dados do negócio para servidores de terceiros.

---

## 🛠️ Padrão e Anatomia de Skills (`.agents/skills/`)

Skills são o principal formato de contribuição no Córtex. Elas devem ser salvas na pasta `.agents/skills/<nome-da-skill>/SKILL.md`.

### Estrutura obrigatória de uma Skill:

```markdown
---
name: nome-da-skill-kebab-case
description: Descrição curta em 1 ou 2 frases sobre o que a skill faz e quando acioná-la.
---

# Nome da Skill

## Quando Usar
Descreva os gatilhos de linguagem natural que acionam esta skill (ex: "gerar proposta", "analisar concorrente").

## Instruções para a IA
1. Passo 1 curto e objetivo.
2. Passo 2 com regras de formatação.

## Formato de Saída
Defina a estrutura esperada do resultado gerado.
```

### Economia de Tokens (Context Overhead)
> ⚠️ **IMPORTANTE:** Cada skill adicionada é carregada no contexto da IA. Mantenha as instruções **curtas, diretas e extremamente objetivas**. Prefira bullet points a parágrafos longos.

---

## 💻 Compatibilidade Multi-IDE

O Córtex é compatível com múltiplos assistentes de IA local ([AGENTS.md](AGENTS.md), [GEMINI.md](GEMINI.md), [CLAUDE.md](CLAUDE.md), [CODEX.md](CODEX.md), [.cursorrules](.cursorrules)).

- Se você alterar regras de inicialização ou o system prompt base, certifique-se de replicar a alteração em todos os arquivos de instrução correspondentes para manter a sincronia.

---

## O que aceitamos

- 🛠️ **Novas Skills Agnósticas (`.agents/skills/`):** Habilidades operacionais reutilizáveis.
- 🏛️ **Pilares Específicos por Setor (`Pilares/`):** Templates customizados de pilares para nichos (ex: *Saúde & Clínicas, Imobiliárias, E-commerce, Advocacia, Infoprodutos*).
- 📐 **Novos Frameworks Estratégicos (`Frameworks/`):** Métodos e protocolos de gestão (ex: *OKRs, Matriz Eisenhower, Funil de Vendas*).
- 🚀 **Melhorias no CLI (`bin/cli.js`):** Aprimoramentos para o instalador `npx cortex init`.
- 📚 **Documentação & Exemplos:** Melhorias no README, guias e traduções.

---

## O que NÃO se encaixa

- ❌ Substituir arquivos Markdown por bancos de dados pesados (PostgreSQL, SQLite, Redis, etc.).
- ❌ Exigir servidores externos ou dependências pagas obrigatórias para o funcionamento básico.
- ❌ Adicionar frameworks complexos no CLI que inflem a instalação.

---

## Como enviar sua contribuição (Passo a Passo)

1. **Abra uma Issue primeiro:** Para mudanças grandes ou novas skills complexas, [abra uma issue](https://github.com/alberthpalhares/cortex/issues) para discutir com a comunidade antes de começar.
2. **Faça um Fork** deste repositório para o seu GitHub.
3. **Crie uma Branch** para a sua funcionalidade:
   ```bash
   git checkout -b feature/minha-nova-skill
   ```
4. **Faça as alterações e teste localmente** na sua IDE.
5. **Faça o Commit** das suas mudanças com mensagens claras (padrão Conventional Commits):
   ```bash
   git commit -m "feat(skill): adiciona skill de proposta-comercial"
   ```
6. **Envie para o seu Fork (Push):**
   ```bash
   git push origin feature/minha-nova-skill
   ```
7. **Abra um Pull Request (PR)** detalhando as mudanças e como testar.

---

## Ideias de Contribuição para Começar

**Skills Recomendadas (`.agents/skills/`):**
- `post-social-media`: Gerador de posts para redes sociais alinhado ao Pilar de Comunicação.
- `proposta-comercial`: Gerador automático de propostas comerciais em PDF/Markdown.
- `analisador-dre`: Leitor e diagnosticador de demonstrativos financeiros (DRE/Planilhas).
- `pesquisa-mercado`: Skill de Deep Research para mapeamento de concorrência.

---

*Obrigado por ajudar a tornar o Córtex o melhor sócio estratégico impulsionado por IA!*
