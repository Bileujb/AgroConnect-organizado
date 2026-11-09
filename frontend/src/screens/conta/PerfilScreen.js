import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import SeletorCidade from '../../components/SeletorCidade';
import BotaoPrimario from '../../components/BotaoPrimario';
import CampoTexto from '../../components/CampoTexto';

// Tela "Meu Perfil": o usuário atualiza os dados do cadastro.
// O produtor vê os campos da fazenda; o consumidor vê o endereço de entrega.
export default function PerfilScreen({ navigation }) {
  const { usuario, atualizarPerfil } = useAuth();
  const ehProdutor = usuario.tipoUsuario === 'produtor';

  // Todos os campos ficam num objeto só. Começam com os dados atuais do usuário.
  const [dados, setDados] = useState({
    nome: usuario.nome || '',
    cidade: usuario.cidade || '',
    nomeFazenda: usuario.nomeFazenda || '',
    cnpj: usuario.cnpj || '',
    enderecoFazenda: usuario.enderecoFazenda || '',
    enderecoEntrega: usuario.enderecoEntrega || '',
  });
  const [salvando, setSalvando] = useState(false);

  // Muda um campo e mantém os outros. Ex.: mudarCampo('nome', 'Maria')
  function mudarCampo(nome, valor) {
    setDados((atual) => ({ ...atual, [nome]: valor }));
  }

  async function salvar() {
    if (salvando) return;
    setSalvando(true);
    try {
      await atualizarPerfil(dados);
      Alert.alert('Perfil atualizado', 'Seus dados foram salvos.');
      navigation.goBack();
    } catch (erro) {
      Alert.alert('Não foi possível salvar', erro.message);
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
      {/* Cartão com quem está logado */}
      <View style={styles.cartaoConta}>
        <View style={styles.avatar}>
          <Text style={styles.avatarLetra}>{(usuario.nome || '?').charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.nomeConta} numberOfLines={1}>
            {usuario.nome}
          </Text>
          <Text style={styles.emailConta} numberOfLines={1}>
            {usuario.email}
          </Text>
        </View>
        <View style={styles.etiquetaTipo}>
          <Text style={styles.etiquetaTipoTexto}>
            {ehProdutor ? '🚜 Produtor' : '🛒 Consumidor'}
          </Text>
        </View>
      </View>

      <CampoTexto
        rotulo="Nome completo"
        icone="👤"
        value={dados.nome}
        onChangeText={(valor) => mudarCampo('nome', valor)}
        editable={!salvando}
      />

      <Text style={styles.rotulo}>Cidade</Text>
      <SeletorCidade
        cidadeSelecionada={dados.cidade}
        onSelecionar={(valor) => mudarCampo('cidade', valor)}
      />

      {ehProdutor ? (
        <>
          <CampoTexto
            rotulo="Nome da fazenda/sítio"
            icone="🌾"
            value={dados.nomeFazenda}
            onChangeText={(valor) => mudarCampo('nomeFazenda', valor)}
            editable={!salvando}
          />
          <CampoTexto
            rotulo="CNPJ"
            icone="🧾"
            value={dados.cnpj}
            onChangeText={(valor) => mudarCampo('cnpj', valor)}
            keyboardType="numeric"
            editable={!salvando}
          />
          <CampoTexto
            rotulo="Endereço da fazenda"
            icone="📍"
            value={dados.enderecoFazenda}
            onChangeText={(valor) => mudarCampo('enderecoFazenda', valor)}
            editable={!salvando}
          />
        </>
      ) : (
        <CampoTexto
          rotulo="Endereço de entrega"
          icone="📍"
          value={dados.enderecoEntrega}
          onChangeText={(valor) => mudarCampo('enderecoEntrega', valor)}
          editable={!salvando}
        />
      )}

      <View style={{ marginTop: 6 }}>
        <BotaoPrimario
          titulo={salvando ? 'Salvando...' : 'Salvar perfil'}
          disabled={salvando}
          onPress={salvar}
        />
      </View>

      {/* Links da conta */}
      <View style={styles.links}>
        <Text style={styles.link} onPress={() => navigation.navigate('AlterarSenha')}>
          🔒 Alterar senha
        </Text>
        <Text style={styles.link} onPress={() => navigation.navigate('PoliticaPrivacidade')}>
          📄 Política de Privacidade
        </Text>
        <Text style={styles.linkExcluir} onPress={() => navigation.navigate('ExcluirConta')}>
          Excluir minha conta
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#FFFFFF' },
  conteudo: { padding: 24, paddingBottom: 40 },

  // Cartão da conta
  cartaoConta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F4FAF6',
    borderRadius: 18,
    padding: 14,
    marginBottom: 22,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#2E8B57',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetra: { color: '#FFFFFF', fontSize: 19, fontWeight: '800' },
  nomeConta: { fontSize: 16, fontWeight: '700', color: '#1F1F1F' },
  emailConta: { fontSize: 12, color: '#6A7A6F', marginTop: 2 },
  etiquetaTipo: {
    backgroundColor: '#E3F2E1',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  etiquetaTipoTexto: { fontSize: 11, fontWeight: '700', color: '#1F5E3D' },

  rotulo: { fontSize: 13, color: '#4A5A50', fontWeight: '600', marginBottom: 6 },

  // Links
  links: { marginTop: 22, gap: 16, alignItems: 'center' },
  link: { color: '#2E8B57', fontWeight: '700' },
  linkExcluir: { color: '#B3261E', fontWeight: '700', marginTop: 6 },
});
