import React, { createContext, useContext, useState, useMemo, useRef } from 'react';
import {
  adicionarAoCarrinho,
  alterarQuantidade as alterarQuantidadeNaLista,
} from '../utils/carrinho';

const CartContext = createContext(null);

// Guarda o carrinho do consumidor e oferece as ações para as telas.
export function CartProvider({ children }) {
  const [itens, setItens] = useState([]);

  // Chave do checkout: evita criar o mesmo pedido duas vezes se o usuário tocar
  // em "Finalizar" de novo sem mudar o carrinho (ex.: depois de uma falha de internet).
  const solicitacao = useRef({ assinatura: '', chave: '' });

  // As regras ficam em utils/carrinho.js. Elas são chamadas ANTES do setItens:
  // se houver erro (ex.: passou do estoque), ele chega na tela, que mostra o aviso.
  function adicionarItem(produto, quantidade = 1) {
    setItens(adicionarAoCarrinho(itens, produto, quantidade));
  }

  function alterarQuantidade(produtoId, novaQuantidade) {
    setItens(alterarQuantidadeNaLista(itens, produtoId, novaQuantidade));
  }

  function removerItem(produtoId) {
    setItens((atual) => atual.filter((item) => item.produtoId !== produtoId));
  }

  function limparCarrinho() {
    setItens([]);
    solicitacao.current = { assinatura: '', chave: '' };
  }

  // Gera uma chave nova só quando o conteúdo do carrinho muda.
  function chaveCheckout() {
    const assinatura = JSON.stringify(itens.map((item) => [item.produtoId, item.quantidade]));
    if (assinatura !== solicitacao.current.assinatura) {
      const aleatorio = () => Math.random().toString(36).slice(2);
      solicitacao.current = { assinatura, chave: `${Date.now()}-${aleatorio()}-${aleatorio()}` };
    }
    return solicitacao.current.chave;
  }

  // Total em reais. O useMemo só recalcula quando a lista de itens muda.
  const valorTotal = useMemo(
    () => itens.reduce((soma, item) => soma + item.quantidade * item.precoUnitario, 0),
    [itens]
  );

  // Total de unidades (ex.: 2 alfaces + 1 tomate = 3).
  const totalUnidades = useMemo(
    () => itens.reduce((soma, item) => soma + item.quantidade, 0),
    [itens]
  );

  return (
    <CartContext.Provider
      value={{
        itens,
        valorTotal,
        totalUnidades,
        adicionarItem,
        alterarQuantidade,
        removerItem,
        limparCarrinho,
        chaveCheckout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const contexto = useContext(CartContext);
  if (!contexto) throw new Error('useCart precisa estar dentro do CartProvider.');
  return contexto;
}
