# ☕ Backend: API AgroConnect

API REST em **Java 17 + Spring Boot 3.5**. Valida a sessão no Supabase Auth e acessa o PostgreSQL com JdbcTemplate.

## Organização (`src/main/java/br/com/agroconnect`)

| Arquivo | Responsabilidade |
|---|---|
| `AgroconnectApplication` | Classe principal |
| `AuthController` | Rotas `/auth` (cadastro, login, senha) |
| `ApiController` | Rotas `/api` (perfil, produtos, pedidos, avaliações) |
| `ProdutoService`, `PedidoService`, `AvaliacaoService`, `PerfilService` | Regras de negócio |
| `Banco` | Consultas SQL parametrizadas |
| `Dados` | Records que validam os formulários |
| `SupabaseAuth` | Integração com o Supabase Auth |
| `AutenticacaoInterceptor` | Exige token nas rotas `/api` |
| `ErroHandler`, `ApiException` | Erros em JSON |
| `WebConfig` | CORS e interceptores |

A lista de rotas está em [`../docs/API.md`](../docs/API.md).

## Rodar

```powershell
Copy-Item .env.example .env     # preencha DB_PASSWORD
.\mvnw.cmd spring-boot:run
```

Saúde da API: `http://localhost:8080/api/saude`

## Testes

```powershell
.\mvnw.cmd test
```

Os testes de integração sobem um PostgreSQL temporário e executam os scripts de `../database/`.

> ⚠️ Nunca envie o arquivo `.env` ao GitHub.
