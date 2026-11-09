# 🌱 AgroConnect

> Conectando produtores rurais a consumidores urbanos, sem intermediários.

O **AgroConnect** é o projeto de startup que estamos desenvolvendo no curso de **Análise e Desenvolvimento de Sistemas (ADS) da FATEC Curitiba**. A ideia é aproximar quem produz no campo de quem quer comprar na cidade: o produtor anuncia seus produtos, o consumidor monta o carrinho e faz o pedido direto pelo celular.

O aplicativo é feito em **React Native com Expo** e conversa com uma **API Java (Spring Boot)**, que guarda os dados no **PostgreSQL do Supabase**.

---

## 📁 Estrutura do projeto

```
AgroConnect/
├── frontend/          → Aplicativo mobile (React Native + Expo)
│   ├── src/
│   │   ├── screens/       → Telas (auth, consumidor, produtor, conta)
│   │   ├── components/    → Componentes reutilizáveis (botões, cards, menu…)
│   │   ├── constants/     → Valores fixos (categorias, status de pedido)
│   │   ├── navigation/    → Rotas e pilhas de navegação
│   │   ├── context/       → Estado global (login, carrinho, pedidos…)
│   │   ├── services/      → Comunicação com a API
│   │   ├── hooks/         → Hooks personalizados
│   │   └── utils/         → Funções auxiliares
│   ├── assets/            → Ícones e splash
│   ├── tests/             → Testes do app (node --test)
│   ├── scripts/           → Script de verificação dos fontes
│   ├── App.js · index.js  → Ponto de entrada do app
│   └── app.json · eas.json · package.json
│
├── backend/           → API REST em Java 17 + Spring Boot
│   └── src/main/java/br/com/agroconnect/
│
├── database/          → Scripts SQL do Supabase (PostgreSQL)
│   ├── 001_estrutura.sql
│   └── 002_exclusao_conta.sql
│
├── docs/              → Documentação técnica
│   ├── API.md             → Rotas da API e decisões
│   ├── ALTERACOES.md      → Histórico de mudanças
│   ├── VALIDACAO.md       → Testes feitos e pendências
│   └── modelos-dominio/   → Classes de domínio dos exercícios (não usadas pelo app)
│
└── README.md
```

Cada pasta principal tem o seu próprio `README.md` com detalhes.

---

## 🛠️ Tecnologias

| Camada | Tecnologias |
|---|---|
| **Frontend** | React Native 0.86, Expo SDK 57, React Navigation 7, Expo SecureStore |
| **Backend** | Java 17, Spring Boot 3.5, Bean Validation, JdbcTemplate |
| **Banco de dados** | PostgreSQL 17 no Supabase, com RLS |
| **Autenticação** | Supabase Auth (e-mail e senha) |
| **Build** | EAS Build (APK Android), Maven Wrapper |

### Como as partes se conectam

```
📱 App (frontend)  ──HTTP/JSON──▶  ☕ API Java (backend)  ──JDBC──▶  🐘 PostgreSQL (Supabase)
                                         │
                                         └──▶ 🔐 Supabase Auth
```

O app **nunca** acessa o banco diretamente. A senha do banco fica só na máquina que executa o backend.

---

## ✨ Funcionalidades

- **Cadastro e login** de produtores e consumidores, com autenticação pelo Supabase.
- **Recuperação e troca de senha.**
- **Perfil:** o produtor informa os dados da fazenda; o consumidor, o endereço de entrega.
- **Produtos:** o produtor cadastra, edita e retira produtos (preço, estoque e URL da imagem).
- **Carrinho e pedidos:** o consumidor finaliza a compra e a API confere preço e estoque no banco. O produtor acompanha e atualiza o andamento.
- **Avaliações** depois da entrega.
- **Privacidade (LGPD):** tela de Política de Privacidade, com confirmação obrigatória no cadastro.
- **Excluir conta:** o usuário apaga a própria conta confirmando a senha. Os dados pessoais são anonimizados e o histórico de pedidos é mantido.

---

## 🚀 Como rodar

**Pré-requisitos:** Node.js 22.13+, JDK 17+ e um emulador Android (Android Studio).

### 1. Banco de dados

As tabelas já estão criadas no schema `agroconnect` do nosso Supabase. Para montar em outro projeto, execute no **SQL Editor**:

1. `database/001_estrutura.sql`
2. `database/002_exclusao_conta.sql`

Depois, ative a autenticação por e-mail e senha. Mais detalhes em [`database/README.md`](database/README.md).

### 2. Backend

```powershell
cd backend
Copy-Item .env.example .env      # preencha DB_PASSWORD
.\mvnw.cmd spring-boot:run
```

Teste em `http://localhost:8080/api/saude`. O esperado é `{"status":"ok","banco":"conectado"}`.

### 3. Frontend

Em **outro terminal**, com o emulador aberto:

```powershell
cd frontend
npm install
npm run android
```

No emulador, o app já usa `http://10.0.2.2:8080`, sem configuração. Em um celular físico, crie o `.env` (`Copy-Item .env.example .env`) e troque `10.0.2.2` pelo IP do computador.

---

## ✅ Testes

```powershell
# Frontend
cd frontend
npm run verificar   # sintaxe e imports
npm test            # testes (carrinho, preço, produto, cliente HTTP…)
npm run lint        # revisor automático (ESLint)
npm run formatar    # formata o código no padrão do projeto (Prettier)

# Backend
cd backend
.\mvnw.cmd test     # testes de integração e de autenticação
```

---

## 🎤 Roteiro para a apresentação

1. Crie uma conta de **produtor** e cadastre dois produtos.
2. Saia e crie uma conta de **consumidor** com outro e-mail.
3. Adicione um produto ao carrinho e finalize o pedido.
4. Entre como produtor e avance o pedido até **entregue**.
5. Volte ao consumidor e faça uma **avaliação**.
6. Confira os registros no Supabase.
7. Crie uma terceira conta e teste **Meu Perfil → Excluir minha conta**.

---

## 🚧 Limitações desta versão

- A imagem do produto é informada por URL; ainda não há upload para o Storage.
- Sem pagamento online, cálculo real de frete, rastreamento por GPS ou notificações push.
- O CNPJ é validado só pelo número de dígitos, sem consulta à Receita Federal.
- As listagens são limitadas (1.000 produtos e 500 pedidos por conta). Um catálogo maior vai precisar de paginação.

---

## 👥 Equipe

| Integrante | Papel |
|---|---|
| Bileu | Desenvolvimento do app (React Native) |
| Josileudo | |
| Luiz Cesar | |
| Luiz Felipe | |
| Ruan | |

**Orientador:** Prof. Aroldo Ferraz
**Instituição:** FATEC Curitiba, Análise e Desenvolvimento de Sistemas

---

## 📄 Licença

Veja o arquivo [`LICENSE`](LICENSE).
