import React, { useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MenuConta from '../../components/MenuConta';
import { precoPorUnidade, quantidadeComUnidade } from '../../utils/unidades';
import EstadoLista from '../../components/EstadoLista';
import BotaoPrimario from '../../components/BotaoPrimario';
import { useAuth } from '../../context/AuthContext';
import { useProdutos } from '../../context/ProdutoContext';

export default function HomeProdutorScreen({ navigation }) {
  const { usuario } = useAuth();
  const insets = useSafeAreaInsets();
  const { produtosDoProdutor, removerProduto, carregando, erro, recarregar } = useProdutos();

  const meusProdutos = produtosDoProdutor(usuario?.id);

  function confirmarExclusao(produto) {
    Alert.alert(
      'Excluir produto',
      `Tem certeza que deseja excluir "${produto.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: async () => { try { await removerProduto(produto.id); } catch (erro) { Alert.alert('Não foi possível excluir', erro.message); } } },
      ]
    );
  }

  useFocusEffect(useCallback(() => { recarregar(); }, [recarregar]));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.cabecalho}>
        <View style={{ flex: 1 }}>
          <Text style={styles.saudacao} numberOfLines={1}>
            Olá, {usuario?.nome?.split(' ')[0] || 'Produtor'} 👋
          </Text>
          <Text style={styles.subSaudacao}>Gerencie seus produtos e pedidos</Text>
        </View>
        <MenuConta
          navigation={navigation}
          itensExtras={[
            { icone: '📦', rotulo: 'Meus pedidos recebidos', onPress: () => navigation.navigate('PedidosProdutor') },
          ]}
        />
      </View>

      <EstadoLista carregando={carregando} erro={erro} recarregar={recarregar} />
      <View style={styles.cardMetrica}>
        <Text style={styles.metricaValor}>{meusProdutos.length}</Text>
        <Text style={styles.metricaLabel}>Produtos cadastrados</Text>
      </View>

      <View style={{ paddingHorizontal: 20 }}>
        <BotaoPrimario
          titulo="+ Cadastrar Produto"
          onPress={() => navigation.navigate('CadastrarProduto')}
        />
      </View>

      <FlatList
        style={{ marginTop: 20 }}
        refreshing={carregando} onRefresh={recarregar}
        data={meusProdutos}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          meusProdutos.length > 0 ? <Text style={styles.subtitulo}>Meus produtos</Text> : null
        }
        renderItem={({ item }) => (
          <View style={styles.itemProduto}>
            <View style={styles.itemLinha}>
              <Text style={styles.itemNome} numberOfLines={1}>{item.nome}</Text>
              <Text style={styles.itemPreco}>{precoPorUnidade(item.preco, item.unidade)}</Text>
            </View>
            <View style={styles.itemLinha}>
              <Text style={styles.itemCategoria}>{item.categoria}</Text>
              <Text style={styles.itemEstoque}>
                Disponível: {quantidadeComUnidade(item.quantidadeEstoque, item.unidade)}
              </Text>
            </View>
            <View style={styles.itemAcoes}>
              <Pressable
                style={({ pressed }) => [styles.botaoAcao, styles.botaoEditar, pressed && { opacity: 0.7 }]}
                onPress={() => navigation.navigate('EditarProduto', { produto: item })}
              >
                <Text style={styles.editar}>✏️  Editar</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.botaoAcao, styles.botaoExcluir, pressed && { opacity: 0.7 }]}
                onPress={() => confirmarExclusao(item)}
              >
                <Text style={styles.excluir}>🗑️  Excluir</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.vazio}>Nenhum produto cadastrado ainda. Toque em "Cadastrar Produto" acima.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4FAF6' },
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  saudacao: { fontSize: 20, fontWeight: '800', color: '#1F5E3D' },
  subSaudacao: { fontSize: 13, color: '#6A7A6F', marginTop: 2 },
  cardMetrica: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E3E9E5',
    marginBottom: 16,
  },
  metricaValor: { fontSize: 28, fontWeight: '800', color: '#2E8B57' },
  metricaLabel: { fontSize: 13, color: '#4A4A4A', marginTop: 4 },
  subtitulo: { fontSize: 16, fontWeight: '700', color: '#1F5E3D', paddingHorizontal: 20, marginBottom: 8 },
  itemProduto: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E3E9E5',
    gap: 4,
  },
  itemLinha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  itemNome: { flex: 1, fontSize: 16, fontWeight: '700', color: '#1F1F1F' },
  itemCategoria: { fontSize: 13, color: '#666666' },
  itemPreco: { fontSize: 15, fontWeight: '800', color: '#2E8B57' },
  itemEstoque: { fontSize: 13, color: '#666666' },
  itemAcoes: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEF2EF',
  },
  botaoAcao: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  botaoEditar: { backgroundColor: '#EAF3EC', borderColor: '#CFE3D6' },
  botaoExcluir: { backgroundColor: '#FDF0F0', borderColor: '#F1CFCF' },
  editar: { color: '#1F5E3D', fontSize: 14, fontWeight: '700' },
  excluir: { color: '#B23A3A', fontSize: 14, fontWeight: '700' },
  vazio: { textAlign: 'center', color: '#888888', marginTop: 40, paddingHorizontal: 40 },
});