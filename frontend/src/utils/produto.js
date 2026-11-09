// Funções do formulário de produto, usadas ao cadastrar e ao editar.

// Confere os campos digitados e monta os dados para enviar à API.
// Devolve { erro: 'mensagem' } se algo estiver errado, ou { dados } se estiver tudo certo.
export function validarProduto({ nome, descricao, preco, quantidadeEstoque, categoria, imagem }) {
  // O usuário pode digitar "3,50" ou "3.50": trocamos a vírgula por ponto antes de converter.
  const precoNumero = Number(String(preco).replace(',', '.'));
  const estoqueNumero = Number(quantidadeEstoque);

  if (!nome.trim()) {
    return { erro: 'Informe o nome do produto.' };
  }
  if (!Number.isFinite(precoNumero) || precoNumero <= 0) {
    return { erro: 'Informe um preço válido maior que zero.' };
  }
  if (
    String(quantidadeEstoque).trim() === '' ||
    !Number.isInteger(estoqueNumero) ||
    estoqueNumero < 0
  ) {
    return { erro: 'Informe o estoque: um número inteiro, zero ou maior.' };
  }

  return {
    dados: {
      nome: nome.trim(),
      descricao: descricao.trim(),
      preco: precoNumero,
      quantidadeEstoque: estoqueNumero,
      categoria,
      imagem: imagem.trim() || null, // campo vazio vira "sem imagem"
    },
  };
}

// Converte o preço salvo (3.5) para o formato brasileiro do campo de texto ("3,50").
export function precoParaCampo(preco) {
  if (preco == null) return '';
  return Number(preco).toFixed(2).replace('.', ',');
}
