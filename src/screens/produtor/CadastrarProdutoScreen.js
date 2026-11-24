import React from 'react';
import { Alert } from 'react-native';
import FormularioProduto from '../../components/FormularioProduto';
import { useProdutos } from '../../context/ProdutoContext';

export default function CadastrarProdutoScreen({ navigation }) {
  const { cadastrarProduto } = useProdutos();

  async function salvar(dados) {
    await cadastrarProduto(dados);
    Alert.alert('Produto salvo!', `${dados.nome} foi cadastrado.`);
    navigation.goBack();
  }

  return (
    <FormularioProduto
      titulo="Novo Produto"
      subtitulo="Preencha os dados abaixo"
      textoBotao="Salvar produto"
      aoSalvar={salvar}
      aoVoltar={() => navigation.goBack()}
    />
  );
}
