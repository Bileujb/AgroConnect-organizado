import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Pressable, Alert, Image, Keyboard, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BotaoPrimario from '../../components/BotaoPrimario';
import { useCart } from '../../context/CartContext';
import { useProdutos } from '../../context/ProdutoContext';
import { formatarPreco, nomeUnidade, quantidadeComUnidade } from '../../utils/unidades';

export default function DetalheProdutoScreen({ route, navigation }) {
  const { produtos } = useProdutos();
  // Estoque mais recente da lista (o parâmetro da rota é uma cópia de quando a tela abriu).
  const produto = produtos.find((p) => p.id === route.params.produto.id) || route.params.produto;
  const { adicionarItem, itens } = useCart();
  const insets = useSafeAreaInsets();
  const [alturaTeclado, setAlturaTeclado] = useState(0);

  // Sobe a barra de quantidade junto com o teclado para o campo não ficar escondido.
  useEffect(() => {
    const ios = Platform.OS === 'ios';
    const abrir = Keyboard.addListener(ios ? 'keyboardWillShow' : 'keyboardDidShow', (e) => setAlturaTeclado(e.endCoordinates.height));
    const fechar = Keyboard.addListener(ios ? 'keyboardWillHide' : 'keyboardDidHide', () => setAlturaTeclado(0));
    return () => { abrir.remove(); fechar.remove(); };
  }, []);
  // Texto do campo de quantidade: pode ficar vazio enquanto a pessoa digita.
  const [textoQtd, setTextoQtd] = useState('1');
  const quantidade = parseInt(textoQtd, 10) || 0;
  const setQuantidade = (valor) => setTextoQtd(String(typeof valor === 'function' ? valor(quantidade) : valor));
  // Desconta o que já está no carrinho para não deixar escolher além do disponível.
  const noCarrinho = itens.find((i) => i.produtoId === produto.id)?.quantidade || 0;
  const disponivel = Math.max(0, produto.quantidadeEstoque - noCarrinho);
  const temEstoque = disponivel > 0;

  useEffect(() => {
    if (disponivel > 0 && quantidade > disponivel) setTextoQtd(String(disponivel));
  }, [disponivel, quantidade]);

  function digitarQuantidade(texto) {
    const digitos = texto.replace(/\D/g, '');
    if (digitos === '') { setTextoQtd(''); return; }
    // Não deixa passar do disponível: "150" com 100 em estoque vira 100.
    setTextoQtd(String(Math.min(parseInt(digitos, 10), disponivel)));
  }

  function corrigirQuantidade() {
    if (quantidade < 1) setTextoQtd('1');
  }

  function diminuir() {
    setQuantidade((atual) => Math.max(1, Math.min(disponivel, atual - 1)));
  }

  function aumentar() {
    setQuantidade((atual) => Math.min(disponivel, Math.max(1, atual + 1)));
  }

  function adicionar() {
    if (quantidade < 1) { Alert.alert('Confira a quantidade', 'Informe pelo menos 1.'); return; }
    try { adicionarItem(produto, quantidade); navigation.navigate('Carrinho'); }
    catch (erro) { Alert.alert('Confira a quantidade', erro.message); }
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.imagem}>
          {produto.imagem ? (
            <Image source={{ uri: produto.imagem }} style={styles.imagemFoto} resizeMode="cover" />
          ) : (
            <Text style={styles.imagemEmoji}>🌱</Text>
          )}
        </View>

        <View style={styles.conteudo}>
          <View style={styles.tagCategoria}>
            <Text style={styles.tagCategoriaTexto}>{produto.categoria}</Text>
          </View>

          <Text style={styles.nome}>{produto.nome}</Text>

          <View style={styles.precoLinha}>
            <Text style={styles.preco}>{formatarPreco(produto.preco)}</Text>
            <Text style={styles.precoUnidade}> / {nomeUnidade(produto.unidade)}</Text>
          </View>

          <Text style={[styles.estoque, !temEstoque && styles.semEstoque]}>
            {temEstoque
              ? `✓ ${quantidadeComUnidade(disponivel, produto.unidade)} disponíveis`
              : noCarrinho > 0
                ? `Você já tem todo o estoque no carrinho (${quantidadeComUnidade(noCarrinho, produto.unidade)})`
                : 'Sem estoque no momento'}
          </Text>

          <View style={styles.produtorCard}>
            <Text style={styles.produtorIcone}>🧑‍🌾</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.produtorNome} numberOfLines={1}>
                {produto.nomeFazenda || produto.nomeProdutor || 'Produtor local'}
              </Text>
              {!!produto.cidadeProdutor && (
                <Text style={styles.produtorCidade} numberOfLines={1}>📍 {produto.cidadeProdutor}</Text>
              )}
            </View>
            {produto.notaMedia != null && (
              <View style={styles.nota}>
                <Text style={styles.notaTexto}>⭐ {Number(produto.notaMedia).toFixed(1)}</Text>
              </View>
            )}
          </View>

          {!!produto.descricao && (
            <>
              <Text style={styles.secaoTitulo}>Sobre o produto</Text>
              <Text style={styles.descricao}>{produto.descricao}</Text>
            </>
          )}

          <View style={styles.rastreabilidade}>
            <Text style={styles.rastreabilidadeTitulo}>🌾 Direto do produtor</Text>
            <Text style={styles.rastreabilidadeTexto}>
              Produzido por um agricultor familiar cadastrado no AgroConnect, sem intermediários.
            </Text>
          </View>
        </View>
      </ScrollView>

      {temEstoque && (
        <View style={[styles.rodape, { paddingBottom: 12 + (alturaTeclado > 0 ? 0 : insets.bottom), marginBottom: alturaTeclado }]}>
          <View style={styles.controles}>
            <Pressable
              onPress={diminuir}
              disabled={quantidade <= 1}
              style={[styles.botaoQtd, quantidade <= 1 && styles.botaoQtdDesativado]}
              accessibilityLabel="Diminuir quantidade"
            >
              <Text style={styles.botaoQtdTexto}>−</Text>
            </Pressable>
            <View style={styles.quantidadeCaixa}>
              <TextInput
                style={styles.quantidadeValor}
                value={textoQtd}
                onChangeText={digitarQuantidade}
                onBlur={corrigirQuantidade}
                onSubmitEditing={corrigirQuantidade}
                keyboardType="number-pad"
                returnKeyType="done"
                maxLength={7}
                selectTextOnFocus
                textAlign="center"
                accessibilityLabel={`Quantidade em ${nomeUnidade(produto.unidade)}`}
              />
              <Text style={styles.quantidadeUnidade}>{nomeUnidade(produto.unidade)}</Text>
            </View>
            <Pressable
              onPress={aumentar}
              disabled={quantidade >= disponivel}
              style={[styles.botaoQtd, quantidade >= disponivel && styles.botaoQtdDesativado]}
              accessibilityLabel="Aumentar quantidade"
            >
              <Text style={styles.botaoQtdTexto}>+</Text>
            </Pressable>
          </View>
          <View style={{ flex: 1 }}>
            <BotaoPrimario
              titulo={`Adicionar · ${formatarPreco(quantidade * produto.preco)}`}
              disabled={quantidade < 1}
              onPress={adicionar}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4FAF6' },
  imagem: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: '#E8F3EC',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  imagemFoto: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  imagemEmoji: { fontSize: 64 },
  conteudo: {
    marginTop: -24,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingTop: 22,
    minHeight: 300,
  },
  tagCategoria: {
    alignSelf: 'flex-start',
    backgroundColor: '#EAF3EC',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  tagCategoriaTexto: { color: '#1F5E3D', fontSize: 12, fontWeight: '700' },
  nome: { fontSize: 24, fontWeight: '800', color: '#1F1F1F' },
  precoLinha: { flexDirection: 'row', alignItems: 'baseline', marginTop: 6 },
  preco: { fontSize: 24, fontWeight: '800', color: '#2E8B57' },
  precoUnidade: { fontSize: 15, fontWeight: '600', color: '#6A7A6F' },
  estoque: { fontSize: 13, color: '#2E8B57', fontWeight: '600', marginTop: 6 },
  semEstoque: { color: '#B3261E' },
  produtorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 18,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E3E9E5',
    backgroundColor: '#FFFFFF',
  },
  produtorIcone: { fontSize: 26 },
  produtorNome: { fontSize: 15, fontWeight: '700', color: '#1F1F1F' },
  produtorCidade: { fontSize: 13, color: '#6A7A6F', marginTop: 2 },
  nota: { backgroundColor: '#FFF7E6', borderRadius: 12, paddingVertical: 4, paddingHorizontal: 8 },
  notaTexto: { fontSize: 13, fontWeight: '700', color: '#B8791E' },
  secaoTitulo: { fontSize: 16, fontWeight: '800', color: '#1F1F1F', marginTop: 20 },
  descricao: { fontSize: 15, color: '#4A4A4A', marginTop: 6, lineHeight: 22 },
  rastreabilidade: { marginTop: 20, backgroundColor: '#EAF3EC', borderRadius: 14, padding: 14 },
  rastreabilidadeTitulo: { fontWeight: '700', color: '#1F5E3D', marginBottom: 4 },
  rastreabilidadeTexto: { fontSize: 14, color: '#3A4A40', lineHeight: 20 },
  rodape: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E3E9E5',
  },
  controles: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  botaoQtd: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EAF3EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoQtdDesativado: { opacity: 0.4 },
  botaoQtdTexto: { fontSize: 20, color: '#1F5E3D', fontWeight: '800' },
  quantidadeCaixa: { alignItems: 'center' },
  quantidadeValor: {
    width: 56,
    paddingVertical: 4,
    fontSize: 18,
    fontWeight: '800',
    color: '#1F1F1F',
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#CFE3D6',
  },
  quantidadeUnidade: { fontSize: 11, color: '#6A7A6F' },
});
