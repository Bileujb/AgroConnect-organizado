import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BotaoPrimario from './BotaoPrimario';
import { VISUAL_CATEGORIA } from '../constants/categorias';
import { validarProduto, precoParaCampo } from '../utils/produto';

// Nomes das categorias, na ordem em que aparecem: ['Verduras', 'Legumes', 'Frutas', 'Derivados']
const CATEGORIAS = Object.keys(VISUAL_CATEGORIA);

// Cor clara dos textos de exemplo, para não serem confundidos com o que foi digitado.
const COR_EXEMPLO = '#9AA79F';

// Formulário de produto, usado pelas telas de Cadastrar e de Editar.
// Props:
//   titulo, subtitulo → textos do topo verde
//   produtoInicial    → produto a editar (vazio ao cadastrar)
//   textoBotao        → ex.: "Salvar produto" ou "Salvar alterações"
//   aoSalvar(dados)   → função da tela que envia os dados para a API
//   aoVoltar          → chamado pela seta de voltar
export default function FormularioProduto({
  titulo,
  subtitulo,
  produtoInicial = {},
  textoBotao,
  aoSalvar,
  aoVoltar,
}) {
  const insets = useSafeAreaInsets();

  // Cada campo começa com o valor do produto (ao editar) ou vazio (ao cadastrar).
  const [nome, setNome] = useState(produtoInicial.nome || '');
  const [descricao, setDescricao] = useState(produtoInicial.descricao || '');
  const [preco, setPreco] = useState(precoParaCampo(produtoInicial.preco));
  const [quantidadeEstoque, setQuantidadeEstoque] = useState(
    produtoInicial.quantidadeEstoque != null ? String(produtoInicial.quantidadeEstoque) : ''
  );
  const [categoria, setCategoria] = useState(produtoInicial.categoria || CATEGORIAS[0]);
  const [imagem, setImagem] = useState(produtoInicial.imagem || '');
  const [enviando, setEnviando] = useState(false);

  async function salvar() {
    if (enviando) return; // evita salvar duas vezes com dois toques rápidos

    const resultado = validarProduto({
      nome,
      descricao,
      preco,
      quantidadeEstoque,
      categoria,
      imagem,
    });
    if (resultado.erro) {
      Alert.alert('Confira os dados', resultado.erro);
      return;
    }

    setEnviando(true);
    try {
      await aoSalvar(resultado.dados);
    } catch (erro) {
      Alert.alert('Não foi possível salvar', erro.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Topo verde com seta de voltar, título e subtítulo */}
      <LinearGradient
        colors={['#0A2818', '#1F5E3D']}
        style={[styles.topo, { paddingTop: insets.top + 12 }]}
      >
        <Text style={styles.folhaTopo}>🌱</Text>
        <Pressable
          style={styles.botaoVoltar}
          onPress={aoVoltar}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <Text style={styles.botaoVoltarTexto}>‹</Text>
        </Pressable>
        <Text style={styles.tituloTopo}>{titulo}</Text>
        <Text style={styles.subtituloTopo}>{subtitulo}</Text>
      </LinearGradient>

      <View style={styles.corpo}>
        <Text style={styles.rotulo}>Nome do produto</Text>
        <View style={styles.campo}>
          <Text style={styles.campoIcone}>🏷️</Text>
          <TextInput
            style={styles.campoInput}
            placeholderTextColor={COR_EXEMPLO}
            placeholder="Ex.: Alface crespa"
            value={nome}
            onChangeText={setNome}
          />
        </View>

        <Text style={styles.rotulo}>Descrição (opcional)</Text>
        <View style={styles.campo}>
          <Text style={styles.campoIcone}>📝</Text>
          <TextInput
            style={styles.campoInput}
            placeholderTextColor={COR_EXEMPLO}
            placeholder="Ex.: Colhida no dia"
            value={descricao}
            onChangeText={setDescricao}
          />
        </View>

        <Text style={styles.rotulo}>Categoria</Text>
        <View style={styles.categoriasGrid}>
          {CATEGORIAS.map((nomeCategoria) => {
            const ativa = categoria === nomeCategoria;
            const visual = VISUAL_CATEGORIA[nomeCategoria];
            return (
              <Pressable
                key={nomeCategoria}
                style={[
                  styles.categoriaCard,
                  ativa && { backgroundColor: visual.fundo, borderColor: '#2E8B57' },
                ]}
                onPress={() => setCategoria(nomeCategoria)}
                accessibilityRole="button"
                accessibilityState={{ selected: ativa }}
              >
                <Text style={styles.categoriaIcone}>{visual.icone}</Text>
                <Text style={[styles.categoriaTexto, ativa && styles.categoriaTextoAtiva]}>
                  {nomeCategoria}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Preço e estoque lado a lado */}
        <View style={styles.linhaDupla}>
          <View style={styles.metade}>
            <Text style={styles.rotulo}>Preço (R$)</Text>
            <View style={styles.campo}>
              <Text style={styles.campoIcone}>💵</Text>
              <TextInput
                style={styles.campoInput}
                placeholderTextColor={COR_EXEMPLO}
                placeholder="0,00"
                value={preco}
                onChangeText={setPreco}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
          <View style={styles.metade}>
            <Text style={styles.rotulo}>Estoque</Text>
            <View style={styles.campo}>
              <Text style={styles.campoIcone}>📦</Text>
              <TextInput
                style={styles.campoInput}
                placeholderTextColor={COR_EXEMPLO}
                placeholder="0"
                value={quantidadeEstoque}
                onChangeText={setQuantidadeEstoque}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        <Text style={styles.rotulo}>URL da imagem (opcional)</Text>
        <View style={styles.campo}>
          <Text style={styles.campoIcone}>🖼️</Text>
          <TextInput
            style={styles.campoInput}
            placeholderTextColor={COR_EXEMPLO}
            placeholder="https://..."
            value={imagem}
            onChangeText={setImagem}
            autoCapitalize="none"
          />
        </View>

        <View style={{ marginTop: 8 }}>
          <BotaoPrimario
            titulo={enviando ? 'Salvando...' : textoBotao}
            disabled={enviando}
            onPress={salvar}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  // Topo verde
  topo: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  folhaTopo: { position: 'absolute', fontSize: 100, opacity: 0.12, right: -10, bottom: -20 },
  botaoVoltar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  botaoVoltarTexto: { color: '#FFFFFF', fontSize: 24, fontWeight: '700', marginTop: -2 },
  tituloTopo: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  subtituloTopo: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },

  // Campos
  corpo: { paddingHorizontal: 24, paddingTop: 20 },
  rotulo: { fontSize: 13, color: '#4A5A50', fontWeight: '600', marginBottom: 6 },
  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF3EC',
    borderRadius: 30,
    paddingHorizontal: 18,
    marginBottom: 14,
  },
  campoIcone: { fontSize: 15, marginRight: 10 },
  campoInput: { flex: 1, paddingVertical: 13, fontSize: 15, color: '#1F1F1F' },
  linhaDupla: { flexDirection: 'row', gap: 12 },
  metade: { flex: 1 },

  // Categorias
  categoriasGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  categoriaCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E3E9E5',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  categoriaIcone: { fontSize: 24, marginBottom: 4 },
  categoriaTexto: { fontSize: 13, color: '#6A6A6A', fontWeight: '600' },
  categoriaTextoAtiva: { color: '#1F5E3D' },
});
