// Regras do carrinho. São funções "puras": recebem a lista atual e devolvem uma lista NOVA,
// sem mexer na antiga. Assim dá para testar sem abrir o app.

// Adiciona um produto ao carrinho. Se ele já estiver lá, soma a quantidade.
export function adicionarAoCarrinho(itens, produto, quantidade = 1) {
  if (!Number.isInteger(quantidade) || quantidade < 1) {
    throw new Error('Quantidade inválida.');
  }

  const existente = itens.find((item) => item.produtoId === produto.id);
  const total = (existente?.quantidade || 0) + quantidade;
  if (total > produto.quantidadeEstoque) {
    throw new Error('A quantidade excede o estoque disponível.');
  }

  // Dados do produto que o carrinho guarda. O estoque serve para limitar o botão "+".
  const dadosDoProduto = {
    precoUnitario: produto.preco,
    estoque: produto.quantidadeEstoque,
    categoria: produto.categoria,
  };

  if (existente) {
    return itens.map((item) =>
      item.produtoId === produto.id ? { ...item, ...dadosDoProduto, quantidade: total } : item
    );
  }

  return [
    ...itens,
    {
      produtoId: produto.id,
      produtorId: produto.produtorId,
      nome: produto.nome,
      ...dadosDoProduto,
      quantidade,
    },
  ];
}

// Muda a quantidade de um item que já está no carrinho (botões − e +).
// Quantidade menor que 1 tira o item do carrinho.
export function alterarQuantidade(itens, produtoId, novaQuantidade) {
  if (!Number.isInteger(novaQuantidade)) {
    throw new Error('Quantidade inválida.');
  }
  if (novaQuantidade < 1) {
    return itens.filter((item) => item.produtoId !== produtoId);
  }

  const item = itens.find((i) => i.produtoId === produtoId);
  if (!item) return itens;
  if (item.estoque != null && novaQuantidade > item.estoque) {
    throw new Error(`Só há ${item.estoque} unidade(s) de ${item.nome} em estoque.`);
  }

  return itens.map((i) => (i.produtoId === produtoId ? { ...i, quantidade: novaQuantidade } : i));
}
