import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import EstadoLista from '../../components/EstadoLista';
import BotaoPrimario from '../../components/BotaoPrimario';
import MenuConta from '../../components/MenuConta';
import { useAuth } from '../../context/AuthContext';
import { useProdutos } from '../../context/ProdutoContext';
import { formatarPreco } from '../../utils/formatar';

export default function HomeProdutorScreen({ navigation }) {
  const insets = useSafeAreaInsets(); // espaço do notch/barra de status do celular
  const { usuario, logout } = useAuth();
  const { produtosDoProdutor, removerProduto, carregando, erro, recarregar } = useProdutos();
  const [menuAberto, setMenuAberto] = useState(false); // true = menu da conta aparecendo
  const primeiroNome = usuario?.nome?.split(' ')[0] || 'Produtor';

  const meusProdutos = produtosDoProdutor(usuario?.id);

  function confirmarExclusao(produto) {
    Alert.alert('Excluir produto', `Tem certeza que deseja excluir "${produto.nome}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await removerProduto(produto.id);
          } catch (erro) {
            Alert.alert('Não foi possível excluir', erro.message);
          }
        },
      },
    ]);
  }

  useFocusEffect(
    useCallback(() => {
      recarregar();
    }, [recarregar])
  );

  // Pergunta antes de sair, para evitar sair por um toque sem querer.
  function confirmarSaida() {
    Alert.alert('Sair da conta?', 'Você precisará entrar de novo para gerenciar seus produtos.', [
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

  // Opções do menu da conta (☰). O mesmo MenuConta do consumidor, com opções do produtor.
  const opcoesMenu = [
    { icone: '👤', texto: 'Atualizar cadastro', aoTocar: () => navigation.navigate('MeuPerfil') },
    {
      icone: '📋',
      texto: 'Pedidos recebidos',
      aoTocar: () => navigation.navigate('PedidosProdutor'),
    },
    { icone: '🔒', texto: 'Alterar senha', aoTocar: () => navigation.navigate('AlterarSenha') },
    { icone: '🚪', texto: 'Sair', aoTocar: confirmarSaida, perigo: true },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Cabeçalho: saudação à esquerda; atalho dos pedidos e menu à direita */}
      <View style={styles.cabecalho}>
        <View style={{ flex: 1 }}>
          <Text style={styles.saudacao} numberOfLines={1}>
            Olá, {primeiroNome} 👋
          </Text>
          <Text style={styles.subSaudacao}>Como está a sua banca hoje?</Text>
        </View>

        <View style={styles.acoesTopo}>
          <Pressable
            onPress={() => navigation.navigate('PedidosProdutor')}
            style={styles.botaoRedondo}
            accessibilityRole="button"
            accessibilityLabel="Ver pedidos recebidos"
          >
            <Text style={styles.botaoRedondoIcone}>📋</Text>
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
      </View>

      <EstadoLista carregando={carregando} erro={erro} recarregar={recarregar} />
      <View style={styles.cardMetrica}>
        <Text style={styles.metricaValor}>{meusProdutos.length}</Text>
        <Text style={styles.metricaLabel}>Produtos cadastrados</Text>
      </View>

      <View style={{ paddingHorizontal: 20 }}>
        <BotaoPrimario
          titulo="+ Cadastrar Produto"
          onPress={() => navigation.navigate('CadastrarProduto')}
        />
      </View>

      <FlatList
        style={{ marginTop: 20 }}
        refreshing={carregando}
        onRefresh={recarregar}
        data={meusProdutos}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          meusProdutos.length > 0 ? <Text style={styles.subtitulo}>Meus produtos</Text> : null
        }
        renderItem={({ item }) => (
          <View style={styles.itemProduto}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemNome}>{item.nome}</Text>
              <Text style={styles.itemCategoria}>{item.categoria}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.itemPreco}>{formatarPreco(item.preco)}</Text>
              <Text style={styles.itemEstoque}>Estoque: {item.quantidadeEstoque}</Text>
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 6 }}>
                <Pressable onPress={() => navigation.navigate('EditarProduto', { produto: item })}>
                  <Text style={styles.editar}>Editar</Text>
                </Pressable>
                <Pressable onPress={() => confirmarExclusao(item)}>
                  <Text style={styles.excluir}>Excluir</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.vazio}>
            Nenhum produto cadastrado ainda. Toque em “Cadastrar Produto” acima.
          </Text>
        }
      />

      {/* Menu da conta. Fica por último para aparecer por cima de tudo. */}
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
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  saudacao: { fontSize: 19, fontWeight: '800', color: '#1F5E3D' },
  subSaudacao: { fontSize: 13, color: '#6A7A6F', marginTop: 2 },
  acoesTopo: { flexDirection: 'row', gap: 10 },
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
  cardMetrica: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E3E9E5',
    marginBottom: 16,
  },
  metricaValor: { fontSize: 28, fontWeight: '800', color: '#2E8B57' },
  metricaLabel: { fontSize: 13, color: '#4A4A4A', marginTop: 4 },
  subtitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F5E3D',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  itemProduto: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E3E9E5',
  },
  itemNome: { fontSize: 15, fontWeight: '600', color: '#1F1F1F' },
  itemCategoria: { fontSize: 13, color: '#666666', marginTop: 2 },
  itemPreco: { fontSize: 15, fontWeight: '700', color: '#2E8B57' },
  itemEstoque: { fontSize: 13, color: '#666666', marginTop: 2 },
  editar: { color: '#2E8B57', fontSize: 13, fontWeight: '600' },
  excluir: { color: '#B23A3A', fontSize: 13, marginTop: 6, fontWeight: '600' },
  vazio: { textAlign: 'center', color: '#888888', marginTop: 40, paddingHorizontal: 40 },
});
