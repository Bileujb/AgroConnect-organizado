import React from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { formatarPreco } from '../utils/formatar';
import { visualDaCategoria } from '../constants/categorias';

// onAdicionar: chamado ao tocar no "+" (adiciona 1 unidade ao carrinho).
export default function ProdutoCard({ produto, onPress, onAdicionar }) {
  const temEstoque = produto.quantidadeEstoque > 0;
  const visual = visualDaCategoria(produto.categoria); // emoji e cor da categoria
  return (
    <Pressable style={styles.card} onPress={onPress}>
      {/* Foto do produto; sem foto, mostra o emoji da categoria sobre a cor dela */}
      <View style={[styles.imagem, { backgroundColor: visual.fundo }]}>
        {produto.imagem ? (
          <Image source={{ uri: produto.imagem }} style={styles.foto} resizeMode="cover" />
        ) : (
          <Text style={styles.imagemEmoji}>{visual.icone}</Text>
        )}
        <View style={styles.tagCategoria}>
          <Text style={styles.tagCategoriaTexto}>{produto.categoria}</Text>
        </View>
      </View>

      <View style={styles.info}>
        <Text style={styles.nome} numberOfLines={1}>
          {produto.nome}
        </Text>
        <View style={styles.linhaInferior}>
          <Text style={styles.preco}>{formatarPreco(produto.preco)}</Text>
          {temEstoque && (
            <Pressable
              style={styles.botaoAdd}
              onPress={onAdicionar}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={`Adicionar ${produto.nome} ao carrinho`}
            >
              <Text style={styles.botaoAddTexto}>+</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  imagem: {
    height: 110,
    backgroundColor: '#E8F3EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  foto: { width: '100%', height: '100%' },
  imagemEmoji: { fontSize: 44 },
  tagCategoria: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(31,94,61,0.85)',
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  tagCategoriaTexto: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },
  info: { padding: 12 },
  nome: { fontSize: 15, fontWeight: '700', color: '#1F1F1F', marginBottom: 8 },
  linhaInferior: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  preco: { fontSize: 16, fontWeight: '800', color: '#2E8B57' },
  botaoAdd: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#2E8B57',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoAddTexto: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', lineHeight: 18 },
});
