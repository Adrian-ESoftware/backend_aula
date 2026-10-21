# API Baiao Aula Quinta

API REST educacional construída com Node.js, TypeScript, Express, TypeORM e MySQL.

## Requisitos

- Node.js 22 ou superior
- MySQL 8 ou superior
- npm

O projeto atual foi validado com Node.js `v26.7.0`. O servidor MySQL precisa estar instalado e em execução separadamente.

## Diagrama do Banco de Dados

O banco de dados segue a estrutura relacional definida no diagrama:

```text
+---------------------+           +---------------------+
|     situations      |           |        users        |
+---------------------+           +---------------------+
| id (PK)             |<-----+    | id (PK)             |
| nameSituation       |      +----| situationId (FK)    |
| createdAt           |           | name                |
| updatedAt           |           | email               |
+---------------------+           | createdAt           |
                                  | updatedAt           |
                                  +---------------------+

+---------------------+           +---------------------+           +---------------------+
| product_categories  |           |      products       |           | product_situations  |
+---------------------+           +---------------------+           +---------------------+
| id (PK)             |<-----+    | id (PK)             |    +----->| id (PK)             |
| name                |      +----| productCategoryId   |    |      | name                |
| createdAt           |           | productSituationId  |----+      | createdAt           |
| updatedAt           |           | name                |           | updatedAt           |
+---------------------+           | createdAt           |           +---------------------+
                                  | updatedAt           |
                                  +---------------------+
```

## Instalação

1. Crie o banco de dados:

```sql
CREATE DATABASE nodeapi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Copie o arquivo de ambiente e ajuste as credenciais:

```bash
cp .env.example .env
```

3. Instale as dependências:

```bash
npm install
```

4. Execute as migrations e as seeds:

```bash
npm run migration:run
npm run seed
```

## Comandos

```bash
npm run start:watch  # desenvolvimento
npm run build        # compilação para dist/
npm start            # execução da compilação
npm test             # testes automatizados
```

As migrations também podem ser revertidas com `npm run migration:revert`.

## Variáveis de ambiente

Veja `.env.example` para a lista completa. As principais são:

- `PORT`: porta HTTP, padrão `8080`.
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`: conexão MySQL.
- `JWT_SECRET`: segredo usado para assinar os tokens.
- `JWT_EXPIRES_IN`: duração do JWT, padrão `1d`.
- `RECOVERY_TOKEN_EXPIRES_MINUTES`: validade do token de recuperação, padrão `30`.

## API e Endpoints

Todos os endpoints de listagem utilizam paginação via query parameters (`?page=1&limit=10`) com o `PaginationService`.

### 1. Situações de Usuários (`/situations`)
- `GET /situations?page=1&limit=10` (lista paginada)
- `GET /situations/:id` (visualização)
- `POST /situations` (cadastro)
- `PUT /situations/:id` e `PATCH /situations/:id` (edição)
- `DELETE /situations/:id` (remoção)

### 2. Categorias de Produtos (`/product-categories`)
- `GET /product-categories?page=1&limit=10` (lista paginada)
- `GET /product-categories/:id` (visualização)
- `POST /product-categories` (cadastro)
- `PUT /product-categories/:id` e `PATCH /product-categories/:id` (edição)
- `DELETE /product-categories/:id` (remoção)

### 3. Situações de Produtos (`/product-situations`)
- `GET /product-situations?page=1&limit=10` (lista paginada)
- `GET /product-situations/:id` (visualização)
- `POST /product-situations` (cadastro)
- `PUT /product-situations/:id` e `PATCH /product-situations/:id` (edição)
- `DELETE /product-situations/:id` (remoção)

### 4. Produtos (`/products`)
- `GET /products?page=1&limit=10` (lista paginada com categoria e situação)
- `GET /products/:id` (visualização detalhada)
- `POST /products` (cadastro vinculando `productCategoryId` e `productSituationId`)
- `PUT /products/:id` e `PATCH /products/:id` (edição)
- `DELETE /products/:id` (remoção)

### 5. Autenticação (`/auth`)
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`

## Seeds

As seeds para inicialização e população padrão do banco de dados ficam organizadas na pasta `src/seeds/`:

- `src/seeds/create-situations-seeds.ts`: popula `Ativo`, `Inativo`, `Pendente` na tabela `situations`.
- `src/seeds/create-product-situations-seeds.ts`: popula `Disponível`, `Indisponível`, `Esgotado`, `Descontinuado` na tabela `product_situations`.
- `src/seeds/create-product-categories-seeds.ts`: popula `Eletrônicos`, `Informática`, `Acessórios`, `Escritório` na tabela `product_categories`.
- `src/run-seeds.ts`: script centralizador executável que executa todas as seeds em sequência e finaliza a conexão de forma segura.

Para executar as seeds:

```bash
npm run seed
```
