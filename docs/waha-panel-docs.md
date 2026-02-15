# WAHA Panel - Documentação do Projeto

## Visão Geral

WAHA Panel é um painel web para gerenciar a **WAHA (WhatsApp HTTP API)**, com interface inspirada na Evolution API.

O objetivo principal é:

- **[Autenticação]**: Conectar-se a uma instância WAHA via `host` e `API Key`.
- **[Sessões]**: Visualizar, criar, iniciar, parar e desconectar sessões WhatsApp.
- **[Perfil]**: Gerenciar informações do perfil da sessão padrão (default).
- **[Envio de mensagens]**: Enviar mensagens de texto e outros tipos de mídia (imagem, arquivo, áudio, vídeo, botões).

---

## Stack e Ferramentas

- **React 18** + **Vite** (SPA)
- **React Router v6** (roteamento de páginas)
- **Context API** (autenticação e instância de API compartilhada)
- **Hooks customizados** (lógica de sessão, listas e detalhes de sessão)
- **Axios** (cliente HTTP configurado dinamicamente)
- **TailwindCSS** (estilização, tema dark padrão)

---

## Estrutura de Pastas Principal

```text
src/
├── App.jsx              # Definição das rotas e composição do layout principal
├── main.jsx             # Ponto de entrada React / Vite
├── index.css            # Estilos globais + Tailwind
├── components/          # Componentes reutilizáveis (ex.: ProtectedRoute, layout/sidebars, cards)
├── context/
│   └── AuthContext.jsx  # Contexto de autenticação e instância da API
├── hooks/
│   ├── useSession.js            # Hook para sessão "default" (status + QR)
│   └── useSessionByName.js      # Hook para sessão por nome/id
├── pages/
│   ├── Login.jsx                # Tela de login (Host + API Key)
│   ├── Dashboard.jsx            # Layout do dashboard autenticado
│   ├── DashboardHome.jsx        # Visão geral do dashboard
│   ├── SessionPage.jsx          # Status detalhado da sessão default
│   ├── SessionControlPage.jsx   # Controle de sessão específica
│   ├── ProfilePage.jsx          # Gerenciamento de perfil da sessão default
│   └── SendMessagePage.jsx      # Envio de mensagens
└── services/
    └── api.js           # Configuração do Axios e métodos de acesso à WAHA
```

---

## Fluxo de Execução (Frontend)

1. **Ponto de entrada (`main.jsx`)**
   - Cria a raiz React com `ReactDOM.createRoot`.
   - Renderiza o componente `App` dentro de `React.StrictMode`.

2. **Componente raiz (`App.jsx`)**
   - Envolve toda a aplicação com `AuthProvider` (Context API de autenticação).
   - Configura o `BrowserRouter` e as rotas com `Routes` e `Route`.
   - Rotas principais:
     - `/` → `Login`
     - `/dashboard` → `Dashboard` (rota protegida por `ProtectedRoute`)
       - `index` → `DashboardHome`
       - `/dashboard/session` → `SessionPage`
       - `/dashboard/sessions/:sessionId` → `SessionControlPage`
       - `/dashboard/profile` → `ProfilePage`
       - `/dashboard/send` → `SendMessagePage`
     - `*` → redireciona para `/` (`Navigate`)

3. **Proteção de rotas (`ProtectedRoute`)**
   - Verifica se o usuário está autenticado via `useAuth()`.
   - Se **não autenticado**, redireciona para `/` (Login).
   - Se **autenticado**, renderiza o `Dashboard` e as páginas filhas.

---

## Autenticação e Contexto (`AuthContext`)

Arquivo: `src/context/AuthContext.jsx`

Responsabilidades:

- Armazenar e disponibilizar globalmente:
  - `host` (URL base da API WAHA)
  - `token` (API Key)
  - `api` (instância Axios criada dinamicamente)
  - `isAuthenticated` (booleano: `host` e `token` preenchidos)
  - `loading` (carregando estado inicial dos dados salvos)
- Fornecer funções de controle:
  - `login(host, token)` → salva credenciais em `localStorage` e no estado global.
  - `logout()` → limpa credenciais do `localStorage` e zera estado global.

Ciclo de vida:

- `useEffect` ao montar:
  - Lê `host` e `token` do `localStorage` via `getStoredCredentials`.
  - Caso existam, inicializa o contexto autenticado automaticamente.
  - Define `loading = false` ao finalizar.

Instância da API:

- `isAuthenticated` = `!!(host && token)`.
- `api` = `isAuthenticated ? createApiInstance(host, token) : null`.
- Assim, qualquer componente/hook da árvore pode acessar `api` com `useAuth()`.

Erro comum tratado:

- Se `useAuth` for usado fora de `AuthProvider`, é lançada uma exceção clara.

---

## Serviço de API (`services/api.js`)

Responsável por encapsular o acesso HTTP à WAHA via Axios.

### Armazenamento de credenciais

- `getStoredCredentials()` → lê `host` e `token` do `localStorage`.
- `setStoredCredentials(host, token)` → salva `host` e `token` no `localStorage`.
- `clearStoredCredentials()` → remove `host` e `token` do `localStorage`.

### Criação da instância Axios

Função: `createApiInstance(host, token)`

- Normaliza a URL removendo `/` ao final.
- Cria instância Axios com:
  - `baseURL` = `host` normalizado.
  - `headers` padrão:
    - `Content-Type: application/json`
    - `X-Api-Key: <token>` (autenticação na WAHA)
- Interceptor de resposta:
  - Se `status === 401`, executa `clearStoredCredentials()` e redireciona para `/`.

### Teste de conexão (Login)

Função: `testConnection(host, token)`

- Cria uma instância provisória via `createApiInstance`.
- Faz `GET /api/sessions/default` com `validateStatus` que aceita **200** ou **404**.
- Usada na tela de login para validar se a API está acessível e a key é válida.

### Métodos de API (`apiMethods`)

- **Sessões**
  - `getSessions(api)` → `GET /api/sessions`
  - `getSession(api, sessionName = 'default')` → `GET /api/sessions/{sessionName}`
  - `getSessionMe(api, sessionName = 'default')` → `GET /api/sessions/{sessionName}/me`
  - `createSession(api, name = 'default')` → `POST /api/sessions`
  - `startSession(api, sessionName = 'default')` → `POST /api/sessions/{sessionName}/start`
  - `stopSession(api, sessionName = 'default')` → `POST /api/sessions/{sessionName}/stop`
  - `logoutSession(api, sessionName = 'default')` → `POST /api/sessions/{sessionName}/logout`
  - `restartSession(api, sessionName = 'default')` → `POST /api/sessions/{sessionName}/restart`

- **QR Code (sessão default)**
  - `getQr(api)` → `GET /api/default/auth/qr` (retorna `blob` com a imagem)

- **Perfil (sessão default)**
  - `getProfile(api)` → `GET /api/default/profile`
  - `updateProfileName(api, name)` → `PUT /api/default/profile/name`
  - `updateProfileStatus(api, status)` → `PUT /api/default/profile/status`
  - `updateProfilePicture(api, formData)` → `PUT /api/default/profile/picture` (multipart)
  - `deleteProfilePicture(api)` → `DELETE /api/default/profile/picture`

- **Envio de mensagens**
  - `sendText(api, { session = 'default', chatId, text })` → `POST /api/sendText`
    - Garante o formato `@c.us` em `chatId` caso não esteja presente.
  - `sendImage(api, formData)` → `POST /api/sendImage`
  - `sendFile(api, formData)` → `POST /api/sendFile`
  - `sendVoice(api, formData)` → `POST /api/sendVoice`
  - `sendVideo(api, formData)` → `POST /api/sendVideo`
  - `sendButtons(api, { session = 'default', chatId, text, buttons })` → `POST /api/sendButtons`

---

## Hooks Customizados

### `useSession` (sessão default)

Arquivo: `src/hooks/useSession.js`

Responsável por gerenciar o estado da **sessão default** e o QR Code.

- Depende de `useAuth()` para obter `api` e `logout`.
- Estado interno:
  - `session` → dados atuais da sessão
  - `qrImage` → URL criada via `URL.createObjectURL(blob)` para exibir o QR
  - `loading` → carregamento inicial
  - `error` → mensagem de erro, se houver
  - `actionLoading` → estado de carregamento de ações (start/logout/create)

Funções principais:

- `fetchSession()`
  - Obtém `GET /api/sessions/default` via `apiMethods.getSession`.
  - Avalia o status:
    - Se `status === 'SCAN_QR_CODE'` → busca a imagem do QR via `getQr`.
    - Caso contrário → limpa QR armazenado.
  - Trata erro 401 deslogando e redirecionando.
- A cada **5000 ms** (5s), refaz o `fetchSession` via `setInterval`.

- `startSession()`
  - Chama `apiMethods.startSession` e, em seguida, `fetchSession()`.

- `logoutSession()`
  - Chama `apiMethods.logoutSession` e depois `fetchSession()`.

- `createSession()`
  - Chama `apiMethods.createSession` e depois `fetchSession()`.

Cuidados implementados:

- Limpeza de `URL.createObjectURL` em `qrUrlRef.current` ao desmontar ou quando o QR muda.
- Tratamento consistente para erro 401 (deslogar + redirect).

### `useSessionByName`

- Semelhante ao `useSession`, mas focado em uma sessão específica (`:sessionId` na URL).
- Usado em `SessionControlPage` para exibir e controlar uma sessão individual.

---

## Páginas Principais

### Login (`pages/Login.jsx`)

Fluxo:

1. Usuário informa **Host da API** e **API Key**.
2. Ao enviar o formulário:
   - Normaliza o host removendo `/` ao final.
   - Chama `testConnection(formattedHost, apiKey)`.
   - Em caso de sucesso → `login(formattedHost, apiKey)` pelo `AuthContext` e `navigate('/dashboard')`.
   - Em caso de erro → exibe mensagem amigável conforme o tipo:
     - 401 → "API Key inválida"
     - Erro de rede → "Não foi possível conectar ao host"
     - 404 → "Endpoint não encontrado"

### Dashboard (`pages/Dashboard.jsx` + rotas filhas)

- Layout base (provavelmente com sidebar/topbar) compartilhado entre:
  - `DashboardHome` → visão geral da sessão.
  - `SessionPage` → painel mais detalhado da sessão default (status + QR + ações).
  - `SessionControlPage` → detalhes e ações de uma sessão selecionada.
  - `ProfilePage` → edição de nome/status/foto da sessão default.
  - `SendMessagePage` → formulário para envio de mensagens.

Essas páginas consomem os hooks (`useSession`, `useSessionByName`) e os métodos da API para compor a interface.

---

## Componentes Importantes

### `ProtectedRoute`

- Envolve rotas que exigem autenticação.
- Usa `useAuth()` para verificar `isAuthenticated`.
- Em caso negativo, redireciona para `/`.

### Componentes de UI (exemplos típicos)

- **Sidebar / Layout** → Navegação lateral e layout do dashboard.
- **SessionStatusCard** → Card exibindo status atual da sessão.
- **QRCodeDisplay** → Componente para mostrar a imagem de QR Code usando `qrImage`.

---

## Como Rodar o Projeto

Requisitos:

- Node.js e npm instalados.

Passos:

```bash
npm install
npm run dev
```

- Acesse em: `http://localhost:5173` (padrão Vite).

---

## Como Usar em Ambiente de Desenvolvimento

1. **Configurar e subir a instância WAHA** (backend da WhatsApp HTTP API).
2. Rodar o frontend (`npm run dev`).
3. Acessar `http://localhost:5173`.
4. Na tela de **Login**:
   - Preencher **Host da API** (ex.: `http://localhost:3000`).
   - Preencher **API Key** configurada no WAHA.
5. Após logar, navegar pelo dashboard para:
   - Ver/gerenciar sessão default e QR.
   - Criar e controlar múltiplas sessões.
   - Gerenciar perfil (nome, status, foto).
   - Enviar mensagens de texto (e outros tipos, conforme páginas/componentes).

---

## Boas Práticas Implementadas

- Centralização de autenticação e API no `AuthContext`.
- Encapsulamento do cliente HTTP e endpoints em `services/api.js`.
- Uso de hooks customizados para separar lógica de sessão da camada de UI.
- Tratamento consistente de erros 401 (limpa credenciais e redireciona para login).
- Normalização de `chatId` para o formato esperado pela WAHA (`@c.us`).
- Atualização periódica do status da sessão com `setInterval`.

---

## Pontos de Extensão

- Adicionar novas páginas em `pages/` usando o mesmo layout de `Dashboard`.
- Incluir novos endpoints WAHA em `services/api.js` dentro de `apiMethods`.
- Criar hooks adicionais em `hooks/` para outras funcionalidades (por exemplo, histórico de mensagens).
- Melhorar a UI adicionando novos componentes em `components/` reaproveitando Tailwind.
