import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function useListaApi(caminho) {
  const { usuario } = useAuth();
  const usuarioId = usuario?.id; // só recarrega quando muda a pessoa logada
  const [dados, setDados] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const versao = useRef(0);
  const recarregar = useCallback(async () => {
    const atual = ++versao.current;
    if (!usuarioId) {
      setDados([]);
      return;
    }
    setCarregando(true);
    setErro('');
    try {
      const resultado = await api(caminho);
      if (atual === versao.current) setDados(resultado);
    } catch (falha) {
      if (atual === versao.current) setErro(falha.message);
    } finally {
      if (atual === versao.current) setCarregando(false);
    }
  }, [caminho, usuarioId]);
  useEffect(() => {
    // Buscar dados no servidor ao abrir a tela é o uso certo de um efeito
    // (sincronizar com um sistema externo), por isso esta regra fica desligada aqui.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    recarregar();
    return () => {
      versao.current += 1;
    };
  }, [recarregar]);
  return { dados, setDados, carregando, erro, recarregar };
}
