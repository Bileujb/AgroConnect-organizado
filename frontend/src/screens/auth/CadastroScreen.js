import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView, Pressable } from 'react-native';
import BotaoPrimario from '../../components/BotaoPrimario';
import SeletorCidade from '../../components/SeletorCidade';
import { useAuth } from '../../context/AuthContext';
import CampoTexto from '../../components/CampoTexto';

export default function CadastroScreen({ route, navigation }) {
  const perfil = route.params?.perfil || 'consumidor';
  const { cadastrar } = useAuth();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [cidade, setCidade] = useState('');
  const [nomeFazenda, setNomeFazenda] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [enderecoFazenda, setEnderecoFazenda] = useState('');
  const [enderecoEntrega, setEnderecoEntrega] = useState('');
  const [aceitouPolitica, setAceitouPolitica] = useState(false);

  async function handleCadastro() {
    if (enviando) return;
    if (!nome.trim() || !email.trim() || !senha) {
      Alert.alert('Campos obrigatórios', 'Preencha nome, e-mail e senha.');
      return;
    }
    if (senha.length < 8 || senha !== confirmacao) {
      Alert.alert('Confira as senhas', 'Use pelo menos 8 caracteres e repita a mesma senha.');
      return;
    }
    if (!cidade) {
      Alert.alert('Cidade obrigatória', 'Selecione sua cidade.');
      return;
    }
    if (perfil === 'produtor' && (!nomeFazenda.trim() || !cnpj.trim() || !enderecoFazenda.trim())) {
      Alert.alert('Dados da fazenda', 'Preencha nome da fazenda, CNPJ e endereço.');
      return;
    }
    if (perfil === 'consumidor' && !enderecoEntrega.trim()) {
      Alert.alert('Endereço obrigatório', 'Informe o endereço de entrega.');
      return;
    }
    if (!aceitouPolitica) {
      Alert.alert(
        'Política de Privacidade',
        'Leia e confirme a Política de Privacidade para criar a conta.'
      );
      return;
    }
    setEnviando(true);
    try {
      const resposta = await cadastrar({
        nome: nome.trim(),
        email: email.trim(),
        senha,
        tipoUsuario: perfil,
        cidade,
        nomeFazenda: nomeFazenda.trim(),
        cnpj: cnpj.trim(),
        enderecoFazenda: enderecoFazenda.trim(),
        enderecoEntrega: enderecoEntrega.trim(),
      });
      if (resposta.confirmarEmail) {
        Alert.alert('Confira seu e-mail', resposta.mensagem);
        navigation.navigate('Login', { perfil });
      }
    } catch (erro) {
      Alert.alert('Não foi possível cadastrar', erro.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable style={styles.botaoVoltar} onPress={() => navigation.goBack()}>
        <Text style={styles.botaoVoltarTexto}>‹</Text>
      </Pressable>

      <Text style={styles.titulo}>Cadastro</Text>
      <Text style={styles.subtitulo}>
        Crie sua conta de {perfil === 'produtor' ? 'Produtor' : 'Consumidor'}
      </Text>

      <View style={styles.campo}>
        <Text style={styles.campoIcone}>👤</Text>
        <TextInput
          style={styles.campoInput}
          placeholder="Nome completo"
          value={nome}
          onChangeText={setNome}
        />
      </View>

      <View style={styles.campo}>
        <Text style={styles.campoIcone}>✉️</Text>
        <TextInput
          style={styles.campoInput}
          placeholder="E-mail"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      <CampoTexto
        icone="🔒"
        placeholder="Senha (mínimo 8 caracteres)"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />

      <CampoTexto
        icone="🔒"
        placeholder="Confirmar senha"
        value={confirmacao}
        onChangeText={setConfirmacao}
        secureTextEntry
      />
      <Text style={styles.rotuloSecao}>Cidade</Text>
      <SeletorCidade cidadeSelecionada={cidade} onSelecionar={setCidade} />

      {perfil === 'produtor' && (
        <>
          <View style={styles.campo}>
            <Text style={styles.campoIcone}>🚜</Text>
            <TextInput
              style={styles.campoInput}
              placeholder="Nome da fazenda/sítio"
              value={nomeFazenda}
              onChangeText={setNomeFazenda}
            />
          </View>
          <View style={styles.campo}>
            <Text style={styles.campoIcone}>📄</Text>
            <TextInput
              style={styles.campoInput}
              placeholder="CNPJ"
              value={cnpj}
              onChangeText={setCnpj}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.campo}>
            <Text style={styles.campoIcone}>📍</Text>
            <TextInput
              style={styles.campoInput}
              placeholder="Endereço da fazenda"
              value={enderecoFazenda}
              onChangeText={setEnderecoFazenda}
            />
          </View>
        </>
      )}

      {perfil === 'consumidor' && (
        <View style={styles.campo}>
          <Text style={styles.campoIcone}>📍</Text>
          <TextInput
            style={styles.campoInput}
            placeholder="Endereço de entrega"
            value={enderecoEntrega}
            onChangeText={setEnderecoEntrega}
          />
        </View>
      )}

      <View style={styles.aceite}>
        <Pressable
          style={[styles.caixa, aceitouPolitica && styles.caixaMarcada]}
          onPress={() => setAceitouPolitica(!aceitouPolitica)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: aceitouPolitica }}
          accessibilityLabel="Li e concordo com a Política de Privacidade"
          hitSlop={8}
        >
          {aceitouPolitica && <Text style={styles.caixaMarca}>✓</Text>}
        </Pressable>
        <Text style={styles.aceiteTexto}>
          Li e concordo com a{' '}
          <Text
            style={styles.linkDestaque}
            onPress={() => navigation.navigate('PoliticaPrivacidade')}
          >
            Política de Privacidade
          </Text>
          , que explica como meus dados são usados.
        </Text>
      </View>

      <View style={{ marginTop: 16 }}>
        <BotaoPrimario
          titulo={enviando ? 'Cadastrando...' : 'Criar conta'}
          disabled={enviando}
          onPress={handleCadastro}
        />
      </View>

      <Text style={styles.link} onPress={() => navigation.goBack()}>
        Já tenho conta — <Text style={styles.linkDestaque}>Entrar</Text>
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 28, paddingTop: 50, backgroundColor: '#FFFFFF', flexGrow: 1 },
  botaoVoltar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2E8B57',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  botaoVoltarTexto: { color: '#FFFFFF', fontSize: 22, fontWeight: '700', marginTop: -2 },
  titulo: { fontSize: 26, fontWeight: '800', color: '#1F5E3D' },
  subtitulo: { fontSize: 14, color: '#8A8A8A', marginTop: 4, marginBottom: 24 },
  rotuloSecao: { fontSize: 13, color: '#6A6A6A', fontWeight: '600', marginBottom: 8, marginTop: 4 },
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
  aceite: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 4, gap: 12 },
  caixa: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#2E8B57',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  caixaMarcada: { backgroundColor: '#2E8B57' },
  caixaMarca: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  aceiteTexto: { flex: 1, fontSize: 14, lineHeight: 20, color: '#4A4A4A' },
  link: { marginTop: 20, marginBottom: 20, textAlign: 'center', color: '#6A6A6A', fontSize: 14 },
  linkDestaque: { color: '#2E8B57', fontWeight: '700' },
});
