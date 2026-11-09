import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { rotuloStatus, visualStatus } from '../constants/statusPedido';

// Etiqueta colorida com o status do pedido. Uso: <EtiquetaStatus status={pedido.status} />
export default function EtiquetaStatus({ status }) {
  const visual = visualStatus(status);
  return (
    <View style={[styles.etiqueta, { backgroundColor: visual.fundo }]}>
      <Text style={[styles.texto, { color: visual.texto }]}>
        {visual.icone} {rotuloStatus(status)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  etiqueta: {
    alignSelf: 'flex-start', // a etiqueta fica do tamanho do texto, e não da largura toda
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  texto: { fontSize: 12, fontWeight: '700' },
});
