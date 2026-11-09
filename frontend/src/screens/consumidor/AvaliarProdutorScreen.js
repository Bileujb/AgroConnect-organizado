import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import BotaoPrimario from '../../components/BotaoPrimario';
import CampoTexto from '../../components/CampoTexto';
import { useAvaliacoes } from '../../context/AvaliacaoContext';

// Texto que aparece embaixo das estrelas para cada nota.
const TEXTO_NOTA = { 1: 'Ruim', 2: 'Regular', 3: 'Bom', 4: 'Muito bom', 5: 'Ótimo!' };

// Tela de avaliação do produtor, aberta a partir de um pedido entregue.
export default function AvaliarProdutorScreen({ route, navigation }) {
  const { pedido } = route.params; // o pedido que está sendo avaliado
  const { avaliarProdutor } = useAvaliacoes();
  const [nota, setNota] = useState(0); // 0 = nenhuma estrela escolhida ainda
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    if (enviando) return;
    if (nota === 0) {
      Alert.alert('Escolha uma nota', 'Toque nas estrelas para avaliar de 1 a 5.');
      return;
    }

    setEnviando(true);
    try {
      await avaliarProdutor({ pedidoId: pedido.id, nota, comentario });
      Alert.alert('Obrigado!', 'Sua avaliação foi salva.');
      navigation.goBack();
    } catch (erro) {
      Alert.alert('Não foi possível avaliar', erro.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <ScrollView
      style={styles.tela}
      contentContainerStyle={styles.conteudo}
      keyboardShouldPersistTaps="handled"
    >
      {/* Cartão com o produtor e o pedido */}
      <View style={styles.cartao}>
        <Text style={styles.cartaoIcone}>🧑‍🌾</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.pergunta}>
            Como foi sua compra com {pedido.nomeProdutor || 'o produtor'}?
          </Text>
          <Text style={styles.pedido}>Pedido #{pedido.id.slice(0, 8)}</Text>
        </View>
      </View>

      {/* Estrelas: tocar na 3ª acende 1, 2 e 3 */}
      <View style={styles.estrelas}>
        {[1, 2, 3, 4, 5].map((valor) => (
          <Pressable
            key={valor}
            onPress={() => setNota(valor)}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={`Nota ${valor}`}
          >
            <Text style={[styles.estrela, valor <= nota && styles.estrelaAtiva]}>★</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.textoNota}>
        {nota ? TEXTO_NOTA[nota] : 'Toque nas estrelas para dar sua nota'}
      </Text>

      <CampoTexto
        rotulo="Comentário (opcional)"
        icone="💬"
        placeholder="Conte como foi: qualidade, entrega, atendimento..."
        value={comentario}
        onChangeText={setComentario}
        multiline
      />

      <View style={{ marginTop: 6 }}>
        <BotaoPrimario
          titulo={enviando ? 'Enviando...' : 'Enviar avaliação'}
          disabled={enviando}
          onPress={enviar}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#FFFFFF' },
  conteudo: { padding: 24 },
  cartao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F4FAF6',
    borderRadius: 18,
    padding: 14,
    marginBottom: 24,
  },
  cartaoIcone: { fontSize: 30 },
  pergunta: { fontSize: 15, fontWeight: '700', color: '#1F1F1F' },
  pedido: { fontSize: 12, color: '#6A7A6F', marginTop: 2 },
  estrelas: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  estrela: { fontSize: 44, color: '#E3E9E5' },
  estrelaAtiva: { color: '#F5A623' },
  textoNota: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6A7A6F',
    fontWeight: '600',
    marginTop: 6,
    marginBottom: 22,
  },
});
