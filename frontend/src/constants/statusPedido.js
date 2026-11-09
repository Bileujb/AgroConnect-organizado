// Nomes amigáveis dos status de pedido, usados pelas telas do consumidor e do produtor.
// O backend envia o código (ex.: 'em_rota'); a tela mostra o texto (ex.: 'Em rota de entrega').
export const ROTULOS_STATUS = {
  aguardando: 'Aguardando confirmação',
  confirmado: 'Confirmado',
  em_rota: 'Em rota de entrega',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
};

// Se aparecer um status novo que ainda não está na lista, mostra o próprio código.
export function rotuloStatus(status) {
  return ROTULOS_STATUS[status] || status;
}

// Visual da etiqueta de cada status: ícone, cor de fundo e cor do texto.
// Cores diferentes deixam o andamento do pedido claro de relance.
export const VISUAL_STATUS = {
  aguardando: { icone: '⏳', fundo: '#FFF4D6', texto: '#8A5A00' }, // amarelo: falta o produtor agir
  confirmado: { icone: '👍', fundo: '#E3EEFC', texto: '#1F4E8C' }, // azul: aceito
  em_rota: { icone: '🚚', fundo: '#EDE7FB', texto: '#5B3A9E' }, // roxo: a caminho
  entregue: { icone: '✅', fundo: '#E3F2E1', texto: '#1F5E3D' }, // verde: concluído
  cancelado: { icone: '✖️', fundo: '#EEEEEE', texto: '#666666' }, // cinza: encerrado
};

// Para um status que ainda não está na lista acima.
const VISUAL_STATUS_PADRAO = { icone: '•', fundo: '#EEEEEE', texto: '#444444' };

export function visualStatus(status) {
  return VISUAL_STATUS[status] || VISUAL_STATUS_PADRAO;
}
