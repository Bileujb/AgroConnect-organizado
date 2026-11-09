// Formata um número como dinheiro brasileiro.
// Exemplo: formatarPreco(5) → "R$ 5,00" | formatarPreco(1234.5) → "R$ 1.234,50"
export function formatarPreco(valor) {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return 'R$ 0,00';
  return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
