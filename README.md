# AgroConnect

O AgroConnect é o projeto de startup que estamos desenvolvendo na faculdade. A ideia é aproximar produtores rurais de pessoas que querem comprar seus produtos. Fizemos o aplicativo em React Native com Expo e, nesta etapa, conectamos ele a uma API Java (Spring Boot) e ao Supabase.

## O que fizemos

- **Cadastro e login:** produtor e consumidor criam conta e entram com e-mail e senha. O Supabase cuida da autenticação. Se a confirmação por e-mail estiver ativa, é preciso confirmar a conta antes de entrar.
- **Recuperação de senha:** o usuário solicita um e-mail para definir outra senha. Quem está logado também pode trocar a senha.
- **Perfil:** cada pessoa edita seus dados. O produtor informa dados da fazenda; o consumidor, o endereço para entrega.
- **Produtos:** o produtor cadastra, edita e retira produtos do catálogo, com preço, estoque e URL de imagem.
- **Pedidos:** o consumidor monta o carrinho e finaliza a compra. A API confere preço e estoque no banco antes de registrar o pedido. O produtor atualiza o andamento.
- **Avaliações:** depois da entrega, o consumidor pode avaliar o pedido.
- **Privacidade (LGPD):** a tela de Política de Privacidade explica quais dados coletamos, para que, com quem compartilhamos e como o titular exerce seus direitos. Ela abre pela tela inicial, pelo cadastro e por Meu Perfil, e o cadastro só é concluído após o usuário confirmar a leitura.
- **Excluir conta:** em Meu Perfil, o usuário exclui a própria conta confirmando a senha. O login é apagado no Supabase Auth, o perfil é anonimizado, os produtos saem do catálogo e os comentários das avaliações são apagados. Os pedidos antigos ficam guardados sem o nome da pessoa. Contas com pedidos em andamento precisam concluir ou cancelar esses pedidos antes.

Os dados de usuários, produtos, pedidos e avaliações ficam no Supabase. O carrinho fica salvo no celular, separado por conta, até a compra ser finalizada: fechar o app não apaga os itens. Os preços do carrinho são uma estimativa; o valor final é sempre calculado pela API.

## Como organizamos o projeto

| Pasta/arquivo | Para que serve |
|---|---|
| `src/screens` | Telas do aplicativo |
| `src/context` e `src/services` | Estado do app, sessão e chamadas da API |
| `backend` | API Java: recebe as solicitações, valida o usuário e acessa o banco |
| `supabase/001_estrutura.sql` | Script das tabelas |
| `supabase/002_exclusao_conta.sql` | Ajuste para a exclusão de conta manter o histórico de pedidos |
| `supabase/003_unidade_produto.sql` | Unidade de venda dos produtos (kg, maço, dúzia...) |
| `supabase/004_pagamento.sql` | Forma de pagamento dos pedidos (pagamento simulado) |
| `docs/API.md` | Resumo das rotas da API |
| `docs/VALIDACAO.md` | Verificações feitas e o que ainda precisamos testar |

O app conversa com a API Java, e a API acessa as tabelas. A senha do banco fica apenas no computador ou servidor que executa o backend.

## Como rodar

Passo a passo para Windows. Na primeira vez leva cerca de 40 minutos, quase tudo instalação. Este aplicativo usa Expo, não Flutter.

### 1. Instalar os programas (só na primeira vez)

| Programa | Versão | Para quê |
|---|---|---|
| Git | qualquer recente | Baixar o código do GitHub |
| Node.js | 22.13 ou mais novo (LTS) | Rodar o app (Expo) |
| JDK (por exemplo, Temurin) | 17 ou mais novo | Rodar o backend Java |
| Android Studio | atual | Emulador Android |

- No instalador do JDK, marque a opção de configurar o `JAVA_HOME`.
- No Android Studio, abra o **Device Manager** e crie um emulador (qualquer Pixel recente).

Confira num terminal novo (PowerShell):

```powershell
node -v
java -version
git --version
```

### 2. Baixar o código

```powershell
git clone https://github.com/Bileujb/AgroConnect-organizado.git
cd AgroConnect-organizado
```

### 3. Banco no Supabase

As seis tabelas do nosso projeto já foram criadas no schema `agroconnect`. Se você for usar o nosso projeto Supabase, **não precisa executar nenhum script**.

Para montar a estrutura em outro projeto Supabase, execute no SQL Editor, nesta ordem, e ative a autenticação por e-mail e senha:

1. `supabase/001_estrutura.sql`: cria o schema, as tabelas, os índices e o RLS.
2. `supabase/002_exclusao_conta.sql`: adiciona a coluna `excluido_em` e solta o vínculo entre `agroconnect.usuarios` e `auth.users`, para o login poder ser apagado sem perder o histórico de pedidos.
3. `supabase/003_unidade_produto.sql`: adiciona a coluna `unidade` em `agroconnect.produtos`; os produtos antigos ficam como "unidade".
4. `supabase/004_pagamento.sql`: adiciona `forma_pagamento` e `pago` em `agroconnect.pedidos`. O pagamento é **simulado**: Pix e cartão são aprovados automaticamente e nenhum valor é cobrado; pedidos antigos ficam como "pagar na entrega".

Os scripts podem ser executados mais de uma vez. Num banco que já existe, execute o 002, o 003 e o 004 **antes** de subir uma versão nova da API.

As tabelas ficam em um schema privado. O aplicativo acessa os dados pela API Java; não é necessário expor `agroconnect` na Data API. Se o Table Editor não mostrar as tabelas, consulte no SQL Editor:

```sql
select * from agroconnect.usuarios;
```

### 4. Backend Java

```powershell
cd backend
Copy-Item .env.example .env
notepad .env
```

No `backend/.env`, preencha só o `DB_PASSWORD` com a senha do banco. O exemplo já contém o endereço do nosso projeto Supabase e o usuário do banco. Se usar outro projeto, atualize os demais valores.

> **A senha não está no GitHub, e é assim que deve ser.** Leve o `.env` do seu PC num pendrive ou pegue a senha no painel do Supabase (Project Settings → Database). Se você redefinir a senha lá, atualize o `.env` de todos os PCs que usam ela. **Nunca envie o `.env` ao GitHub.**

Para iniciar:

```powershell
.\mvnw.cmd spring-boot:run
```

Na primeira vez demora um pouco, porque baixa as dependências. **Deixe esse terminal aberto.** Acesse `http://localhost:8080/api/saude`; a resposta esperada é `{"status":"ok","banco":"conectado"}`.

### 5. Aplicativo

1. Abra o emulador pelo Android Studio e espere o Android carregar.
2. Abra um **segundo terminal** na **pasta principal** do projeto (não na `backend`) e rode:

```powershell
Copy-Item .env.example .env
npm ci
npm run android
```

O `.env` da pasta principal já vem com:

```properties
EXPO_PUBLIC_API_URL=http://10.0.2.2:8080
```

Esse é o endereço que o emulador usa para chegar à API rodando no PC. O app abre sozinho no emulador. Depois de alterar o `.env`, reinicie o Expo com `npx expo start --clear`.

### 6. Celular de verdade em vez do emulador

1. O PC e o celular precisam estar no mesmo Wi-Fi.
2. Descubra o IP do PC com `ipconfig` e troque no `.env` do app: `EXPO_PUBLIC_API_URL=http://SEU_IP:8080`.
3. Rode `npx expo start --clear`.
4. Se o celular não conectar, libere a porta 8080 no Firewall do Windows.

### Problemas comuns

| Sintoma | Causa provável | Solução |
|---|---|---|
| `/api/saude` dá erro de banco | Senha errada no `backend/.env` | Confira o `DB_PASSWORD` |
| Erro sobre JDK ao rodar o `mvnw` | `JAVA_HOME` apontando para um JRE ou vazio | Aponte o `JAVA_HOME` para a pasta do JDK e abra outro terminal |
| `mvnw.cmd` falha | Problema do Maven Wrapper no Windows | Instale o Maven e rode `mvn spring-boot:run` |
| App diz "Não foi possível acessar a API" | Backend desligado ou `.env` do app errado | Confira o terminal do backend e o `EXPO_PUBLIC_API_URL` |
| Mudou o `.env` e nada mudou | O Expo guarda os valores em cache | `npx expo start --clear` |
| `npm ci` dá erro | Node antigo | Atualize para 22.13 ou mais novo |
| Emulador não aparece | Emulador não foi aberto antes | Abra pelo Device Manager e rode de novo |

## Teste rápido para apresentar

1. Crie uma conta de produtor e confirme o e-mail, se solicitado.
2. Entre como produtor e cadastre dois produtos com preço e estoque.
3. Saia e crie uma conta de consumidor com outro e-mail.
4. Coloque um produto no carrinho, feche o app pela tela de multitarefa e abra de novo: o carrinho deve continuar lá. Depois finalize o pedido.
5. Entre como produtor e avance o pedido até entregue.
6. Volte à conta do consumidor e faça uma avaliação.
7. Confira os registros no Supabase e teste a edição do perfil e a recuperação de senha.
8. Crie uma terceira conta, entre em Meu Perfil → Excluir minha conta e confirme com a senha. Ela deve voltar para a tela inicial e não conseguir entrar de novo.

Para o link de recuperação funcionar, o endereço de `AUTH_REDIRECT_URL` no `backend/.env` precisa estar permitido em **Authentication → URL Configuration → Redirect URLs** no Supabase. No mesmo PC, usamos `http://localhost:8080/recuperar-senha.html`. Para abrir no celular, configure o IP do PC.

## Limites desta versão

O produtor informa uma URL de imagem; ainda não fizemos upload para o Storage. Também não há pagamento online, cálculo real de frete, rastreamento por GPS nem notificações push. As classes de domínio criadas nos exercícios da faculdade (incluindo sensor e notificação) ficam em `docs/exercicios/models` e não fazem parte do aplicativo. Na demonstração, aceitamos CNPJ com 14 dígitos, sem consulta à Receita Federal.

Para conferir o código, usamos `npm run verificar`, `npm test` e os testes Java em `backend`. O roteiro acima ainda precisa ser executado no emulador ou celular com o backend ligado.
