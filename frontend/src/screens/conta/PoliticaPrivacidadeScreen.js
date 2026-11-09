import React from 'react';
import { ScrollView, View, Text, StyleSheet, Linking } from 'react-native';

export const EMAIL_PRIVACIDADE = 'contatoagroconnect@gmail.com';
export const VERSAO_POLITICA = '3 de novembro de 2026';

const secoes = [
  {
    titulo: '1. Quem somos',
    paragrafos: [
      'O AgroConnect é um aplicativo que aproxima produtores rurais de consumidores. Ele é desenvolvido como projeto acadêmico pela equipe AgroConnect, que atua como controladora dos dados pessoais tratados no aplicativo, nos termos da Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 — LGPD).',
    ],
  },
  {
    titulo: '2. Dados que coletamos',
    itens: [
      'Dados de conta: nome completo, e-mail e senha. A senha é processada pelo serviço de autenticação do Supabase e não fica guardada pela nossa API.',
      'Dados de perfil: cidade. Para produtores, também nome da fazenda ou sítio, CNPJ e endereço da fazenda. Para consumidores, endereço de entrega.',
      'Dados de uso do marketplace: produtos cadastrados, pedidos (itens, valores, endereço e cidade de entrega, andamento) e avaliações com nota e comentário.',
      'Dados de sessão: o token de acesso fica guardado no armazenamento seguro do seu aparelho para manter você conectado. O carrinho fica apenas no aparelho até a compra ser finalizada.',
    ],
    paragrafos: [
      'Não coletamos localização por GPS, contatos, fotos, dados de pagamento nem dados pessoais sensíveis.',
    ],
  },
  {
    titulo: '3. Para que usamos e com qual base legal',
    itens: [
      'Criar e manter sua conta, permitir o login e a recuperação de senha: execução de contrato (art. 7º, V, da LGPD).',
      'Exibir produtos, registrar pedidos, organizar a entrega e permitir avaliações: execução de contrato (art. 7º, V).',
      'Enviar e-mails de confirmação de conta e de redefinição de senha: execução de contrato (art. 7º, V).',
      'Proteger as contas e evitar fraudes, como pedidos duplicados: legítimo interesse (art. 7º, IX).',
      'Guardar registros de pedidos quando a lei exigir: cumprimento de obrigação legal (art. 7º, II).',
    ],
    paragrafos: [
      'Usamos apenas os dados necessários para essas finalidades. Não enviamos publicidade e não usamos seus dados para criar perfis de comportamento.',
    ],
  },
  {
    titulo: '4. Com quem compartilhamos',
    itens: [
      'Entre usuários do pedido: o produtor vê o nome do consumidor e o endereço de entrega do pedido que recebeu. O consumidor vê o nome do produtor ou da fazenda e a cidade do produtor.',
      'Supabase: fornecedor que hospeda o banco de dados e a autenticação, atuando como operador e tratando os dados apenas conforme nossas instruções.',
      'Autoridades públicas: somente quando houver obrigação legal ou ordem judicial.',
    ],
    paragrafos: ['Não vendemos nem alugamos dados pessoais.'],
  },
  {
    titulo: '5. Armazenamento e segurança',
    paragrafos: [
      'Os dados ficam no Supabase, em servidores da região de São Paulo. O aplicativo não acessa o banco diretamente: todas as operações passam pela nossa API, que confere a sessão do usuário e se ele é dono do registro. A conexão com o banco é criptografada e as tabelas ficam em um schema privado.',
      'Nenhum sistema é totalmente imune a falhas. Se ocorrer um incidente de segurança que possa causar risco ou dano relevante, comunicaremos os titulares afetados e a Autoridade Nacional de Proteção de Dados (ANPD), conforme o art. 48 da LGPD.',
    ],
  },
  {
    titulo: '6. Por quanto tempo guardamos',
    paragrafos: [
      'Mantemos seus dados enquanto sua conta estiver ativa. Quando você exclui a conta, apagamos seu login, removemos nome, e-mail, cidade, CNPJ e endereços do perfil, retiramos seus produtos do catálogo e apagamos os comentários das suas avaliações.',
      'Os pedidos já realizados (itens, valores e endereço de entrega) continuam guardados sem o seu nome pelo prazo exigido em lei, para cumprir obrigações legais e fiscais (art. 16 da LGPD).',
    ],
  },
  {
    titulo: '7. Seus direitos',
    intro: 'Pelo art. 18 da LGPD, você pode solicitar a qualquer momento:',
    itens: [
      'Confirmação de que tratamos seus dados e acesso a eles.',
      'Correção de dados incompletos, inexatos ou desatualizados.',
      'Anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade com a lei.',
      'Portabilidade dos dados a outro fornecedor.',
      'Informação sobre com quem compartilhamos seus dados.',
      'Eliminação dos dados e exclusão da conta.',
      'Revisão de decisões tomadas apenas com base em tratamento automatizado.',
    ],
  },
  {
    titulo: '8. Como exercer seus direitos',
    paragrafos: [
      'Você pode corrigir nome, cidade e endereços a qualquer momento em Meu Perfil, e excluir sua conta em Meu Perfil > Excluir minha conta. Para os demais pedidos, envie um e-mail a partir do endereço cadastrado para o contato abaixo. Responderemos em até 15 dias.',
      'Se não ficar satisfeito com a resposta, você também pode apresentar reclamação à ANPD pelo site gov.br/anpd.',
    ],
  },
  {
    titulo: '9. Cookies e rastreamento',
    paragrafos: [
      'O aplicativo não usa cookies de publicidade, ferramentas de análise ou rastreadores de terceiros. Na versão web, a sessão é guardada temporariamente no navegador e apagada ao fechar a aba ou sair da conta.',
    ],
  },
  {
    titulo: '10. Público',
    paragrafos: [
      'O AgroConnect é destinado a maiores de 18 anos, pois envolve a compra e a venda de produtos. Não coletamos intencionalmente dados de crianças ou adolescentes.',
    ],
  },
  {
    titulo: '11. Alterações nesta política',
    paragrafos: [
      'Podemos atualizar esta política quando o aplicativo mudar. A data da versão vigente fica no topo desta tela, e mudanças relevantes serão avisadas no aplicativo.',
    ],
  },
];

export default function PoliticaPrivacidadeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.pagina}>
      <Text style={styles.titulo}>Política de Privacidade</Text>
      <Text style={styles.versao}>Última atualização: {VERSAO_POLITICA}</Text>
      <Text style={styles.paragrafo}>
        Esta política explica, de forma simples, quais dados pessoais o AgroConnect coleta, por que
        coleta, com quem compartilha e como você pode exercer seus direitos.
      </Text>

      {secoes.map((secao) => (
        <View key={secao.titulo} style={styles.secao}>
          <Text style={styles.subtitulo}>{secao.titulo}</Text>
          {secao.intro && <Text style={styles.paragrafo}>{secao.intro}</Text>}
          {secao.itens?.map((item) => (
            <View key={item} style={styles.item}>
              <Text style={styles.marcador}>•</Text>
              <Text style={styles.itemTexto}>{item}</Text>
            </View>
          ))}
          {secao.paragrafos?.map((p) => (
            <Text key={p} style={styles.paragrafo}>
              {p}
            </Text>
          ))}
        </View>
      ))}

      <View style={styles.contato}>
        <Text style={styles.subtitulo}>12. Contato</Text>
        <Text style={styles.paragrafo}>Dúvidas e solicitações sobre seus dados pessoais:</Text>
        <Text style={styles.email} onPress={() => Linking.openURL(`mailto:${EMAIL_PRIVACIDADE}`)}>
          {EMAIL_PRIVACIDADE}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pagina: { padding: 24, paddingBottom: 40, backgroundColor: '#FFFFFF', flexGrow: 1 },
  titulo: { fontSize: 24, fontWeight: '800', color: '#1F5E3D' },
  versao: { fontSize: 13, color: '#8A8A8A', marginTop: 4, marginBottom: 16 },
  secao: { marginTop: 20 },
  subtitulo: { fontSize: 17, fontWeight: '700', color: '#1F5E3D', marginBottom: 8 },
  paragrafo: { fontSize: 15, lineHeight: 22, color: '#3A3A3A', marginBottom: 8 },
  item: { flexDirection: 'row', marginBottom: 8, paddingRight: 8 },
  marcador: { fontSize: 15, lineHeight: 22, color: '#2E8B57', width: 16 },
  itemTexto: { flex: 1, fontSize: 15, lineHeight: 22, color: '#3A3A3A' },
  contato: { marginTop: 24, padding: 16, borderRadius: 12, backgroundColor: '#EAF3EC' },
  email: { fontSize: 15, fontWeight: '700', color: '#2E8B57' },
});
