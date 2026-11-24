import React from 'react';
import { Alert } from 'react-native';
import FormularioProduto from '../../components/FormularioProduto';
import { useProdutos } from '../../context/ProdutoContext';

export default function EditarProdutoScreen({ route, navigation }) {
  const { produtos, atualizarProduto, recarregar } = useProdutos();
  // Usa a versão mais recente da lista; o parâmetro da rota pode estar desatualizado.
  const produto = produtos.find((p) => p.id === route.params.produto.id) || route.params.produto;

  async function salvar(dados) {
    try {
      await atualizarProduto(produto.id, dados);
    } catch (erro) {
      // Estoque mudou por causa de pedidos: busca o valor novo para a próxima tentativa.
      if (erro.status === 409) recarregar();
      throw erro;
    }
    Alert.alert('Produto salvo!', `${dados.nome} foi atualizado.`);
    navigation.goBack();
  }

  return (
    <FormularioProduto
      titulo="Editar Produto"
      subtitulo={produto.nome}
      textoBotao="Salvar alterações"
      valoresIniciais={produto}
      aoSalvar={salvar}
      aoVoltar={() => navigation.goBack()}
    />
  );
}
