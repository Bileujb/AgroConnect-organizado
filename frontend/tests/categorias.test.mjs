// Testes do visual das categorias (emoji usado quando o produto não tem foto).
import test from 'node:test';
import assert from 'node:assert/strict';
import { visualDaCategoria } from '../src/constants/categorias.js';

test('cada categoria tem seu emoji', () => {
  assert.equal(visualDaCategoria('Verduras').icone, '🥬');
  assert.equal(visualDaCategoria('Legumes').icone, '🥕');
  assert.equal(visualDaCategoria('Frutas').icone, '🍎');
  assert.equal(visualDaCategoria('Derivados').icone, '🍯');
});

test('categoria desconhecida usa a folhinha padrão', () => {
  assert.equal(visualDaCategoria('Grãos').icone, '🌿');
  assert.equal(visualDaCategoria(undefined).icone, '🌿');
});
