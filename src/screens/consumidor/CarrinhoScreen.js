import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BotaoPrimario from '../../components/BotaoPrimario';
import { useCart } from '../../context/CartContext';
import { useProdutos } from '../../context/ProdutoContext';
import { formatarPreco, nomeUnidade } from '../../utils/unidades';

// Controle − [campo] + para editar a quantidade de um item já no carrinho.
function EditorQuantidade({ item, estoque, onAlterar }) {
  const [texto, setTexto] = useState(String(item.quantidade));
  useEffect(() => { setTexto(String(item.quantidade)); }, [item.quantidade]);
  const limite = Number.isFinite(estoque) ? estoque : Infinity;

  function aplicar(valor) {
    try { onAlterar(valor); }
    catch (erro) { Alert.alert('Confira a quantidade', erro.message); setTexto(String(item.quantidade)); }
  }

  function digitar(valor) {
    const digitos = valor.replace(/\D/g, '');
    setTexto(digitos === '' ? '' : String(Math.min(parseInt(digitos, 10), limite)));
  }

  function confirmar() {
    const valor = parseInt(texto, 10);
    if (!valor || valor < 1) { setTexto(String(item.quantidade)); return; }
    if (valor !== item.quantidade) aplicar(valor);
  }

  const noMinimo = item.quantidade <= 1;
  const noMaximo = item.quantidade >= limite;
  return (
    <View style={styles.controles}>
      <Pressable
        onPress={() => aplicar(item.quantidade - 1)}
        disabled={noMinimo}
        style={[styles.botaoQtd, noMinimo && styles.botaoQtdDesativado]}
        hitSlop={6}
        accessibilityLabel={`Diminuir quantidade de ${item.nome}`}
      >
        <Text style={styles.botaoQtdTexto}>−</Text>
      </Pressable>
      <TextInput
        style={styles.quantidadeValor}
        value={texto}
        onChangeText={digitar}
        onBlur={confirmar}
        onSubmitEditing={confirmar}
        keyboardType="number-pad"
        returnKeyType="done"
        maxLength={7}
        selectTextOnFocus
        textAlign="center"
        accessibilityLabel={`Quantidade de ${item.nome} em ${nomeUnidade(item.unidade)}`}
      />
      <Pressable
        onPress={() => aplicar(item.quantidade + 1)}
        disabled={noMaximo}
        style={[styles.botaoQtd, noMaximo && styles.botaoQtdDesativado]}
        hitSlop={6}
        accessibilityLabel={`Aumentar quantidade de ${item.nome}`}
      >
        <Text style={styles.botaoQtdTexto}>+</Text>
      </Pressable>
      <Text style={styles.quantidadeUnidade}>{nomeUnidade(item.unidade)}</Text>
    </View>
  );
}

export default function CarrinhoScreen({ navigation }) {
  const { itens, removerItem, atualizarQuantidade, valorTotal } = useCart();
  const { produtos } = useProdutos();
  const insets = useSafeAreaInsets();

  function renderItem({ item }) {
    // Estoque atual do produto; se a lista ainda não carregou, o servidor valida no pagamento.
    const estoque = produtos.find((p) => p.id === item.produtoId)?.quantidadeEstoque;
    return (
      <View style={styles.card}>
        <View style={styles.cardIcone}>
          <Text style={{ fontSize: 22 }}>🌿</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemNome} numberOfLines={1}>{item.nome}</Text>
          <Text style={styles.itemQuantidade}>
            {formatarPreco(item.precoUnitario)} / {nomeUnidade(item.unidade)}
          </Text>
          <EditorQuantidade
            item={item}
            estoque={estoque}
            onAlterar={(qtd) => atualizarQuantidade(item.produtoId, qtd, estoque)}
          />
          <Text style={styles.itemValor}>{formatarPreco(item.quantidade * item.precoUnitario)}</Text>
        </View>
        <Pressable
          onPress={() => removerItem(item.produtoId)}
          style={styles.botaoRemover}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Remover ${item.nome}`}
        >
          <Text style={styles.botaoRemoverTexto}>✕</Text>
        </Pressable>
      </View>
    );
  }

  if (itens.length === 0) {
    return (
      <View style={[styles.container, styles.vazioCaixa]}>
        <Text style={styles.vazioIcone}>🛒</Text>
        <Text style={styles.vazioTitulo}>Seu carrinho está vazio</Text>
        <Text style={styles.vazioTexto}>Escolha produtos fresquinhos direto do produtor.</Text>
        <View style={{ alignSelf: 'stretch', marginTop: 16 }}>
          <BotaoPrimario titulo="Ver produtos" onPress={() => navigation.navigate('Catalogo')} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={itens}
        keyboardShouldPersistTaps="handled"
        keyExtractor={(item) => item.produtoId}
        contentContainerStyle={styles.lista}
        renderItem={renderItem}
        ListHeaderComponent={
          <Text style={styles.contagem}>
            {itens.length} {itens.length === 1 ? 'produto' : 'produtos'} no carrinho
          </Text>
        }
      />

      <View style={[styles.rodape, { paddingBottom: 12 + insets.bottom }]}>
        <View style={styles.totalLinha}>
          <Text style={styles.totalRotulo}>Total estimado</Text>
          <Text style={styles.totalValor}>{formatarPreco(valorTotal)}</Text>
        </View>
        <Text style={styles.aviso}>Pedidos de produtores diferentes são enviados separadamente.</Text>
        <BotaoPrimario titulo="Ir para pagamento" onPress={() => navigation.navigate('Pagamento')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4FAF6' },
  lista: { padding: 16, paddingBottom: 24 },
  contagem: { fontSize: 13, color: '#6A7A6F', marginBottom: 10, marginLeft: 4 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E3E9E5',
  },
  cardIcone: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#EAF3EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemNome: { fontSize: 15, fontWeight: '700', color: '#1F1F1F' },
  itemQuantidade: { fontSize: 13, color: '#6A7A6F', marginTop: 2 },
  itemValor: { fontSize: 15, fontWeight: '800', color: '#2E8B57', marginTop: 4 },
  controles: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  botaoQtd: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EAF3EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoQtdDesativado: { opacity: 0.4 },
  botaoQtdTexto: { fontSize: 18, color: '#1F5E3D', fontWeight: '800' },
  quantidadeValor: {
    minWidth: 44,
    paddingVertical: 2,
    fontSize: 16,
    fontWeight: '800',
    color: '#1F1F1F',
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#CFE3D6',
  },
  quantidadeUnidade: { fontSize: 12, color: '#6A7A6F' },
  botaoRemover: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FDE8E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoRemoverTexto: { color: '#B3261E', fontSize: 14, fontWeight: '800' },
  rodape: {
    paddingHorizontal: 16,
    paddingTop: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E3E9E5',
  },
  totalLinha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  totalRotulo: { fontSize: 15, fontWeight: '700', color: '#4A4A4A' },
  totalValor: { fontSize: 22, fontWeight: '800', color: '#1F5E3D' },
  aviso: { fontSize: 12, color: '#6A7A6F', marginTop: 4, marginBottom: 12 },
  vazioCaixa: { alignItems: 'center', justifyContent: 'center', padding: 32, gap: 6 },
  vazioIcone: { fontSize: 52 },
  vazioTitulo: { fontSize: 18, fontWeight: '800', color: '#1F5E3D' },
  vazioTexto: { fontSize: 14, color: '#6A7A6F', textAlign: 'center' },
});
