import React, { useCallback, useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import EstadoLista from '../../components/EstadoLista';
import ProdutoCard from '../../components/ProdutoCard';
import MenuConta from '../../components/MenuConta';
import { useProdutos } from '../../context/ProdutoContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { calcularDistanciaEntreCidades } from '../../utils/distanciaCidades';

const CATEGORIAS = [
  { nome: 'Todos', icone: '🌾' },
  { nome: 'Verduras', icone: '🥬' },
  { nome: 'Legumes', icone: '🥕' },
  { nome: 'Frutas', icone: '🍎' },
  { nome: 'Derivados', icone: '🍯' },
];

export default function CatalogoScreen({ navigation }) {
  const { produtos, carregando, erro, recarregar } = useProdutos();
  const { usuario } = useAuth();
  const { itens } = useCart();
  const insets = useSafeAreaInsets();
  const [busca, setBusca] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');

  const produtosFiltrados = produtos
    .filter((p) => {
      const bateBusca = `${p.nome} ${p.nomeProdutor || ''} ${p.nomeFazenda || ''}`.toLowerCase().includes(busca.toLowerCase());
      const bateCategoria = categoriaAtiva === 'Todos' || p.categoria === categoriaAtiva;
      return bateBusca && bateCategoria;
    })
    .sort((a, b) => {
      const distanciaA = calcularDistanciaEntreCidades(usuario?.cidade, a.cidadeProdutor);
      const distanciaB = calcularDistanciaEntreCidades(usuario?.cidade, b.cidadeProdutor);
      return distanciaA - distanciaB; // menor distância primeiro
    });

  // Completa a última linha da grade para o card sozinho não esticar a largura toda.
  const dadosGrade = produtosFiltrados.length % 2 === 1
    ? [...produtosFiltrados, { id: '__espaco', espaco: true }]
    : produtosFiltrados;

  useFocusEffect(useCallback(() => { recarregar(); }, [recarregar]));

  const cabecalhoLista = (
    <View>
      <TextInput
        style={styles.busca}
        placeholder="🔍  Buscar produtos, produtores..."
        placeholderTextColor="#8A978F"
        value={busca}
        onChangeText={setBusca}
      />

      <View style={styles.destaque}>
        <Text style={styles.destaqueTitulo}>🌾 Direto do produtor</Text>
        <Text style={styles.destaqueTexto}>Sem intermediários, colhido recentemente</Text>
      </View>

      <View style={styles.categorias}>
        {CATEGORIAS.map((item) => {
          const ativa = categoriaAtiva === item.nome;
          return (
            <Pressable
              key={item.nome}
              onPress={() => setCategoriaAtiva(item.nome)}
              style={[styles.categoriaBotao, ativa && styles.categoriaBotaoAtivo]}
              accessibilityRole="button"
              accessibilityState={{ selected: ativa }}
            >
              <Text style={styles.categoriaBotaoIcone}>{item.icone}</Text>
              <Text
                style={[styles.categoriaBotaoTexto, ativa && styles.categoriaBotaoTextoAtivo]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                {item.nome}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.secaoLinha}>
        <Text style={styles.secaoTitulo}>
          {categoriaAtiva === 'Todos' ? 'Produtos perto de você' : categoriaAtiva}
        </Text>
        <Text style={styles.secaoContagem}>
          {produtosFiltrados.length} {produtosFiltrados.length === 1 ? 'item' : 'itens'}
        </Text>
      </View>

      <EstadoLista carregando={carregando} erro={erro} recarregar={recarregar} />
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.cabecalho}>
        <View style={styles.saudacaoBloco}>
          <Text style={styles.saudacao} numberOfLines={1}>
            Olá, {usuario?.nome?.split(' ')[0] || 'Consumidor'} 👋
          </Text>
          <Text style={styles.subSaudacao}>O que vamos colher hoje?</Text>
        </View>

        <View style={styles.acoesCabecalho}>
          <Pressable
            onPress={() => navigation.navigate('Carrinho')}
            style={styles.iconeBotao}
            accessibilityRole="button"
            accessibilityLabel="Carrinho"
          >
            <Text style={styles.iconeTexto}>🛒</Text>
            {itens.length > 0 && (
              <View style={styles.carrinhoBadge}>
                <Text style={styles.carrinhoBadgeTexto}>{itens.length}</Text>
              </View>
            )}
          </Pressable>
          <MenuConta
            navigation={navigation}
            itensExtras={[
              { icone: '📦', rotulo: 'Meus pedidos', onPress: () => navigation.navigate('MeusPedidos') },
            ]}
          />
        </View>
      </View>

      <FlatList
        refreshing={carregando}
        onRefresh={recarregar}
        data={dadosGrade}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        ListHeaderComponent={cabecalhoLista}
        contentContainerStyle={styles.grade}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        renderItem={({ item }) =>
          item.espaco ? (
            <View style={styles.cardEspaco} />
          ) : (
            <ProdutoCard
              produto={item}
              onPress={() => navigation.navigate('DetalheProduto', { produto: item })}
            />
          )
        }
        ListEmptyComponent={
          !carregando && !erro ? (
            <View style={styles.vazioCaixa}>
              <Text style={styles.vazioIcone}>🧺</Text>
              <Text style={styles.vazioTitulo}>Nenhum produto encontrado</Text>
              <Text style={styles.vazio}>
                {busca || categoriaAtiva !== 'Todos'
                  ? 'Tente outra busca ou categoria.'
                  : 'Os produtores ainda não cadastraram produtos.'}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4FAF6' },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 12,
  },
  saudacaoBloco: { flex: 1 },
  saudacao: { fontSize: 20, fontWeight: '800', color: '#1F5E3D' },
  subSaudacao: { fontSize: 13, color: '#6A7A6F', marginTop: 2 },
  acoesCabecalho: { flexDirection: 'row', gap: 8 },
  iconeBotao: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E3E9E5',
  },
  iconeTexto: { fontSize: 18 },
  carrinhoBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#2E8B57',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  carrinhoBadgeTexto: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  grade: { paddingHorizontal: 10, paddingBottom: 24 },
  busca: {
    marginHorizontal: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3E9E5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  destaque: {
    marginHorizontal: 6,
    marginTop: 12,
    backgroundColor: '#1F5E3D',
    borderRadius: 16,
    padding: 16,
  },
  destaqueTitulo: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  destaqueTexto: { color: '#CFE8DA', fontSize: 13, marginTop: 4 },
  categorias: { flexDirection: 'row', gap: 6, paddingHorizontal: 6, paddingVertical: 14 },
  categoriaBotao: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3E9E5',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 2,
  },
  categoriaBotaoAtivo: { backgroundColor: '#EAF3EC', borderColor: '#2E8B57' },
  categoriaBotaoIcone: { fontSize: 22, marginBottom: 4 },
  categoriaBotaoTexto: { fontSize: 11, color: '#6A6A6A', fontWeight: '600' },
  categoriaBotaoTextoAtivo: { color: '#1F5E3D' },
  secaoLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 6,
    marginBottom: 4,
  },
  secaoTitulo: { fontSize: 16, fontWeight: '800', color: '#1F1F1F' },
  secaoContagem: { fontSize: 12, color: '#6A7A6F' },
  cardEspaco: { flex: 1, margin: 6 },
  vazioCaixa: { alignItems: 'center', paddingVertical: 40, gap: 4 },
  vazioIcone: { fontSize: 40, marginBottom: 4 },
  vazioTitulo: { fontSize: 15, fontWeight: '800', color: '#1F5E3D' },
  vazio: { textAlign: 'center', color: '#6A7A6F', fontSize: 13 },
});
