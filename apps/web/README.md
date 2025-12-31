# Frontend - Web Application

## 📦 Stack Técnica

- **Framework**: React 19.2.0
- **Router**: TanStack Router (file-based routing)
- **UI Library**: shadcn/ui (11 componentes)
- **Styling**: Tailwind CSS v3
- **Forms**: react-hook-form + zod
- **HTTP Client**: axios (com interceptors)
- **WebSocket**: socket.io-client
- **Notifications**: sonner (toast)
- **Build Tool**: Vite 7

## 🚀 Como Rodar

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

### 3. Rodar em modo desenvolvimento

```bash
npm run dev
```

### 4. Build para produção

```bash
npm run build
npm run preview
```

## 📱 Funcionalidades

- ✅ Autenticação (Login/Register/Logout)
- ✅ Dashboard com lista de tarefas
- ✅ Criar/Editar/Deletar tarefas
- ✅ Adicionar comentários
- ✅ Notificações em tempo real via WebSocket
- ✅ Refresh token automático
- ✅ Loading states e skeleton loaders
- ✅ Toast notifications
- ✅ Responsive design

## 🎨 Componentes shadcn/ui

Button, Card, Input, Form, Dialog, Badge, Skeleton, Select, Dropdown Menu, Label, Sonner

**Total**: 11 componentes ✅

## 📚 Documentação

Ver documentação completa no arquivo principal do projeto.


The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
