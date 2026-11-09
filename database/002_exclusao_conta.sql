-- Execute no SQL Editor depois do 001_estrutura.sql. Permite excluir a conta do Supabase Auth
-- mantendo os pedidos antigos ligados a um perfil anonimizado.
begin;
alter table agroconnect.usuarios drop constraint if exists usuarios_id_fkey;
alter table agroconnect.usuarios add column if not exists excluido_em timestamptz;
commit;
