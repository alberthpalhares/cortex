# Contribuindo para o Córtex

Você está ajudando a construir o **Sócio Inteligente** do futuro para milhares de negócios.

O **Córtex** existe para transformar a Inteligência Artificial em uma parceira estratégica viva para qualquer negócio. Cada skill que você cria, cada pilar que você refina e cada framework que você adiciona permite que empreendedores e profissionais foquem naquilo que as máquinas não conseguem fazer: criatividade, liderança, relacionamentos e visão de longo prazo.

---

## Bem-vindo(a)

Buscamos contribuidores que compartilhem da nossa missão: **democratizar a inteligência de negócios com IA local, privada e autônoma.**

### Quem pode contribuir
- **Designers de IA & Prompt Engineers:** Entendem a estrutura de system prompts, instruções concisas e orquestração de assistentes.
- **Empreendedores & Especialistas de Nicho:** Trazem frameworks reais de mercado (vendas, finanças, jurídico, marketing, operações).
- **Desenvolvedores:** Criam automações, skills agnósticas e melhorias para a CLI (`npx @aksp/cortex init`).

Antes de começar, leia o [README.md](README.md) para entender a arquitetura do projeto.

---

## A Regra de Ouro: Arquivos Locais & Simplicidade

O Córtex foi desenhado para ser **100% local, privado e leve**. Ele roda com um único comando:

```bash
npx @aksp/cortex init
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

### Convenção de Gatilhos (Trigger Discipline)

Com 12+ skills convivendo no mesmo cérebro, a IA precisa saber qual acionar sem hesitar. Siga estas regras ao escrever a `description` de qualquer skill:

**1. Verbo primário exclusivo.** Cada skill "possui" um verbo ou frase curta que nenhuma outra skill usa como gatilho principal:

| Skill | Verbo primário | Gatilhos secundários |
|-------|---------------|---------------------|
| `radar` | `radar` | `status`, `como estamos?`, `briefing` |
| `registrar` | `registra` | `nova lição`, `pendência`, `decidi que`, `resolvido` |
| `cortex-onboarding` | `montar meu córtex` | `criar córtex`, `continuar onboarding`, `completar meu córtex` |
| `cortex-revisao` | `revisar córtex` | `revisar pilares` |
| `saude` | `saúde do córtex` | `diagnóstico` (do Córtex), `o que falta preencher` |
| `ajuda` | `ajuda` | `o que você faz?`, `comandos` |
| `consolidar` | `consolidar memória` | `arquivar memória`, `a memória está grande` |
| `proposta-comercial` | `gerar proposta` | `monta uma proposta`, `proposta comercial` |
| `analisador-dre` | `analisar DRE` | `analisa essa planilha`, `como está minha margem` |
| `pesquisa-mercado` | `pesquisar concorrência` | `mapear concorrentes`, `quem são meus concorrentes` |
| `ideias` | `ideia` (sobre o framework) | `nova ideia`, `tenho uma ideia`, `analisar viabilidade` |
| `cortex doctor` (CLI) | `cortex doctor` | `npx @aksp/cortex doctor` |

**2. Verbo novo = verbo livre.** Antes de propor uma skill, verifique se o verbo primário dela já não é usado por outra skill nesta tabela. Se for, escolha outro.

**3. Gatilho sobreposto = a IA pergunta.** O `brain.framework.md` instrui a IA: na dúvida entre duas skills, pergunte em uma linha antes de agir ("Você quer registrar essa decisão ou quer que eu analise o impacto financeiro dela?").

**4. `description` no frontmatter é o que dispara.** A IA lê o campo `description` do frontmatter de cada `SKILL.md` para decidir qual acionar. Se o gatilho não estiver ali, a skill não dispara. Mantenha-o atualizado.

### Manifesto do Framework (`.agents/manifest.json`)

Toda skill ou template novo/removido em `.agents/` deve ser refletido no manifesto, que é o que permite ao `cortex update` diferenciar arquivos do framework de customizações do usuário:

```bash
npm run build:manifest   # regenera .agents/manifest.json
npm run verify:manifest  # falha se o manifesto commitado estiver desatualizado (rodado no CI)
```

Rode `npm run build:manifest` sempre que adicionar, remover ou renomear um arquivo dentro de `.agents/`, e commite o `manifest.json` atualizado junto com o PR.

### Testes (`bin/cli.js`)

O CLI executa operações que tocam o disco do usuário (`init`, `update`, `sync`), então qualquer mudança em `bin/cli.js` precisa vir acompanhada de teste:

```bash
npm test   # node --test — roda os testes em test/unit e test/integration
```

A invariante mais importante do projeto — **`cortex update` nunca altera `Pilares/`, `Memoria/`, `Ativos/`, `Frameworks/` ou os arquivos de raiz** — é coberta por `test/integration/cli.test.js`. PRs que tocam `bin/cli.js` sem teste correspondente não serão aceitos.

---

## 💻 Compatibilidade Multi-IDE

O Córtex é compatível com múltiplos assistentes de IA local ([AGENTS.md](AGENTS.md), [GEMINI.md](GEMINI.md), [CLAUDE.md](CLAUDE.md), [CODEX.md](CODEX.md), [.cursorrules](.cursorrules)).

- Se você alterar regras de inicialização ou o system prompt base, certifique-se de replicar a alteração em todos os arquivos de instrução correspondentes para manter a sincronia.

---

## O que aceitamos

- 🛠️ **Novas Skills Agnósticas (`.agents/skills/`):** Habilidades operacionais reutilizáveis.
- 🏛️ **Pilares Específicos por Setor (`Pilares/`):** Templates customizados de pilares para nichos (ex: *Saúde & Clínicas, Imobiliárias, E-commerce, Advocacia, Infoprodutos*).
- 📐 **Novos Frameworks Estratégicos (`Frameworks/`):** Métodos e protocolos de gestão (ex: *OKRs, Matriz Eisenhower, Funil de Vendas*).
- 🚀 **Melhorias no CLI (`bin/cli.js`):** Aprimoramentos para `npx @aksp/cortex init` e `npx @aksp/cortex update`.
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

## Checklist de Release

Ao publicar uma nova versão (adicionar/remover/renomear skill, ou qualquer mudança que afete o comportamento do framework), siga esta lista. O CI (`npm test && npm run verify:manifest`) cobre os itens marcados com ⚙️ automaticamente.

- ⚙️ `npm test` passa (28+ testes)
- ⚙️ `npm run verify:manifest` passa (manifesto em dia)
- [ ] `npm run build:manifest` foi rodado e commitado (se arquivos em `.agents/` mudaram)
- [ ] **Tabela de gatilhos** no `CONTRIBUTING.md` está atualizada (skill nova = nova linha na tabela)
- [ ] **Skill `ajuda`** lista o novo comando (se for skill acionável pelo usuário)
- [ ] **`brain.framework.md` + `CORTEX_TEMPLATE.md`** têm a regra de disparo da nova skill
- [ ] **CHANGELOG.md** está atualizado com as mudanças desta versão
- [ ] **`examples/estudio-lumen/`** reflete as mudanças (se o exemplo for afetado — ex: novo pilar opcional, nova skill que o cérebro do exemplo deveria conhecer)
- [ ] **`package.json`** — versão incrementada conforme SemVer
- [ ] **`README.md`** — tabela de comandos do CLI atualizada, se houve mudança em `init`/`update`/`sync`/`doctor`

### Ao adicionar uma skill nova:

- [ ] Criar `.agents/skills/<nome>/SKILL.md` com frontmatter (`name`, `description`)
- [ ] `description` inclui os gatilhos em português (mesmo com o corpo em inglês)
- [ ] Verbo primário não conflita com nenhuma skill existente (ver tabela de gatilhos)
- [ ] Templates associados (se houver) em `.agents/skills/<nome>/templates/`
- [ ] Adicionar ao manifesto: `npm run build:manifest`
- [ ] Adicionar regra de disparo no `brain.framework.md` e `CORTEX_TEMPLATE.md`
- [ ] Adicionar à skill `ajuda`
- [ ] Adicionar à tabela de gatilhos neste arquivo

### Ao remover/renomear uma skill:

- [ ] Remover/renomear a pasta em `.agents/skills/`
- [ ] Remover a regra de disparo do `brain.framework.md` e `CORTEX_TEMPLATE.md`
- [ ] Remover da skill `ajuda`
- [ ] Atualizar a tabela de gatilhos neste arquivo
- [ ] Atualizar o manifesto: `npm run build:manifest`
- [ ] O arquivo antigo será detectado como "removido pelo framework" no próximo `cortex update` do usuário (via manifesto) e removido apenas com `--prune`

## Ideias de Contribuição para Começar

**Skills Recomendadas (`.agents/skills/`):**
- `post-social-media`: Gerador de posts para redes sociais alinhado ao Pilar de Comunicação.
- `analisador-contrato`: Leitor de contratos que aponta cláusulas fora do padrão registrado em `07_Juridico.md`.
- `onboarding-cliente`: Roteiro de boas-vindas para clientes recorrentes, reaproveitando Comunicação + Identidade Visual.

> ✅ `proposta-comercial`, `analisador-dre` e `pesquisa-mercado` já existem em `.agents/skills/` — confira o [Córtex de exemplo](examples/estudio-lumen/) para ver todas as skills em ação num negócio fictício.

---

*Obrigado por ajudar a tornar o Córtex o melhor sócio estratégico impulsionado por IA!*
