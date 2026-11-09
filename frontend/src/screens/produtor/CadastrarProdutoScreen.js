import React from 'react';
import { Alert } from 'react-native';
import FormularioProduto from '../../components/FormularioProduto';
import { useProdutos } from '../../context/ProdutoContext';

// Tela de cadastro de produto. O formulário e a validação ficam no FormularioProduto;
// aqui só dizemos o título e o que fazer com os dados ao salvar.
export default function CadastrarProdutoScreen({ navigation }) {
  const { cadastrarProduto } = useProdutos();

  async function salvar(dados) {
    await cadastrarProduto(dados);
    Alert.alert('Produto cadastrado!', `${dados.nome} já aparece no catálogo.`);
    navigation.goBack();
  }

  return (
    <FormularioProduto
      titulo="Novo produto"
      subtitulo="Preencha os dados abaixo"
      textoBotao="Cadastrar produto"
      aoSalvar={salvar}
      aoVoltar={() => navigation.goBack()}
    />
  );
}
