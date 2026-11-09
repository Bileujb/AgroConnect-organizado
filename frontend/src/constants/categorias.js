// Visual de cada categoria de produto: emoji e cor de fundo.
// Usado no lugar da foto quando o produto ainda não tem imagem.
export const VISUAL_CATEGORIA = {
  Verduras: { icone: '🥬', fundo: '#E3F2E1' }, // verde-claro
  Legumes: { icone: '🥕', fundo: '#FDEBDD' }, // laranja-claro
  Frutas: { icone: '🍎', fundo: '#FCE4E4' }, // vermelho-claro
  Derivados: { icone: '🍯', fundo: '#FBF0D5' }, // amarelo-claro
};

// Para uma categoria que não está na lista acima.
const VISUAL_PADRAO = { icone: '🌿', fundo: '#E8F3EC' };

// Devolve o emoji e a cor da categoria. Ex.: visualDaCategoria('Frutas') → { icone: '🍎', fundo: '#FCE4E4' }
export function visualDaCategoria(categoria) {
  return VISUAL_CATEGORIA[categoria] || VISUAL_PADRAO;
}
