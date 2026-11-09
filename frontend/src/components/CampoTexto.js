import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';

// Campo de texto no estilo do app: fundo verde-claro, cantos arredondados e ícone à esquerda.
// Props:
//   rotulo          → texto acima do campo (opcional)
//   icone           → emoji à esquerda (opcional)
//   secureTextEntry → campo de senha: esconde o texto e mostra o "olhinho" para revelar
//   todas as outras props vão direto para o TextInput (value, onChangeText, placeholder,
//   keyboardType, multiline, editable...)
export default function CampoTexto({ rotulo, icone, multiline, secureTextEntry, ...propsDoInput }) {
  const ehSenha = !!secureTextEntry;
  const [senhaVisivel, setSenhaVisivel] = useState(false); // começa escondida

  return (
    <View style={styles.bloco}>
      {!!rotulo && <Text style={styles.rotulo}>{rotulo}</Text>}
      <View style={[styles.campo, multiline && styles.campoMultilinha]}>
        {!!icone && (
          <Text style={[styles.icone, multiline && styles.iconeMultilinha]}>{icone}</Text>
        )}
        <TextInput
          style={[styles.input, multiline && styles.inputMultilinha]}
          placeholderTextColor="#9AA79F"
          multiline={multiline}
          // Senha: esconde enquanto o olhinho estiver fechado e não corrige/capitaliza o texto
          secureTextEntry={ehSenha && !senhaVisivel}
          autoCapitalize={ehSenha ? 'none' : propsDoInput.autoCapitalize}
          autoCorrect={ehSenha ? false : propsDoInput.autoCorrect}
          {...propsDoInput}
        />

        {/* Olhinho: só aparece em campo de senha */}
        {ehSenha && (
          <Pressable
            onPress={() => setSenhaVisivel((atual) => !atual)}
            hitSlop={10}
            style={styles.olho}
            accessibilityRole="button"
            accessibilityLabel={senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'}
          >
            <Text style={styles.olhoIcone}>{senhaVisivel ? '🙈' : '👁️'}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bloco: { marginBottom: 14 },
  rotulo: { fontSize: 13, color: '#4A5A50', fontWeight: '600', marginBottom: 6 },
  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF3EC',
    borderRadius: 30,
    paddingHorizontal: 18,
  },
  // Campo de várias linhas (ex.: comentário): cantos menos redondos e ícone no alto
  campoMultilinha: { borderRadius: 18, alignItems: 'flex-start', paddingTop: 4 },
  icone: { fontSize: 15, marginRight: 10 },
  iconeMultilinha: { marginTop: 10 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#1F1F1F' },
  inputMultilinha: { minHeight: 96, textAlignVertical: 'top' },
  olho: { paddingLeft: 10, paddingVertical: 6 },
  olhoIcone: { fontSize: 17 },
});
