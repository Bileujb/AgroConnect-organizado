import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import EstadoLista from '../../components/EstadoLista';
import ProdutoCard from '../../components/ProdutoCard';
import MenuConta from '../../components/MenuConta';
import { useProdutos } from '../../context/ProdutoContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { calcularDistanciaEntreCidades } from '../../utils/distanciaCidades';
import { VISUAL_CATEGORIA } from '../../constants/categorias';

// Botões de filtro: "Todos" + as categorias do arquivo central (constants/categorias.js).
// Assim, uma categoria nova aparece aqui, no card e no formulário de produto ao mesmo tempo.
const CATEGORIAS = [
  { nome: 'Todos', icone: '🌾' },
  ...Object.entries(VISUAL_CATEGORIA).map(([nome, visual]) => ({ nome, icone: visual.icone })),
];

export default function CatalogoScreen({ navigation }) {
  const insets = useSafeAreaInsets(); // espaço do notch/barra de status do celular
  const { produtos, carregando, erro, recarregar } = useProdutos();
  const { usuario, logout } = useAuth();
  const { itens, adicionarItem } = useCart();
  const [busca, setBusca] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [menuAberto, setMenuAberto] = useState(false);

  // Soma das unidades no carrinho (ex.: 2 alfaces + 1 tomate = 3).
  const totalUnidades = itens.reduce((soma, item) => soma + item.quantidade, 0);
  const primeiroNome = usuario?.nome?.split(' ')[0] || 'Consumidor';

  // Filtra pela busca e pela categoria, e mostra primeiro os produtores mais próximos.
  const produtosFiltrados = produtos
    .filter((p) => {
      const textoProduto = `${p.nome} ${p.nomeProdutor || ''} ${p.nomeFazenda || ''}`.toLowerCase();
      const bateBusca = textoProduto.includes(busca.toLowerCase());
      const bateCategoria = categoriaAtiva === 'Todos' || p.categoria === categoriaAtiva;
      return bateBusca && bateCategoria;
    })
    .sort((a, b) => {
      const distanciaA = calcularDistanciaEntreCidades(usuario?.cidade, a.cidadeProdutor);
      const distanciaB = calcularDistanciaEntreCidades(usuario?.cidade, b.cidadeProdutor);
      return distanciaA - distanciaB;
    });

  useFocusEffect(
    useCallback(() => {
      recarregar();
    }, [recarregar])
  );

  function confirmarSaida() {
    Alert.alert('Sair da conta?', 'Você precisará entrar de novo para fazer pedidos.', [
      { text: 'Cancelar' },
      { text: 'Sair', style: 'destructive', onPress: sair },
    ]);
  }

  async function sair() {
    try {
      await logout();
    } catch {
      Alert.alert('Sessão local encerrada', 'A conexão com o servidor estava indisponível.');
    }
  }

  // Botão "+" do card: adiciona 1 unidade sem sair do catálogo.
  function adicionarRapido(produto) {
    try {
      adicionarItem(produto, 1);
    } catch (falha) {
      Alert.alert('Não foi possível adicionar', falha.message);
    }
  }

  // Opções do menu da conta.
  const opcoesMenu = [
    { icone: '👤', texto: 'Atualizar cadastro', aoTocar: () => navigation.navigate('MeuPerfil') },
    { icone: '📦', texto: 'Meus pedidos', aoTocar: () => navigation.navigate('MeusPedidos') },
    { icone: '🔒', texto: 'Alterar senha', aoTocar: () => navigation.navigate('AlterarSenha') },
    { icone: '🚪', texto: 'Sair', aoTocar: confirmarSaida, perigo: true },
  ];

  // Tudo que fica acima dos produtos. Vai dentro da lista para rolar junto com ela.
  const topo = (
    <View>
      <EstadoLista carregando={carregando} erro={erro} recarregar={recarregar} />

      <View style={styles.busca}>
        <Text style={styles.buscaIcone}>🔍</Text>
        <TextInput
          style={styles.buscaInput}
          placeholder="Buscar produtos, produtores..."
          placeholderTextColor="#8A968E"
          value={busca}
          onChangeText={setBusca}
        />
      </View>

      <View style={styles.destaque}>
        <Text style={styles.destaqueTitulo}>🌾 Direto do produtor</Text>
        <Text style={styles.destaqueTexto}>Sem intermediários, colhido recentemente</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categorias}
      >
        {CATEGORIAS.map((categoria) => {
          const ativa = categoriaAtiva === categoria.nome;
          return (
            <Pressable
              key={categoria.nome}
              onPress={() => setCategoriaAtiva(categoria.nome)}
              style={[styles.chip, ativa && styles.chipAtivo]}
            >
              <Text style={styles.chipIcone}>{categoria.icone}</Text>
              <Text style={[styles.chipTexto, ativa && styles.chipTextoAtivo]}>
                {categoria.nome}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Barra fixa do topo: saudação, carrinho e menu */}
      <View style={styles.barraTopo}>
        <View style={{ flex: 1 }}>
          <Text style={styles.saudacao} numberOfLines={1}>
            Olá, {primeiroNome} 👋
          </Text>
          <Text style={styles.subSaudacao}>O que vamos colher hoje?</Text>
        </View>

        <Pressable
          onPress={() => navigation.navigate('Carrinho')}
          style={styles.botaoRedondo}
          accessibilityRole="button"
          accessibilityLabel="Abrir carrinho"
        >
          <Text style={styles.botaoRedondoIcone}>🛒</Text>
          {totalUnidades > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeTexto}>{totalUnidades}</Text>
            </View>
          )}
        </Pressable>

        <Pressable
          onPress={() => setMenuAberto(true)}
          style={styles.botaoRedondo}
          accessibilityRole="button"
          accessibilityLabel="Abrir menu da conta"
        >
          <Text style={styles.botaoMenuIcone}>☰</Text>
        </Pressable>
      </View>

      <FlatList
        data={produtosFiltrados}
        keyExtractor={(item) => item.id}
        numColumns={2}
        ListHeaderComponent={topo}
        refreshing={carregando}
        onRefresh={recarregar}
        contentContainerStyle={styles.lista}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          // Cada coluna ocupa metade da largura, mesmo quando sobra um produto sozinho.
          <View style={styles.coluna}>
            <ProdutoCard
              produto={item}
              onPress={() => navigation.navigate('DetalheProduto', { produto: item })}
              onAdicionar={() => adicionarRapido(item)}
            />
          </View>
        )}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhum produto encontrado.</Text>}
      />

      <MenuConta
        visivel={menuAberto}
        aoFechar={() => setMenuAberto(false)}
        usuario={usuario}
        opcoes={opcoesMenu}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4FAF6' },

  // Barra do topo
  barraTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
  saudacao: { fontSize: 19, fontWeight: '800', color: '#1F5E3D' },
  subSaudacao: { fontSize: 13, color: '#6A7A6F', marginTop: 2 },
  botaoRedondo: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E3E9E5',
  },
  botaoRedondoIcone: { fontSize: 18 },
  botaoMenuIcone: { fontSize: 20, color: '#1F5E3D', fontWeight: '700' },
  badge: {
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
  badgeTexto: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },

  // Lista e topo da lista
  lista: { paddingHorizontal: 10, paddingBottom: 24 },
  busca: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 6,
    marginTop: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3E9E5',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  buscaIcone: { fontSize: 15, marginRight: 8 },
  buscaInput: { flex: 1, paddingVertical: 11, fontSize: 14, color: '#1F1F1F' },
  destaque: {
    marginHorizontal: 6,
    marginTop: 12,
    backgroundColor: '#1F5E3D',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  destaqueTitulo: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  destaqueTexto: { color: '#CFE8DA', fontSize: 12, marginTop: 2 },
  categorias: { paddingHorizontal: 6, paddingVertical: 12, gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3E9E5',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  chipAtivo: { backgroundColor: '#2E8B57', borderColor: '#2E8B57' },
  chipIcone: { fontSize: 15 },
  chipTexto: { fontSize: 13, color: '#4A5A50', fontWeight: '600' },
  chipTextoAtivo: { color: '#FFFFFF' },
  coluna: { width: '50%' },
  vazio: { textAlign: 'center', color: '#888888', marginTop: 40 },
});
