const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { marginFromPrice, priceForMargin, verdict, counterOffer } = require('../support/margin');

const ROOT = path.join(__dirname, '..', '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const near = (actual, expected, msg) => assert.ok(Math.abs(actual - expected) < 0.01, `${msg}: esperava ${expected}, veio ${actual}`);

const PROTOCOLO = '.agents/cortex/PROTOCOLO_AUTONOMIA.md';

// Números do Córtex de exemplo (examples/estudio-lumen/Pilares/03 e 04).
const LUMEN = { taxPct: 6, feesPct: 3 };
const LUMEN_RULES = { preco_piso: 700, desconto_max: 10, margem_minima: 20, margem_alvo: 35 };

test('Guardião de Margem: tem fórmula, ordem de checagem e caminho de orientação para quem não sabe', () => {
  const p = read(PROTOCOLO);
  assert.ok(p.includes('margin% = (net price − real cost) ÷ net price × 100'), 'a fórmula precisa estar escrita');
  assert.ok(p.includes('preco_piso') && p.includes('desconto_max') && p.includes('margem_minima'), 'precisa checar piso, desconto e margem mínima');
  assert.ok(p.includes('descobrir minha margem'), 'precisa ter o modo guiado');
  assert.ok(/always answer and never guess/i.test(p), 'o princípio "sempre responde, nunca chuta" precisa estar explícito');
  assert.ok(/never suggest a "market standard"/i.test(p), 'não pode sugerir margem "de mercado"');
});

test('Guardião de Margem: tem a conta de volta (do custo para o preço) e proíbe o acréscimo sobre o custo', () => {
  const p = read(PROTOCOLO);
  assert.ok(p.includes('minimum price = item variable cost ÷ (1 − (`imposto_pct` + `taxas_pct` + `margem_minima`) ÷ 100)'));
  assert.ok(p.includes('target price = item variable cost ÷ (1 − (`imposto_pct` + `taxas_pct` + `margem_alvo`) ÷ 100)'));
  assert.ok(/never price as cost × \(1 \+ margin\)/i.test(p), 'precisa dizer que custo × (1 + margem) é a conta errada');
  assert.ok(p.includes('quanto cobrar por'), 'precisa ter o formato de resposta para "quanto cobrar"');
  assert.ok(/accountant/i.test(p), 'precisa deixar imposto e regime tributário com o contador');
});

test('a conta de volta fecha: o preço sugerido devolve exatamente a margem prometida', () => {
  for (const marginPct of [20, 35, 50]) {
    const price = priceForMargin({ variableCost: 1000, ...LUMEN, marginPct });
    near(marginFromPrice({ price, variableCost: 1000, ...LUMEN }).marginPct, marginPct, `margem de ${marginPct}%`);
  }
  assert.equal(priceForMargin({ variableCost: 1000, taxPct: 40, feesPct: 30, marginPct: 30 }), null, 'imposto + taxas + margem = 100%: não existe preço');
});

test('o exemplo do protocolo confere: custo de R$ 1.000 com 35% de margem custa R$ 1.785,71, não R$ 1.350', () => {
  near(priceForMargin({ variableCost: 1000, ...LUMEN, marginPct: 35 }), 1785.71, 'preço-alvo');
  near(priceForMargin({ variableCost: 1000, ...LUMEN, marginPct: 20 }), 1408.45, 'preço mínimo');
  // Somar 35% ao custo (acréscimo) deixa bem menos que 35% de margem.
  near(marginFromPrice({ price: 1350, variableCost: 1000, ...LUMEN }).marginPct, 16.93, 'margem do acréscimo');

  const p = read(PROTOCOLO);
  assert.ok(p.includes('R$ 1.785,71') && p.includes('R$ 1.350'), 'o protocolo cita os dois números');
  const comercial = read('examples/estudio-lumen/Pilares/04_Comercial.md');
  assert.ok(comercial.includes('R$ 1.785,71'), 'o exemplo ensina a conta certa');
  assert.ok(!/somando custo direto[^.]*\+ margem-alvo de 35%/.test(comercial), 'o exemplo não pode voltar a ensinar "custo + 35%"');
});

test('os exemplos do README conferem com os números do Estúdio Lumen e com a ordem do protocolo', () => {
  // "posso dar 15% de desconto na cobertura de evento?" — R$ 2.500, custo direto de R$ 350.
  const m = marginFromPrice({ price: 2500, discountPct: 15, variableCost: 350, ...LUMEN });
  near(m.netPrice, 2125, 'preço com desconto');
  near(m.realCost, 541.25, 'custo real');
  near(m.marginPct, 74.53, 'margem');
  assert.equal(verdict({ ...m, discountPct: 15 }, LUMEN_RULES), 'desconto', 'passa do desconto máximo: contraproposta');
  assert.equal(2500 * (1 - LUMEN_RULES.desconto_max / 100), 2250);

  const readme = read('README.md');
  for (const figure of ['R$ 541,25', '74,5%', 'R$ 2.250', 'R$ 1.408,45', 'R$ 1.785,71']) {
    assert.ok(readme.includes(figure), `o README deveria citar ${figure}`);
  }
  assert.ok(readme.includes('Veredito: Contraproposta'), 'o veredito do README segue a ordem de checagem');
});

test('ordem de checagem: piso, depois desconto, depois margem mínima, depois margem-alvo', () => {
  // Ensaio de R$ 800 com 15% de desconto cai abaixo do piso de R$ 700: para ali, antes de olhar o desconto.
  const ensaio = marginFromPrice({ price: 800, discountPct: 15, variableCost: 150, ...LUMEN });
  assert.equal(verdict({ ...ensaio, discountPct: 15 }, LUMEN_RULES), 'piso');
  assert.equal(verdict({ netPrice: 1000, discountPct: 5, marginPct: 15 }, LUMEN_RULES), 'margem-minima');
  assert.equal(verdict({ netPrice: 1000, discountPct: 5, marginPct: 25 }, LUMEN_RULES), 'ressalva');
  assert.equal(verdict({ netPrice: 1000, discountPct: 5, marginPct: 40 }, LUMEN_RULES), 'aprovar');
  assert.equal(verdict({ netPrice: 1000, discountPct: 50, marginPct: 5 }, {}), 'aprovar', 'sem regras definidas, nada é reprovado por conta própria');

  // A mesma ordem tem de estar escrita no protocolo: é ele que a IA segue.
  const p = read(PROTOCOLO);
  const order = [
    '1. net price below `preco_piso` → **Recusar**, or **Contraproposta**',
    '2. discount above `desconto_max` → **Contraproposta**',
    '3. margin below `margem_minima` → **Recusar**, or **Contraproposta**',
    '4. margin below `margem_alvo` → **Aprovar com ressalva**',
    '5. otherwise → **Aprovar**',
  ];
  let last = -1;
  for (const line of order) {
    const at = p.indexOf(line);
    assert.ok(at > last, `o protocolo deveria trazer, nesta ordem: "${line}"`);
    last = at;
  }
  assert.ok(p.includes('stop at the first failure'));
  assert.ok(p.includes('Check before answering'), 'a autoconferência do preço sugerido');
});

test('a contraproposta respeita as três regras de uma vez: desconto máximo, piso e margem mínima', () => {
  const p = read(PROTOCOLO);
  assert.ok(p.includes('The counter-offer is always a price in R$'));
  assert.ok(p.includes('it must itself pass checks 1 to 3'));

  const passes = (price, offer, variableCost) => {
    const discountPct = (1 - offer / price) * 100;
    const m = marginFromPrice({ price, discountPct, variableCost, ...LUMEN });
    return verdict({ ...m, discountPct: Math.round(discountPct * 100) / 100 }, { ...LUMEN_RULES, margem_alvo: null });
  };

  // README: cobertura de evento, R$ 2.500 — o desconto máximo é o que manda.
  near(counterOffer({ price: 2500, variableCost: 350, ...LUMEN }, LUMEN_RULES), 2250, 'cobertura de evento');
  assert.equal(passes(2500, 2250, 350), 'aprovar');

  // Ensaio de R$ 800 com 15% cai abaixo do piso. Voltar "ao piso" (R$ 700) seria
  // 12,5% de desconto, acima do máximo: a contraproposta certa é R$ 720.
  near(counterOffer({ price: 800, variableCost: 150, ...LUMEN }, LUMEN_RULES), 720, 'ensaio corporativo');
  assert.equal(passes(800, 720, 150), 'aprovar');
  assert.equal(passes(800, 700, 150), 'desconto', 'o piso sozinho quebraria a regra do desconto');

  // Custo alto: o desconto máximo (R$ 900) deixaria 13% de margem; manda a margem mínima.
  const tight = { price: 1000, variableCost: 700, ...LUMEN };
  near(counterOffer(tight, { preco_piso: 600, desconto_max: 10, margem_minima: 20 }), 985.92, 'custo alto');
  near(marginFromPrice({ ...tight, discountPct: 10 }).marginPct, 13.22, 'margem no desconto máximo');

  // Sem espaço: o preço mínimo já passa do preço cheio.
  assert.equal(counterOffer({ price: 1000, variableCost: 800, ...LUMEN }, { desconto_max: 10, margem_minima: 20 }), null);
});

test('Guardião de Margem: o cérebro manda ler o protocolo e a skill ajuda divulga o caminho guiado', () => {
  const brain = read('.agents/cortex/brain.framework.md');
  assert.ok(brain.includes('descobrir minha margem'));
  assert.ok(brain.includes(PROTOCOLO), 'o cérebro aponta para o protocolo que vem com o framework');
  assert.ok(read('.agents/skills/ajuda/SKILL.md').includes('descobrir minha margem'));
});

test('Onboarding pergunta margem-alvo/mínima e orienta quem não sabe, sem inventar número', () => {
  const o = read('.agents/skills/cortex-onboarding/SKILL.md');
  assert.ok(o.includes('margem_alvo') && o.includes('margem_minima'));
  assert.ok(o.includes('descobrir minha margem'), 'deixa o caminho para depois');
  assert.ok(o.includes('imposto_pct') && o.includes('taxas_pct'));
});

test('proposta-comercial confere a margem antes de salvar, sem bloquear quando faltam dados', () => {
  const s = read('.agents/skills/proposta-comercial/SKILL.md');
  assert.ok(s.includes('Margin check BEFORE saving'));
  assert.ok(s.includes('do not block and do not guess'));
  assert.ok(s.includes(PROTOCOLO));
});

test('analisador-dre não compara com "médias de mercado"', () => {
  const s = read('.agents/skills/analisador-dre/SKILL.md');
  assert.ok(!/common-sense benchmarks/i.test(s));
  assert.ok(s.includes('do not compare against "market"'));
});
