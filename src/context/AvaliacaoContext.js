import React, { createContext, useContext } from 'react';
import useListaApi from '../hooks/useListaApi';
import { api } from '../services/api';

const AvaliacaoContext = createContext(null);
export function AvaliacaoProvider({ children }) {
  const lista = useListaApi('/api/avaliacoes');
  async function avaliarProdutor({ pedidoId, nota, comentario }) {
    const salva = await api('/api/avaliacoes', { method: 'POST', body: { pedidoId, nota, comentario } });
    lista.setDados((atual) => [salva, ...atual]); return salva;
  }
  // A nota média de cada produtor vem pronta da API (campo notaMedia dos produtos).
  return <AvaliacaoContext.Provider value={{ avaliacoes: lista.dados, avaliarProdutor,
    jaAvaliouPedido: (id) => lista.dados.some((a) => a.pedidoId === id), recarregar: lista.recarregar,
    carregando: lista.carregando, erro: lista.erro }}>{children}</AvaliacaoContext.Provider>;
}
export function useAvaliacoes() { return useContext(AvaliacaoContext); }
