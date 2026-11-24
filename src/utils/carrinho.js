export function adicionarAoCarrinho(itens, produto, quantidade = 1) {
  if (!Number.isInteger(quantidade) || quantidade < 1) throw new Error('Quantidade inválida.');
  const existente = itens.find((i) => i.produtoId === produto.id);
  const total = (existente?.quantidade || 0) + quantidade;
  if (total > produto.quantidadeEstoque) throw new Error('A quantidade excede o estoque disponível.');
  if (existente) return itens.map((i) => i.produtoId === produto.id ? { ...i, quantidade: total, precoUnitario: produto.preco } : i);
  return [...itens, { produtoId: produto.id, produtorId: produto.produtorId, nome: produto.nome,
    precoUnitario: produto.preco, quantidade, unidade: produto.unidade || 'unidade' }];
}

// Cada conta tem seu próprio carrinho salvo, então outra pessoa no mesmo celular não vê os itens.
export function chaveCarrinho(usuarioId) {
  return `agroconnect.carrinho.${usuarioId}`;
}

function itemValido(item) {
  return item !== null && typeof item === 'object'
    && typeof item.produtoId === 'string' && item.produtoId !== ''
    && typeof item.produtorId === 'string'
    && typeof item.nome === 'string'
    && typeof item.precoUnitario === 'number' && Number.isFinite(item.precoUnitario) && item.precoUnitario > 0
    && Number.isInteger(item.quantidade) && item.quantidade >= 1;
}

// Converte o texto salvo no aparelho de volta em itens.
// Dado ausente, corrompido ou de uma versão antiga vira carrinho vazio em vez de travar o app.
export function lerCarrinhoSalvo(texto) {
  if (!texto) return [];
  let dados;
  try { dados = JSON.parse(texto); } catch { return []; }
  if (!Array.isArray(dados)) return [];
  return dados.filter(itemValido).map((i) => ({ produtoId: i.produtoId, produtorId: i.produtorId,
    nome: i.nome, precoUnitario: i.precoUnitario, quantidade: i.quantidade,
    unidade: typeof i.unidade === 'string' ? i.unidade : 'unidade' }));
}
