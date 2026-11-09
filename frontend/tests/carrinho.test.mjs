import test from 'node:test';
import assert from 'node:assert/strict';
import { adicionarAoCarrinho, alterarQuantidade } from '../src/utils/carrinho.js';
const produto = { id: 'p1', produtorId: 'u1', nome: 'Alface', preco: 3.5, quantidadeEstoque: 5 };
test('somar um item existente respeita o estoque total, não apenas a última adição', () => {
  const itens = adicionarAoCarrinho([], produto, 4);
  assert.throws(() => adicionarAoCarrinho(itens, produto, 2), /estoque/);
  assert.equal(adicionarAoCarrinho(itens, produto, 1)[0].quantidade, 5);
  assert.equal(itens[0].quantidade, 4);
});
test('rejeita quantidade negativa, fracionária e produto sem estoque', () => {
  for (const valor of [-1, 0, 0.5, NaN])
    assert.throws(() => adicionarAoCarrinho([], produto, valor));
  assert.throws(() => adicionarAoCarrinho([], { ...produto, quantidadeEstoque: 0 }));
});
test('misturar produtores mantém itens separados para o checkout dividir os pedidos', () => {
  let itens = adicionarAoCarrinho([], produto);
  itens = adicionarAoCarrinho(itens, { ...produto, id: 'p2', produtorId: 'u2' });
  assert.deepEqual(
    itens.map((i) => i.produtorId),
    ['u1', 'u2']
  );
});

// ---------- Botões − e + do carrinho ----------

test('"+" aumenta até o estoque e não passa dele', () => {
  const tomate = {
    id: 't1',
    produtorId: 'u1',
    nome: 'Tomate',
    preco: 6,
    quantidadeEstoque: 3,
    categoria: 'Legumes',
  };
  let itens = adicionarAoCarrinho([], tomate, 1);
  itens = alterarQuantidade(itens, 't1', 3);
  assert.equal(itens[0].quantidade, 3);
  assert.throws(() => alterarQuantidade(itens, 't1', 4), /estoque/);
});

test('"−" na última unidade tira o item do carrinho', () => {
  const tomate = {
    id: 't1',
    produtorId: 'u1',
    nome: 'Tomate',
    preco: 6,
    quantidadeEstoque: 3,
    categoria: 'Legumes',
  };
  const itens = adicionarAoCarrinho([], tomate, 1);
  assert.deepEqual(alterarQuantidade(itens, 't1', 0), []);
});

test('o item guarda estoque e categoria para a tela do carrinho', () => {
  const mel = {
    id: 'm1',
    produtorId: 'u1',
    nome: 'Mel',
    preco: 20,
    quantidadeEstoque: 2,
    categoria: 'Derivados',
  };
  const [item] = adicionarAoCarrinho([], mel, 1);
  assert.equal(item.estoque, 2);
  assert.equal(item.categoria, 'Derivados');
});
