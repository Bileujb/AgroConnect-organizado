// Unidades de venda aceitas pela API (mesmos valores do check no banco).
export const UNIDADES = [
  { valor: 'kg', singular: 'kg', plural: 'kg' },
  { valor: 'unidade', singular: 'unidade', plural: 'unidades' },
  { valor: 'maco', singular: 'maço', plural: 'maços' },
  { valor: 'duzia', singular: 'dúzia', plural: 'dúzias' },
  { valor: 'bandeja', singular: 'bandeja', plural: 'bandejas' },
  { valor: 'litro', singular: 'litro', plural: 'litros' },
  { valor: 'pacote', singular: 'pacote', plural: 'pacotes' },
];

const PADRAO = UNIDADES[1];

function buscar(valor) {
  return UNIDADES.find((u) => u.valor === valor) || PADRAO;
}

// "R$ 8,00"
export function formatarPreco(valor) {
  return `R$ ${Number(valor || 0).toFixed(2).replace('.', ',')}`;
}

// "R$ 8,00 / kg"
export function precoPorUnidade(preco, unidade) {
  return `${formatarPreco(preco)} / ${buscar(unidade).singular}`;
}

// "20 kg", "1 maço", "3 dúzias"
export function quantidadeComUnidade(quantidade, unidade) {
  const u = buscar(unidade);
  return `${quantidade} ${quantidade === 1 ? u.singular : u.plural}`;
}

export function nomeUnidade(unidade) {
  return buscar(unidade).singular;
}
