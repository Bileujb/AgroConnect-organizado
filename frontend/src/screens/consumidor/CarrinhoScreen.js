import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, Pressable } from 'react-native';
import BotaoPrimario from '../../components/BotaoPrimario';
import { useCart } from '../../context/CartContext';
import { usePedidos } from '../../context/PedidoContext';
import { formatarPreco } from '../../utils/formatar';
import { visualDaCategoria } from '../../constants/categorias';

// Carrinho do consumidor: muda quantidades, remove itens e finaliza o pedido.
export default function CarrinhoScreen({ navigation }) {
  const { itens, valorTotal, totalUnidades, alterarQuantidade, limparCarrinho, chaveCheckout } =
    useCart();
  const { criarPedido } = usePedidos();
  const [enviando, setEnviando] = useState(false);

  // Botões − e +. Se passar do estoque, alterarQuantidade lança um erro e mostramos o aviso.
  function mudarQuantidade(item, novaQuantidade) {
    try {
      alterarQuantidade(item.produtoId, novaQuantidade);
    } catch (erro) {
      Alert.alert('Estoque insuficiente', erro.message);
    }
  }

  async function finalizarPedido() {
    if (enviando || itens.length === 0) return;
    setEnviando(true);
    try {
      const pedidos = await criarPedido({ itens, chave: chaveCheckout() });
      const total = pedidos.reduce((soma, p) => soma + p.valorTotal, 0);
      limparCarrinho();
      Alert.alert(
        'Pedido realizado!',
        `${pedidos.length} pedido(s), separados por produtor. Total confirmado: ${formatarPreco(total)}`,
        [{ text: 'Ver meus pedidos', onPress: () => navigation.navigate('MeusPedidos') }]
      );
    } catch (erro) {
      Alert.alert('Não foi possível finalizar', erro.message);
    } finally {
      setEnviando(false);
    }
  }

  // Desenha um item do carrinho.
  function renderItem({ item }) {
    const visual = visualDaCategoria(item.categoria);
    const noLimite = item.estoque != null && item.quantidade >= item.estoque; // "+" bloqueado
    const ultimaUnidade = item.quantidade === 1; // o "−" vira lixeira

    return (
      <View style={styles.card}>
        {/* Emoji da categoria, igual ao do catálogo */}
        <View style={[styles.imagem, { backgroundColor: visual.fundo }]}>
          <Text style={styles.imagemEmoji}>{visual.icone}</Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.nome} numberOfLines={1}>
            {item.nome}
          </Text>
          <Text style={styles.precoUnitario}>{formatarPreco(item.precoUnitario)} cada</Text>

          <View style={styles.linhaInferior}>
            {/* Controle de quantidade: − 1 + */}
            <View style={styles.controle}>
              <Pressable
                style={styles.botaoQtd}
                disabled={enviando}
                onPress={() => mudarQuantidade(item, item.quantidade - 1)}
                accessibilityRole="button"
                accessibilityLabel={
                  ultimaUnidade ? `Remover ${item.nome}` : `Diminuir ${item.nome}`
                }
              >
                <Text style={ultimaUnidade ? styles.lixeira : styles.botaoQtdTexto}>
                  {ultimaUnidade ? '🗑️' : '−'}
                </Text>
              </Pressable>

              <Text style={styles.quantidade}>{item.quantidade}</Text>

              <Pressable
                style={[styles.botaoQtd, noLimite && styles.botaoQtdDesativado]}
                disabled={enviando || noLimite}
                onPress={() => mudarQuantidade(item, item.quantidade + 1)}
                accessibilityRole="button"
                accessibilityLabel={`Aumentar ${item.nome}`}
              >
                <Text style={[styles.botaoQtdTexto, noLimite && styles.botaoQtdTextoDesativado]}>
                  +
                </Text>
              </Pressable>
            </View>

            <Text style={styles.subtotal}>
              {formatarPreco(item.quantidade * item.precoUnitario)}
            </Text>
          </View>

          {noLimite && <Text style={styles.aviso}>Máximo em estoque</Text>}
        </View>
      </View>
    );
  }

  // Carrinho vazio: mensagem e atalho de volta ao catálogo.
  if (itens.length === 0) {
    return (
      <View style={styles.vazio}>
        <Text style={styles.vazioIcone}>🛒</Text>
        <Text style={styles.vazioTitulo}>Seu carrinho está vazio</Text>
        <Text style={styles.vazioTexto}>Escolha produtos frescos direto do produtor.</Text>
        <View style={{ alignSelf: 'stretch', marginTop: 20 }}>
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
        renderItem={renderItem}
        contentContainerStyle={styles.lista}
      />

      {/* Rodapé fixo com o total e o botão de finalizar */}
      <View style={styles.rodape}>
        <View style={styles.linhaTotal}>
          <Text style={styles.unidades}>
            {totalUnidades} {totalUnidades === 1 ? 'item' : 'itens'}
          </Text>
          <Text style={styles.total}>{formatarPreco(valorTotal)}</Text>
        </View>
        <BotaoPrimario
          titulo={enviando ? 'Enviando...' : 'Finalizar pedido'}
          disabled={enviando}
          onPress={finalizarPedido}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4FAF6' },
  lista: { padding: 16, gap: 12 },

  // Cartão do item
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  imagem: {
    width: 72,
    height: 72,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagemEmoji: { fontSize: 34 },
  info: { flex: 1 },
  nome: { fontSize: 15, fontWeight: '700', color: '#1F1F1F' },
  precoUnitario: { fontSize: 12, color: '#6A7A6F', marginTop: 2 },
  linhaInferior: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  // Controle − 1 +
  controle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF3EC',
    borderRadius: 20,
    padding: 3,
  },
  botaoQtd: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoQtdDesativado: { backgroundColor: '#F1F4F2' },
  botaoQtdTexto: { fontSize: 18, fontWeight: '700', color: '#2E8B57', lineHeight: 20 },
  botaoQtdTextoDesativado: { color: '#B8C4BC' },
  lixeira: { fontSize: 13 },
  quantidade: {
    minWidth: 32,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: '#1F1F1F',
  },
  subtotal: { fontSize: 16, fontWeight: '800', color: '#2E8B57' },
  aviso: { fontSize: 11, color: '#8A5A00', marginTop: 6 },

  // Rodapé
  rodape: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  linhaTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 14,
  },
  unidades: { fontSize: 14, color: '#6A7A6F' },
  total: { fontSize: 22, fontWeight: '800', color: '#1F5E3D' },

  // Carrinho vazio
  vazio: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#F4FAF6',
  },
  vazioIcone: { fontSize: 56, marginBottom: 12 },
  vazioTitulo: { fontSize: 18, fontWeight: '800', color: '#1F5E3D' },
  vazioTexto: { fontSize: 14, color: '#6A7A6F', marginTop: 6, textAlign: 'center' },
});
