import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Menu da conta que sobe da parte de baixo da tela.
// Props:
//   visivel  → true para mostrar o menu
//   aoFechar → chamado ao tocar fora do menu ou em "Fechar"
//   usuario  → mostra nome e e-mail no topo do menu
//   opcoes   → lista de { icone, texto, aoTocar, perigo }
//              (perigo: true deixa a opção em vermelho, ex.: Sair)
export default function MenuConta({ visivel, aoFechar, usuario, opcoes }) {
  const insets = useSafeAreaInsets();

  // Fecha o menu antes de executar a opção escolhida.
  function escolher(opcao) {
    aoFechar();
    opcao.aoTocar();
  }

  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={aoFechar}>
      {/* Fundo escuro: tocar nele fecha o menu */}
      <Pressable style={styles.fundo} onPress={aoFechar}>
        {/* O Pressable vazio impede que o toque dentro do menu feche o menu */}
        <Pressable
          style={[styles.painel, { paddingBottom: 16 + insets.bottom }]}
          onPress={() => {}}
        >
          <View style={styles.alca} />

          <View style={styles.usuario}>
            <View style={styles.avatar}>
              <Text style={styles.avatarLetra}>
                {(usuario?.nome || '?').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.nome} numberOfLines={1}>
                {usuario?.nome}
              </Text>
              <Text style={styles.email} numberOfLines={1}>
                {usuario?.email}
              </Text>
            </View>
          </View>

          {opcoes.map((opcao) => (
            <Pressable
              key={opcao.texto}
              style={({ pressed }) => [styles.opcao, pressed && styles.opcaoPressionada]}
              onPress={() => escolher(opcao)}
              accessibilityRole="button"
            >
              <Text style={styles.opcaoIcone}>{opcao.icone}</Text>
              <Text style={[styles.opcaoTexto, opcao.perigo && styles.opcaoPerigo]}>
                {opcao.texto}
              </Text>
            </Pressable>
          ))}

          <Pressable style={styles.fechar} onPress={aoFechar} accessibilityRole="button">
            <Text style={styles.fecharTexto}>Fechar</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  painel: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  alca: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D5DDD8',
    marginBottom: 16,
  },
  usuario: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2EF',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2E8B57',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetra: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  nome: { fontSize: 16, fontWeight: '700', color: '#1F1F1F' },
  email: { fontSize: 13, color: '#6A7A6F', marginTop: 2 },
  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  opcaoPressionada: { backgroundColor: '#F1F7F3' },
  opcaoIcone: { fontSize: 20, width: 28, textAlign: 'center' },
  opcaoTexto: { fontSize: 15, color: '#1F1F1F', fontWeight: '600' },
  opcaoPerigo: { color: '#B3261E' },
  fechar: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F1F4F2',
    alignItems: 'center',
  },
  fecharTexto: { fontSize: 15, color: '#1F5E3D', fontWeight: '700' },
});
