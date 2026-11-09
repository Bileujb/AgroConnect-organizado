import React from 'react';
import { Alert } from 'react-native';
import FormularioProduto from '../../components/FormularioProduto';
import { useProdutos } from '../../context/ProdutoContext';

// Tela de edição de produto. Usa o mesmo formulário do cadastro,
// já preenchido com os dados do produto escolhido.
export default function EditarProdutoScreen({ route, navigation }) {
  const { produto } = route.params;
  const { atualizarProduto } = useProdutos();

  async function salvar(dados) {
    await atualizarProduto(produto.id, dados);
    Alert.alert('Alterações salvas!', `${dados.nome} foi atualizado.`);
    navigation.goBack();
  }

  return (
    <FormularioProduto
      titulo="Editar produto"
      subtitulo={produto.nome}
      produtoInicial={produto}
      textoBotao="Salvar alterações"
      aoSalvar={salvar}
      aoVoltar={() => navigation.goBack()}
    />
  );
}
