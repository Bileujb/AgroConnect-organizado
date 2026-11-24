-- Execute no SQL Editor depois do 001 e do 002. Pode ser executado mais de uma vez.
-- Adiciona a unidade de venda do produto (kg, maço, dúzia...). O preço vale por unidade
-- e o estoque é contado nessa mesma unidade. Produtos antigos ficam como "unidade".
begin;
alter table agroconnect.produtos add column if not exists unidade varchar(20) not null default 'unidade';
alter table agroconnect.produtos drop constraint if exists produtos_unidade_check;
alter table agroconnect.produtos add constraint produtos_unidade_check
  check (unidade in ('kg','unidade','maco','duzia','bandeja','litro','pacote'));
commit;
