# 🐘 Database: scripts do Supabase

Scripts SQL do PostgreSQL do Supabase. As tabelas ficam no schema privado `agroconnect`, com RLS habilitado, e só a API Java acessa os dados.

| Script | O que faz |
|---|---|
| `001_estrutura.sql` | Cria as seis tabelas, índices, chaves estrangeiras e restrições |
| `002_exclusao_conta.sql` | Adiciona `excluido_em` e solta o vínculo com `auth.users`, para permitir a exclusão de conta |

## Como aplicar

No **SQL Editor** do Supabase, execute os scripts **em ordem** (001 → 002). Os dois podem ser executados mais de uma vez sem apagar dados.

No banco do nosso projeto o `001` já foi aplicado. O `002` precisa ser executado nele também, para a exclusão de conta funcionar.

Para conferir:

```sql
select * from agroconnect.usuarios;
```

> Os testes Java em `backend/` leem estes arquivos. Se renomear algum, atualize o `NegocioIntegrationTest.java`.
