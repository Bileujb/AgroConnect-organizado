// Testes da validação do formulário de produto (cadastrar e editar).
import test from 'node:test';
import assert from 'node:assert/strict';
import { validarProduto, precoParaCampo } from '../src/utils/produto.js';

const campos = {
  nome: 'Alface',
  descricao: '',
  preco: '3,50',
  quantidadeEstoque: '10',
  categoria: 'Verduras',
  imagem: '',
};

test('aceita preço com vírgula e converte para número', () => {
  const { dados, erro } = validarProduto(campos);
  assert.equal(erro, undefined);
  assert.equal(dados.preco, 3.5);
  assert.equal(dados.quantidadeEstoque, 10);
  assert.equal(dados.imagem, null);
});

test('recusa nome vazio, preço zero e estoque vazio ou quebrado', () => {
  assert.match(validarProduto({ ...campos, nome: '   ' }).erro, /nome/);
  assert.match(validarProduto({ ...campos, preco: '0' }).erro, /preço/);
  assert.match(validarProduto({ ...campos, preco: 'abc' }).erro, /preço/);
  assert.match(validarProduto({ ...campos, quantidadeEstoque: '' }).erro, /estoque/);
  assert.match(validarProduto({ ...campos, quantidadeEstoque: '2.5' }).erro, /estoque/);
});

test('preço salvo aparece no campo com vírgula', () => {
  assert.equal(precoParaCampo(3.5), '3,50');
  assert.equal(precoParaCampo(12), '12,00');
  assert.equal(precoParaCampo(undefined), '');
});
