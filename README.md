# MARKETPLACE

Projeto full stack de marketplace multi-vendedor, criado para demonstrar uma experiência completa de compra, venda e administração em uma plataforma de e-commerce.

O sistema permite que compradores naveguem por produtos e lojas, adicionem itens ao carrinho e finalizem pedidos. Vendedores possuem um painel próprio para gerenciar loja, produtos e vendas. Administradores acompanham métricas gerais, usuários, vendedores e pedidos da plataforma.

## Visão Geral

Este projeto foi desenvolvido como aplicação de portfólio, com foco em arquitetura limpa, separação de responsabilidades e fluxo completo entre frontend, backend e banco de dados.

Principais pontos demonstrados:

- Autenticação com JWT e controle de acesso por perfil.
- Marketplace com múltiplos vendedores.
- Catálogo público com busca, categorias e paginação.
- Carrinho persistente por usuário.
- Checkout com separação automática de pedidos por vendedor.
- Painel do vendedor para gestão de produtos, loja e pedidos.
- Painel administrativo com métricas e listagens globais.
- API REST estruturada em controllers, services, routes e middlewares.
- Banco PostgreSQL com schema, seeds e scripts de migração.

## Funcionalidades

### Comprador

- Cadastro e login.
- Navegação por produtos e lojas.
- Busca e filtro por categoria.
- Página de detalhe do produto.
- Carrinho com adição, remoção e alteração de quantidade.
- Checkout com endereço de entrega e observações.
- Histórico de pedidos.
- Perfil do usuário.

### Vendedor

- Criação automática da loja ao cadastrar uma conta vendedora.
- Edição de nome, descrição, logo e banner da loja.
- Cadastro, edição e remoção de produtos.
- Controle de estoque, preço, SKU, categoria e status ativo.
- Dashboard com totais de produtos, pedidos e faturamento.
- Gestão de pedidos recebidos.
- Atualização de status e código de rastreio.

### Administrador

- Dashboard com métricas globais da plataforma.
- Listagem de usuários.
- Listagem de vendedores.
- Acompanhamento de pedidos.
- Visão geral de GMV, produtos e operação do marketplace.

## Stack

### Frontend

- React 18
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide React
- React Hot Toast

### Backend

- Node.js
- Express
- PostgreSQL
- JWT
- bcrypt
- Zod
- Helmet
- Morgan

### Banco de Dados

- PostgreSQL
- Scripts SQL para schema e seed
- Integração preparada para Supabase

## Arquitetura

```txt
MARKETPLACE/
├── backend/
│   ├── src/
│   │   ├── config/          # Conexão com o banco de dados
│   │   ├── controllers/     # Entrada das requisições HTTP
│   │   ├── middleware/      # Autenticação e tratamento de erros
│   │   ├── routes/          # Rotas da API
│   │   ├── services/        # Regras de negócio
│   │   └── utils/           # Funções auxiliares
│   ├── scripts/             # Migração, seed e utilitários
│   └── server.js
├── database/
│   ├── schema.sql
│   ├── schema_tables.sql
│   └── seed_data.sql
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── contexts/        # Contextos de autenticação e carrinho
│   │   ├── pages/           # Telas públicas e privadas
│   │   ├── services/        # Cliente HTTP
│   │   └── utils/           # Formatadores e helpers
│   └── public/
└── vercel.json
```

## Modelagem Principal

O projeto trabalha com três papéis de usuário:

- `buyer`: comprador.
- `seller`: vendedor.
- `admin`: administrador.

Fluxo principal:

1. O vendedor cria uma conta e recebe uma loja automaticamente.
2. O vendedor cadastra produtos vinculados à própria loja.
3. O comprador navega pelo catálogo e adiciona produtos ao carrinho.
4. Ao finalizar a compra, o backend separa o carrinho em pedidos por vendedor.
5. Cada vendedor acompanha e atualiza apenas os próprios pedidos.
6. O administrador acompanha a operação geral da plataforma.

## API REST

Principais grupos de rotas:

```txt
/api/auth       # Cadastro, login e sessão
/api/products   # Catálogo e CRUD de produtos
/api/sellers    # Lojas e dados do vendedor
/api/cart       # Carrinho do comprador
/api/orders     # Pedidos de compra e venda
/api/admin      # Métricas e gestão administrativa
```

## Como Executar Localmente

### 1. Backend

```bash
cd backend
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

A API será executada em:

```txt
http://localhost:4000
```

### 2. Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

A interface será executada em:

```txt
http://localhost:5173
```

## Variáveis de Ambiente

Crie um arquivo `.env` dentro da pasta `backend` com as variáveis necessárias para conexão com o banco e autenticação:

```env
DATABASE_URL=postgresql://usuario:senha@host:porta/database
JWT_SECRET=sua_chave_secreta
PORT=4000
```

## Scripts Úteis

### Backend

```bash
npm run dev
npm start
npm run db:migrate
npm run db:seed
npm run db:update-images
```

### Frontend

```bash
npm run dev
npm run build
npm run preview
```

## Destaques Técnicos

- Separação entre camada HTTP e regras de negócio.
- Validação de entrada com Zod.
- Middleware de autenticação baseado em JWT.
- Proteção de rotas por perfil no frontend.
- Context API para autenticação e carrinho.
- Transações no banco ao criar pedidos e debitar estoque.
- Estrutura preparada para integração futura com gateway de pagamento.

## Próximas Melhorias

- Integração com gateway de pagamento.
- Upload real de imagens com storage externo.
- Avaliações de produtos e vendedores.
- Favoritos e lista de desejos.
- Notificações por e-mail.
- Testes automatizados no frontend e backend.

---

Projeto desenvolvido para portfólio, demonstrando um marketplace completo com área pública, painel do vendedor, painel administrativo, API REST e persistência em banco relacional.
