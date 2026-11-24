-- Execute no SQL Editor depois do 003. Pode ser executado mais de uma vez.
-- Guarda como o consumidor escolheu pagar. O pagamento é SIMULADO: nenhum valor é cobrado.
-- pix/cartao ficam como pagos na hora; "entrega" é pago ao receber.
begin;
alter table agroconnect.pedidos add column if not exists forma_pagamento varchar(20) not null default 'entrega';
alter table agroconnect.pedidos add column if not exists pago boolean not null default false;
alter table agroconnect.pedidos drop constraint if exists pedidos_forma_pagamento_check;
alter table agroconnect.pedidos add constraint pedidos_forma_pagamento_check
  check (forma_pagamento in ('pix','cartao','entrega'));
commit;
