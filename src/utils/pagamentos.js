// Formas de pagamento (mesmos valores aceitos pela API). O pagamento é simulado.
export const FORMAS_PAGAMENTO = [
  { valor: 'pix', icone: '💠', titulo: 'Pix', descricao: 'Aprovação na hora' },
  { valor: 'cartao', icone: '💳', titulo: 'Cartão de crédito', descricao: 'Aprovação na hora' },
  { valor: 'entrega', icone: '💵', titulo: 'Pagar na entrega', descricao: 'Dinheiro ou Pix ao receber' },
];

export function descreverPagamento(pedido) {
  const forma = FORMAS_PAGAMENTO.find((f) => f.valor === pedido?.formaPagamento) || FORMAS_PAGAMENTO[2];
  if (forma.valor === 'entrega') return { icone: forma.icone, texto: 'Pagar na entrega', pago: false };
  if (pedido?.status === 'cancelado') return { icone: forma.icone, texto: `${forma.titulo} · estornado`, pago: false };
  return { icone: forma.icone, texto: `${forma.titulo} · pago`, pago: true };
}
