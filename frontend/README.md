# 📱 Frontend: aplicativo AgroConnect

Aplicativo mobile em **React Native + Expo SDK 57**, focado em Android.

## Pastas

| Pasta                    | Conteúdo                                                                 |
| ------------------------ | ------------------------------------------------------------------------ |
| `src/screens/auth`       | Escolha de perfil, login, cadastro e recuperação de senha                |
| `src/screens/consumidor` | Catálogo, detalhe do produto, carrinho, pedidos e avaliação              |
| `src/screens/produtor`   | Início, cadastro/edição de produtos e pedidos recebidos                  |
| `src/screens/conta`      | Perfil, alterar senha, excluir conta e política de privacidade           |
| `src/components`         | Componentes reutilizáveis (lista abaixo)                                 |
| `src/constants`          | Valores fixos usados por várias telas: categorias e status de pedido     |
| `src/navigation`         | `RootNavigator`, `ConsumidorStack` e `ProdutorStack`                     |
| `src/context`            | Estado global: Auth, Produto, Pedido, Avaliação e Carrinho               |
| `src/services`           | `api.js` e `httpClient.js` (chamadas à API e renovação de sessão)        |
| `src/hooks`              | `useListaApi` (carrega listas da API)                                    |
| `src/utils`              | Regras do carrinho, formatação de preço, validação de produto, distância |
| `tests`                  | Testes com `node --test`                                                 |
| `scripts`                | `verificar-fontes.cjs` (confere sintaxe e imports)                       |

### Componentes

| Componente          | Para que serve                                                    |
| ------------------- | ----------------------------------------------------------------- |
| `BotaoPrimario`     | Botão verde principal                                             |
| `CampoTexto`        | Campo arredondado com ícone e rótulo                              |
| `EstadoLista`       | Mostra "carregando" ou o erro com botão de tentar de novo         |
| `EtiquetaStatus`    | Etiqueta colorida do status do pedido                             |
| `FormularioProduto` | Formulário usado ao cadastrar e ao editar produto                 |
| `MenuConta`         | Menu ☰ da conta (consumidor e produtor passam opções diferentes) |
| `ProdutoCard`       | Card do produto no catálogo, com o botão "+"                      |
| `SeletorCidade`     | Lista de cidades atendidas                                        |

## Rodar

Com o backend ligado (veja `../backend/README.md`):

```powershell
npm install
npm run android
```

No emulador Android o app usa `http://10.0.2.2:8080` sem precisar de configuração. Para testar
num **celular físico**, crie o `.env` (`Copy-Item .env.example .env`), troque `10.0.2.2` pelo IP
do computador e reinicie com `npx expo start --clear`.

## Gerar APK (EAS Build)

Rode **dentro desta pasta**:

```powershell
eas build -p android --profile preview
```

## Comandos

| Comando             | O que faz                                             |
| ------------------- | ----------------------------------------------------- |
| `npm start`         | Inicia o Expo                                         |
| `npm run android`   | Abre no emulador Android                              |
| `npm run web`       | Abre no navegador                                     |
| `npm test`          | Roda os testes                                        |
| `npm run verificar` | Confere sintaxe e imports                             |
| `npm run formatar`  | Formata todo o código no padrão do projeto (Prettier) |
| `npm run lint`      | Revisa o código e aponta problemas (ESLint)           |

Antes de enviar código para o repositório, rode `npm run formatar` e `npm run lint`.
