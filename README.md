# Galoppe Marketplace

Um marketplace multi-vendedor para o agronegócio, inspirado em plataformas como Mercado Livre e TodoAgro. Permite que múltiplos vendedores criem suas lojas, cadastrem produtos e recebam pedidos de compradores cadastrados dentro da plataforma.

## Stack

- **Frontend:** React 18 + Vite + TailwindCSS + React Router + Axios
- **Backend:** Node.js + Express + JWT + bcrypt + Zod
- **Banco:** PostgreSQL (hospedado no Supabase)

## Estrutura do projeto

```
Galoppe/
├── database/
│   └── schema.sql           # Script completo de criação + seed
├── backend/
│   ├── src/
│   │   ├── config/          # Conexão com Postgres (pool + transações)
│   │   ├── controllers/     # Recebem a requisição e validam entrada (Zod)
│   │   ├── services/        # Regras de negócio puras
│   │   ├── routes/          # Mapeamento de rotas Express
│   │   ├── middleware/      # auth (JWT) e error handler
│   │   ├── utils/
│   │   └── app.js
│   ├── scripts/             # migrate.js e generate-hash.js
│   ├── server.js
│   ├── package.json
│   └── .env
└── frontend/
    ├── src/
    │   ├── components/      # Navbar, Footer, ProductCard, ProtectedRoute
    │   ├── contexts/        # AuthContext, CartContext
    │   ├── pages/           # Home, ProductDetail, Login, Cart, Checkout...
    │   ├── pages/seller/    # Painel do vendedor
    │   ├── pages/admin/     # Painel administrativo
    │   ├── services/api.js  # Axios + interceptor JWT
    │   └── utils/
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

## Funcionalidades implementadas

### Autenticação
- Cadastro e login com JWT
- Três papéis: `buyer`, `seller`, `admin`
- Endpoint `GET /auth/me` para rehidratar a sessão

### Vendedores
- Ao se cadastrar como vendedor, a loja é criada automaticamente (com slug único)
- Edição dos dados da loja (nome, descrição, logo, banner)
- Listagem pública de lojas

### Produtos
- CRUD completo, restrito ao vendedor dono
- Campos: nome, descrição, preço, imagem, estoque, categoria, SKU, ativo
- Listagem pública com busca, filtros de categoria e paginação

### Carrinho
- Um carrinho por usuário comprador
- Adicionar, atualizar quantidade, remover e limpar

### Pedidos
- Ao finalizar a compra, o carrinho é particionado **por vendedor**: um pedido por loja
- Estoque é debitado dentro de uma transação
- Status do pedido: `pending → paid → shipped → delivered` (ou `cancelled`)
- Status de pagamento separado, preparado para gateway futuro
- Campos `payment_provider`, `payment_reference` e `tracking_code` já existem no schema

### Painel do vendedor
- Dashboard com totais (produtos, pedidos, faturamento)
- CRUD de produtos
- Visualização dos pedidos recebidos com atualização de status e código de rastreio

### Painel administrativo
- Métricas globais (usuários, vendedores, produtos, GMV)
- Listagem de usuários, vendedores e pedidos

## Instalação e execução local

### 1. Banco de dados (Supabase / PostgreSQL)

O projeto já vem configurado para conectar no Supabase através da variável `DATABASE_URL` em `backend/.env`.

**Para criar as tabelas e dados de exemplo**, execute o script:

```bash
cd backend
npm install
npm run db:migrate
```

Alternativamente, rode manualmente o `database/schema.sql` no SQL Editor do Supabase.

### 2. Backend

```bash
cd backend
npm install
npm run dev        # usa nodemon
# ou
npm start
```

A API sobe em `http://localhost:4000`. Teste com:

```bash
curl http://localhost:4000/api/health
```

### 3. Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

A UI sobe em `http://localhost:5173`.

### 4. Seed de empresas de teste

Para criar ou atualizar 5 empresas de teste com produtos no catalogo:

```bash
cd backend
npm run db:seed
```

O seed e idempotente e todos os usuarios criados por ele usam a senha **`senha123`**.

## Usuários de teste (seed)

Todos os usuários criados pelo seed usam a senha **`senha123`**:

| E-mail                 | Papel   |
|------------------------|---------|
| `admin@galoppe.com`    | admin   |
| `joao@email.com`       | buyer   |
| `maria@email.com`      | buyer   |
| `contato@fazendadovale.com` | seller  |
| `contato@agroloja.com` | seller  |
| `campo.norte@teste.com` | seller |
| `terra.viva@teste.com` | seller |
| `horizonte@teste.com` | seller |
| `pivo.certo@teste.com` | seller |
| `raiz.forte@teste.com` | seller |

> Para regerar o hash de uma senha: `node scripts/generate-hash.js novasenha` e cole o hash no `schema.sql`.

## API REST - principais endpoints

```
POST   /api/auth/register            { name, email, password, role, storeName? }
POST   /api/auth/login               { email, password }
GET    /api/auth/me                  (auth)

GET    /api/products                 ?search=&category=&sellerId=&limit=&offset=
GET    /api/products/:id
GET    /api/products/mine            (seller)
POST   /api/products                 (seller)
PUT    /api/products/:id             (seller, owner)
DELETE /api/products/:id             (seller, owner)

GET    /api/sellers
GET    /api/sellers/:slug
GET    /api/sellers/me               (seller)
PUT    /api/sellers/me               (seller)

GET    /api/cart                     (buyer)
POST   /api/cart/items               (buyer)  { product_id, quantity }
PUT    /api/cart/items/:itemId       (buyer)  { quantity }
DELETE /api/cart/items/:itemId       (buyer)
DELETE /api/cart                     (buyer)

POST   /api/orders                   (buyer)  { shipping_address, notes }
GET    /api/orders/mine              (buyer)
GET    /api/orders/sales             (seller)
GET    /api/orders/:id               (owner)
PATCH  /api/orders/:id/status        (seller, owner)

GET    /api/admin/metrics            (admin)
GET    /api/admin/users              (admin)
GET    /api/admin/sellers            (admin)
GET    /api/admin/orders             (admin)
```

## Preparação para gateway de pagamento

O schema da tabela `orders` já contém:

- `payment_status` (pending, processing, approved, refused, refunded)
- `payment_provider` (ex.: `mercadopago`, `stripe`, `pagseguro`)
- `payment_reference` (ID da transação no gateway)

Para integrar um gateway basta criar um novo `paymentService`, emitir a cobrança após `orderService.createFromCart`, guardar o `payment_reference` retornado e registrar um webhook que chame `orderService.updateStatus` ao aprovar o pagamento.

## Próximos passos sugeridos

- Upload real de imagens (S3 / Supabase Storage) em vez de URL manual
- Refresh tokens + logout server-side
- Avaliações e comentários em produtos e vendedores
- Favoritos / wishlist
- Integração Mercado Pago / Stripe
- Notificações por e-mail (pedido criado, enviado, entregue)
- Testes automatizados (Vitest no frontend / Jest no backend)

## Segurança — importante

A string de conexão do Supabase foi fornecida na primeira mensagem do chat. Como a senha ficou exposta, recomenda-se **rotacioná-la no painel do Supabase** (Project Settings → Database → Reset database password) e atualizar `backend/.env`.

---

Feito com ♥ para rodar — boa construção!
