import test from 'node:test';
import assert from 'node:assert/strict';
import { adicionarAoCarrinho, chaveCarrinho, lerCarrinhoSalvo } from '../src/utils/carrinho.js';
const produto = { id: 'p1', produtorId: 'u1', nome: 'Alface', preco: 3.5, quantidadeEstoque: 5 };
test('somar um item existente respeita o estoque total, não apenas a última adição', () => {
  const itens = adicionarAoCarrinho([], produto, 4);
  assert.throws(() => adicionarAoCarrinho(itens, produto, 2), /estoque/);
  assert.equal(adicionarAoCarrinho(itens, produto, 1)[0].quantidade, 5);
  assert.equal(itens[0].quantidade, 4);
});
test('rejeita quantidade negativa, fracionária e produto sem estoque', () => {
  for (const valor of [-1, 0, 0.5, NaN]) assert.throws(() => adicionarAoCarrinho([], produto, valor));
  assert.throws(() => adicionarAoCarrinho([], { ...produto, quantidadeEstoque: 0 }));
});
test('misturar produtores mantém itens separados para o checkout dividir os pedidos', () => {
  let itens = adicionarAoCarrinho([], produto);
  itens = adicionarAoCarrinho(itens, { ...produto, id: 'p2', produtorId: 'u2' });
  assert.deepEqual(itens.map((i) => i.produtorId), ['u1', 'u2']);
});
test('cada conta usa uma chave própria para o carrinho salvo', () => {
  assert.notEqual(chaveCarrinho('conta-a'), chaveCarrinho('conta-b'));
});
test('carrinho salvo é recuperado com os mesmos itens', () => {
  const itens = adicionarAoCarrinho([], produto, 2);
  assert.deepEqual(lerCarrinhoSalvo(JSON.stringify(itens)), itens);
});
test('dado salvo ausente, corrompido ou em outro formato vira carrinho vazio', () => {
  for (const texto of [null, undefined, '', 'não é json', '{"a":1}', '42', 'null']) {
    assert.deepEqual(lerCarrinhoSalvo(texto), []);
  }
});
test('itens inválidos no dado salvo são descartados e os válidos mantidos', () => {
  const valido = { produtoId: 'p1', produtorId: 'u1', nome: 'Alface', precoUnitario: 3.5, quantidade: 2 };
  const salvos = [valido, null, { ...valido, produtoId: '' }, { ...valido, quantidade: 0 },
    { ...valido, quantidade: 1.5 }, { ...valido, precoUnitario: 'caro' }, { ...valido, extra: 'ignorado' }];
  // Carrinhos salvos antes da unidade de venda existir ganham a unidade padrão.
  const esperado = { ...valido, unidade: 'unidade' };
  assert.deepEqual(lerCarrinhoSalvo(JSON.stringify(salvos)), [esperado, esperado]);
});
test('a unidade de venda do produto vai para o item e sobrevive ao salvar', () => {
  const itens = adicionarAoCarrinho([], { ...produto, unidade: 'kg' }, 2);
  assert.equal(itens[0].unidade, 'kg');
  assert.equal(lerCarrinhoSalvo(JSON.stringify(itens))[0].unidade, 'kg');
});
