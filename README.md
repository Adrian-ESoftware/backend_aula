# API Baianá Aula Quinta

API REST educacional construída com Node.js, TypeScript, Express, TypeORM e MySQL.

## Requisitos

- Node.js 22 ou superior
- MySQL 8 ou superior
- npm

O projeto atual foi validado com Node.js `v26.7.0`. O servidor MySQL precisa estar instalado e em execução separadamente.

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

- `PORT`: porta HTTP, padrão `3000`.
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`: conexão MySQL.
- `JWT_SECRET`: segredo usado para assinar os tokens.
- `JWT_EXPIRES_IN`: duração do JWT, padrão `1d`.
- `RECOVERY_TOKEN_EXPIRES_MINUTES`: validade do token de recuperação, padrão `30`.

## API

O health check não consulta tabelas, mas o servidor precisa conseguir inicializar a conexão com o MySQL:

```http
GET /health
```

### Autenticação

```http
POST /auth/register
Content-Type: application/json

{
  "name": "Maria",
  "email": "maria@example.com",
  "password": "senha-segura"
}
```

Também estão disponíveis `POST /auth/login`, `GET /auth/me`, `POST /auth/forgot-password` e `POST /auth/reset-password`.

Envie o JWT retornado no login para endpoints protegidos:

```http
Authorization: Bearer <token>
```

### Situações e produtos

- `GET /situations` e `GET /situations/:id`
- `POST`, `PATCH` e `DELETE /situations/:id` — autenticados
- `GET /products` e `GET /products/:id`
- `POST`, `PATCH` e `DELETE /products/:id` — autenticados

Produtos possuem nome, slug, descrição, preço e situação relacionada. O slug é gerado automaticamente a partir do nome.

## Dados de teste

Depois de executar `npm run seed`, use:

```text
e-mail: admin@example.com
senha: 12345678
```

Em ambiente de desenvolvimento, `POST /auth/forgot-password` inclui o token de recuperação na resposta para facilitar os testes locais. Em produção, a resposta não expõe o token.
