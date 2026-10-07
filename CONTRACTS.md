# Contratos do Córtex — v1.0.0

> **Congelados em 2026-08-02.**
> Estes são os contratos estruturais da v1.0.0. Mudanças que quebrem qualquer um destes exigem uma major version bump (v2.0.0) e plano de migração documentado para Córtex existentes.

---

## 1. Manifesto de Framework (`.agents/manifest.json`)

**Propósito:** Lista versionada e exaustiva dos arquivos que pertencem à camada de framework. Usado pelo `cortex update` para diferenciar arquivos do framework de customizações do usuário, e pelo `cortex doctor` para dizer quais arquivos do framework faltam na pasta.

**Schema:**

```json
{
  "version": "1.0.0",
  "files": [
    ".agents/cortex/brain.framework.md",
    ".agents/skills/ajuda/SKILL.md",
    "..."
  ]
}
```

**Regras:**
- `version` sempre casa com `package.json` → `version`
- `files` é um array de strings ordenado alfabeticamente, com caminhos POSIX (`/`) relativos à raiz do repositório
- Gerado por `scripts/build-manifest.js` (varredura determinística de `.agents/`)
- Commitado no repositório; o CI (`npm run verify:manifest`) falha se estiver desatualizado
- O `cortex doctor` compara a pasta com o manifesto **instalado** nela (o da versão que o usuário tem), não com o do comando que está rodando. Ele só acusa arquivo listado que não existe ou está vazio: arquivo editado ou criado pelo usuário nunca é apontado, e o que sobrou de versões antigas continua sendo assunto do `update --prune`. O achado não muda o código de saída de um Córtex montado (0, como as demais seções do relatório) e o conserto indicado para arquivo faltando é sempre `npx @aksp/cortex@latest update --force`. O `update` guarda antes uma cópia de `.agents/` (seção 3.4): uma skill editada pelo usuário volta ao texto padrão e a versão dele fica nessa cópia, que é uma das 3 `update-…` mantidas
- Sem manifesto legível e sem registro de versão a partir da v0.10.0 (`.cortex/version.json` ausente, ilegível ou anterior a ela) não há lista para comparar: o `doctor` diz que não conseguiu conferir e indica o mesmo comando, em vez de afirmar que nada falta
- Num Córtex montado, o `cortex update` repõe a pasta `.agents/` inteira quando ela não existe (o `init` não roda por cima de um Córtex montado). Nesse caso a pasta `update-…` não tem `agents/` (não havia o que copiar) e o CLI não afirma que tem nem mostra os passos manuais de volta. Caso à parte (v1.9.0+): pasta que tem `Memoria/META.md`, mas não tem `Frameworks/CEREBRO.md` nem nenhum arquivo de instrução na raiz (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.cursorrules`) — só os dados do negócio. Nela o `update` **reconstrói** o que falta (ver a emenda v1.9.0 da seção 2), com confirmação ou `--force`; o `init` continua recusando e aponta o `update`, e o `doctor` indica `npx @aksp/cortex@latest update --force`, mesmo com a `.agents/` inteira. Pasta sem cérebro e sem `Memoria/META.md` não é um Córtex: segue fora do alcance do `update`
- Pasta só instalada (ainda não montada) que perdeu a `.agents/` inteira: não há manifesto para comparar, o `update` recusa (código 1) e o conserto indicado é `npx @aksp/cortex@latest init`, que repõe a pasta
- **Garantia de breaking change:** renomear ou remover `manifest.json`, ou mudar seu caminho (`MANIFEST_REL_PATH` em `bin/cli.js`)

---

## 2. Camadas do Cérebro (`Frameworks/CEREBRO.md`)

**Propósito:** Separar o que é do framework (regenerável) do que é do negócio (intocável). É isso que permite `cortex update` evoluir as regras de operação sem nunca alterar os dados do usuário.

**Marcadores (âncoras):**

```
<!-- CORTEX:BUSINESS:START -->
... identidade do negócio, datas de revisão, lista de pilares ...
<!-- CORTEX:BUSINESS:END -->

<!-- CORTEX:FRAMEWORK:START -->
... regras de operação, disparo de skills, protocolos ...
<!-- CORTEX:FRAMEWORK:END -->
```

**Regras:**
- Ambos os pares de marcadores DEVEM existir no `CEREBRO.md` gerado pelo onboarding
- A região `CORTEX:BUSINESS` é escrita uma vez (onboarding) e **nunca** tocada por `cortex update`
- A região `CORTEX:FRAMEWORK` é regenerada a cada `cortex update` a partir de `.agents/cortex/brain.framework.md`
- O conteúdo entre `BUSINESS:START` e `BUSINESS:END` inclui obrigatoriamente: nome do negócio (`**Negócio:**`), setor, tipo, data de onboarding, data de próxima revisão, e a lista de pilares (`{{LISTA_PILARES}}`)
- **Cérebro reconstruído a partir dos dados (emenda v1.9.0).** Numa pasta que só tem os dados do negócio (seção 1), o `cortex update` cria o `CEREBRO.md` a partir do mesmo molde do onboarding (`.agents/skills/cortex-onboarding/resources/CORTEX_TEMPLATE.md`) e preenche a região `CORTEX:BUSINESS` **só com o que está escrito na pasta**: nome, setor e datas vêm de `.cortex/meta.json` (se existir) e do cabeçalho de `Memoria/META.md`; a lista de pilares, dos arquivos que existem em `Pilares/`, com os tópicos que o mapa do `META.md` dá a cada um. Um fato que não está lá vira o marcador exato `<!-- REVISAR -->` — nunca um nome ou uma data inventados — e nenhuma variável `{{…}}` do molde chega ao cérebro nem aos arquivos compilados. Nenhum arquivo que já existe em `Pilares/`, `Memoria/` ou `Ativos/` é alterado; as pastas que faltarem são criadas vazias. O comando também repõe `.agents/` (com cópia `update-…` antes, se já havia uma), compila os arquivos de instrução, grava o `COMECE-AQUI.txt` se não houver um e termina mandando dizer `revisar córtex`: é a skill `cortex-revisao` que pergunta os fatos marcados e os grava no cérebro e no `META.md`. Enquanto houver `<!-- REVISAR -->` na região, ela ainda não traz todo o conteúdo obrigatório do item acima
- **Garantia de breaking change:** alterar os marcadores (`BUSINESS_START`, `BUSINESS_END`, `FRAMEWORK_START`, `FRAMEWORK_END` em `bin/cli.js`), ou mudar o caminho do template fonte (`BRAIN_FRAMEWORK_REL_PATH`)

---

## 3. Schema do Diretório `.cortex/`

**Propósito:** Fonte-máquina de metadados estruturados. Complementa o `META.md` (fonte humana, Markdown) com dados que o CLI consulta deterministicamente, sem regex frágil.

### 3.1 `.cortex/version.json`

```json
{
  "version": "1.0.0",
  "updatedAt": "2026-08-02T00:00:00.000Z",
  "checkedAt": "2026-08-02T00:00:00.000Z"
}
```

- Escrito por `cortex init` e `cortex update`
- Nas pastas prontas para baixar (§4.1) o arquivo traz só `version`, sem as datas: elas entram no primeiro `update`. Sem nenhuma das duas datas, o radar não mostra o lembrete de atualizar
- `version` é a versão do framework instalada no projeto
- `checkedAt` (opcional, v1.4.1+) é a última vez em que o usuário conferiu se havia versão nova; o radar usa esse campo, e cai para `updatedAt` quando ele não existe
- A existência deste arquivo significa **instalado**, não **montado**. Montado é quando existe `Frameworks/CEREBRO.md` (ou, em instalações antigas, `Memoria/META.md`): só então o `init` se recusa a rodar de novo (v1.4.2+)

### 3.2 `.cortex/targets.json`

```json
{
  "targets": ["AGENTS.md"],
  "updatedAt": "2026-08-02T00:00:00.000Z"
}
```

- `targets` é um subconjunto de `["AGENTS.md", "CLAUDE.md", "GEMINI.md", ".cursorrules"]`
- Escrito pelo onboarding (Step 7), por `cortex sync` e por `cortex update`
- Se o arquivo não existe, o CLI detecta quais targets já existem na raiz ou usa o padrão: `["AGENTS.md", "CLAUDE.md", "GEMINI.md"]` (até a v1.5.0, sem o `GEMINI.md`)
- Alvos aposentados (ver emenda da v1.3.0 abaixo) presentes em um `targets.json` antigo são ignorados na leitura

### 3.3 `.cortex/meta.json`

```json
{
  "businessName": "Nome do Negócio",
  "type": "Eu-presa",
  "onboardedAt": "2026-08-02",
  "nextReview": "2027-02-02",
  "updatedAt": "2026-08-02T00:00:00.000Z"
}
```

- `type` é um dos valores: `"Eu-presa"`, `"Pequena empresa"`, `"Entidade sem fins lucrativos"`, `"Negócio recorrente"`
- Escrito pelo onboarding (Step 7); campos adicionais podem ser mergeados via `writeCortexMeta`
- Lido por `readCortexMeta` → `readBusinessName` (fallback: regex no `META.md`)

### 3.4 `.cortex/backups/` (v1.6.0+)

Cada cópia é uma pasta `<rótulo>-<data ISO com "-" no lugar de ":" e ".">`. O rótulo diz o que há dentro e se a pasta entra na limpeza automática:

| Pasta | Quem cria | O que guarda | Limpeza automática |
|---|---|---|---|
| `update-…` | `cortex update` | `.agents/` (em `agents/`) e o `CEREBRO.md` de antes da atualização | sim: ficam as 3 mais recentes |
| `init-…` | `cortex init` | `.gitignore` e arquivos de raiz que o usuário já tinha na pasta | nunca |
| `originais-…` | `cortex sync` / `update` | arquivo de raiz escrito pelo usuário, antes de ser substituído pelo cérebro compilado | nunca |
| `dados-…` | `cortex backup` (também chamado pelas skills `consolidar` e `cortex-revisao` antes de alterarem arquivos) e `cortex restore`, antes de restaurar | `Pilares/`, `Memoria/`, `Ativos/` e `Frameworks/CEREBRO.md`, nos mesmos caminhos da raiz | nunca |

- Só as pastas `update-…` giram, porque o framework pode ser baixado de novo; as demais guardam coisas que não têm como ser refeitas e só saem pela mão do usuário
- Nas pastas `init-…` e `originais-…`, um arquivo cujo nome começa com ponto é gravado com `_` no lugar (`.gitignore` → `_gitignore`)
- `cortex backup` só lê os dados: não altera `Pilares/`, `Memoria/`, `Ativos/` nem o cérebro, e por isso não pede confirmação. Recusa-se (código 1) numa pasta sem Córtex montado
- `cortex restore [pasta]` (v1.9.0+; alias `restaurar`) traz de volta os dados de UMA pasta `dados-…`: a mais recente, ou a indicada em `--from=<nome>` (o nome como o `--list` mostra; um nome que não existe lista as válidas e sai com código 1). `--list` só mostra as cópias (da mais recente para a mais antiga, com a data por extenso e o número de arquivos) e não altera nada. A ordem é pelo momento da cópia, não pelo nome: o instante UTC que o nome traz, nas cópias do `backup`; nas feitas à mão (`dados-AAAA-MM-DD[-N]`), a hora de modificação da pasta quando ela cai nesse dia (no horário do computador) e, quando não cai, o fim desse dia, com o `-N` como desempate numérico. A cópia que o próprio `restore` tira antes de gravar leva o arquivo `.antes-de-restaurar` (uma linha: o nome da cópia restaurada): o `--list` e o plano a mostram como "como estava antes de uma restauração", e o `restore` sem `--from` nunca a escolhe — usa a cópia mais recente sem essa marca e mostra o `--from` que desfaz a última restauração; se só houver cópias marcadas, lista-as e sai com código 1 sem gravar. Só `dados-…` serve de origem: `update-…`, `init-…` e `originais-…` têm outro formato dentro e são recusadas com a explicação do que fazer; uma pasta com o sufixo `-incompleta` nunca é listada nem aceita. Antes de gravar, o comando mostra o plano (arquivos que voltam a ser como na cópia, arquivos que voltam a existir, arquivos iguais) e pede confirmação — sem terminal interativo e sem `--force`, sai com código 2 sem gravar nada. Confirmado, ele primeiro tira uma cópia `dados-…` NOVA do estado atual (se ela falhar, nada é restaurado) e só então copia os arquivos da cópia escolhida por cima dos atuais. **Nunca apaga:** um arquivo que existe hoje e não está na cópia fica como está, e é listado. Não atravessa atalhos (links simbólicos e junções), nem na cópia nem no destino: o arquivo cujo lugar é um atalho fica de fora, com aviso. Só toca em `Pilares/`, `Memoria/`, `Ativos/` e `Frameworks/CEREBRO.md`. A região `CORTEX:FRAMEWORK` do cérebro não é dado do dono: um cérebro que só difere do da cópia nessa região conta como igual, e, quando o cérebro é restaurado, essa região é reescrita a partir do `.agents/cortex/brain.framework.md` instalado antes de compilar — uma cópia antiga nunca traz de volta as regras de outra versão. No fim recompila os arquivos de instrução como o `sync` e mostra o comando que desfaz (`restore --from=<a cópia tirada antes>`); desfazer devolve o texto de antes, mas não apaga os arquivos que a restauração trouxe de volta. Dados já iguais aos da cópia: nada é gravado, nem a cópia de antes. Funciona também numa pasta que perdeu os dados (não montada), desde que as cópias estejam lá. Copiar de volta à mão um arquivo só continua valendo
- `cortex backup` não segue atalhos (links simbólicos e junções de pasta) dentro das pastas de dados: lista no terminal os que ficaram de fora. Se a cópia falhar no meio, a pasta `dados-…` daquela tentativa é removida (ou, se não der para remover, renomeada com o sufixo `-incompleta`): uma pasta `dados-…` sem sufixo é sempre uma cópia que terminou
- Uma pasta `update-…` com o arquivo `.atualizacao-em-andamento` pertence a uma atualização que parou no meio. Repetir o `cortex update` reaproveita essa pasta (ela é a que guarda o estado de antes) em vez de criar outra, e apaga o arquivo ao terminar
- Caminho de volta depois de um `update`: para uma versão anterior à v1.6.0, o CLI mostra os passos manuais a partir da pasta `update-…` (copiar `agents/` por cima de `.agents/`, o `CEREBRO.md` por cima de `Frameworks/CEREBRO.md` e rodar `cortex sync`) e **não** sugere o comando da versão antiga, que não conhece as regras desta seção nem a emenda v1.6.0 do item 4. Da v1.6.0 em diante, sugere `npx @aksp/cortex@<versão anterior> update --force`
- As skills `consolidar` e `cortex-revisao` tiram essa cópia antes da primeira alteração. Elas chamam `npx @aksp/cortex@latest backup`, para que uma versão antiga guardada pelo `npx` não responda no lugar. Sem terminal, sem Node.js ou se o comando falhar, a própria IA copia os arquivos que vai alterar para `.cortex/backups/dados-AAAA-MM-DD/`, nos mesmos caminhos: essa pasta feita à mão guarda só esses arquivos, não os dados todos. Uma cópia feita à mão nunca é gravada por cima de outra: se a pasta do dia já existe, a nova se chama `dados-AAAA-MM-DD-2` (depois `-3`…)

**Garantia de breaking change:** renomear o diretório `.cortex/` (`CORTEX_META_DIR`), mudar o nome/estrutura de qualquer um dos 3 arquivos acima, ou passar a apagar sozinho pastas de backup que não sejam `update-…`.

---

## 4. Formato dos Artefatos Compilados

**Propósito:** Arquivos de instrução na raiz (`AGENTS.md`, `CLAUDE.md`, etc.) que cada ferramenta de IA lê. São artefatos gerados, não editados à mão.

**Formato:**

```
<!-- ============================================================
     ARQUIVO GERADO PELO CÓRTEX — NÃO EDITE À MÃO.

     Fonte:   Frameworks/CEREBRO.md
     Gerado:  cortex sync (v1.0.0) em 2026-08-02

     Qualquer alteração feita aqui será perdida no próximo
     "npx @aksp/cortex sync". Edite a fonte acima.
     ============================================================ -->

[conteúdo completo de Frameworks/CEREBRO.md, com quebras de linha preservadas]
```

**Regras:**
- O cabeçalho é gerado por `buildGeneratedHeader(version)` em `bin/cli.js`
- O conteúdo é a concatenação direta do header + `CEREBRO.md` completo (não um ponteiro, não um resumo)
- **Exceção — `CLAUDE.md`:** quando `AGENTS.md` também está entre os targets, o `CLAUDE.md` contém o header + a linha `@AGENTS.md`. Isso é um *import nativo* do Claude Code (resolvido pela ferramenta ao carregar a memória do projeto), não um ponteiro que dependa de a IA decidir abrir outro arquivo. Sem `AGENTS.md` entre os targets, o `CLAUDE.md` recebe o conteúdo completo.
- Quebras de linha (CRLF/LF) são preservadas do `CEREBRO.md` original
- Os targets válidos são: `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.cursorrules`
- **Garantia de breaking change:** alterar o formato do cabeçalho de forma que o teste `sync compila o cérebro COMPLETO` quebre, ou mudar a lista de targets (`KNOWN_TARGETS`)

> **Emenda — v1.3.0 (2026-10-04).** `CODEX.md` foi retirado da lista de targets. Pela regra acima isso seria uma quebra de contrato; registramos como emenda, e não como major version, porque **nenhuma instalação perde funcionalidade**: o Codex lê `AGENTS.md` nativamente, então o `CODEX.md` era uma cópia redundante. Córtex existentes continuam funcionando sem ação: `cortex sync`/`update` avisam sobre um `CODEX.md` antigo e só o removem com confirmação explícita. Na mesma versão, o padrão de targets passou de `["AGENTS.md"]` para `["AGENTS.md", "CLAUDE.md"]` (o Claude Code não lê `AGENTS.md` sozinho) — instalações que já têm `targets.json` não são alteradas.

> **Emenda — v1.6.0.** Um arquivo de raiz que o **usuário** escreveu (sem o cabeçalho de arquivo gerado, sem o texto de inicialização e que não seja o ponteiro das versões antigas) nunca é substituído em silêncio. O `CLAUDE.md` dele, quando o `AGENTS.md` está entre os targets, é mantido e só recebe a linha `@AGENTS.md` (sem cabeçalho); qualquer outro é copiado para `.cortex/backups/originais-…/` antes de receber o cérebro compilado, com aviso no terminal. A posse é reconhecida pela forma (o arquivo **começa** pelo cabeçalho gerado ou pelo título do texto de inicialização), não por uma expressão citada no meio do texto. A linha `@AGENTS.md` é acrescentada ao fim do `CLAUDE.md` do usuário sem regravar o texto dele (acentos, BOM e fim de linha ficam como estavam). Três casos em que o `CLAUDE.md` também é copiado para `originais-…` (no `init`, para `init-…`) e trocado, com aviso: o do usuário que não está em UTF-8 e ainda não tem a linha (acrescentá-la estragaria os acentos); o gerado em que alguém escreveu além do cabeçalho e do import; e, só no `init`, o que é um atalho para outro arquivo. Um arquivo de instrução que é um atalho (link simbólico) nunca é gravado através do atalho: ele vira um arquivo próprio, com aviso. O `cortex update` grava `.cortex/version.json` por último: uma rodada interrompida deixa a versão antiga marcada, e repetir o comando termina o serviço.

> **Emenda — v1.6.0 (`COMECE-AQUI.txt`).** O `init` grava na raiz um `COMECE-AQUI.txt`: texto simples para o dono da pasta (como começar, as frases do dia a dia, como atualizar e o aviso de privacidade). A **fonte** pertence à camada de framework (`.agents/cortex/COMECE-AQUI.txt`, listada no manifesto e trocada pelo `update` como qualquer arquivo de `.agents/`). A **cópia da raiz** é do usuário a partir do momento em que ele a altera: o `update` só a substitui enquanto ela for igual à fonte da versão instalada (ignorando fim de linha e a marca BOM); se foi editada, fica como está e a versão nova continua disponível em `.agents/cortex/`; se foi apagada, não é recriada. Numa instalação anterior à v1.6.0 (sem a fonte), o `update` cria a cópia uma vez. Um `COMECE-AQUI.txt` que já existia na pasta antes do `init` nunca é substituído. A cópia da raiz é gravada em UTF-8 com BOM (para os acentos abrirem certo em qualquer Bloco de Notas) e não é lida por nenhuma skill.

> **Emenda — v1.6.0 (padrão de targets e `init`).** O padrão de targets passou a incluir o `GEMINI.md` (o Gemini CLI só lê esse arquivo), com o cérebro completo. Vale para instalações novas: uma pasta que já tem `targets.json`, ou que já tem arquivos de instrução na raiz, continua com os seus — `sync` e `update` não criam `GEMINI.md` nela. O `.cursorrules` segue como target opcional. No `init`: uma pasta com arquivos do usuário, sem nenhum nome igual ao do que o Córtex cria, é instalada sem pergunta (nada é substituído); havendo nome igual (uma das pastas do Córtex, ou um arquivo de instrução do usuário que seria substituído), o `init` pede confirmação. Na pasta pessoal do usuário, na Área de Trabalho, em Documentos, em Downloads (também dentro do OneDrive), na raiz do disco ou, no Windows, numa pasta do sistema (a do Windows, as de Arquivos de Programas e a `ProgramData`, com o que há dentro delas), o `init` sugere uma subpasta e só instala com confirmação ou `--force`. Sem terminal interativo e sem `--force`, as duas confirmações saem com código 2 e nada é gravado. Um **arquivo** do usuário com o nome de uma das pastas que o Córtex cria (`Pilares`, `Memoria`, `Frameworks`, `Ativos`, `.agents`) faz o `init` parar antes de gravar qualquer coisa, com ou sem `--force`, pedindo para renomear o arquivo (código 1). Numa pasta já instalada e ainda não montada, o `init` trata o `CLAUDE.md` do usuário como o `sync`: mantém o texto e só acrescenta a linha `@AGENTS.md` (se ele não estiver em UTF-8 ou for um atalho, fica como está, com aviso).

---

## 4.1 Pastas prontas para baixar (v1.6.0+)

**Propósito:** começar sem Node.js e sem terminal. A cada versão, `scripts/build-zip.js` (`npm run build:zip`) gera dois arquivos em `dist/`, e o workflow `release.yml` os anexa à Release do GitHub, que só sai depois de a versão estar no npm (a pasta pronta nunca fica à frente do `npx @aksp/cortex@latest update`):

| Em `dist/` | Anexo da Release (nome fixo) | Conteúdo |
|---|---|---|
| `cortex-<versão>.zip` | `cortex.zip` | Exatamente o que `cortex init` grava numa pasta vazia — o script roda o `init` de verdade e compacta o resultado. Única diferença: o `.cortex/version.json` leva só `version`, sem as datas do dia em que o ZIP foi gerado |
| `cortex-exemplo-estudio-lumen-<versão>.zip` | `cortex-exemplo-estudio-lumen.zip` | `examples/estudio-lumen/` + a pasta `.agents/` da versão + `.cortex/version.json` (só `version`), recompilado para `AGENTS.md`, `CLAUDE.md` e `GEMINI.md`. O `README.md` é um texto próprio do ZIP, para quem já baixou (o do repositório manda baixar o ZIP). As datas dos dados são ajustadas para a semana em que o ZIP é gerado (ver abaixo) |

- Os arquivos ficam soltos na raiz do ZIP (sem uma pasta por cima); nomes em UTF-8, com `/`, em ordem alfabética; a data dos arquivos vai no horário de Brasília
- As pastas prontas vêm preparadas para o Claude Code, o Gemini CLI e as ferramentas que leem `AGENTS.md`. Não trazem `.cursorrules`: ele nasce na conversa de montagem ou com `init --targets=.cursorrules`
- Uma pasta descompactada do `cortex.zip` é uma instalação como qualquer outra: `update`, `sync`, `backup` e `doctor` funcionam nela (esses comandos continuam pedindo Node.js)
- **Datas do exemplo (v1.9.0+).** A cópia do repositório tem datas fixas, escritas para a semana de 05/10/2026 (`EXAMPLE_REFERENCE_DAY` em `scripts/build-zip.js`). No ZIP — e só nele — todas as datas de `Memoria/`, `Pilares/` e da região `CORTEX:BUSINESS` do cérebro andam o mesmo número de **semanas inteiras**, da semana de referência até a semana do dia em que o ZIP é gerado (os dias da semana continuam verdadeiros). `--hoje=AAAA-MM-DD` (ou a variável `CORTEX_ZIP_HOJE`) fixa esse dia e torna a geração repetível byte a byte: a hora das entradas do ZIP e o `updatedAt` de `.cortex/targets.json` passam a ser a meia-noite de Brasília desse dia, e não o relógio de quem gerou (o dia do cabeçalho "Gerado: … em" dos arquivos de instrução é sempre o dia para o qual o ZIP foi gerado); `--hoje=2026-10-05` reproduz as datas do repositório. Datas completas andam em dias; o mês solto (`**[AAAA-MM]**`, com a data "analisado em" da mesma linha) e a etiqueta `[AAAA-T#]` andam os meses e os trimestres que separam as duas semanas; a etiqueta de uma rotina acompanha a data `próxima` da própria linha (`[TODO MÊS: dia N]` passa a ter o dia dela; `[TODO ANO: mês]`, o mês em que a rotina foi feita, com a `próxima` no último dia desse mês). O `README.md` de dentro do ZIP diz para que semana as datas foram ajustadas
- **ZIPs em dia (v1.9.0+).** O workflow `zips-em-dia.yml` roda todo mês (e à mão): gera os dois ZIPs de novo a partir do código da tag da última Release e troca os anexos dela (`--clobber`). Gera com `CORTEX_ZIP_HOJE` no dia da execução (horário de Brasília) e imprime o SHA-256 dos dois arquivos: quem rodar `build-zip --hoje=<esse dia>` na mesma tag obtém os mesmos bytes. Não publica no npm, não cria tag nem Release e não altera o repositório; sem Release, não faz nada
- `dist/` não é versionado nem entra no pacote do npm

**Garantia de breaking change:** renomear os anexos de nome fixo (o README e páginas externas apontam para `releases/latest/download/cortex.zip`) ou colocar uma pasta por cima do conteúdo do ZIP.

## 5. Pilares Obrigatórios e Opcionais

**Propósito:** Definir quais pilares o `cortex doctor` e o onboarding tratam como estrutura mínima.

**Obrigatórios (4):**
- `Pilares/01_Estrategia.md`
- `Pilares/02_Cultura.md`
- `Pilares/05_Comunicacao.md`
- `Pilares/06_Operacao.md`

**Opcionais (5+):**
- `Pilares/03_Financeiro.md` — incluído apenas se o usuário optar pelo Bloco 3
- `Pilares/04_Comercial.md` — incluído apenas se o usuário optar pelo Bloco 3
- `Pilares/07_Juridico.md` — se aplicável
- `Pilares/08_Inventario.md` — se aplicável
- `Pilares/09_Identidade_Visual.md` — se aplicável
- `Pilares/10_*.md` — pilares customizados do Bloco 9

**Garantia de breaking change:** alterar a lista de prefixos obrigatórios (`MANDATORY_PILLAR_PREFIXES` em `bin/cli.js`).

---

## 6. Nomenclatura de Skills

**Propósito:** Convenção que permite ao `cortex update` distinguir skills do framework de skills do usuário.

- Skills do framework vivem em `.agents/skills/<nome>/SKILL.md`
- Skills customizadas do usuário também vivem em `.agents/skills/<nome>/SKILL.md`
- A pasta de uma skill pode ter arquivos de apoio (ex.: `registrar/lote.md`), lidos só quando o `SKILL.md` dela manda: o `SKILL.md` continua sendo a única porta de entrada, e os arquivos de apoio entram no manifesto como qualquer outro arquivo da camada de framework
- A distinção é feita exclusivamente pelo manifesto: se o caminho está em `.agents/manifest.json` → framework; senão → usuário
- **Garantia de breaking change:** mudar o diretório de skills, ou o mecanismo de distinção framework vs usuário

---

## 7. Formato das Linhas da Memória e Protocolos

**Propósito:** As skills gravam linhas de texto em `Memoria/`, e essas linhas são dados do usuário. Uma versão nova nunca pode deixar de entender o que uma versão antiga gravou.

- **Formatos só crescem.** Um formato novo acrescenta informação opcional no fim da linha (ex.: `*(desde AAAA-MM-DD)*` nas pendências sem prazo, a partir da v1.5.0). Linhas no formato antigo continuam válidas e nunca são reescritas só para ganhar o campo novo.
- **Nenhuma migração de dados automática.** O CLI não reescreve arquivos de `Memoria/` nem de `Pilares/`; uma skill só altera uma linha existente quando o usuário pede aquela alteração.
- **Marcadores congelados:** `[DEADLINE AAAA-MM-DD]`, `[AGUARDANDO]` (opcionalmente `[AGUARDANDO: Nome]`), `[SEM PRAZO]`, `[REVOGADA em AAAA-MM-DD: …]`, o carimbo `**[AAAA-MM-DD]**` no início das linhas e a etiqueta de trimestre `[AAAA-T#]`.
- **Proposta na rua (v1.7.0+).** Uma proposta enviada é uma linha de espera comum, reconhecida pelo começo do texto: `- ⏳ **[AGUARDANDO: Cliente]** Resposta da proposta — [o que foi proposto] — R$ [valor] — vale até AAAA-MM-DD. *(desde AAAA-MM-DD)*`, em que `desde` é o dia do envio e o valor e a validade são opcionais. O desfecho vai para "Pendências Resolvidas": `- ✅ **[AAAA-MM-DD]** Proposta fechada — [Cliente] — …` ou `- 🚫 **[AAAA-MM-DD]** Proposta perdida — [Cliente] — … — motivo: [motivo].` (o motivo é opcional). Nenhum marcador novo: quem não conhece a forma lê uma espera, um item resolvido e um item deixado de lado. Linhas de espera sobre proposta ou orçamento escritas de outro jeito continuam válidas e são fechadas do mesmo modo; sem `(desde …)` e sem `vale até`, aparecem no radar sem idade e sem o convite para dar retorno. Uma linha 🚫 sem `*(deixada de lado)*` continua sendo um item que não conta como resolvido.
- **Pessoa e combinado (v1.7.0+).** Quem a pessoa ou empresa é (cliente, fornecedor, parceiro, equipe) fica na linha `👥` de "Stakeholders"; o que foi combinado com ela é uma linha de decisão que começa pelo nome (`- **[AAAA-MM-DD]** [Nome]: [combinado]`), no formato de decisão de sempre. Continuam válidos, e nunca são movidos nem reescritos por iniciativa da IA: o combinado guardado dentro da nota da pessoa e os fornecedores e parceiros listados em "Parceiros e Fornecedores" de `Memoria/05_Registros_Gerais.md` (em geral sem data). Só quando o dono diz que um combinado mudou, o novo vira linha de decisão e o antigo é retirado de onde estiver (a nota da pessoa, uma decisão anterior ou a linha antiga de "Parceiros e Fornecedores"), mostrando antes → depois, para nunca valerem dois ao mesmo tempo.
- **O porquê da decisão (v1.7.0+).** Uma linha de decisão pode terminar com o motivo e com a alternativa deixada de lado: `- **[AAAA-MM-DD]** [Decisão] — porque [motivo] — descartado: [alternativa].` Os dois finais são opcionais e independentes. Linhas sem motivo continuam válidas, nunca são reescritas só para ganhar um, e ninguém pergunta o motivo de uma linha antiga; quem não conhece a forma lê uma decisão comum.
- **A data é a do dia da anotação (v1.7.0+).** O carimbo `**[AAAA-MM-DD]**` e o `*(desde AAAA-MM-DD)*` dizem quando a coisa aconteceu, não quando foi digitada: anotações coladas depois (ditadas, ou mandadas para si mesmo no WhatsApp) ficam com o dia de cada uma, calculado a partir da data real do sistema; sem data na anotação, vale o dia de hoje. Um prazo dito na anotação ("ligar pro João sexta", "entrega dia 20/10") não é a data dela: conta para a frente a partir do dia da anotação e vira `[DEADLINE AAAA-MM-DD]`. Nenhum formato muda, e linhas antigas continuam com a data que têm.
- **Marca dos lembretes na agenda (v1.7.0+).** No primeiro fechamento de semana, a skill `semana` sugere dois compromissos na agenda do dono e grava em `Memoria/05_Registros_Gerais.md` uma linha de lista cujo texto, depois da data, começa com `Lembretes na agenda` — comentário HTML não conta — (`- **[AAAA-MM-DD]** Lembretes na agenda: sugeridos (radar na segunda, fechar a semana na sexta).`). É só por ela que a sugestão não se repete; apagar a linha à mão faz a sugestão voltar uma vez; o "desfaz" do fechamento não a apaga.
- **Reler antes de gravar (v1.7.0+).** A pasta pode estar em dois computadores, com um sócio ou sincronizada na nuvem. Toda skill que grava em `Memoria/` relê o arquivo imediatamente antes de escrever e acrescenta ou altera só as próprias linhas; nunca regrava o arquivo inteiro a partir de uma leitura anterior.
- **Rotinas (v1.8.0+).** O que se repete (imposto, aluguel, relatório semanal, renovação anual) é uma linha só, numa seção própria de `Memoria/04_Pessoas_Pendencias.md` — `## Rotinas`, que a skill `registrar` cria logo acima de `## Pendências Resolvidas` quando o arquivo ainda não a tem: `- 🔁 **[QUANDO]** [Texto] *(desde AAAA-MM-DD · próxima AAAA-MM-DD)*`. `[QUANDO]` é um destes quatro, e nenhum outro: `[TODO MÊS: dia N]` (num mês mais curto, o último dia), `[TODA SEMANA: segunda]` (o dia da semana por extenso), `[TODO ANO: DD/MM]` ou `[TODO ANO: março]` (o mês inteiro: a data é o último dia dele). `próxima` é a próxima data em que a rotina cai, calculada e conferida na hora de gravar; o radar só compara essa data com o dia de hoje e mostra a rotina quando ela já passou ou cai na semana — uma rotina atrasada ocupa uma linha só, com a última data que passou, por mais vezes que tenha ficado sem marcar. "Feito" não move a linha para "Pendências Resolvidas": troca o carimbo final por `*(feito em AAAA-MM-DD · próxima AAAA-MM-DD)*`, mostrando antes → depois; "feito" numa rotina que já está em dia (a `próxima` ainda não chegou à semana, ou a linha já foi marcada hoje) não é gravado sem uma pergunta, para não pular uma data. A rotina encerrada vai para "Pendências Resolvidas" como `- 🚫 **[AAAA-MM-DD]** Rotina encerrada — [Texto] — [todo mês, dia 5].` Arquivo sem a seção `## Rotinas` simplesmente não tem rotinas, e nada é acrescentado a ele até o dono ditar a primeira; linha de rotina sem `próxima` (escrita à mão) continua válida: vale a primeira data depois da data do carimbo — sem carimbo nenhum, a próxima data a partir de hoje (hoje incluso), de modo que ela aparece só na semana dessa data, nunca como atrasada. Enquanto está na seção, a rotina nunca é arquivada nem fundida pelo `consolidar`, e nenhuma skill a trata como pendência: ela fica fora de "Pendências Ativas" e não leva `[DEADLINE …]`.
- **Resultado mês a mês (v1.8.0+).** Depois de analisar os números que o dono traz, a skill `analisador-dre` guarda UMA linha por mês numa seção própria de `Memoria/05_Registros_Gerais.md` — `## Resultado Mês a Mês`, criada no fim do arquivo quando ele ainda não a tem, com o mês mais novo em cima: `- 📊 **[AAAA-MM]** Receita R$ 42.000 · Custos e despesas R$ 33.600 · Resultado R$ 8.400 · Margem líquida 20% *(analisado em AAAA-MM-DD)*`. O carimbo `**[AAAA-MM]**` é o mês do resultado (não é o carimbo de data `**[AAAA-MM-DD]**` das outras linhas, e nenhuma skill conta idade por ele); `analisado em` é o dia da gravação. Prejuízo leva sinal de menos (`Resultado -R$ 1.200 · Margem líquida -4%`). Só entram números que o dono trouxe ou que saem deles por conta simples; sem o mês identificado, sem receita ou sem custos/resultado, nada é gravado, e o mês que ainda está correndo também não. Analisar de novo o mesmo mês troca a linha dele no lugar, mostrando antes → depois: nunca há duas linhas do mesmo mês. Arquivo sem a seção simplesmente não tem meses guardados; linha escrita à mão com algum número faltando continua válida e é comparada só no que tem. Essas linhas nunca são arquivadas nem fundidas pelo `consolidar` (o mesmo mês de anos anteriores é a base da comparação) e não aparecem no radar nem no fechamento da semana.
- **Protocolos na camada do framework (v1.5.0+).** `PROTOCOLO_AUTONOMIA.md` e `PROTOCOLO_MEMORIA.md` vivem em `.agents/cortex/` e são atualizados pelo `cortex update`. Cópias antigas em `Frameworks/` (instalações até a v1.4.2) não são apagadas nem lidas pelo cérebro novo; um cérebro ainda sem as camadas `CORTEX:BUSINESS`/`CORTEX:FRAMEWORK` continua apontando para elas.
- **Garantia de breaking change:** remover ou mudar o significado de um marcador acima, ou passar a exigir um campo que linhas antigas não têm.

---

## 8. Versionamento e Migração

- **SemVer estrito.** Breaking changes nos contratos acima → major bump (v2.0.0)
- **Migração documentada.** Toda major version deve incluir no CHANGELOG um plano de migração para Córtex da versão anterior (ex: "Córtex v0.11.0 → v1.0.0: rode `cortex update`, o cérebro será migrado automaticamente se tiver as camadas CORTEX:BUSINESS/FRAMEWORK")
- **Compatibilidade forward.** `cortex update` de uma versão antiga para uma nova deve preservar `Pilares/`, `Memoria/`, `Ativos/` e a região `CORTEX:BUSINESS` do cérebro — invariante coberta por teste
