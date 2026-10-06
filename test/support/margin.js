// Implementação de referência das fórmulas do Guardião de Margem
// (.agents/cortex/PROTOCOLO_AUTONOMIA.md, modo 2).
//
// Não é usada pelo CLI: quem faz a conta de verdade é a IA, seguindo o
// protocolo. Este arquivo existe para que os exemplos numéricos escritos no
// protocolo, no README e no Córtex de exemplo sejam conferidos por teste. Sem
// isso, o exemplo oficial ensinou "custo + 35%" (a conta errada) sem ninguém notar.

// Do preço para a margem.
function marginFromPrice({ price, discountPct = 0, variableCost, variableCostPct, taxPct = 0, feesPct = 0 }) {
  const netPrice = price * (1 - discountPct / 100);
  const itemCost = variableCost !== undefined && variableCost !== null
    ? variableCost
    : price * ((variableCostPct || 0) / 100);
  const realCost = itemCost + netPrice * ((taxPct + feesPct) / 100);
  return { netPrice, realCost, marginPct: ((netPrice - realCost) / netPrice) * 100 };
}

// Do custo para o preço. Devolve null quando imposto + taxas + margem chegam a
// 100%: aí não existe preço que feche a conta.
function priceForMargin({ variableCost, taxPct = 0, feesPct = 0, marginPct }) {
  const share = 1 - (taxPct + feesPct + marginPct) / 100;
  return share > 0 ? variableCost / share : null;
}

// Ordem de checagem do protocolo: para na primeira que falha.
function verdict({ netPrice, discountPct = 0, marginPct }, rules) {
  const { preco_piso, desconto_max, margem_minima, margem_alvo } = rules || {};
  if (preco_piso != null && netPrice < preco_piso) return 'piso';
  if (desconto_max != null && discountPct > desconto_max) return 'desconto';
  if (margem_minima != null && marginPct < margem_minima) return 'margem-minima';
  if (margem_alvo != null && marginPct < margem_alvo) return 'ressalva';
  return 'aprovar';
}

// A contraproposta é o maior entre: o preço com o desconto máximo, o piso e o
// preço mínimo — assim ela mesma passa nas checagens 1 a 3. Devolve null quando
// esse número não fica abaixo do preço cheio: não há espaço para desconto.
function counterOffer({ price, variableCost, taxPct = 0, feesPct = 0 }, rules) {
  const { preco_piso, desconto_max, margem_minima } = rules || {};
  const candidates = [];
  if (desconto_max != null) candidates.push(price * (1 - desconto_max / 100));
  if (preco_piso != null) candidates.push(preco_piso);
  if (margem_minima != null && variableCost != null) {
    const minimum = priceForMargin({ variableCost, taxPct, feesPct, marginPct: margem_minima });
    if (minimum === null) return null;
    candidates.push(minimum);
  }
  if (candidates.length === 0) return null;
  const offer = Math.max(...candidates);
  return offer < price ? offer : null;
}

module.exports = { marginFromPrice, priceForMargin, verdict, counterOffer };
