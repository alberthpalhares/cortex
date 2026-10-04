const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

const PROTOCOLO = '.agents/skills/cortex-onboarding/templates/Frameworks/PROTOCOLO_AUTONOMIA.md';

test('Guardião de Margem: tem fórmula, ordem de checagem e caminho de orientação para quem não sabe', () => {
  const p = read(PROTOCOLO);
  assert.ok(p.includes('margin% = (net price − real cost) ÷ net price × 100'), 'a fórmula precisa estar escrita');
  assert.ok(p.includes('preco_piso') && p.includes('desconto_max') && p.includes('margem_minima'), 'precisa checar piso, desconto e margem mínima');
  assert.ok(p.includes('descobrir minha margem'), 'precisa ter o modo guiado');
  assert.ok(/never refuse and never guess/i.test(p), 'o princípio "nunca recusa, nunca chuta" precisa estar explícito');
  assert.ok(/never suggest a "market standard"/i.test(p), 'não pode sugerir margem "de mercado"');
});

test('Guardião de Margem: o cérebro manda ler o protocolo e a skill ajuda divulga o caminho guiado', () => {
  assert.ok(read('.agents/cortex/brain.framework.md').includes('descobrir minha margem'));
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
});

test('analisador-dre não compara com "médias de mercado"', () => {
  const s = read('.agents/skills/analisador-dre/SKILL.md');
  assert.ok(!/common-sense benchmarks/i.test(s));
  assert.ok(s.includes('do not compare against "market"'));
});
