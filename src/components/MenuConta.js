import React, { useRef, useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

/**
 * Botão ☰ com o menu da conta.
 * Sempre mostra: Alterar perfil, Alterar senha e Sair.
 * `itensExtras` entram no topo do menu: [{ icone, rotulo, onPress }].
 */
export default function MenuConta({ navigation, itensExtras = [] }) {
  const { usuario, logout } = useAuth();
  const [aberto, setAberto] = useState(false);
  const [posicaoTopo, setPosicaoTopo] = useState(70);
  const botaoRef = useRef(null);

  function abrir() {
    // Posiciona o menu logo abaixo do botão, independente do cabeçalho da tela.
    if (botaoRef.current?.measureInWindow) {
      botaoRef.current.measureInWindow((_x, y, _largura, altura) => {
        if (typeof y === 'number' && typeof altura === 'number') setPosicaoTopo(y + altura + 8);
        setAberto(true);
      });
    } else {
      setAberto(true);
    }
  }

  async function sair() {
    try { await logout(); }
    catch { Alert.alert('Sessão local encerrada', 'A conexão com o servidor estava indisponível.'); }
  }

  function escolher(acao) {
    setAberto(false);
    acao();
  }

  const itens = [
    ...itensExtras,
    { icone: '👤', rotulo: 'Alterar perfil', onPress: () => navigation.navigate('MeuPerfil') },
    { icone: '🔒', rotulo: 'Alterar senha', onPress: () => navigation.navigate('AlterarSenha') },
    {
      icone: '🚪',
      rotulo: 'Sair',
      destrutivo: true,
      onPress: () => Alert.alert('Sair da conta', 'Deseja realmente sair?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: sair },
      ]),
    },
  ];

  return (
    <>
      <Pressable
        ref={botaoRef}
        onPress={abrir}
        style={styles.botao}
        accessibilityRole="button"
        accessibilityLabel="Abrir menu da conta"
      >
        <Text style={styles.botaoIcone}>☰</Text>
      </Pressable>

      <Modal visible={aberto} transparent animationType="fade" onRequestClose={() => setAberto(false)}>
        <Pressable style={styles.fundo} onPress={() => setAberto(false)}>
          <View style={[styles.caixa, { marginTop: posicaoTopo }]} onStartShouldSetResponder={() => true}>
            <View style={styles.topo}>
              <Text style={styles.nome} numberOfLines={1}>{usuario?.nome || 'Minha conta'}</Text>
              {!!usuario?.email && <Text style={styles.email} numberOfLines={1}>{usuario.email}</Text>}
            </View>
            {itens.map((item, indice) => (
              <Pressable
                key={item.rotulo}
                style={({ pressed }) => [
                  styles.item,
                  indice === itens.length - 1 && styles.itemUltimo,
                  pressed && styles.itemPressionado,
                ]}
                onPress={() => escolher(item.onPress)}
              >
                <Text style={[styles.itemTexto, item.destrutivo && styles.itemDestrutivo]}>
                  {item.icone}  {item.rotulo}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  botao: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E3E9E5',
  },
  botaoIcone: { fontSize: 20, color: '#1F5E3D', fontWeight: '700' },
  fundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', alignItems: 'flex-end' },
  caixa: {
    marginRight: 16,
    width: 240,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  topo: { padding: 14, backgroundColor: '#EAF3EC' },
  nome: { fontSize: 15, fontWeight: '800', color: '#1F5E3D' },
  email: { fontSize: 12, color: '#6A7A6F', marginTop: 2 },
  item: { paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#EEF2EF' },
  itemUltimo: { borderBottomWidth: 0 },
  itemPressionado: { backgroundColor: '#F4FAF6' },
  itemTexto: { fontSize: 15, color: '#2B2B2B', fontWeight: '600' },
  itemDestrutivo: { color: '#B3261E' },
});
