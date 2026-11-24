import React from 'react';
import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BotaoPrimario from '../../components/BotaoPrimario';
import { useCart } from '../../context/CartContext';
import { formatarPreco, quantidadeComUnidade } from '../../utils/unidades';

export default function CarrinhoScreen({ navigation }) {
  const { itens, removerItem, valorTotal } = useCart();
  const insets = useSafeAreaInsets();

  function renderItem({ item }) {
    return (
      <View style={styles.card}>
        <View style={styles.cardIcone}>
          <Text style={{ fontSize: 22 }}>🌿</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemNome} numberOfLines={1}>{item.nome}</Text>
          <Text style={styles.itemQuantidade}>
            {quantidadeComUnidade(item.quantidade, item.unidade)} × {formatarPreco(item.precoUnitario)}
          </Text>
          <Text style={styles.itemValor}>{formatarPreco(item.quantidade * item.precoUnitario)}</Text>
        </View>
        <Pressable
          onPress={() => removerItem(item.produtoId)}
          style={styles.botaoRemover}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Remover ${item.nome}`}
        >
          <Text style={styles.botaoRemoverTexto}>✕</Text>
        </Pressable>
      </View>
    );
  }

  if (itens.length === 0) {
    return (
      <View style={[styles.container, styles.vazioCaixa]}>
        <Text style={styles.vazioIcone}>🛒</Text>
        <Text style={styles.vazioTitulo}>Seu carrinho está vazio</Text>
        <Text style={styles.vazioTexto}>Escolha produtos fresquinhos direto do produtor.</Text>
        <View style={{ alignSelf: 'stretch', marginTop: 16 }}>
          <BotaoPrimario titulo="Ver produtos" onPress={() => navigation.navigate('Catalogo')} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={itens}
        keyExtractor={(item) => item.produtoId}
        contentContainerStyle={styles.lista}
        renderItem={renderItem}
        ListHeaderComponent={
          <Text style={styles.contagem}>
            {itens.length} {itens.length === 1 ? 'produto' : 'produtos'} no carrinho
          </Text>
        }
      />

      <View style={[styles.rodape, { paddingBottom: 12 + insets.bottom }]}>
        <View style={styles.totalLinha}>
          <Text style={styles.totalRotulo}>Total estimado</Text>
          <Text style={styles.totalValor}>{formatarPreco(valorTotal)}</Text>
        </View>
        <Text style={styles.aviso}>Pedidos de produtores diferentes são enviados separadamente.</Text>
        <BotaoPrimario titulo="Ir para pagamento" onPress={() => navigation.navigate('Pagamento')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4FAF6' },
  lista: { padding: 16, paddingBottom: 24 },
  contagem: { fontSize: 13, color: '#6A7A6F', marginBottom: 10, marginLeft: 4 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E3E9E5',
  },
  cardIcone: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#EAF3EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemNome: { fontSize: 15, fontWeight: '700', color: '#1F1F1F' },
  itemQuantidade: { fontSize: 13, color: '#6A7A6F', marginTop: 2 },
  itemValor: { fontSize: 15, fontWeight: '800', color: '#2E8B57', marginTop: 4 },
  botaoRemover: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FDE8E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoRemoverTexto: { color: '#B3261E', fontSize: 14, fontWeight: '800' },
  rodape: {
    paddingHorizontal: 16,
    paddingTop: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E3E9E5',
  },
  totalLinha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  totalRotulo: { fontSize: 15, fontWeight: '700', color: '#4A4A4A' },
  totalValor: { fontSize: 22, fontWeight: '800', color: '#1F5E3D' },
  aviso: { fontSize: 12, color: '#6A7A6F', marginTop: 4, marginBottom: 12 },
  vazioCaixa: { alignItems: 'center', justifyContent: 'center', padding: 32, gap: 6 },
  vazioIcone: { fontSize: 52 },
  vazioTitulo: { fontSize: 18, fontWeight: '800', color: '#1F5E3D' },
  vazioTexto: { fontSize: 14, color: '#6A7A6F', textAlign: 'center' },
});
