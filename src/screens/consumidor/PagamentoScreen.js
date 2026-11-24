import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BotaoPrimario from '../../components/BotaoPrimario';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { usePedidos } from '../../context/PedidoContext';
import { formatarPreco, quantidadeComUnidade } from '../../utils/unidades';
import { FORMAS_PAGAMENTO } from '../../utils/pagamentos';

// Pagamento SIMULADO: nenhum valor é cobrado e nenhum dado de cartão é pedido.
const CODIGO_PIX_SIMULADO = '00020126AGROCONNECT.SIMULACAO.PIX5204000053039865802BR6304ABCD';

export default function PagamentoScreen({ navigation }) {
  const { itens, valorTotal, limparCarrinho, chaveCheckout } = useCart();
  const { usuario } = useAuth();
  const { criarPedido } = usePedidos();
  const insets = useSafeAreaInsets();
  const [forma, setForma] = useState('pix');
  const [etapa, setEtapa] = useState('escolha'); // escolha | processando | concluido
  const [resultado, setResultado] = useState(null);

  const semEndereco = !usuario?.enderecoEntrega?.trim() || !usuario?.cidade?.trim();

  async function pagar() {
    if (semEndereco) {
      Alert.alert('Endereço de entrega', 'Complete seu endereço e sua cidade antes de pagar.', [
        { text: 'Agora não', style: 'cancel' },
        { text: 'Completar', onPress: () => navigation.navigate('MeuPerfil') },
      ]);
      return;
    }
    if (etapa !== 'escolha' || itens.length === 0) return;
    setEtapa('processando');
    try {
      // Pequena espera só para a simulação parecer um pagamento sendo processado.
      if (forma !== 'entrega') await new Promise((r) => setTimeout(r, 1200));
      const pedidos = await criarPedido({ itens, chave: chaveCheckout(), formaPagamento: forma });
      const total = pedidos.reduce((soma, p) => soma + p.valorTotal, 0);
      limparCarrinho();
      setResultado({ quantidade: pedidos.length, total });
      setEtapa('concluido');
    } catch (erro) {
      setEtapa('escolha');
      Alert.alert('Não foi possível concluir', erro.message);
    }
  }

  function verPedidos() {
    navigation.reset({ index: 1, routes: [{ name: 'Catalogo' }, { name: 'MeusPedidos' }] });
  }

  if (etapa === 'concluido') {
    const naEntrega = forma === 'entrega';
    return (
      <View style={[styles.container, styles.concluido, { paddingBottom: 24 + insets.bottom }]}>
        <View style={styles.concluidoIcone}><Text style={{ fontSize: 44 }}>{naEntrega ? '📦' : '✅'}</Text></View>
        <Text style={styles.concluidoTitulo}>{naEntrega ? 'Pedido enviado!' : 'Pagamento aprovado!'}</Text>
        <Text style={styles.concluidoTexto}>
          {naEntrega
            ? `Você vai pagar ${formatarPreco(resultado.total)} ao receber.`
            : `Recebemos ${formatarPreco(resultado.total)}.`}
          {'\n'}
          {resultado.quantidade > 1
            ? `Seus ${resultado.quantidade} pedidos (um por produtor) estão aguardando confirmação.`
            : 'Seu pedido está aguardando a confirmação do produtor.'}
        </Text>
        <View style={styles.etapas}>
          <Etapa feita texto="Pedido feito" />
          <Etapa feita={!naEntrega} texto={naEntrega ? 'Pagamento na entrega' : 'Pagamento aprovado'} />
          <Etapa atual texto="Aguardando confirmação" />
        </View>
        <View style={{ alignSelf: 'stretch', gap: 10 }}>
          <BotaoPrimario titulo="Ver meus pedidos" onPress={verPedidos} />
          <Text style={styles.linkVoltar} onPress={() => navigation.popToTop()}>Continuar comprando</Text>
        </View>
      </View>
    );
  }

  const processando = etapa === 'processando';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.conteudo}>
        <View style={styles.avisoSimulacao}>
          <Text style={styles.avisoSimulacaoTexto}>🧪 Ambiente de demonstração: nenhum valor é cobrado.</Text>
        </View>

        <Text style={styles.secao}>Resumo</Text>
        <View style={styles.card}>
          {itens.map((item) => (
            <View key={item.produtoId} style={styles.linha}>
              <Text style={styles.linhaNome} numberOfLines={1}>
                {quantidadeComUnidade(item.quantidade, item.unidade)} · {item.nome}
              </Text>
              <Text style={styles.linhaValor}>{formatarPreco(item.quantidade * item.precoUnitario)}</Text>
            </View>
          ))}
          <View style={[styles.linha, styles.linhaTotal]}>
            <Text style={styles.totalRotulo}>Total</Text>
            <Text style={styles.totalValor}>{formatarPreco(valorTotal)}</Text>
          </View>
        </View>

        <Text style={styles.secao}>Entrega</Text>
        <Pressable style={styles.card} onPress={() => navigation.navigate('MeuPerfil')}>
          {semEndereco ? (
            <Text style={styles.enderecoFaltando}>⚠️ Toque para informar seu endereço de entrega</Text>
          ) : (
            <View style={styles.enderecoLinha}>
              <Text style={{ fontSize: 20 }}>📍</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.enderecoTexto}>{usuario.enderecoEntrega}</Text>
                <Text style={styles.enderecoCidade}>{usuario.cidade}</Text>
              </View>
              <Text style={styles.alterar}>Alterar</Text>
            </View>
          )}
        </Pressable>

        <Text style={styles.secao}>Forma de pagamento</Text>
        <View style={{ gap: 10 }}>
          {FORMAS_PAGAMENTO.map((f) => {
            const ativa = forma === f.valor;
            return (
              <Pressable
                key={f.valor}
                disabled={processando}
                onPress={() => setForma(f.valor)}
                style={[styles.opcao, ativa && styles.opcaoAtiva]}
                accessibilityRole="radio"
                accessibilityState={{ selected: ativa }}
              >
                <Text style={styles.opcaoIcone}>{f.icone}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.opcaoTitulo}>{f.titulo}</Text>
                  <Text style={styles.opcaoDescricao}>{f.descricao}</Text>
                </View>
                <View style={[styles.radio, ativa && styles.radioAtivo]}>
                  {ativa && <View style={styles.radioPonto} />}
                </View>
              </Pressable>
            );
          })}
        </View>

        {forma === 'pix' && (
          <View style={[styles.card, { marginTop: 12 }]}>
            <Text style={styles.detalheTitulo}>Pix copia e cola (simulado)</Text>
            <Text style={styles.codigoPix} selectable>{CODIGO_PIX_SIMULADO}</Text>
            <Text style={styles.detalheTexto}>Ao tocar em "Pagar", o pagamento é aprovado automaticamente.</Text>
          </View>
        )}
        {forma === 'cartao' && (
          <View style={[styles.card, { marginTop: 12 }]}>
            <Text style={styles.detalheTitulo}>Cartão (simulado)</Text>
            <Text style={styles.detalheTexto}>
              Nesta demonstração nenhum dado de cartão é pedido. Ao tocar em "Pagar", o pagamento é aprovado.
            </Text>
          </View>
        )}
        {forma === 'entrega' && (
          <View style={[styles.card, { marginTop: 12 }]}>
            <Text style={styles.detalheTexto}>Você paga ao produtor quando receber, em dinheiro ou Pix.</Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.rodape, { paddingBottom: 12 + insets.bottom }]}>
        {processando ? (
          <View style={styles.processando}>
            <ActivityIndicator color="#2E8B57" />
            <Text style={styles.processandoTexto}>
              {forma === 'entrega' ? 'Enviando pedido...' : 'Processando pagamento...'}
            </Text>
          </View>
        ) : (
          <BotaoPrimario
            titulo={forma === 'entrega'
              ? `Confirmar pedido · ${formatarPreco(valorTotal)}`
              : `Pagar ${formatarPreco(valorTotal)}`}
            disabled={itens.length === 0}
            onPress={pagar}
          />
        )}
      </View>
    </View>
  );
}

function Etapa({ texto, feita, atual }) {
  return (
    <View style={styles.etapa}>
      <View style={[styles.etapaBolinha, feita && styles.etapaFeita, atual && styles.etapaAtual]}>
        <Text style={styles.etapaMarca}>{feita ? '✓' : atual ? '•' : ''}</Text>
      </View>
      <Text style={[styles.etapaTexto, atual && { color: '#B8791E', fontWeight: '700' }]}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4FAF6' },
  conteudo: { padding: 16, paddingBottom: 24 },
  avisoSimulacao: { backgroundColor: '#FFF7E6', borderRadius: 12, padding: 10, marginBottom: 4 },
  avisoSimulacaoTexto: { color: '#8A5A12', fontSize: 12, fontWeight: '600', textAlign: 'center' },
  secao: { fontSize: 15, fontWeight: '800', color: '#1F1F1F', marginTop: 16, marginBottom: 8, marginLeft: 4 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#E3E9E5' },
  linha: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 3 },
  linhaNome: { flex: 1, fontSize: 14, color: '#2B2B2B' },
  linhaValor: { fontSize: 14, color: '#4A4A4A' },
  linhaTotal: { borderTopWidth: 1, borderTopColor: '#EEF2EF', marginTop: 8, paddingTop: 10 },
  totalRotulo: { fontSize: 15, fontWeight: '700', color: '#4A4A4A' },
  totalValor: { fontSize: 18, fontWeight: '800', color: '#2E8B57' },
  enderecoLinha: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  enderecoTexto: { fontSize: 14, fontWeight: '600', color: '#1F1F1F' },
  enderecoCidade: { fontSize: 13, color: '#6A7A6F', marginTop: 2 },
  enderecoFaltando: { fontSize: 14, fontWeight: '700', color: '#B3261E' },
  alterar: { color: '#2E8B57', fontWeight: '700', fontSize: 13 },
  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E3E9E5',
  },
  opcaoAtiva: { borderColor: '#2E8B57', backgroundColor: '#F1F8F3' },
  opcaoIcone: { fontSize: 24 },
  opcaoTitulo: { fontSize: 15, fontWeight: '700', color: '#1F1F1F' },
  opcaoDescricao: { fontSize: 12, color: '#6A7A6F', marginTop: 2 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#CBD8D0', alignItems: 'center', justifyContent: 'center' },
  radioAtivo: { borderColor: '#2E8B57' },
  radioPonto: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#2E8B57' },
  detalheTitulo: { fontSize: 14, fontWeight: '700', color: '#1F5E3D', marginBottom: 6 },
  detalheTexto: { fontSize: 13, color: '#4A4A4A', lineHeight: 19 },
  codigoPix: {
    fontSize: 12,
    color: '#2B2B2B',
    backgroundColor: '#F4FAF6',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  rodape: { paddingHorizontal: 16, paddingTop: 12, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E3E9E5' },
  processando: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  processandoTexto: { fontSize: 15, fontWeight: '700', color: '#1F5E3D' },
  concluido: { alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10 },
  concluidoIcone: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#E3F3E8', alignItems: 'center', justifyContent: 'center' },
  concluidoTitulo: { fontSize: 22, fontWeight: '800', color: '#1F5E3D', marginTop: 6 },
  concluidoTexto: { fontSize: 14, color: '#4A4A4A', textAlign: 'center', lineHeight: 21 },
  etapas: {
    alignSelf: 'stretch',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#E3E9E5',
  },
  etapa: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  etapaBolinha: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#EEF2EF', alignItems: 'center', justifyContent: 'center' },
  etapaFeita: { backgroundColor: '#2E8B57' },
  etapaAtual: { backgroundColor: '#F5A623' },
  etapaMarca: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  etapaTexto: { fontSize: 14, color: '#2B2B2B' },
  linkVoltar: { textAlign: 'center', color: '#2E8B57', fontWeight: '700', paddingVertical: 8 },
});
