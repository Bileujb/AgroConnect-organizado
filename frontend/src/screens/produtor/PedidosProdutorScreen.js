import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, Alert, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { usePedidos } from '../../context/PedidoContext';
import { useProdutos } from '../../context/ProdutoContext';
import EstadoLista from '../../components/EstadoLista';
import EtiquetaStatus from '../../components/EtiquetaStatus';
import { formatarPreco } from '../../utils/formatar';

// Para cada status, qual é o próximo passo e o texto do botão.
// Pedidos entregues ou cancelados não têm próximo passo.
const PROXIMO_PASSO = {
  aguardando: { status: 'confirmado', texto: 'Confirmar pedido' },
  confirmado: { status: 'em_rota', texto: 'Iniciar entrega' },
  em_rota: { status: 'entregue', texto: 'Marcar entregue' },
};

// O produtor só pode cancelar antes de o pedido sair para entrega.
const PODE_CANCELAR = ['aguardando', 'confirmado'];

export default function PedidosProdutorScreen() {
  const { pedidos, carregando, erro, recarregar, atualizarStatus } = usePedidos();
  const { recarregar: recarregarProdutos } = useProdutos();

  // Id do pedido que está sendo atualizado agora (null = nenhum).
  const [atualizandoId, setAtualizandoId] = useState(null);

  // Recarrega a lista sempre que a tela aparece.
  useFocusEffect(
    useCallback(() => {
      recarregar();
    }, [recarregar])
  );

  async function mudarStatus(pedido, novoStatus) {
    if (atualizandoId) return; // evita dois cliques ao mesmo tempo
    setAtualizandoId(pedido.id);
    try {
      await atualizarStatus(pedido.id, novoStatus);
      // Cancelar devolve o estoque, então a lista de produtos precisa ser recarregada.
      if (novoStatus === 'cancelado') await recarregarProdutos();
    } catch (falha) {
      Alert.alert('Não foi possível atualizar', falha.message);
    } finally {
      setAtualizandoId(null);
    }
  }

  function confirmarCancelamento(pedido) {
    Alert.alert('Cancelar pedido?', 'O estoque será devolvido.', [
      { text: 'Voltar' },
      { text: 'Cancelar pedido', onPress: () => mudarStatus(pedido, 'cancelado') },
    ]);
  }

  // Desenha o card de um pedido da lista.
  function renderPedido({ item: pedido }) {
    const proximo = PROXIMO_PASSO[pedido.status];
    const podeCancelar = PODE_CANCELAR.includes(pedido.status);
    const ocupado = atualizandoId !== null;

    return (
      <View style={styles.card}>
        {/* Número do pedido à esquerda e etiqueta de status à direita */}
        <View style={styles.cabecalhoCard}>
          <Text style={styles.codigo}>Pedido #{pedido.id.slice(0, 8)}</Text>
          <EtiquetaStatus status={pedido.status} />
        </View>
        <Text>{pedido.nomeConsumidor}</Text>
        <Text>
          {pedido.enderecoEntrega} · {pedido.cidadeEntrega}
        </Text>

        {pedido.itens.map((produto) => (
          <Text key={produto.id}>
            {produto.quantidade}x {produto.nome} — {formatarPreco(produto.precoUnitario)}
          </Text>
        ))}

        <Text>Total: {formatarPreco(pedido.valorTotal)}</Text>

        {proximo && (
          <Pressable disabled={ocupado} onPress={() => mudarStatus(pedido, proximo.status)}>
            <Text style={styles.botaoAvancar}>
              {atualizandoId === pedido.id ? 'Atualizando...' : proximo.texto}
            </Text>
          </Pressable>
        )}

        {podeCancelar && (
          <Pressable disabled={ocupado} onPress={() => confirmarCancelamento(pedido)}>
            <Text style={styles.botaoCancelar}>Cancelar pedido</Text>
          </Pressable>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <EstadoLista carregando={carregando} erro={erro} recarregar={recarregar} />
      <FlatList
        data={pedidos}
        keyExtractor={(pedido) => pedido.id}
        renderItem={renderPedido}
        refreshing={carregando}
        onRefresh={recarregar}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={<Text>Nenhum pedido recebido.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  lista: { padding: 20, gap: 16 },
  card: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#CBD8D0',
    borderRadius: 12,
    gap: 10,
  },
  cabecalhoCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  codigo: { fontWeight: '700', color: '#1F5E3D' },
  botaoAvancar: { color: '#2E8B57', fontWeight: '700' },
  botaoCancelar: { color: '#B3261E' },
});
