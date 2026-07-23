# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/), e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

## [0.4.0] - 2026-07-22

### Adicionado
- **Instalador NPX CLI (`npx cortex-ai init` / `npx cortex init`):** Utilitário CLI nativo em Node.js ([bin/cli.js](file:///e:/60-69%20PROJETOS/62%20Projetos%20conclu%C3%ADdos/62.10%20C%C3%B3rtex/bin/cli.js)) para inicializar a estrutura completa do Córtex em qualquer diretório com um único comando.
- **Configuração de Pacote NPM (`cortex-ai`):** Arquivo [package.json](file:///e:/60-69%20PROJETOS/62%20Projetos%20conclu%C3%ADdos/62.10%20C%C3%B3rtex/package.json) configurado com o nome de pacote `cortex-ai` e atalhos de binários `cortex`, `cortex-ai` e `cortex-framework`.
- **Guia de Contribuição Open-Source:** Criado [CONTRIBUTING.md](file:///e:/60-69%20PROJETOS/62%20Projetos%20conclu%C3%ADdos/62.10%20C%C3%B3rtex/CONTRIBUTING.md) estabelecendo as diretrizes de desenvolvimento da comunidade, regras de economia de tokens e passo a passo para Pull Requests.

## [0.3.0] - 2026-07-20

### Adicionado
- **Seção "Por que a IA precisa ser local?":** Comparativo detalhado entre Córtex (Local/IDE) e soluções baseadas em navegador (ChatGPT/Gemini/Claude).
- **Protocolo de Autonomia (`PROTOCOLO_AUTONOMIA.md`):** Evolução dos blocos fundamentais introduzindo os 4 modos de ação da IA para execução autônoma.
- **Suporte nativo ao OpenAI Codex / ChatGPT CLI:** Adicionado [CODEX.md](file:///e:/60-69%20PROJETOS/62%20Projetos%20conclu%C3%ADdos/62.10%20C%C3%B3rtex/CODEX.md) para integração com assistentes CLI.
- **Comandos de instalação cross-platform:** Instruções parametrizadas para macOS, Linux e Windows (PowerShell/CMD).

## [0.2.0] - 2026-07-19

### Adicionado
- **Skills Agnósticas:** Migração das habilidades para a pasta `.agents/skills` garantindo compatibilidade multiplataforma.
- **Ramificação por Modelo de Negócio:** Entrevista adaptativa de onboarding conforme a modalidade da empresa (B2B, B2C, SaaS, E-commerce, Infoprodutos, Serviços).
- **Pilares Customizados:** Capacidade de gerar pilares estratégicos adicionais sob medida além dos 9 padrão.
- **Pré-preenchimento Inteligente:** Leitura prévia de documentos do cliente (PDFs, planilhas) para agilizar o onboarding.
- **Skill de Revisão Semestral:** Skill [cortex-revisao](file:///e:/60-69%20PROJETOS/62%20Projetos%20conclu%C3%ADdos/62.10%20C%C3%B3rtex/.agents/skills/cortex-revisao/SKILL.md) para auditoria periódica dos pilares do negócio.

### Alterado
- **Blindagem de Estrutura:** Utilização de arquivos antigos estritamente como contexto sem corromper a estrutura padrão do Córtex.

## [0.1.1] - 2026-07-19

### Adicionado
- **Arquivos `.gitkeep`:** Garantia de persistência de diretórios vazios ao clonar o repositório.
- **Refinamento do Guia de Instalação:** Ajustes nos comandos `git clone` no [README.md](file:///e:/60-69%20PROJETOS/62%20Projetos%20conclu%C3%ADdos/62.10%20C%C3%B3rtex/README.md) com aspas e ponto-e-vírgula para evitar erros no terminal.

## [0.1.0] - 2026-07-19

### Adicionado
- **Lançamento Inicial do Córtex:** Estrutura base de Pilares, Memória, Ativos e Frameworks.
- **Skill de Onboarding (`cortex-onboarding`):** Entrevista guiada em 9 blocos para inicialização do negócio.
- **Skills de Operação Diária:** Habilidades [radar](file:///e:/60-69%20PROJETOS/62%20Projetos%20conclu%C3%ADdos/62.10%20C%C3%B3rtex/.agents/skills/radar/SKILL.md) e [registrar](file:///e:/60-69%20PROJETOS/62%20Projetos%20conclu%C3%ADdos/62.10%20C%C3%B3rtex/.agents/skills/registrar/SKILL.md).
- **System Prompts Multi-IDE:** Suporte inicial para [AGENTS.md](file:///e:/60-69%20PROJETOS/62%20Projetos%20conclu%C3%ADdos/62.10%20C%C3%B3rtex/AGENTS.md), [GEMINI.md](file:///e:/60-69%20PROJETOS/62%20Projetos%20conclu%C3%ADdos/62.10%20C%C3%B3rtex/GEMINI.md), [CLAUDE.md](file:///e:/60-69%20PROJETOS/62%20Projetos%20conclu%C3%ADdos/62.10%20C%C3%B3rtex/CLAUDE.md) e [.cursorrules](file:///e:/60-69%20PROJETOS/62%20Projetos%20conclu%C3%ADdos/62.10%20C%C3%B3rtex/.cursorrules).
