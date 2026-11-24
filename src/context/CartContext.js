import React, { createContext, useContext, useEffect, useState, useMemo, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { adicionarAoCarrinho, chaveCarrinho, lerCarrinhoSalvo } from '../utils/carrinho';
const CartContext = createContext(null);
export function CartProvider({ children }) {
  const { usuario } = useAuth();
  const chaveSalva = usuario?.id ? chaveCarrinho(usuario.id) : null;
  const [itens, setItens] = useState([]);
  // Guarda de qual conta o carrinho já foi lido. Só salvamos depois dessa leitura:
  // sem esta trava, o carrinho vazio do primeiro render seria gravado por cima do
  // carrinho salvo, ou os itens de uma conta iriam para a chave de outra.
  const [carregadoPara, setCarregadoPara] = useState(null);
  const carregado = carregadoPara !== null && carregadoPara === chaveSalva;
  const solicitacao = useRef({ assinatura: '', chave: '' });

  // 1) Ao abrir o app (ou trocar de conta), recupera o carrinho daquela conta.
  useEffect(() => {
    let ativo = true;
    setItens([]);
    if (!chaveSalva) { setCarregadoPara(null); return undefined; }
    AsyncStorage.getItem(chaveSalva)
      .then((texto) => { if (ativo) setItens(lerCarrinhoSalvo(texto)); })
      .catch(() => {}) // Falha de leitura: segue com o carrinho vazio.
      .finally(() => { if (ativo) setCarregadoPara(chaveSalva); });
    return () => { ativo = false; };
  }, [chaveSalva]);

  // 2) Depois de carregado, cada mudança nos itens é gravada no aparelho.
  useEffect(() => {
    if (!carregado) return;
    const gravacao = itens.length
      ? AsyncStorage.setItem(chaveSalva, JSON.stringify(itens))
      : AsyncStorage.removeItem(chaveSalva);
    gravacao.catch(() => {}); // O carrinho continua funcionando em memória.
  }, [itens, carregado, chaveSalva]);

  function adicionarItem(produto, quantidade = 1) {
    // Validação antes do setState permite mostrar o erro no evento do botão.
    const novos = adicionarAoCarrinho(itens, produto, quantidade);
    setItens(novos);
  }
  function chaveCheckout() {
    const assinatura = JSON.stringify(itens.map((i) => [i.produtoId, i.quantidade]));
    if (assinatura !== solicitacao.current.assinatura) solicitacao.current = {
      assinatura, chave: `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`,
    };
    return solicitacao.current.chave;
  }
  const valorTotal = useMemo(() => itens.reduce((s, i) => s + i.quantidade * i.precoUnitario, 0), [itens]);
  return <CartContext.Provider value={{ itens, carregado, adicionarItem, valorTotal, chaveCheckout,
    removerItem: (id) => setItens((atual) => atual.filter((i) => i.produtoId !== id)),
    limparCarrinho: () => { setItens([]); solicitacao.current = { assinatura: '', chave: '' }; },
  }}>{children}</CartContext.Provider>;
}
export function useCart() { return useContext(CartContext); }
