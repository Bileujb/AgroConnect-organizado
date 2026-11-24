import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import EstadoLista from '../../components/EstadoLista';
import { View, Text, FlatList, StyleSheet, Pressable, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { usePedidos } from '../../context/PedidoContext';
import { useAvaliacoes } from '../../context/AvaliacaoContext';
import { descreverPagamento } from '../../utils/pagamentos';

const STATUS = {
  aguardando: { rotulo: 'Aguardando confirmação', cor: '#B8791E', fundo: '#FFF4DE' },
  confirmado: { rotulo: 'Confirmado', cor: '#1F5E8B', fundo: '#E4F0FA' },
  em_rota: { rotulo: 'Em rota de entrega', cor: '#6A3FA0', fundo: '#F0E8FA' },
  entregue: { rotulo: 'Entregue', cor: '#1F5E3D', fundo: '#E3F3E8' },
  cancelado: { rotulo: 'Cancelado', cor: '#B3261E', fundo: '#FDE8E8' },
};

const formatarPreco = (valor) => `R$ ${Number(valor || 0).toFixed(2).replace('.', ',')}`;

export default function MeusPedidosScreen({ navigation }) {
  const { usuario } = useAuth();
  const { pedidosDoConsumidor, recarregar, carregando, erro, atualizarStatus } = usePedidos();
  const { jaAvaliouPedido, recarregar: recarregarAvaliacoes } = useAvaliacoes();
  const [cancelando, setCancelando] = useState(null);
  useFocusEffect(useCallback(() => { recarregar(); recarregarAvaliacoes(); }, [recarregar, recarregarAvaliacoes]));

  async function cancelar(id) {
    if (cancelando) return;
    setCancelando(id);
    try { await atualizarStatus(id, 'cancelado'); }
    catch (erro) { Alert.alert('Não foi possível cancelar', erro.message); }
    finally { setCancelando(null); }
  }

  function confirmarCancelamento(id) {
    Alert.alert('Cancelar pedido', 'Deseja realmente cancelar este pedido?', [
      { text: 'Voltar', style: 'cancel' },
      { text: 'Cancelar pedido', style: 'destructive', onPress: () => cancelar(id) },
    ]);
  }

  const meusPedidos = pedidosDoConsumidor(usuario?.id);

  function renderPedido({ item }) {
    const status = STATUS[item.status] || { rotulo: item.status, cor: '#4A4A4A', fundo: '#EEEEEE' };
    const jaAvaliado = jaAvaliouPedido(item.id);
    const pagamento = descreverPagamento(item);

    return (
      <View style={styles.card}>
        <View style={styles.cardTopo}>
          <View style={{ flex: 1 }}>
            <Text style={styles.codigo}>Pedido #{String(item.id).slice(0, 8)}</Text>
            {!!item.nomeProdutor && (
              <Text style={styles.produtor} numberOfLines={1}>🧑‍🌾 {item.nomeProdutor}</Text>
            )}
          </View>
          <View style={[styles.badge, { backgroundColor: status.fundo }]}>
            <Text style={[styles.badgeTexto, { color: status.cor }]}>{status.rotulo}</Text>
          </View>
        </View>

        <View style={styles.itens}>
          {item.itens?.map((produto) => (
            <View key={produto.id} style={styles.itemLinha}>
              <Text style={styles.itemNome} numberOfLines={1}>
                <Text style={styles.itemQtd}>{produto.quantidade}x </Text>
                {produto.nome}
              </Text>
              <Text style={styles.itemPreco}>
                {formatarPreco(produto.precoUnitario * produto.quantidade)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totalLinha}>
          <Text style={styles.totalRotulo}>Total</Text>
          <Text style={styles.totalValor}>{formatarPreco(item.valorTotal)}</Text>
        </View>
        <Text style={[styles.pagamento, pagamento.pago && styles.pagamentoPago]}>
          {pagamento.icone} {pagamento.texto}
        </Text>

        {item.status === 'aguardando' && (
          <Pressable
            style={[styles.botaoCancelar, !!cancelando && { opacity: 0.6 }]}
            disabled={!!cancelando}
            onPress={() => confirmarCancelamento(item.id)}
          >
            <Text style={styles.botaoCancelarTexto}>
              {cancelando === item.id ? 'Cancelando...' : 'Cancelar pedido'}
            </Text>
          </Pressable>
        )}

        {item.status === 'entregue' && (jaAvaliado ? (
          <Text style={styles.avaliado}>✓ Você já avaliou este pedido</Text>
        ) : (
          <Pressable
            style={styles.botaoAvaliar}
            onPress={() => navigation.navigate('AvaliarProdutor', { pedido: item })}
          >
            <Text style={styles.botaoAvaliarTexto}>⭐ Avaliar produtor</Text>
          </Pressable>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        refreshing={carregando}
        onRefresh={recarregar}
        data={meusPedidos}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.lista}
        ListHeaderComponent={<EstadoLista carregando={carregando} erro={erro} recarregar={recarregar} />}
        renderItem={renderPedido}
        ListEmptyComponent={!carregando && !erro ? (
          <View style={styles.vazioCaixa}>
            <Text style={styles.vazioIcone}>🧺</Text>
            <Text style={styles.vazioTitulo}>Nenhum pedido ainda</Text>
            <Text style={styles.vazio}>Quando você fizer um pedido, ele aparece aqui.</Text>
          </View>
        ) : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4FAF6' },
  lista: { padding: 16, paddingBottom: 32, flexGrow: 1 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E3E9E5',
  },
  cardTopo: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  codigo: { fontSize: 15, fontWeight: '800', color: '#1F1F1F' },
  produtor: { fontSize: 13, color: '#6A7A6F', marginTop: 3 },
  badge: { borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10, maxWidth: '55%' },
  badgeTexto: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  itens: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEF2EF',
    gap: 6,
  },
  itemLinha: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  itemNome: { flex: 1, fontSize: 14, color: '#2B2B2B' },
  itemQtd: { fontWeight: '700', color: '#2E8B57' },
  itemPreco: { fontSize: 14, color: '#4A4A4A' },
  totalLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEF2EF',
  },
  totalRotulo: { fontSize: 14, fontWeight: '700', color: '#4A4A4A' },
  totalValor: { fontSize: 17, fontWeight: '800', color: '#2E8B57' },
  pagamento: { fontSize: 13, color: '#6A7A6F', marginTop: 6, textAlign: 'right' },
  pagamentoPago: { color: '#2E8B57', fontWeight: '600' },
  botaoCancelar: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E6B4B0',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  botaoCancelarTexto: { color: '#B3261E', fontWeight: '700', fontSize: 13 },
  botaoAvaliar: {
    marginTop: 12,
    backgroundColor: '#FFF7E6',
    borderWidth: 1,
    borderColor: '#F5A623',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  botaoAvaliarTexto: { color: '#B8791E', fontWeight: '700', fontSize: 13 },
  avaliado: { marginTop: 12, color: '#2E8B57', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  vazioCaixa: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 6 },
  vazioIcone: { fontSize: 44 },
  vazioTitulo: { fontSize: 17, fontWeight: '800', color: '#1F5E3D' },
  vazio: { textAlign: 'center', color: '#6A7A6F', fontSize: 14 },
});
