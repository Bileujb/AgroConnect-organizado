import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BotaoPrimario from './BotaoPrimario';
import { UNIDADES, nomeUnidade } from '../utils/unidades';

const CATEGORIAS = [
  { nome: 'Verduras', icone: '🥬' },
  { nome: 'Legumes', icone: '🥕' },
  { nome: 'Frutas', icone: '🍎' },
  { nome: 'Derivados', icone: '🍯' },
];

// Formulário compartilhado entre cadastro e edição de produto.
// Valida os campos, controla o estado "salvando" e mostra o erro caso aoSalvar falhe.
export default function FormularioProduto({
  titulo,
  subtitulo,
  textoBotao,
  valoresIniciais = {},
  aoSalvar,
  aoVoltar,
}) {
  const insets = useSafeAreaInsets();
  const [nome, setNome] = useState(valoresIniciais.nome || '');
  const [descricao, setDescricao] = useState(valoresIniciais.descricao || '');
  const [preco, setPreco] = useState(valoresIniciais.preco != null ? String(valoresIniciais.preco) : '');
  const [quantidadeEstoque, setQuantidadeEstoque] = useState(
    valoresIniciais.quantidadeEstoque != null ? String(valoresIniciais.quantidadeEstoque) : ''
  );
  const [categoria, setCategoria] = useState(valoresIniciais.categoria || 'Verduras');
  const [unidade, setUnidade] = useState(valoresIniciais.unidade || 'kg');
  const [enviando, setEnviando] = useState(false);

  async function handleSalvar() {
    if (enviando) return;
    const precoNumero = Number(preco.replace(',', '.'));
    const estoqueNumero = Number(quantidadeEstoque);
    if (!nome.trim() || !Number.isFinite(precoNumero) || precoNumero <= 0) {
      Alert.alert('Dados inválidos', 'Informe nome e um preço válido maior que zero.'); return;
    }
    if (quantidadeEstoque.trim() === '' || !Number.isInteger(estoqueNumero) || estoqueNumero < 0) {
      Alert.alert('Quantidade inválida', 'Informe a quantidade disponível como número inteiro (0 ou mais).'); return;
    }
    const dados = {
      nome: nome.trim(),
      descricao,
      preco: precoNumero,
      quantidadeEstoque: estoqueNumero,
      categoria,
      unidade,
      // Edição: estoque que estava no banco quando o formulário abriu (ou na última atualização da lista).
      estoqueAnterior: valoresIniciais.quantidadeEstoque ?? null,
      // O campo de URL saiu do formulário; na edição mantém a imagem que o produto já tinha.
      imagem: valoresIniciais.imagem || null,
    };
    setEnviando(true);
    try {
      await aoSalvar(dados);
    } catch (erro) {
      Alert.alert('Não foi possível salvar', erro.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 + insets.bottom }}
      keyboardShouldPersistTaps="handled"
    >
      <LinearGradient colors={['#0A2818', '#1F5E3D']} style={[styles.topo, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.folhaTopo}>🌱</Text>
        {aoVoltar && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            onPress={aoVoltar}
            hitSlop={12}
            style={({ pressed }) => [styles.botaoVoltar, pressed && { opacity: 0.6 }]}
          >
            <Text style={styles.botaoVoltarTexto}>←</Text>
          </Pressable>
        )}
        <Text style={styles.tituloTopo}>{titulo}</Text>
        {!!subtitulo && <Text style={styles.subtituloTopo}>{subtitulo}</Text>}
      </LinearGradient>

      <View style={styles.card}>
        <View style={styles.campo}>
          <Text style={styles.campoIcone}>🏷️</Text>
          <TextInput style={styles.campoInput} placeholder="Nome do produto" value={nome} onChangeText={setNome} />
        </View>

        <View style={styles.campo}>
          <Text style={styles.campoIcone}>📝</Text>
          <TextInput
            style={styles.campoInput}
            placeholder="Descrição (opcional)"
            value={descricao}
            onChangeText={setDescricao}
            multiline
          />
        </View>

        <Text style={styles.rotuloSecao}>Categoria</Text>
        <View style={styles.categoriasGrid}>
          {CATEGORIAS.map((cat) => {
            const ativa = categoria === cat.nome;
            return (
              <Pressable
                key={cat.nome}
                accessibilityRole="button"
                accessibilityState={{ selected: ativa }}
                style={[styles.categoriaCard, ativa && styles.categoriaCardAtiva]}
                onPress={() => setCategoria(cat.nome)}
              >
                <Text style={styles.categoriaIcone}>{cat.icone}</Text>
                <Text style={[styles.categoriaTexto, ativa && styles.categoriaTextoAtiva]}>{cat.nome}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.rotuloSecao}>Vendido por</Text>
        <View style={styles.unidadesGrid}>
          {UNIDADES.map((u) => {
            const ativa = unidade === u.valor;
            return (
              <Pressable
                key={u.valor}
                accessibilityRole="button"
                accessibilityState={{ selected: ativa }}
                style={[styles.unidadeChip, ativa && styles.unidadeChipAtivo]}
                onPress={() => setUnidade(u.valor)}
              >
                <Text style={[styles.unidadeTexto, ativa && styles.unidadeTextoAtivo]}>{u.singular}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.linhaDupla}>
          <View style={styles.campoMetade}>
            <Text style={styles.rotuloCampo}>Preço por {nomeUnidade(unidade)}</Text>
            <View style={styles.campo}>
              <Text style={styles.campoIcone}>💵</Text>
              <TextInput
                style={styles.campoInput}
                placeholder="0,00"
                value={preco}
                onChangeText={setPreco}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
          <View style={styles.campoMetade}>
            <Text style={styles.rotuloCampo}>Disponível ({nomeUnidade(unidade)})</Text>
            <View style={styles.campo}>
              <Text style={styles.campoIcone}>📦</Text>
              <TextInput
                style={styles.campoInput}
                placeholder="0"
                value={quantidadeEstoque}
                onChangeText={setQuantidadeEstoque}
                keyboardType="number-pad"
              />
            </View>
          </View>
        </View>

        <View style={{ marginTop: 12 }}>
          <BotaoPrimario titulo={enviando ? 'Salvando...' : textoBotao} disabled={enviando} onPress={handleSalvar} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
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
    marginBottom: 12,
  },
  botaoVoltarTexto: { fontSize: 20, color: '#FFFFFF', fontWeight: '700' },
  tituloTopo: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  subtituloTopo: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  card: { paddingHorizontal: 24, paddingTop: 24 },
  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF3EC',
    borderRadius: 30,
    paddingHorizontal: 18,
    marginBottom: 14,
  },
  campoIcone: { fontSize: 15, marginRight: 10 },
  campoInput: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#1F1F1F' },
  rotuloSecao: { fontSize: 13, color: '#6A6A6A', fontWeight: '600', marginBottom: 10, marginTop: 4 },
  categoriasGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 },
  categoriaCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E3E9E5',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  categoriaCardAtiva: { backgroundColor: '#EAF3EC', borderColor: '#2E8B57' },
  categoriaIcone: { fontSize: 26, marginBottom: 6 },
  categoriaTexto: { fontSize: 13, color: '#6A6A6A', fontWeight: '600' },
  categoriaTextoAtiva: { color: '#1F5E3D' },
  rotuloCampo: { fontSize: 12, color: '#6A6A6A', fontWeight: '600', marginBottom: 6, marginLeft: 6 },
  unidadesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  unidadeChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E3E9E5',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  unidadeChipAtivo: { backgroundColor: '#EAF3EC', borderColor: '#2E8B57' },
  unidadeTexto: { fontSize: 13, color: '#6A6A6A', fontWeight: '600' },
  unidadeTextoAtivo: { color: '#1F5E3D' },
  linhaDupla: { flexDirection: 'row', gap: 12 },
  campoMetade: { flex: 1 },
});
