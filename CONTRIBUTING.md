# Contribuindo para o Córtex

Você está ajudando a construir o **Sócio Inteligente** do futuro para milhares de negócios.

O **Córtex** existe para transformar a Inteligência Artificial em uma parceira estratégica viva para qualquer negócio. Cada skill que você cria, cada pilar que você refina e cada framework que você adiciona permite que empreendedores e profissionais foquem naquilo que as máquinas não conseguem fazer: criatividade, liderança, relacionamentos e visão de longo prazo.

---

## Bem-vindo(a)

Buscamos contribuidores que compartilhem da nossa missão: **democratizar a inteligência de negócios com IA local, privada e autônoma.**

### Quem pode contribuir
- **Designers de IA & Prompt Engineers:** Entendem a estrutura de system prompts, instruções concisas e orquestração de assistentes.
- **Empreendedores & Especialistas de Nicho:** Trazem frameworks reais de mercado (vendas, finanças, jurídico, marketing, operações).
- **Desenvolvedores:** Criam automações, skills agnósticas e melhorias para o CLI (`npx cortex init`).

Antes de começar, leia o [README.md](README.md) para entender a arquitetura do projeto.

---

## A Regra de Ouro: Arquivos Locais & Simplicidade

O Córtex foi desenhado para ser **100% local, privado e leve**. Ele roda com um único comando:

```bash
npx cortex init
```

**Arquivos Markdown locais são a fonte da verdade por design.**

### O que aceitamos

- 🛠️ **Novas Skills Agnósticas (`.agents/skills/`):** Habilidades operacionais reutilizáveis (ex: auditoria de SEO, gerador de propostas comerciais, análise de métricas, integração com WhatsApp).
- 🏛️ **Pilares Específicos por Setor (`Pilares/`):** Templates customizados de pilares para nichos do mercado (ex: *Saúde & Clínicas, Imobiliárias, E-commerce, Advocacia, Infoprodutos*).
- 📐 **Novos Frameworks Estratégicos (`Frameworks/`):** Métodos e protocolos de gestão (ex: *OKRs, Matriz Eisenhower, Planejamento de Lançamentos, Funil de Vendas*).
- 💻 **Suporte a Novas IDEs / Assistentes CLI:** Adição de system prompts para novas ferramentas de IA local.
- 🚀 **Melhorias no CLI (`bin/cli.js`):** Correções e aprimoramentos para o instalador `npx cortex init`.
- 📚 **Documentação & Exemplos:** Melhorias no README, guias e exemplos de uso.

### Impacto no consumo de tokens

> ⚠️ **IMPORTANTE:** Cada skill, pilar ou framework adicionado ao projeto é carregado na janela de contexto da IA. Mantenha todas as instruções **curtas, diretas e extremamente objetivas**. Evite textos prolixos para economizar tokens e garantir respostas rápidas.

---

## O que NÃO se encaixa

Antes de iniciar uma contribuição, pergunte-se: *"Isso mantém o Córtex simples, local e acessível para qualquer pessoa?"*

Exemplos do que **não aceitamos**:

- ❌ Substituir arquivos Markdown por bancos de dados pesados (PostgreSQL, SQLite, Redis, etc.).
- ❌ Exigir servidores externos ou dependências pagas obrigatórias para o funcionamento básico.
- ❌ Adicionar frameworks complexos de Node.js no CLI que inflem a instalação.

---

## Como enviar sua contribuição (Passo a Passo)

1. **Faça um Fork** deste repositório para o seu GitHub.
2. **Crie uma Branch** para a sua funcionalidade:
   ```bash
   git checkout -b feature/minha-nova-skill
   ```
3. **Faça as alterações e teste localmente** na sua IDE com o Córtex.
4. **Faça o Commit** das suas mudanças com mensagens claras:
   ```bash
   git commit -m "feat: adiciona skill de analise-de-concorrentes"
   ```
5. **Envie para o seu Fork (Push):**
   ```bash
   git push origin feature/minha-nova-skill
   ```
6. **Abra um Pull Request (PR)** detalhando o que foi adicionado e como testar.

---

## Ideias de Contribuição para Começar

Se você quer contribuir mas não sabe por onde começar, aqui estão algumas ideias que a comunidade adoraria receber:

**Skills Recomendadas (`.agents/skills/`):**
- `post-social-media`: Gerador de posts para Instagram/LinkedIn com tom de voz do Pilar de Comunicação.
- `proposta-comercial`: Gerador automático de propostas em PDF/Markdown com base nas regras do Pilar Comercial.
- `analisador-dre`: Leitor e diagnosticador de demonstrativos financeiros (DRE/Planilhas).
- `pesquisa-mercado`: Skill de Deep Research para mapeamento de concorrentes.

---

*Obrigado por ajudar a tornar o Córtex o melhor sócio estratégico impulsionado por IA!*
