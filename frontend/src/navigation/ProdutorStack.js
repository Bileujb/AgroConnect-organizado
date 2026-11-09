import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeProdutorScreen from '../screens/produtor/HomeProdutorScreen';
import PedidosProdutorScreen from '../screens/produtor/PedidosProdutorScreen';
import CadastrarProdutoScreen from '../screens/produtor/CadastrarProdutoScreen';
import EditarProdutoScreen from '../screens/produtor/EditarProdutoScreen';

const Stack = createNativeStackNavigator();

// Telas do produtor. A primeira da lista é a que abre depois do login.
export default function ProdutorStack() {
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: '#1F5E3D' }}>
      <Stack.Screen
        name="HomeProdutor"
        component={HomeProdutorScreen}
        options={{ title: 'Início', headerShown: false }}
      />
      <Stack.Screen
        name="PedidosProdutor"
        component={PedidosProdutorScreen}
        options={{ title: 'Pedidos recebidos' }}
      />
      {/* O formulário tem o próprio topo verde com seta de voltar, então a barra padrão fica escondida */}
      <Stack.Screen
        name="CadastrarProduto"
        component={CadastrarProdutoScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditarProduto"
        component={EditarProdutoScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
