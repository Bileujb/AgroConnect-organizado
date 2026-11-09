// Testes do item 1: formatação de preço, nomes dos status e carrinho pelo botão "+".
// Rode com: npm test
import test from 'node:test';
import assert from 'node:assert/strict';
import { formatarPreco } from '../src/utils/formatar.js';
import { rotuloStatus } from '../src/constants/statusPedido.js';
import { adicionarAoCarrinho } from '../src/utils/carrinho.js';

// O toLocaleString usa um espaço especial (não separável) depois do "R$".
// Trocamos por espaço comum só para comparar com facilidade.
const preco = (valor) => formatarPreco(valor).replace(/\s/g, ' ');

test('preço usa vírgula nos centavos', () => {
  assert.equal(preco(5), 'R$ 5,00');
  assert.equal(preco(3.5), 'R$ 3,50');
  assert.equal(preco(0.99), 'R$ 0,99');
});

test('preço usa ponto para separar milhar', () => {
  assert.equal(preco(1234.5), 'R$ 1.234,50');
});

test('preço inválido mostra R$ 0,00 em vez de quebrar a tela', () => {
  assert.equal(preco(undefined), 'R$ 0,00');
  assert.equal(preco('abc'), 'R$ 0,00');
});

test('status aparece com nome amigável', () => {
  assert.equal(rotuloStatus('em_rota'), 'Em rota de entrega');
  assert.equal(rotuloStatus('aguardando'), 'Aguardando confirmação');
  assert.equal(rotuloStatus('entregue'), 'Entregue');
});

test('status desconhecido mostra o próprio código', () => {
  assert.equal(rotuloStatus('devolvido'), 'devolvido');
});

test('tocar "+" duas vezes soma unidades no mesmo item', () => {
  const alface = { id: 'p1', produtorId: 'u1', nome: 'Alface', preco: 3, quantidadeEstoque: 5 };
  let itens = adicionarAoCarrinho([], alface, 1);
  itens = adicionarAoCarrinho(itens, alface, 1);
  assert.equal(itens.length, 1);
  assert.equal(itens[0].quantidade, 2);
});

test('"+" não passa do estoque', () => {
  const mel = { id: 'p2', produtorId: 'u1', nome: 'Mel', preco: 20, quantidadeEstoque: 1 };
  const itens = adicionarAoCarrinho([], mel, 1);
  assert.throws(() => adicionarAoCarrinho(itens, mel, 1), /estoque/);
});

test('cada status tem cor e ícone próprios na etiqueta', async () => {
  const { visualStatus } = await import('../src/constants/statusPedido.js');
  assert.equal(visualStatus('entregue').icone, '✅');
  assert.equal(visualStatus('em_rota').icone, '🚚');
  assert.notEqual(visualStatus('aguardando').fundo, visualStatus('entregue').fundo);
  assert.equal(visualStatus('desconhecido').icone, '•');
});
