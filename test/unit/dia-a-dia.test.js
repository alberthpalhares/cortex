const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const cli = require('../../bin/cli.js');

// O comportamento do dia a dia mora em texto de instrução (cérebro, skills e
// protocolos). Estes testes não substituem uma conversa de verdade — isso é o
// roteiro do checklist de release, no CONTRIBUTING.md —, mas impedem que as
// regras combinadas sumam ou se contradigam entre os arquivos.

const ROOT = path.join(__dirname, '..', '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const skill = (name) => read(`.agents/skills/${name}/SKILL.md`);
const description = (name) => skill(name).match(/^description:\s*"(.*)"\s*$/m)[1];
const BRAIN = read('.agents/cortex/brain.framework.md');
const routingRow = (skillName) => BRAIN.split('\n').find((l) => l.startsWith('|') && l.includes(`\`${skillName}\``)) || '';

function listFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? listFiles(full) : [full];
  });
}

// ── Orçamento do cérebro ──────────────────────────────────────────

test('o cérebro cabe no orçamento: no máximo 900 palavras, carregadas em toda conversa', () => {
  const words = BRAIN.split(/\s+/).filter(Boolean).length;
  assert.ok(words <= 900, `o cérebro tem ${words} palavras; para acrescentar uma regra, corte outra`);
});

// ── Protocolos na camada do framework ─────────────────────────────

test('os protocolos vêm com o framework e nada mais aponta para a cópia em Frameworks/', () => {
  for (const f of cli.LEGACY_PROTOCOL_FILES || ['PROTOCOLO_AUTONOMIA.md', 'PROTOCOLO_MEMORIA.md']) {
    assert.ok(fs.existsSync(path.join(ROOT, '.agents', 'cortex', f)), `.agents/cortex/${f} deveria existir`);
    assert.equal(
      fs.existsSync(path.join(ROOT, '.agents', 'skills', 'cortex-onboarding', 'templates', 'Frameworks', f)),
      false,
      `${f} não é mais um molde copiado na montagem`
    );
  }
  const stale = listFiles(path.join(ROOT, '.agents'))
    .concat([path.join(ROOT, 'README.md'), path.join(ROOT, 'examples', 'estudio-lumen', 'Frameworks', 'CEREBRO.md')])
    .filter((f) => /\.(md|json)$/.test(f) && fs.readFileSync(f, 'utf8').includes('Frameworks/PROTOCOLO_'));
  assert.deepEqual(stale.map((f) => path.relative(ROOT, f)), [], 'referências ao caminho antigo dos protocolos');
  assert.ok(/Do \*\*not\*\* copy them into `\.\/Frameworks\/`/.test(skill('cortex-onboarding')), 'a montagem não copia mais os protocolos');
});

// ── Gatilhos ──────────────────────────────────────────────────────

test('"me lembra de…" é lembrete (registrar), não busca na memória (lembrar)', () => {
  assert.ok(routingRow('registrar').includes('"me lembra de…"'), 'o cérebro manda "me lembra de…" para o registrar');
  assert.ok(!routingRow('lembrar').includes('"lembra de…"'), 'o lembrar não pode ficar com o gatilho "lembra de…"');
  assert.ok(description('registrar').includes("'me lembra de'"));
  assert.ok(!/'lembra de'/.test(description('lembrar')), "a descrição do lembrar não usa mais 'lembra de'");
  assert.ok(skill('lembrar').includes('belongs to the `registrar` skill'));
  const reg = skill('registrar');
  assert.ok(reg.includes('eu não mando aviso no celular'), 'o lembrete não pode prometer notificação');
  assert.ok(reg.includes('Never do this calendar sum in your head'), 'a data sai da ferramenta de data, não de conta de cabeça');
  assert.ok(reg.includes('confirming the weekday and the date'), 'a data do lembrete é confirmada com o dia da semana');
  assert.ok(skill('lembrar').includes('never stop at the first hit'), 'a busca na memória olha todos os arquivos');
});

test('pergunta é consulta, ordem é registro; e a margem tem linha própria na tabela', () => {
  assert.ok(BRAIN.includes('A question is a lookup, never a record'));
  assert.ok(!/"pendência"/.test(routingRow('registrar')), '"pendência" solta não aciona mais o registro');
  assert.ok(routingRow('registrar').includes('"nova pendência"'));
  const guardian = BRAIN.split('\n').find((l) => l.includes('"descobrir minha margem"') && l.startsWith('|')) || '';
  assert.ok(guardian.includes('"quanto cobrar por…"') && guardian.includes('rule 7'), 'linha do Guardião na tabela de roteamento');
  assert.ok(!routingRow('analisador-dre').includes('como está minha margem'), 'sem planilha, "como está minha margem" é do Guardião');
  assert.ok(!description('analisador-dre').includes("'como está minha margem'"));
  assert.ok(routingRow('saude').includes('"diagnóstico do córtex"'), '"diagnóstico" sozinho colidia com o diagnóstico financeiro');
});

test('os gatilhos do cérebro e da tabela do CONTRIBUTING acompanham as descrições das skills', () => {
  const contributing = read('CONTRIBUTING.md');
  for (const phrase of ['me lembra de', 'nova pendência', 'descobrir minha margem', 'quanto cobrar']) {
    assert.ok(contributing.includes(phrase), `CONTRIBUTING.md deveria citar "${phrase}" na tabela de gatilhos`);
  }
  assert.ok(description('proposta-comercial').includes('orçamento'), 'o cérebro roteia "orçamento" para a proposta; a descrição precisa dizer o mesmo');
});

// ── Pendências, radar e fechamento da semana ──────────────────────

test('pendência sem prazo ou em espera guarda desde quando existe, e linhas antigas continuam valendo', () => {
  const reg = skill('registrar');
  assert.ok(reg.includes('**[SEM PRAZO]** [Texto] *(desde YYYY-MM-DD)*'));
  assert.ok(reg.includes('**[AGUARDANDO]** [Texto] *(desde YYYY-MM-DD)*'));
  assert.ok(reg.includes('**[AGUARDANDO: Marina]**'));
  assert.ok(/Older lines without it stay valid/.test(reg));
  assert.ok(reg.includes('*(deixada de lado)*'));
  const template = read('.agents/skills/cortex-onboarding/templates/Memoria/04_Pessoas_Pendencias.md');
  assert.ok(template.includes('*(desde YYYY-MM-DD)*'), 'o molde mostra o formato novo');
  const example = read('examples/estudio-lumen/Memoria/04_Pessoas_Pendencias.md');
  assert.ok(example.includes('[SEM PRAZO]') && example.includes('*(desde 2026-'), 'o exemplo segue o formato que o registrar grava');
});

test('radar: nada some, no máximo 5 atrasadas, sugestão em rodízio e estado vazio', () => {
  const radar = skill('radar');
  assert.ok(radar.includes('DEPOIS / SEM PRAZO'), 'itens sem prazo ou para depois têm lugar na tela');
  assert.ok(radar.includes('[Pendência com prazo depois desta semana] — DD/MM'), 'um prazo mais adiante aparece pelo nome, não só numa contagem');
  assert.ok(radar.includes('… e mais N atrasadas'), 'teto de atrasadas');
  assert.ok(radar.includes('never count toward that limit'), 'o teto não esconde o que vence hoje ou nesta semana');
  assert.ok(radar.includes('Weeks run Monday to Sunday'), '"esta semana" tem definição');
  assert.ok(radar.includes('start at item ((day of the month − 1) mod 6) + 1'), 'rodízio sem arquivo de estado');
  assert.ok(radar.includes('Seu radar está limpo'), 'radar vazio convida a despejar o que está na cabeça');
  assert.ok(radar.includes('no empty headings and no closing question'), 'o radar vazio não ganha sugestões soltas');
  assert.ok(/Size alone is not a reason/.test(radar), 'só sugere consolidar quando há o que arquivar');
  assert.ok(radar.includes('A decision still in force is never archivable'), 'decisão antiga em vigor não conta como arquivável');
  assert.ok(radar.includes('O trimestre virou'), 'meta de trimestre encerrado não aparece como atual');
  assert.ok(radar.includes('quer que eu escreva a cobrança?'));
  assert.ok(radar.includes('never the raw date'), 'mostra "há N dias", não a data crua');
  assert.ok(radar.includes('[Quem se aguarda, quando a etiqueta tiver nome]'), 'a linha de espera diz de quem se espera');
  assert.ok(radar.includes('never add the tag to an old line'), 'linha antiga sem "(desde …)" não é reescrita');
});

test('fechar a semana: limpa o que venceu há muito, vira o trimestre e lembra da revisão', () => {
  const semana = skill('semana');
  assert.ok(semana.includes('vencidos há mais de duas semanas'));
  assert.ok(semana.includes('*(deixada de lado)*'));
  assert.ok(semana.includes('## Metas Anteriores'));
  assert.ok(semana.includes('update the deadline on its existing line'), 'prioridade vencida escolhida de novo não fica vencida');
  assert.ok(semana.includes('its deadline is still ahead → that is a real due date: leave the line untouched'), 'um prazo futuro de verdade nunca é trocado');
  assert.ok(semana.includes('Never reword, convert or remove an `[AGUARDANDO]` or `[SEM PRAZO]` line'));
  assert.ok(semana.includes('the coming Friday when today is Saturday, Sunday or Monday; otherwise the Friday of the following week'), 'o prazo das prioridades tem regra exata');
  assert.ok(semana.includes('✏️ Prazo atualizado'), 'a mudança de prazo aparece com antes e depois');
  assert.ok(semana.includes('revisar córtex'), 'o lembrete de revisão saiu do cérebro e mora aqui e no radar');
  assert.ok(!BRAIN.includes('Review reminder'), 'o cérebro não repete mais o lembrete de revisão em toda conversa');
  assert.ok(BRAIN.includes('`semana` re-dating an overdue priority'), 'a política de escrita do cérebro cobre essa exceção');
});

test('desfaz vale para a operação inteira, e atualizações no lugar mostram antes e depois', () => {
  const reg = skill('registrar');
  assert.ok(/undoes the last \*\*operation\*\*/.test(reg));
  assert.ok(reg.includes('"fechar a semana"') && reg.includes('"anota a reunião"'));
  assert.ok(/In-place updates.*always shows `✏️ Antes: \.\.\. → Agora: \.\.\.`/s.test(reg));
  assert.ok(BRAIN.includes("`registrar`'s in-place updates"), 'a política de escrita do cérebro abre a exceção');
  assert.ok(skill('semana').includes('One undo for the whole close'));
  assert.ok(reg.includes('A batch only adds new lines'), 'anotar uma reunião não reescreve projeto nem cria seção');
  assert.ok(reg.includes('never overwrite or retag a line from another quarter'), 'meta de trimestre novo é linha nova');
});

// ── Consolidar ────────────────────────────────────────────────────

test('consolidar guarda o texto original antes de fundir e confere o próprio trabalho', () => {
  const c = skill('consolidar');
  assert.ok(c.includes('## Fundidas em [YYYY-MM-DD]'));
  assert.ok(/word for word/.test(c));
  assert.ok(/are NOT duplicates/.test(c), 'número, nome ou condição diferente não é duplicata');
  assert.ok(/Check your own work/.test(c));
  assert.ok(c.includes('older than **60 days**'), 'pendências resolvidas saem do arquivo lido todo dia depois de 60 dias');
  assert.ok(c.includes('never use a leftover `[DEADLINE …]` date'), 'linha resolvida sem data não tem idade inventada');
  assert.ok(c.includes('A decision that is still in force is never archived'));
  const protocol = read('.agents/cortex/PROTOCOLO_MEMORIA.md');
  assert.ok(protocol.includes('## Fundidas em [data]'));
  assert.ok(protocol.includes('A decision that is still in force is never archived by age'), 'o protocolo e o radar concordam sobre o que é arquivável');
});

// ── Montagem ──────────────────────────────────────────────────────

test('montagem rápida: a 4ª pergunta colhe a semana, e o primeiro radar nasce com conteúdo', () => {
  const o = skill('cortex-onboarding');
  assert.ok(o.includes('não podem cair no esquecimento esta semana'));
  assert.ok(o.includes("show the user's first `radar` right there"));
  assert.ok(/This does NOT apply to the quick path/.test(o), 'as regras de bloco não valem para o caminho rápido');
  assert.ok(o.includes('propose the 4 Quickstart answers already filled in'), 'quem aponta arquivos continua nos 5 minutos');
  assert.ok(!o.includes('ctx_edit') && !o.includes('write_to_file'), 'nome de ferramenta de um ambiente específico não entra na skill');
  assert.ok(!o.includes('`./agents/skills/'), 'caminho que não existe');
  assert.ok(o.includes('never `[SEM PRAZO]` here'), 'os itens da 4ª pergunta ganham data, para aparecerem pelo nome no primeiro radar');
  assert.ok(o.includes('On the quick path do NOT ask'), 'a pergunta das ferramentas não vira a 5ª pergunta');
  assert.ok(o.includes('never deduce values, routines, a tone of voice or a slogan'), 'pilar sem informação recebe REVISAR, não conteúdo inventado');
  assert.ok(o.includes('"Panorama Competitivo" in `01_Estrategia.md`: leave it empty, with no marker'));
});

test('novidades: mostra as mais novas quando a lista é grande e só esconde o item da margem', () => {
  const n = skill('novidades');
  assert.ok(n.includes('show the **last 6** (the newest)'));
  assert.ok(n.includes('drop only the item whose phrase is `descobrir minha margem`'));
});

// ── Saúde ─────────────────────────────────────────────────────────

test('saúde e doctor dizem o que falta em blocos, não em porcentagem', () => {
  assert.ok(!skill('saude').includes('Completude estimada'));
  assert.ok(skill('saude').includes('never as a percentage'));
  const strategy = '# Estratégia\n\n## Posicionamento\nTexto.\n\n## Panorama Competitivo\n<!-- em branco de propósito -->\n';
  assert.equal(cli.countRevisarAndBlanks(strategy).blankSections, 0, '"Panorama Competitivo" em branco não é pendência');
  assert.equal(cli.countRevisarAndBlanks('## Tom de Voz\n<!-- vazio -->\n').blankSections, 1);

  // Um REVISAR deixado ali pela montagem rápida também não conta: nenhuma pergunta do onboarding o resolveria.
  const marked = '# Estratégia\n\n## Posicionamento\nTexto. <!-- REVISAR -->\n\n## Panorama Competitivo (2026)\n<!-- REVISAR -->\n\n## Objetivos\n<!-- REVISAR -->\n';
  const counted = cli.countRevisarAndBlanks(marked.replace(/\n/g, '\r\n'));
  assert.equal(counted.revisarCount, 2, 'só os marcadores fora do Panorama contam');
  assert.equal(counted.blankSections, 1, 'a seção Objetivos continua contando como em branco');
});
