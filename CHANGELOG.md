# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/), e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

## [1.8.0] - 2026-10-07

O que se repete e o que passou: as rotinas voltam sozinhas ao radar, e o resultado de cada mês fica guardado para comparar.

### Migração (quem já usa)
- Rode `npx @aksp/cortex@latest update`. Nenhum dado seu é tocado: as seções novas ("Rotinas" e "Resultado Mês a Mês") só aparecem quando você usar, e pastas antigas continuam funcionando como estão.

### Adicionado
- **Rotinas.** Diga uma vez o que se repete ("todo dia 20 pago o DAS", "toda segunda mando o relatório", "o seguro vence todo ano em março") e isso volta ao radar na semana de cada data, marcado com 🔁. Quando fizer, diga "feito" ou "paguei o DAS": a rotina não some, só anota a última vez e passa a esperar a próxima data. Se ficou para trás, o radar mostra uma linha só, com a última data perdida.
- **Mudar ou encerrar uma rotina.** "O DAS agora vence dia 25" troca a data; "não pago mais o aluguel" encerra sem apagar o histórico. O "desfaz" vale para tudo isso.
- **Resultado mês a mês.** Depois de analisar a planilha ou os números que você traz, o Córtex guarda uma linha com o resultado daquele mês (receita, custos e despesas, resultado e margem líquida). Analisou o mesmo mês de novo? A linha é atualizada, mostrando antes e depois. Só entram números que você trouxe: nada é estimado, e o mês que ainda não fechou não é guardado.
- **Comparação.** Quando já existem meses guardados, o diagnóstico termina comparando com o mês anterior e com o mesmo mês do ano passado. Depois é só perguntar: "como foi setembro?", "compara setembro com agosto", "como está o ano?".

### Alterado
- **Duas margens, cada uma no seu lugar.** "Como está minha margem?" continua sendo a margem de cada trabalho, antes dos custos fixos; "como foi setembro?" é o resultado do mês inteiro, depois de todos os custos. Cada resposta aponta para a outra.
- O fechamento da semana, a busca na memória, a revisão e a consolidação entendem as rotinas e as linhas de resultado: nenhuma delas é arquivada nem tratada como pendência vencida.
- O roteiro de conversa do `CONTRIBUTING.md` diz o que responder na ata e no fechamento da semana, e ganhou dois passos para as rotinas.

## [1.7.0] - 2026-10-07

O Córtex acompanha o que acontece depois: a proposta enviada, o porquê da decisão, a anotação feita no celular.

### Migração (quem já usa)
- Rode `npx @aksp/cortex@latest update`. Nenhum dado seu é tocado e tudo o que já estava anotado continua valendo como está: os formatos novos só acrescentam.
- Use o modelo padrão ou o mais capaz da sua ferramenta de IA. As regras desta versão foram testadas em conversas com três modelos: os dois maiores seguiram quase tudo; o menor errou na maioria.

### Adicionado
- **Proposta com começo, meio e fim.** Diga "enviei a proposta para [cliente]" e ela passa a aparecer no radar com há quantos dias está sem resposta; depois de alguns dias, o radar oferece uma mensagem de retorno. "A proposta fechou" ou "perdemos a proposta" guarda o desfecho e, se perdeu, o motivo. O fechamento da semana mostra quantas estão sem resposta e quantas fecharam ou foram perdidas.
- **A proposta aprende com as anteriores.** Antes de escrever, ela lê as suas lições comerciais e os motivos das propostas perdidas, e conta em uma linha quando usou alguma. As suas regras de preço e pagamento continuam mandando.
- **Falar com uma pessoa.** "Responde esse cliente" e "cobra o [cliente]" escrevem a mensagem com o que está anotado sobre a pessoa e dentro das suas regras: primeiro uma linha dizendo se pelas suas regras dá ou não dá, depois duas versões, uma firme e uma mais leve. "Preparar reunião com [pessoa]" mostra o que está em aberto com ela, o que já foi combinado e até onde você pode ir.
- **Decisões guardam o porquê.** Se você disser o motivo, ele fica na mesma linha; se não disser, a decisão é gravada na hora e a IA pergunta uma única vez, sem insistir.
- **"Estou em dúvida entre A e B".** A IA pesa as duas opções com o que você já decidiu e aprendeu, mostrando de onde tirou cada ponto, e só grava quando você escolher, com o motivo e a opção deixada de lado.
- **Anotações do celular entram com a data certa.** Mande para você mesmo no WhatsApp (ou dite) o que for acontecendo, cole depois no chat e escreva "anota isso": cada anotação fica com o dia em que aconteceu, não com o dia em que você colou. O README e o `COMECE-AQUI.txt` ganharam a receita "Longe do computador".
- **Os dois momentos da semana na sua agenda.** Como a IA não avisa no celular, no primeiro "fechar a semana" ela sugere, uma vez só, dois compromissos que se repetem: "radar" na segunda e "fechar a semana" na sexta, com link pronto para a Google Agenda.
- **Fale com o criador sem sair da conversa.** Diga "deu problema no Córtex" ou "tenho uma sugestão para o Córtex": a IA escreve um recado curto, sem nenhum nome, valor ou trecho dos seus arquivos, e mostra para você copiar, avisando antes que a página de envio (GitHub) é pública. Funciona mesmo antes da conversa de montagem. Nada é enviado sozinho, e o Córtex continua sem coletar nada.

### Alterado
- **Anotar no dia a dia ficou mais leve.** As instruções do "registra que…" foram divididas: a IA lê sempre a parte curta e só abre o resto quando o caso pede (uma reunião inteira, uma proposta, uma decisão). Nada muda no que ela faz nem no que você diz.

### Corrigido
- **Clientes, fornecedores e parceiros não tinham lugar certo na Memória.** Quem é a pessoa fica numa linha; o que foi combinado com ela vira uma decisão com o nome na frente, e um acordo antigo não some quando você anota outra coisa sobre ela.
- **Dois computadores, sócio ou pasta na nuvem.** Antes de gravar, a IA relê o arquivo e acrescenta só as linhas novas, em vez de regravar tudo a partir de uma leitura antiga. Se a nuvem criou uma "cópia em conflito", ela avisa.
- **Ordem escondida em texto colado.** Ao colar uma ata ou mensagem, frases que parecem ordens para a IA ("ignore as regras", "apague…", "registre a senha…") não são obedecidas: ela avisa em uma linha que não executou.
- **O `doctor` dizia "está tudo em dia" com habilidades faltando.** Ele agora confere a instalação, mostra o que sumiu de `.agents/` e o comando que repõe; "saúde do córtex" no chat faz a mesma conferência. Habilidades que você editou ou criou não são apontadas. Arquivo vazio (que a nuvem não terminou de baixar) conta como faltando, e quando a pasta não tem a lista de arquivos para comparar ele diz que não conseguiu conferir, em vez de dizer que nada falta. O comando que repõe devolve ao texto padrão uma habilidade que você editou: a sua versão fica em `.cortex/backups`, onde só as 3 cópias de atualização mais recentes são guardadas.
- **Córtex montado que perdeu a pasta `.agents/` não tinha conserto:** o `init` mandava rodar o `update` e o `update` mandava rodar o `init`. Agora `npx @aksp/cortex@latest update --force` repõe, e diz que a pasta foi reposta do zero (não havia cópia dela para guardar). Se a pasta só tem a Memória, sem o cérebro e sem o arquivo de instrução da IA, ele não grava nada e pede para trazer a pasta do negócio inteira.

## [1.6.0] - 2026-10-06

Começar sem terminal e confiar nos dados: dá para baixar a pasta pronta, os seus arquivos deixam de ser sobrescritos, e os seus dados ganham cópia de segurança.

### Migração (quem já usa)
- Rode `npx @aksp/cortex@latest update`. Nenhum dado seu é tocado. A pasta ganha um `COMECE-AQUI.txt` na raiz.
- Quem já tem o Córtex montado continua com os mesmos arquivos de instrução: o `GEMINI.md` só passa a ser criado em instalações novas.
- O `init` sem `--force` numa pasta com arquivos agora instala sem perguntar quando nenhum nome coincide com o que ele cria (ele só acrescenta). Continua perguntando, e saindo com código 2 sem terminal, quando há nome coincidente ou quando a pasta é a Área de Trabalho, Documentos, Downloads, a pasta pessoal ou uma pasta do sistema (como a do Windows).

### Adicionado
- **Pasta pronta para baixar, sem instalar nada.** Cada versão publica um ZIP do Córtex: baixe, descompacte, abra na sua ferramenta de IA e escreva "Quero montar meu Córtex". Atualizar continua pedindo o Node.js.
- **Exemplo que roda.** O Estúdio Lumen também sai em ZIP, já com as skills: abra a pasta e diga "radar" para ver o Córtex respondendo sobre um negócio.
- **`COMECE-AQUI.txt` na pasta:** os primeiros passos, as frases do dia a dia e como atualizar. Dá para ler no Bloco de Notas ou imprimir. Se você escrever nele, as atualizações deixam a sua versão como está.
- **Comando `npx @aksp/cortex@latest backup`:** guarda uma cópia dos dados do negócio (Pilares, Memória, Ativos e o cérebro) em `.cortex/backups/dados-<data>`, sem alterar nada, e mostra como restaurar copiando os arquivos de volta. Essas cópias nunca são apagadas sozinhas. Atalhos para outras pastas não entram na cópia (ela avisa quais), e uma cópia que falha no meio não deixa uma pasta pela metade.
- **Cópia antes de mexer.** Antes de consolidar a memória ou de alterar algo na revisão, a IA guarda uma cópia dos dados e diz onde ficou. Funciona também sem o Node.js.
- **Aviso de privacidade na conversa.** Antes de ler uma ata, um PDF ou uma planilha, a IA avisa em uma linha, uma vez por conversa, que o que ela lê é enviado ao fornecedor da ferramenta de IA, e pede para deixar de fora senhas, números de cartão e documentos pessoais.
- **`GEMINI.md` criado na instalação**, junto com o `AGENTS.md` e o `CLAUDE.md`: quem usa o Gemini CLI não precisa de um segundo comando.
- **Publicação pela tag.** Ao criar a tag de uma versão, os testes rodam em Windows, Mac e Linux e só então saem o pacote do npm, com atestado de procedência, e depois dele a Release com as pastas prontas.

### Corrigido
- **O seu `CLAUDE.md` era substituído no primeiro `sync`.** Agora o seu texto fica e ele só ganha a linha que carrega o cérebro. Outro arquivo seu com o mesmo nome de um que o Córtex gera ganha cópia em `.cortex/backups/originais-…` antes de ser substituído, com aviso. O mesmo vale para um `CLAUDE.md` salvo num formato de texto antigo (fora do UTF-8), em que acrescentar a linha estragaria os acentos.
- **A cópia dos seus arquivos feita na instalação sumia depois de três atualizações.** Só os backups de atualização (`update-…`) são renovados; os outros nunca são apagados sozinhos.
- **Uma atualização interrompida ficava marcada como concluída.** A versão passa a ser a última coisa gravada: rodar o mesmo comando de novo termina o serviço, sem perder a lista de novidades.
- **Atualizar era um caminho sem volta.** No fim, o `update` diz onde ficou guardado o que havia antes e como voltar: copiando de volta essa cópia e rodando o `sync`. Ele não manda usar o comando de uma versão antiga, que apagaria cópias guardadas e o seu `CLAUDE.md`. Se a atualização parar no meio, repetir o comando reaproveita o mesmo backup.
- **Instalar numa pasta com arquivos parecia um erro.** O `init` avisa que só acrescenta as pastas dele e segue. Se a pasta for a Área de Trabalho, Documentos, Downloads, a pasta pessoal ou uma pasta do sistema (como a do Windows, onde começa o terminal aberto como administrador), ele sugere criar uma pasta só para o negócio. Se um arquivo seu tiver o nome de uma pasta que o Córtex cria (`Pilares`, por exemplo), ele para antes de gravar e pede para renomear, em vez de quebrar no meio. E rodar o `init` de novo numa pasta instalada não manda mais renomear o seu `CLAUDE.md`: ele só ganha a linha que carrega as instruções.
- **Depois de instalar, o CLI mandava de volta ao terminal.** A primeira instrução agora é abrir a pasta no aplicativo de IA; o terminal virou uma linha opcional no fim.
- **O `doctor` não percebia número escrito do jeito brasileiro** nos pilares Financeiro e Comercial: `1.500` (lido como 1,5), `1.500,00`, `30%`, `R$ 700`. Ele diz o campo, o arquivo e o que escrever no lugar, sem alterar nada.
- **O `doctor` marcava como "Quebrado" a pasta de arquivo da Memória** (`Memoria/_Arquivo/`), que estava lá.

### Ainda não
- Restaurar um backup com um comando (por ora é copiar os arquivos de volta).
- Córtex no Claude Cowork e a aposentadoria do `.cursorrules`: dependem de teste dentro dessas ferramentas.

## [1.5.0] - 2026-10-05

O dia a dia funciona de verdade: o Guardião de Margem novo chega a quem já usa o Córtex e aprende a responder "quanto cobrar?", lembretes viram lembretes, e nada do que foi anotado some do radar.

### Migração (quem já usa)
- Rode `npx @aksp/cortex@latest update`. O cérebro passa a apontar para os protocolos que vêm com o framework; nenhum dado seu é tocado.
- Os arquivos `Frameworks/PROTOCOLO_AUTONOMIA.md` e `Frameworks/PROTOCOLO_MEMORIA.md` deixam de ser usados **depois** do `update`. Ele avisa e não apaga nada; pode removê-los quando quiser. Não apague antes de atualizar: até lá o cérebro ainda lê essas cópias. (Exceção: um cérebro ainda sem as camadas `CORTEX:BUSINESS`/`CORTEX:FRAMEWORK`, ou um Córtex anterior ao `CEREBRO.md`, continua lendo essas cópias mesmo depois — nesses casos o `update` não manda apagar, e "revisar córtex" faz a migração.)
- Os dois moldes antigos em `.agents/skills/cortex-onboarding/templates/Frameworks/` ficam na pasta, sem uso, a menos que você rode o `update` com `--prune`. O `update` lista esses arquivos no fim.
- Pendências antigas continuam valendo como estão. O formato novo só acrescenta `*(desde AAAA-MM-DD)*` ao que for anotado daqui em diante.

### Corrigido
- **O Guardião de Margem da 1.4.0 não chegava a quem já tinha o Córtex.** Os dois protocolos eram copiados para `Frameworks/` na montagem e nunca mais atualizados. Agora vivem em `.agents/cortex/`, a camada que o `update` renova.
- **O exemplo oficial ensinava a conta errada.** O Estúdio Lumen orçava "custo direto + margem-alvo de 35%", o que deixa cerca de 17% de margem, não 35%. O exemplo, o protocolo e o README passaram a usar a conta certa, e um teste confere os números.
- **O exemplo de desconto do README não seguia a ordem do protocolo** nem os números do próprio exemplo. Foi refeito e também é conferido por teste.
- **"Me lembra de…" acionava a busca na memória** e o compromisso não era anotado. Agora vira uma pendência com data, confirmada com o dia da semana ("Anotado para sexta, 09/10"), e o Córtex diz que ela aparece no radar — sem prometer aviso no celular.
- **Pendências sem prazo sumiam do radar.** Ele ganhou o bloco "Depois / sem prazo", que mostra pelo nome os próximos prazos e conta o que não tem data. Também diz de quem se espera e há quantos dias cada item em espera está parado (para o que for anotado daqui em diante), e limita a 5 as atrasadas na tela — sem nunca esconder o que vence hoje ou nesta semana.
- **O radar repetia a mesma sugestão todo dia** e sugeria "consolidar memória" quando não havia nada para consolidar. As sugestões agora se revezam conforme o dia, e a de consolidar só aparece quando há pelo menos 5 linhas que podem ser arquivadas (uma decisão em vigor nunca conta, por mais antiga que seja).
- **"Consolidar memória" fundia duplicatas sem guardar o texto original**, contra a promessa de que nada é apagado. As linhas originais passam a ser copiadas para o arquivo antes da fusão, a confirmação mostra o texto final, e a skill confere no fim que nenhuma linha se perdeu.
- **Quem fazia a montagem rápida recebia "~0% de completude"** no `doctor` e na skill de saúde. Agora a resposta é "o essencial está funcionando; falta completar N de 4 pilares essenciais". A seção "Panorama Competitivo", que fica em branco de propósito, deixou de contar como pendência.
- **"Quais são minhas pendências?" caía no registro**, e "descobrir minha margem" não estava na tabela do cérebro. Pergunta virou consulta; ordem, registro; e a margem ganhou linha própria.
- **Textos do onboarding:** regras que contradiziam o modo rápido, o nome de uma ferramenta de um ambiente específico e um caminho que não existe.

### Adicionado
- **"Quanto cobrar por…?"** O Guardião calcula, a partir do custo, o preço mínimo e o preço-alvo que respeitam as suas margens depois de imposto e taxas, e confere a própria conta antes de responder. Também passa a dizer que regime tributário e pró-labore são com o contador.
- **A contraproposta do Guardião é sempre um preço em reais** e respeita de uma vez o desconto máximo, o piso e a margem mínima; se não houver espaço para desconto, ele diz isso em vez de sugerir um preço que quebra outra regra sua.
- **"Como está minha margem?"** sem planilha passa a ser respondido com as suas margens e a margem de cada serviço a preço de tabela, em vez de pedir uma DRE.
- **O primeiro radar já nasce com conteúdo.** A quarta pergunta da montagem rápida passa a ser "2 ou 3 coisas que não podem cair no esquecimento esta semana", e a montagem termina mostrando o radar com elas. (A regra de preço sai das 4 perguntas e fica para o bloco opcional de preços.)
- **Radar vazio convida a despejar o que está na cabeça** e organiza a resposta de uma vez.
- **Fechamento da semana limpa o que venceu há muito:** uma pergunta só para os itens vencidos há mais de duas semanas (novo prazo, deixar de lado ou manter). Também fecha a meta quando o trimestre vira e lembra da revisão semestral. As prioridades ganham prazo numa sexta definida por regra (a próxima, se você fecha de sábado a segunda; a da semana seguinte, nos outros dias); um prazo que ainda está no futuro nunca é trocado, e uma pendência "aguardando" nunca é convertida.
- **Datas conferidas com a ferramenta de data:** lembretes, prioridades e os itens da montagem rápida passam a ter a data calculada e o dia da semana conferido, em vez de conta de cabeça.
- **"Desfaz" vale para a operação inteira** (uma reunião anotada, um fechamento de semana), e toda atualização de pessoa, meta ou projeto mostra "antes → agora".
- **Pendências resolvidas há mais de 60 dias** podem ir para o arquivo na consolidação, para o arquivo lido a cada radar não crescer sem parar.
- **Roteiro de conversa de 12 frases** no checklist de release, e um teste que limita o cérebro a 900 palavras.

### Alterado
- O lembrete de revisão semestral saiu do cérebro (onde era repetido a cada conversa nova) e passou para o radar e o fechamento da semana.
- `CONTRACTS.md` ganhou a regra dos formatos de linha da Memória: formatos só crescem, e linhas antigas nunca são reescritas.
- CI: `actions/checkout` e `actions/setup-node` na versão 5.

## [1.4.2] - 2026-10-05

Correção: a instalação nova pelo npm estava quebrada nas versões 1.4.0 e 1.4.1.

### Corrigido
- **`npx @aksp/cortex init` voltou a funcionar em instalações novas.** Nas versões 1.4.0 e 1.4.1 o comando terminava em erro (`ENOENT … .gitignore`) logo depois de "Copiando arquivos do framework...": o `init` lia o `.gitignore` de dentro do pacote, e o npm não publica arquivos com esse nome. As regras passaram a ficar dentro do próprio CLI. Quem já tinha o Córtex instalado não foi afetado; o `update` funcionava.
- **O `.gitignore` que protege os dados do negócio agora chega de verdade.** Pelo mesmo motivo, quem instalou pelo npm até a 1.3.0 nunca o recebeu. O `update` passa a criá-lo quando a pasta não tem um. Um `.gitignore` escrito pelo usuário não é tocado, e numa pasta que já é repositório Git o `update` não cria nem altera nada: só mostra as regras que faltam, uma por linha (quem versiona os próprios dados de propósito não é surpreendido).
- **A dica que o próprio `init` imprime deixou de ser recusada.** `init --targets=GEMINI.md,.cursorrules` logo depois do `init` respondia "Já existe um Córtex montado". Agora "instalado" e "montado" são coisas diferentes: montado é quando já existe o cérebro (`Frameworks/CEREBRO.md`) ou o índice da Memória. Em pasta só instalada, repetir o `init` acrescenta o que falta (inclusive a pasta `.agents/`, se tiver sumido), não sobrescreve nada, avisa quando um arquivo seu com o mesmo nome foi mantido e lembra o próximo passo. A dica também passou a levar o nome da pasta quando o Córtex foi instalado numa subpasta (`init "Minha Empresa"`).
- **O `doctor` não manda mais instalar o que já está instalado.** Em pasta instalada e ainda não montada, ele diz que falta só a conversa de montagem. Ele também distingue a instalação incompleta (sem `.agents/`) e o Córtex que tem cérebro mas perdeu o índice da Memória, em vez de mandar refazer a montagem.
- **`update` repetível.** Se uma atualização parava no meio (um arquivo preso pelo OneDrive, por exemplo), a segunda tentativa respondia "Nada para atualizar" e deixava o arquivo que a IA lê com as regras antigas. Agora arquivos de instrução desatualizados contam como trabalho pendente: rodar o mesmo comando de novo termina o serviço e registra as novidades.
- **`sync --targets=` avisa quando tira da lista uma ferramenta em uso.** A lista passada substitui a anterior; o README dizia "inclui", o que levava a deixar o `AGENTS.md` sem atualização. O comando agora mostra quais ferramentas saem e a linha pronta para manter todas, e o README foi corrigido.
- **Sem terminal interativo, o CLI não finge sucesso.** Quando quem roda o comando é uma IA ou um script e falta o `--force`, `init`, `update` e `sync` mostram o plano, dizem "Nada foi alterado" e saem com código 2 (antes saíam com sucesso sem ter feito nada). As skills de revisão e de continuação do onboarding passaram a chamar `sync --force`. No Git Bash do Windows o Node não enxerga um terminal interativo: lá, use `--force`.
- **Erro inesperado em português**, dizendo que Pilares, Memória e Ativos não foram alterados e o que fazer (por exemplo, quando um arquivo está preso pelo OneDrive ou pelo antivírus). O detalhe técnico continua aparecendo, por último.
- **CI:** no Windows a conferência do manifesto falhava por diferença de fim de linha e os testes nunca chegavam a rodar. Entraram um `.gitattributes` (LF em todos os sistemas), a conferência do manifesto pelo conteúdo e uma matriz com Node 18 a 24 em Ubuntu, Windows e macOS.

### Adicionado
- **Teste do pacote como o usuário recebe** (`test/integration/package.test.js`): empacota o projeto, instala o pacote numa pasta temporária e roda por ele `init`, `init --targets`, `doctor`, `sync` e `update`. Também falha se dados de negócio ou arquivos internos entrarem no pacote. `npm publish` passa a rodar a suíte antes (`prepublishOnly`).

### Alterado
- Cores desligadas quando a saída não é um terminal (ou com `NO_COLOR`), para não sujar o texto lido por uma IA.
- `engines`: Node 18 ou mais novo, que é o que o CI testa.
- A descrição do pacote e o CONTRIBUTING deixam de falar em "IA local": os arquivos ficam no computador do usuário, mas o que a IA lê passa pelo fornecedor da ferramenta, como o README já dizia.
- Os arquivos de `.agents/` passam a ser publicados sempre com o mesmo fim de linha. No primeiro `update` depois desta versão, alguns podem aparecer como "atualizados" só por isso.

## [1.4.1] - 2026-10-04

Quem já usa o Córtex passa a saber quando há versão nova e o que mudou depois de atualizar.

### Adicionado
- **`doctor` avisa se existe versão nova.** Consulta apenas o número da versão no npm (nada da pasta do usuário é enviado), com limite de 2,5 segundos e falha silenciosa sem internet. `--offline` (ou a variável `CORTEX_NO_UPDATE_CHECK`) desliga a consulta.
- **`update` percebe quando rodou uma versão antiga guardada pelo `npx`** e manda usar `npx @aksp/cortex@latest update`, em vez de dizer "já está em dia".
- **Novidades depois do update.** O `update` lista no terminal o que há de novo desde a versão que estava instalada e grava `.cortex/novidades.md`. A nova skill **`novidades`** ("novidades", "o que mudou?") apresenta a lista uma vez no chat, oferece testar o item mais útil e apaga o aviso. A lista vem de `.agents/cortex/novidades.json`, mantida a cada versão.
- **`radar` ganhou três lembretes** (continua mostrando no máximo um por vez): novidades pendentes de um update; margem-alvo ou mínima ainda em branco, oferecendo "descobrir minha margem" — o que cobre quem montou o Córtex antes da 1.4.0; e mais de 90 dias sem atualizar, com o comando pronto.

### Alterado
- `.cortex/version.json` passa a guardar `checkedAt` (última vez que o usuário conferiu se havia versão nova), além de `updatedAt`.
- README: corrigida a nota sobre `init` em pasta com arquivos do usuário, que ainda descrevia o comportamento anterior à 1.3.1.

## [1.4.0] - 2026-10-04

O Guardião de Margem passa a funcionar para quem ainda não sabe os próprios números, e o cérebro fica bem mais enxuto.

### Adicionado
- **Guardião de Margem que orienta em vez de travar.** O protocolo agora define a fórmula (preço líquido, custo real com imposto e taxas, margem), a **ordem de checagem** (piso de preço → teto de desconto → margem mínima → margem-alvo) e o veredito em quatro níveis (Aprovar, Aprovar com ressalva, Recusar, Contraproposta com número concreto). Quando faltam dados, ele diz exatamente o que falta e oferece ajuda em uma linha — nunca recusa, nunca inventa número e nunca sugere uma margem "de mercado".
- **Modo guiado "descobrir minha margem":** com um trabalho real que o usuário já fez (quanto o cliente pagou, quanto custou entregar, quanto sobrou), o Córtex mostra "de cada R$ 100, sobraram R$ X", repete com um trabalho bom e um que não valeu a pena, e propõe a margem-alvo e a mínima — sempre com confirmação antes de gravar.
- **Onboarding (Bloco 3) pergunta margem-alvo e mínima**, antes inexistentes (por isso os campos centrais ficavam sempre vazios), com o mesmo caminho guiado para quem não sabe, e pergunta por impostos e taxas (`imposto_pct`, `taxas_pct`, novos campos do frontmatter financeiro).
- **`proposta-comercial` confere a margem antes de salvar** e avisa, com os números, se o valor fica abaixo do mínimo — sem bloquear quando faltam dados. **`registrar`** avisa, em uma linha, quando uma decisão de preço ou desconto conflita com a política já definida.

### Alterado
- **Cérebro 37% mais curto** (1350 → 853 palavras, carregadas a cada sessão): as regras de roteamento viraram uma tabela "frase → skill", sem perder nenhuma; a regra de margem entrou. A data de revisão passa a ter uma única fonte autoritativa, o `META.md`, e o lembrete deixa de dizer "6 meses desde que montamos".
- **`analisador-dre`** deixa de comparar com "médias de mercado" quando o pilar financeiro não existe, e passa a distinguir margem líquida (depois dos custos fixos) de margem por trabalho (a das metas), para não dizer "abaixo da meta" por engano.
- Templates de Memória: as linhas-modelo (`- **[YYYY-MM-DD]** Descrição…`) viraram comentários e não sobram mais nos arquivos gerados; o título "Acessos e Logins" virou "Onde Ficam os Acessos (nunca a senha)".
- **Exemplo `estudio-lumen`** atualizado: datas que não nascem vencidas, pendências no formato que o `registrar` grava, meta do trimestre em formato de meta, chaves de custo iguais aos nomes dos produtos, protocolos atuais.

## [1.3.1] - 2026-10-04

Rodada de confiança: nada que o Córtex faça pode apagar ou confundir os dados do usuário.

### Adicionado
- **Arquivo `LICENSE` (MIT).** O `package.json` já declarava MIT, mas o repositório não tinha o arquivo.
- **`update` recusa voltar no tempo:** se o projeto está numa versão mais nova que o comando, avisa e indica `npx @aksp/cortex@latest update`.

### Corrigido
- **`init` não destrói mais nada.** Em uma pasta onde o Córtex já está montado, recusa e manda usar `update` (antes sobrescrevia o `AGENTS.md` com o texto de inicialização, apagando o cérebro compilado). Em uma pasta com arquivos do usuário, guarda uma cópia em `.cortex/backups/`, **mantém** o `.gitignore` dele e só acrescenta as regras do Córtex, e preserva o `CLAUDE.md` dele acrescentando apenas a linha `@AGENTS.md`.
- **`update` cria o `CLAUDE.md` que faltava** para quem veio de antes da 1.3.0 (só tinha `AGENTS.md`, que o Claude Code não lê sozinho) — sem nunca sobrescrever um `CLAUDE.md` que o usuário já tenha.
- **Backups num lugar só e limitados.** Passam a ficar em `.cortex/backups/` (em vez de `.agents.backup-*` e `CEREBRO.md.backup-*` espalhados na raiz), guardando os 3 mais recentes, e entram no `.gitignore` padrão para não irem para o repositório nem confundirem a IA com skills duplicadas.
- **`doctor` sem alarmes falsos:** o `Memoria/META.md` não aparece mais como "não indexado" (ele é o próprio índice); `custos_variaveis` em YAML de bloco ou objeto em linha deixa de ser lido como vazio; o parser de frontmatter passou a aguentar BOM do Bloco de Notas, `#` dentro de valores e `---` no meio do texto; e as linhas "nenhum faltando"/"sem inconsistências" não usam mais ícone de alerta.
- A mensagem "já está na versão mais recente" deixa de sugerir que o npm foi consultado.

### Migração
- Rode `npx @aksp/cortex@latest update`. Os backups antigos (`.agents.backup-*`) na raiz podem ser apagados à mão.

## [1.3.0] - 2026-10-04

Rodada "mais amigável": primeiro uso sem armadilhas e mais valor no dia a dia.

### Adicionado
- **Skill `lembrar`** — "o que você sabe sobre X?", "o que já decidimos sobre…": busca em Pilares, Memória e no arquivo morto, responde citando arquivo e data, e diz claramente quando não há nada registrado.
- **Skill `semana`** — "fechar a semana": cinco minutos para ver o que foi resolvido, o que ficou para trás, registrar uma lição, definir as 3 prioridades da próxima semana e acompanhar a meta do trimestre (a seção "Metas do Trimestre" do template passa finalmente a ser usada).
- **Skill `conteudo`** — posts, legendas, mensagens de WhatsApp e e-mails curtos no tom de voz do negócio, sempre em duas versões.
- **`registrar` ganha desfazer, lote e pessoas:** "desfaz" / "corrige o último" remove ou corrige o registro recém-feito; "anota a reunião" extrai decisões, pendências e lições de um texto colado e grava tudo com uma única confirmação; "cliente novo" registra uma pessoa em uma linha na seção "Stakeholders". Itens resolvidos e projetos passam a levar data. A skill se recusa a gravar senhas.
- **`radar`** mostra a meta do trimestre e, no máximo, **uma** sugestão por vez (revisão vencida, memória grande, dias sem registro, ou um bloco do onboarding ainda não feito).
- **`CLAUDE.md` por padrão**, como import nativo do Claude Code (`@AGENTS.md`): o cérebro continua em um arquivo só, e quem usa Claude Code deixa de ficar sem arquivo de instrução após o `init`.
- **Aviso de migração** em `sync` e `update` para um `CODEX.md` antigo, com remoção apenas mediante confirmação.

### Alterado
- **Onboarding começa pelo modo Rápido.** A abertura vai direto às 4 perguntas (uma por mensagem); o fluxo Completo só entra se o usuário pedir. O fechamento deixa de ser um inventário de arquivos e vira uma **"primeira vitória"**: três observações específicas sobre o negócio e uma ação pronta para fazer na hora.
- **Continuação em gotas:** "continuar onboarding" passa a ser a única frase oficial de retomada (CLI, `saude`, `radar` e `ajuda` apontam para ela), e o modo continuação faz um bloco de 2–5 minutos por vez.
- **`ajuda` reorganizada por situação** ("No dia a dia", "Para vender e comunicar", "Para cuidar do Córtex"), sem jargão técnico.
- **Cérebro:** diz onde as skills ficam (`.agents/skills/<nome>/SKILL.md`); troca "nunca edite sem perguntar" por uma **política de escrita em dois níveis** — acréscimos na Memória são gravados na hora e mostrados; Pilares, frontmatter, arquivamento e exclusões pedem confirmação — o que resolve a contradição com o `registrar`; "tive uma ideia" passa a ser tratado como ideia do negócio.
- **CLI:** ajuda e exemplos usam sempre `npx @aksp/cortex` (o nome sem escopo é outro pacote no npm) e documentam `doctor` e `--force`; a mensagem pós-`init` explica como abrir a pasta na ferramenta de IA, sem depender do VS Code; o erro do `sync` sem cérebro explica o que fazer.
- **README reescrito para quem nunca usou:** "Comece em 5 minutos" no topo, exemplos reais de uso, guia "Qual ferramenta de IA escolher?" com nota de custo, seção "Seus dados" (a IA envia o que lê ao fornecedor da ferramenta) e "Problemas comuns".
- **Texto de inicialização** (`AGENTS.md` antes do onboarding): qualquer primeira mensagem — "oi", "radar", "ajuda" — oferece começar a montagem.
- Templates de Memória alinhados ao formato que o `registrar` realmente grava.

### Removido
- **`CODEX.md` deixa de ser um alvo.** O Codex lê `AGENTS.md` nativamente, então o arquivo era uma cópia redundante. Registrado como emenda no `CONTRACTS.md`.
- **Skill `ideias` sai da instalação do usuário final.** Ela trata de melhorias do próprio framework e capturava a frase comum "tive uma ideia". Continua disponível para contribuidores em `contrib/skills/ideias/`.

### Migração (de 1.2.0 ou anterior)
- Rode `npx @aksp/cortex@latest update`. Nada precisa ser refeito.
- Se existir um `CODEX.md` na raiz, o comando avisa e pergunta se pode remover; o Codex passa a usar o `AGENTS.md`.
- Instalações que já têm `.cortex/targets.json` mantêm os alvos que escolheram. Quem usa Claude Code e só tinha `AGENTS.md` pode rodar `npx @aksp/cortex sync --targets=AGENTS.md,CLAUDE.md`.
- A skill `ideias` antiga permanece em `.agents/skills/` até você rodar `update --prune`; ela já não é acionada pelo cérebro.

> As versões `0.12.0` e `1.0.0` abaixo não têm *tag* própria no Git: o conteúdo delas entrou no mesmo commit da `1.1.0`.

## [1.2.0] - 2026-08-02

### Adicionado
- **Testes unitários para funções exportadas do CLI:** 40 novos testes em `test/unit/doctor-internals.test.js` cobrindo `parseSimpleFrontmatter` (9 casos), `countRevisarAndBlanks` (7 casos), `calculateCompleteness` (5 casos), `parseMetaHeaders` (3 casos), `parseFileMapFromMeta` (3 casos), `checkBrainHealth` (4 casos), `readCortexMeta`/`writeCortexMeta` (3 casos), e `readBusinessName` (4 casos).
- **Testes de integração para caminhos de erro:** 7 novos testes em `test/integration/cli.test.js` cobrindo `sync` sem `CEREBRO.md`, `update` sem `.agents/`, aliases do doctor (`checkup`, `diagnostico`), `sync --targets=all`, doctor com opcionais não configurados, e `update --force`.

### Alterado
- Total de testes: **31 → 76** (45 novos)
- Cobertura de caminhos de erro do CLI: 0% → 100% dos caminhos documentados

## [1.1.0] - 2026-08-02

### Corrigido
- **Help do `update` corrigido:** o texto dizia que o comando "nunca toca em Frameworks/ ou nos system prompts de raiz", mas desde a v0.11.0 ele regenera `CORTEX:FRAMEWORK` e recompila os arquivos de instrução. O help e o README agora descrevem corretamente o que é e não é tocado.
- **`USER_DATA_ITEMS` corrigido:** o array incluía os 5 arquivos de raiz como "dados do usuário nunca tocados", mas o update os regenera intencionalmente. Corrigido para listar apenas o que realmente é intocável: `Pilares/`, `Memoria/`, `Ativos/`, `Frameworks/` e `.gitignore`.
- **`checkBrainHealth` corrigido:** branch morta (if/else idênticos) removida. Arquivos ponteiro legado não aparecem mais como "compilados" no relatório do doctor.
- **`cortex-revisao` agora tem gatilho direto:** adicionado `'revisar córtex'` à description da skill (o gatilho mais comum, que estava ausente) e regra explícita no `brain.framework.md` (regra 6).
- **Regra 14 do cérebro corrigida:** `04_Comercial.md` agora tem `(if it exists)` — é opcional desde a v1.0.0.
- **`analisador-dre` reestruturado:** branches "arquivo existe" e "não existe" agora são independentes e não aninhados. A contradição "skip steps 3-4" vs "still analyze" foi resolvida.
- **`ideias` não referencia mais arquivo deletado:** substituída a referência a `AUDITORIA_EVOLUCAO_v1.md` por `CONTRACTS.md`.
- **`<!-- REVISAR -->` corrigido no onboarding:** a skill dizia "keep the template's REVISAR comment" mas nenhum template tinha o marcador. Agora instrui a "insert a REVISAR marker".
- **`runInit` corrigido:** prompt de sobrescrita agora aparece sempre (antes pulava quando target era `.`). Argumento posicional agora é buscado corretamente após flags (`--force MinhaPasta` funciona).
- **`--targets=inválido` agora emite warning** listando os targets válidos, em vez de falhar silenciosamente.
- **Lista de pilares obrigatórios unificada** na constante `MANDATORY_PILLAR_PREFIXES`, eliminando 3 duplicatas no `cli.js`.
- **`.gitignore` ampliado:** padrão `/AUDITORIA*.md` cobre qualquer auditoria futura, não só as de evolução.
- **`package.json` `files` inclui `scripts/`** para que `build:manifest` e `verify:manifest` funcionem no pacote npm publicado.

### Alterado
- **`init` agora cria só `AGENTS.md` por padrão.** Os outros 4 arquivos de instrução (`CLAUDE.md`, `GEMINI.md`, `CODEX.md`, `.cursorrules`) só são gerados se o usuário passar `--targets=`. Isso elimina a proliferação de 5 arquivos que o usuário talvez nunca use. `init --targets=all` restaura o comportamento antigo. O onboarding Step 7 continua perguntando quais ferramentas o usuário usa e gerando os arquivos corretos.
- **README totalmente atualizado:** tabela de comandos completa (16 comandos), árvore de diretórios marca `03_Financeiro`/`04_Comercial` como opcionais e inclui `.cortex/meta.json`, referência a "ponteiros" removida, seção "Mantendo o Córtex atualizado" inclui `cortex doctor`, tipos de negócio consolidados em 4 (removido "Profissionais liberais" redundante).
- **`CONTRACTS.md` referenciado** como fonte de contratos na skill `ideias` e nos docs.

## [1.0.0] - 2026-08-02

### Adicionado
- **Contratos congelados (`CONTRACTS.md`):** documento formalizando os 7 contratos estruturais que definem a v1.0.0: manifesto de framework, camadas do cérebro (marcadores `CORTEX:BUSINESS`/`CORTEX:FRAMEWORK`), schema do `.cortex/` (3 arquivos), formato dos artefatos compilados, lista de pilares obrigatórios/opcionais, nomenclatura de skills, e política de versionamento/migração. Quebrar qualquer um desses contratos exige major version bump (v2.0.0).
- **Convenção de gatilhos (`CONTRIBUTING.md`):** tabela de verbos primários exclusivos por skill + regras para evitar colisão de gatilhos entre skills. Cada skill "possui" um verbo principal; skills novas devem verificar a tabela antes de escolher o seu.
- **Regra de desempate no cérebro:** nova instrução no `brain.framework.md` e `CORTEX_TEMPLATE.md`: na dúvida entre duas skills, a IA pergunta em uma linha antes de agir ("Você quer registrar como decisão ou analisar o impacto financeiro?").
- **Teste `skill ↔ ajuda`:** novo teste (`test/unit/skill-ajuda.test.js`) que falha se uma skill em `.agents/skills/` não tiver representação na skill `ajuda`. Roda no CI junto com os demais.
- **Checklist de release (`CONTRIBUTING.md`):** lista de verificação para publicar uma nova versão (14 itens), incluindo sub-checklist para adicionar/remover skills.

### Alterado
- **Pilares financeiro e comercial passam a ser opcionais.** `03_Financeiro.md` e `04_Comercial.md` deixam de ser obrigatórios. Os obrigatórios caem de 6 para 4: `01_Estrategia`, `02_Cultura`, `05_Comunicacao`, `06_Operacao`. Onboarding pergunta antes do Bloco 3, `cortex doctor` mostra como `ℹ️ Opcional não configurado`, skills financeiras têm fallback elegante, Guardião de Margem verifica existência antes de calcular.
- **Skill `cortex-onboarding`** agora aparece na `ajuda` como `montar meu córtex`.

## [0.12.0] - 2026-08-02

### Adicionado
- **Comando `cortex doctor` (aliases: `checkup`, `diagnostico`):** auditoria estrutural determinística do Córtex que roda direto no terminal, sem gastar tokens de IA. Verifica: pilares obrigatórios faltando, marcadores `REVISAR` pendentes, seções em branco, frontmatter com campos `null`/`{}` (incluindo `custos_variaveis`), inconsistências no `META.md` (arquivos quebrados ou não indexados), saúde do cérebro (camadas `CORTEX:BUSINESS`/`CORTEX:FRAMEWORK`, alvos compilados) e índice de completude. A skill `saude` espelha a mesma lógica, agora sugerindo `cortex doctor` como alternativa zero-token.
- **Custo variável canônico no frontmatter:** `Pilares/03_Financeiro.md` ganha dois novos campos no frontmatter: `custos_variaveis` (mapeamento item→custo unitário, ex.: `{"fotografia corporativa": 150}`) e `custo_variavel_padrao` (% do preço quando não há custo por item). Isso fecha a conta do Modo "Guardião de Margem": agora o cálculo `Custo Real → Margem Resultante → Veredito` é determinístico e não depende de a IA adivinhar o custo na prosa. O Bloco 3A do onboarding passou a coletar o custo variável de cada produto/serviço. As skills `analisador-dre`, `proposta-comercial` e `saude` foram atualizadas para usar os novos campos.
- **Modo Continuação no onboarding:** a skill `cortex-onboarding` agora detecta Córtex já existente (via `META.md`) e, quando acionada com "continuar onboarding" ou "completar meu córtex", lê os `REVISAR` e campos `null` pendentes e guia o usuário apenas pelos blocos incompletos — sem recomeçar do zero. Nova regra 17 no `brain.framework.md` para disparar esse modo.
- **Metadados estruturados em `.cortex/meta.json`:** o onboarding agora grava `businessName`, `type`, `onboardedAt` e `nextReview` em `.cortex/meta.json` durante o Passo 7. O CLI (`readBusinessName`, `cortex doctor`) lê desse arquivo primeiro, com fallback para regex no `META.md` — fim do parsing frágil. Novas funções `readCortexMeta`/`writeCortexMeta` exportadas em `bin/cli.js`.
- **Skill `ideias`:** nova skill para capturar e analisar ideias de evolução do próprio framework Córtex. Registra em `IDEIAS.md` (arquivo local gitignored, não versionado) com template estruturado de viabilidade. Três modos: captura rápida, análise de viabilidade contra os 6 princípios do projeto, e priorização. Nova regra 18 no cérebro.

### Alterado
- **Internals do framework passam a ser escritos em inglês.** As 11 skills, os dois protocolos (`PROTOCOLO_AUTONOMIA.md`, `PROTOCOLO_MEMORIA.md`), o template do cérebro (`CORTEX_TEMPLATE.md` / `brain.framework.md`) e os comentários-guia dos templates de Pilares/Memória agora têm sua prosa instrucional em inglês — o que é carregado repetidamente no contexto da IA a cada sessão. Isso reduz o custo de token do carregamento recorrente sem mudar em nada a experiência do usuário: **a conversa com o usuário continua sempre em português**, os gatilhos das skills (`"radar"`, `"registra que..."`, `"saúde do córtex"` etc.) continuam em português nas `description`, os "Formatos de Saída" mostrados ao usuário continuam em português, e os dados do próprio negócio (Pilares/Memória preenchidos, cabeçalhos das seções, comentários do frontmatter YAML) permanecem no idioma do usuário.
- **Nova regra explícita de idioma no cérebro:** a primeira regra do framework agora instrui a IA a sempre responder ao usuário em português, independentemente do idioma das instruções — necessário porque, a partir desta versão, essas instruções passam a ser lidas em inglês.
- **README, CONTRIBUTING e a documentação do onboarding continuam em português** — são conteúdos voltados ao GitHub/usuário final, fora do escopo desta mudança.
- Relatórios de auditoria (`AUDITORIA*.md`) passam a ser sempre excluídos do repositório público via `.gitignore`, com um padrão glob cobrindo futuras versões do relatório.

## [0.11.0] - 2026-08-02

### Adicionado
- **Cérebro em duas camadas:** `Frameworks/CEREBRO.md` passa a ter duas regiões marcadas — `CORTEX:BUSINESS` (identidade, datas de revisão e pilares do negócio, **nunca** tocada por uma atualização) e `CORTEX:FRAMEWORK` (regras de operação e disparo de skills, regenerável). O texto da camada de framework agora é shippado em `.agents/cortex/brain.framework.md`, dentro da camada atualizável.
- **`cortex update` passa a propagar o cérebro.** Até aqui, `update` instalava as skills novas em `.agents/` mas nada ensinava a IA a acioná-las: a skill chegava ao disco e ficava invisível. Agora o comando regenera a região `CORTEX:FRAMEWORK` do cérebro e recompila os arquivos de instrução, preservando a região do negócio byte a byte (com backup do `CEREBRO.md` antes de qualquer escrita).
- **`--targets` no `cortex sync`:** escolhe quais arquivos de instrução gerar (`--targets=CLAUDE.md,GEMINI.md` ou `--targets=all`), gravando a escolha em `.cortex/targets.json`.

### Alterado
- **Os arquivos de instrução deixam de ser "ponteiros" e passam a ser compilados.** `AGENTS.md` e companhia agora contêm o **conteúdo completo** do cérebro, com um cabeçalho de "arquivo gerado — não edite à mão", em vez de um texto pedindo à IA que fosse ler `Frameworks/CEREBRO.md`. O modelo de ponteiro só funcionava se a ferramenta seguisse a indireção — e nem toda IDE faz isso. Como os arquivos passam a ser gerados, e não editados, eles também não têm como divergir entre si.
- **`AGENTS.md` é o alvo padrão, os demais são sob demanda.** Em vez de manter cinco arquivos de instrução na raiz por padrão, o Córtex gera apenas `AGENTS.md` (a convenção cross-tool) e cria os outros só quando o usuário pede — menos arquivos, menos superfície de erro. O onboarding pergunta quais ferramentas o usuário usa.
- **Fim de linha preservado:** a comparação e a escrita do cérebro respeitam o estilo do arquivo (CRLF/LF), evitando que uma atualização reescrevesse o arquivo inteiro só por causa de quebra de linha.
- **`cortex-onboarding`, `cortex-revisao` e `saude`** atualizadas para o modelo compilado, incluindo o caminho de migração para Córtex das versões 0.7–0.10 (cérebro sem marcadores) e anteriores à 0.7.

## [0.10.0] - 2026-08-01

### Adicionado
- **Testes automatizados (`node --test`) e CI:** `bin/cli.js` ganha uma suíte de testes (`test/unit/`, `test/integration/`) cobrindo `init`, `update` e `sync` de ponta a ponta, incluindo a invariante central do projeto — `cortex update` nunca altera `Pilares/`, `Memoria/`, `Ativos/`, `Frameworks/` ou os arquivos de raiz. Workflow `.github/workflows/ci.yml` roda a suíte em Node 18/20 no Linux e no Windows a cada PR.
- **Manifesto de framework (`.agents/manifest.json`):** lista, versionada e gerada por `scripts/build-manifest.js`, de todos os arquivos que pertencem à camada de framework nesta release. `npm run build:manifest` regenera; `npm run verify:manifest` (rodado no CI) falha se o manifesto commitado ficar desatualizado.
- **`cortex update --prune`:** o comando `update` agora distingue, dentro de `.agents/`, arquivos que o usuário criou por conta própria (sempre preservados) de arquivos que o próprio framework já possuiu e descontinuou nesta versão (mantidos por padrão, removidos apenas com a nova flag `--prune`, sempre com backup prévio). Instalações anteriores à v0.10.0 — sem manifesto instalado — continuam com o comportamento anterior: tudo é preservado.
- `bin/cli.js` passa a exportar suas funções internas puras (`diffFrameworkLayer`, `classifyPreserved`, `applyFrameworkUpdate`, etc.) quando importado como módulo, para permitir os testes unitários sem depender de `process.argv`. O comportamento como CLI (`node bin/cli.js ...`) não muda.


## [0.9.0] - 2026-08-01

### Adicionado
- **Skill `proposta-comercial`:** monta uma proposta comercial 90% pronta a partir de `Pilares/04_Comercial.md`, `05_Comunicacao.md` e `09_Identidade_Visual.md`, respeitando piso e teto de desconto do frontmatter. Salva em `Ativos/Propostas/`.
- **Skill `analisador-dre`:** lê planilhas/DRE fornecidas pelo usuário e cruza com `margem_alvo`/`margem_minima` de `Pilares/03_Financeiro.md`. Nunca calcula números que o usuário não forneceu.
- **Skill `pesquisa-mercado`:** mapeia concorrentes (via busca web, quando disponível, ou informações fornecidas pelo usuário) e propõe atualização do novo "Panorama Competitivo" em `Pilares/01_Estrategia.md`.
- **Seção "Panorama Competitivo"** adicionada ao template `Pilares/01_Estrategia.md`, com âncora correspondente no `META.md`.
- **Córtex de exemplo (`examples/estudio-lumen/`):** negócio fictício totalmente preenchido — Pilares, Memória e `CEREBRO.md` completos — como referência de qualidade e demonstração do framework.

### Alterado
- **CONTRIBUTING.md** atualizado: `proposta-comercial`, `analisador-dre` e `pesquisa-mercado` saem da lista de "ideias" (já existem) e novas sugestões entram no lugar.

## [0.8.0] - 2026-08-01

### Adicionado
- **Protocolo de Memória Viva (`Frameworks/PROTOCOLO_MEMORIA.md`) e skill `consolidar`:** itens de `Memoria/02_Licoes.md` com mais de 12 meses, decisões marcadas como revogadas e duplicatas passam a ser arquivados (nunca apagados) em `Memoria/_Arquivo/AAAA.md`. Integrado ao Fechamento da `cortex-revisao` e sugerido pelo `radar` quando a Memória cresce demais.
- **Convenção de decisão revogada:** `registrar` agora marca decisões superadas com `[REVOGADA em YYYY-MM-DD: motivo]` em vez de apagá-las, preservando o histórico até a próxima consolidação.
- **Frontmatter de margem nos pilares financeiro/comercial:** `Pilares/03_Financeiro.md` (`margem_alvo`, `margem_minima`) e `Pilares/04_Comercial.md` (`preco_piso`, `desconto_max`) ganham um bloco YAML canônico e numérico, lido primeiro pelo Modo "Guardião de Margem" do `PROTOCOLO_AUTONOMIA.md`.
- **Índice com âncoras no `META.md`:** o Mapa de Arquivos ganha uma coluna "Seção (âncora)" apontando para o cabeçalho exato dentro de cada arquivo, aprofundando a leitura em camadas.

### Alterado
- **Skill `saude`** passa a contar campos de frontmatter (`margem_alvo`, `margem_minima`, `preco_piso`, `desconto_max`) ainda `null` como pendências de preenchimento.

## [0.7.0] - 2026-08-01

### Adicionado
- **`Frameworks/CEREBRO.md` (fonte única do system prompt):** O onboarding agora salva o conteúdo completo do "cérebro" em um único arquivo. Os 5 arquivos de raiz (`GEMINI.md`, `CLAUDE.md`, `CODEX.md`, `AGENTS.md`, `.cursorrules`) viram ponteiros curtos que instruem a IA a ler `Frameworks/CEREBRO.md`, eliminando o risco de divergência entre ferramentas.
- **Comando `cortex sync`:** Regenera os 5 ponteiros de raiz a partir de `Frameworks/CEREBRO.md`, para quando um deles for sobrescrito ou corrompido.
- **Modo Quickstart no onboarding:** Além do fluxo Completo (~25 perguntas, 20-30 min), o usuário agora pode escolher o modo Rápido (4 perguntas, ~5 min), que gera um Córtex funcional na hora com marcadores `REVISAR` nas lacunas, para completar depois.
- **Skill `saude`:** Novo comando ("saúde do córtex", "diagnóstico") que audita a estrutura do Córtex — pilares obrigatórios faltando, marcadores `REVISAR` pendentes, inconsistências no `META.md` e um índice de completude estimado.

### Alterado
- **`cortex-revisao` migra instalações antigas:** Se o Córtex ainda usa o formato antigo (conteúdo duplicado nos 5 arquivos de raiz, sem `Frameworks/CEREBRO.md`), a revisão semestral agora oferece migrar para a fonte única.

## [0.6.0] - 2026-08-01

### Adicionado
- **Comando `cortex update`:** Atualiza apenas a camada de framework (`.agents/`) para a versão instalada do CLI, sem nunca tocar em `Pilares/`, `Memoria/`, `Ativos/`, `Frameworks/` ou nos system prompts de raiz. Mostra o que vai mudar (arquivos novos, atualizados e preservados) e pede confirmação antes de aplicar.
- **Backup automático:** Antes de qualquer atualização, `.agents/` é copiado para `.agents.backup-<timestamp>/`, protegendo eventuais personalizações feitas pelo usuário nas skills padrão.
- **`.cortex/version.json`:** Novo arquivo de metadados que registra a versão do framework instalada no projeto, criado por `init` e atualizado por `update`.

### Alterado
- **Separação formal framework × dados do usuário:** `init` e `update` agora tratam `.agents/` como camada de framework (atualizável) e `Pilares/`, `Memoria/`, `Ativos/`, `Frameworks/` e os system prompts de raiz como camada de dados do usuário (nunca sobrescrita por uma atualização).

## [0.5.0] - 2026-08-01

### Adicionado
- **Auditoria estrutural (`AUDITORIA.md`):** Diagnóstico completo do framework com plano de evolução em 4 fases.
- **`.gitignore` de proteção de dados:** Novo arquivo, copiado por `cortex init`, que evita que `Pilares/`, `Memoria/` e `Ativos/` (os dados privados do negócio) sejam versionados por acidente. Também ignora `graphify-out/` e `node_modules/`.
- **Template `Memoria/META.md`:** O índice mestre agora tem um template próprio em `templates/Memoria/META.md`, em vez de ficar embutido só na skill de onboarding.
- **Skill `ajuda`:** Novo comando (`ajuda`, `o que você faz?`) que lista os comandos disponíveis do Córtex.

### Alterado
- **Datas reais do sistema:** As skills `registrar`, `radar`, `cortex-revisao` e `cortex-onboarding` agora exigem a data real do sistema para qualquer carimbo temporal, em vez de permitir datas estimadas/aproximadas.
- **Sincronização do `META.md`:** `registrar` e `cortex-revisao` agora atualizam o Mapa de Arquivos do `META.md` sempre que um arquivo é criado, como parte da mesma ação — evitando que o índice fique desatualizado.
- **Radar sugere revisão semestral:** A skill `radar` agora verifica a data de próxima revisão no `META.md` e sugere `revisar córtex` quando aplicável.
- **Documentação alinhada:** [`.agents/skills/cortex-onboarding/README.md`](.agents/skills/cortex-onboarding/README.md) deixou de duplicar o README raiz (que estava desatualizado, falando em "8 blocos" e um único `CORTEX.md`) e agora aponta para ele como fonte única.
- **Links do Changelog:** Removidos links `file:///` com caminhos absolutos de máquina local; substituídos por caminhos relativos ao repositório.

## [0.4.0] - 2026-07-22

### Adicionado
- **Instalador NPX CLI (`npx @aksp/cortex init`):** Utilitário CLI nativo em Node.js ([bin/cli.js](bin/cli.js)) para inicializar a estrutura completa do Córtex em qualquer diretório com um único comando.
- **Configuração de Pacote NPM (`@aksp/cortex`):** Arquivo [package.json](package.json) configurado com o nome de pacote `@aksp/cortex` e atalhos de binários `cortex-framework`, `cortex` e `cortex-ai`.
- **Guia de Contribuição Open-Source:** Criado [CONTRIBUTING.md](CONTRIBUTING.md) estabelecendo as diretrizes de desenvolvimento da comunidade, regras de economia de tokens e passo a passo para Pull Requests.

## [0.3.0] - 2026-07-20

### Adicionado
- **Seção "Por que a IA precisa ser local?":** Comparativo detalhado entre Córtex (Local/IDE) e soluções baseadas em navegador (ChatGPT/Gemini/Claude).
- **Protocolo de Autonomia (`PROTOCOLO_AUTONOMIA.md`):** Evolução dos blocos fundamentais introduzindo os 4 modos de ação da IA para execução autônoma.
- **Suporte nativo ao OpenAI Codex / ChatGPT CLI:** Adicionado [CODEX.md](CODEX.md) para integração com assistentes CLI.
- **Comandos de instalação cross-platform:** Instruções parametrizadas para macOS, Linux e Windows (PowerShell/CMD).

## [0.2.0] - 2026-07-19

### Adicionado
- **Skills Agnósticas:** Migração das habilidades para a pasta `.agents/skills` garantindo compatibilidade multiplataforma.
- **Ramificação por Modelo de Negócio:** Entrevista adaptativa de onboarding conforme a modalidade da empresa (B2B, B2C, SaaS, E-commerce, Infoprodutos, Serviços).
- **Pilares Customizados:** Capacidade de gerar pilares estratégicos adicionais sob medida além dos 9 padrão.
- **Pré-preenchimento Inteligente:** Leitura prévia de documentos do cliente (PDFs, planilhas) para agilizar o onboarding.
- **Skill de Revisão Semestral:** Skill [cortex-revisao](.agents/skills/cortex-revisao/SKILL.md) para auditoria periódica dos pilares do negócio.

### Alterado
- **Blindagem de Estrutura:** Utilização de arquivos antigos estritamente como contexto sem corromper a estrutura padrão do Córtex.

## [0.1.1] - 2026-07-19

### Adicionado
- **Arquivos `.gitkeep`:** Garantia de persistência de diretórios vazios ao clonar o repositório.
- **Refinamento do Guia de Instalação:** Ajustes nos comandos `git clone` no [README.md](README.md) com aspas e ponto-e-vírgula para evitar erros no terminal.

## [0.1.0] - 2026-07-19

### Adicionado
- **Lançamento Inicial do Córtex:** Estrutura base de Pilares, Memória, Ativos e Frameworks.
- **Skill de Onboarding (`cortex-onboarding`):** Entrevista guiada em 9 blocos para inicialização do negócio.
- **Skills de Operação Diária:** Habilidades [radar](.agents/skills/radar/SKILL.md) e [registrar](.agents/skills/registrar/SKILL.md).
- **System Prompts Multi-IDE:** Suporte inicial para [AGENTS.md](AGENTS.md), [GEMINI.md](GEMINI.md), [CLAUDE.md](CLAUDE.md) e [.cursorrules](.cursorrules).
