import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import BotaoPrimario from '../../components/BotaoPrimario';
import CampoTexto from '../../components/CampoTexto';

const TAMANHO_MINIMO = 8;

// Tela para trocar a senha. Pede a senha atual para confirmar que é o dono da conta.
export default function AlterarSenhaScreen({ navigation }) {
  const { alterarSenha } = useAuth();
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    if (salvando) return;
    if (!senhaAtual) {
      Alert.alert('Confira a senha', 'Informe sua senha atual.');
      return;
    }
    if (novaSenha.length < TAMANHO_MINIMO) {
      Alert.alert(
        'Confira a senha',
        `A nova senha precisa ter pelo menos ${TAMANHO_MINIMO} caracteres.`
      );
      return;
    }
    if (novaSenha !== confirmacao) {
      Alert.alert('Confira a senha', 'A confirmação está diferente da nova senha.');
      return;
    }

    setSalvando(true);
    try {
      await alterarSenha(senhaAtual, novaSenha);
      Alert.alert('Senha alterada', 'Use a nova senha no próximo login.');
      navigation.goBack();
    } catch (erro) {
      Alert.alert('Não foi possível alterar', erro.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ScrollView
      style={styles.tela}
      contentContainerStyle={styles.conteudo}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.aviso}>
        <Text style={styles.avisoIcone}>🔒</Text>
        <Text style={styles.avisoTexto}>
          Confirme sua senha atual e escolha uma nova com pelo menos {TAMANHO_MINIMO} caracteres.
        </Text>
      </View>

      <CampoTexto
        rotulo="Senha atual"
        icone="🔑"
        value={senhaAtual}
        onChangeText={setSenhaAtual}
        secureTextEntry
        editable={!salvando}
      />
      <CampoTexto
        rotulo="Nova senha"
        icone="🔒"
        value={novaSenha}
        onChangeText={setNovaSenha}
        secureTextEntry
        editable={!salvando}
      />
      <CampoTexto
        rotulo="Confirmar nova senha"
        icone="🔒"
        value={confirmacao}
        onChangeText={setConfirmacao}
        secureTextEntry
        editable={!salvando}
      />

      <View style={{ marginTop: 6 }}>
        <BotaoPrimario
          titulo={salvando ? 'Alterando...' : 'Alterar senha'}
          disabled={salvando}
          onPress={salvar}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#FFFFFF' },
  conteudo: { padding: 24 },
  aviso: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: '#F4FAF6',
    borderRadius: 16,
    padding: 14,
    marginBottom: 22,
  },
  avisoIcone: { fontSize: 22 },
  avisoTexto: { flex: 1, fontSize: 13, color: '#4A5A50', lineHeight: 19 },
});
