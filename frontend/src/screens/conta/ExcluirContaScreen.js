import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import CampoTexto from '../../components/CampoTexto';

export default function ExcluirContaScreen({ navigation }) {
  const { usuario, excluirConta } = useAuth();
  const [senha, setSenha] = useState('');
  const [ciente, setCiente] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState('');
  const produtor = usuario?.tipoUsuario === 'produtor';
  const podeExcluir = ciente && senha.length > 0 && !excluindo;

  async function confirmar() {
    if (!podeExcluir) return;
    setErro('');
    setExcluindo(true);
    try {
      await excluirConta(senha);
      Alert.alert('Conta excluída', 'Seus dados pessoais foram removidos do AgroConnect.');
    } catch (falha) {
      setErro(falha.message);
      setExcluindo(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.pagina} keyboardShouldPersistTaps="handled">
      <Text style={styles.titulo}>Excluir minha conta</Text>
      <Text style={styles.paragrafo}>
        Esta ação é permanente e não pode ser desfeita. Ao excluir sua conta:
      </Text>

      <View style={styles.quadro}>
        <Text style={styles.item}>
          • Seu login é apagado e não será possível entrar novamente com este e-mail e senha.
        </Text>
        <Text style={styles.item}>
          • Nome, e-mail, cidade
          {produtor ? ', CNPJ, nome e endereço da fazenda' : ' e endereço de entrega'} são removidos
          do seu perfil.
        </Text>
        {produtor && <Text style={styles.item}>• Seus produtos saem do catálogo.</Text>}
        <Text style={styles.item}>• Comentários das suas avaliações são apagados.</Text>
        <Text style={styles.item}>
          • Pedidos já concluídos ficam guardados sem seu nome, apenas para cumprir obrigações
          legais.
        </Text>
      </View>

      <Text style={styles.aviso}>
        Se houver pedidos aguardando, confirmados ou em rota, conclua ou cancele esses pedidos antes
        de excluir.
      </Text>

      <Text style={styles.rotulo}>Digite sua senha para confirmar</Text>
      <CampoTexto
        icone="🔒"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        editable={!excluindo}
        placeholder="Senha"
      />

      <Pressable
        style={styles.aceite}
        onPress={() => setCiente(!ciente)}
        disabled={excluindo}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: ciente }}
      >
        <View style={[styles.caixa, ciente && styles.caixaMarcada]}>
          {ciente && <Text style={styles.caixaMarca}>✓</Text>}
        </View>
        <Text style={styles.aceiteTexto}>Entendo que a exclusão é permanente.</Text>
      </Pressable>

      {erro ? <Text style={styles.erro}>{erro}</Text> : null}

      <Pressable
        style={({ pressed }) => [
          styles.botaoExcluir,
          !podeExcluir && styles.botaoDesabilitado,
          pressed && styles.pressionado,
        ]}
        onPress={confirmar}
        disabled={!podeExcluir}
        accessibilityRole="button"
      >
        <Text style={styles.botaoExcluirTexto}>
          {excluindo ? 'Excluindo...' : 'Excluir conta permanentemente'}
        </Text>
      </Pressable>

      <Pressable
        style={styles.botaoCancelar}
        onPress={() => navigation.goBack()}
        disabled={excluindo}
      >
        <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pagina: { padding: 24, paddingBottom: 40, backgroundColor: '#FFFFFF', flexGrow: 1 },
  titulo: { fontSize: 24, fontWeight: '800', color: '#B3261E', marginBottom: 8 },
  paragrafo: { fontSize: 15, lineHeight: 22, color: '#3A3A3A', marginBottom: 12 },
  quadro: { backgroundColor: '#FDECEA', borderRadius: 12, padding: 16, gap: 8 },
  item: { fontSize: 14, lineHeight: 20, color: '#5A1D18' },
  aviso: { fontSize: 13, lineHeight: 19, color: '#6A6A6A', marginTop: 12 },
  rotulo: { color: '#4A4A4A', marginTop: 20, marginBottom: 8 },
  aceite: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16 },
  caixa: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#B3261E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  caixaMarcada: { backgroundColor: '#B3261E' },
  caixaMarca: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  aceiteTexto: { flex: 1, fontSize: 14, color: '#3A3A3A' },
  erro: { color: '#B3261E', fontSize: 14, marginTop: 16 },
  botaoExcluir: {
    backgroundColor: '#B3261E',
    minHeight: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  botaoDesabilitado: { backgroundColor: '#E3A9A4' },
  pressionado: { opacity: 0.8 },
  botaoExcluirTexto: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  botaoCancelar: { minHeight: 48, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  botaoCancelarTexto: { color: '#2E8B57', fontSize: 15, fontWeight: '700' },
});
