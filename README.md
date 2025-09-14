# Sistema Garnhões

### 🚀 Tecnologias

- **Next.js 15.3.4** - Full-stack React framework
- **Prisma ORM + MySQL** - Database ORM with Railway hosting
- **JWT Authentication** - Secure token-based auth
- **TypeScript** - Full type safety
- **S3 Upload** - File storage with DigitalOcean Spaces
- **Cache System** - In-memory caching with ETag support
- **Error Handling** - Advanced error management system
- **Performance Optimized** - Database indexes and query optimization

### 📋 Comandos

#### Prisma/Migrations (Índices/Otimizações)

```bash
npm run migration:up      # Aplicar custom migrations
npm run migration:status  # Status custom migrations
npm run migration:create  # Criar nova migration
npm run migration:down    # Reset migrations
```

### Resetar, migrar e popular o banco de dados (Prisma)

```bash
# Gera um novo arquivo de migration e aplica as alterações no banco de dados local
npx prisma migrate dev

# Aplica todas as migrations no banco de dados de produção
npx prisma migrate deploy

# Verifica se tem alterações pendentes
npx prisma migrate status

# Abre o prisma studio
npx prisma studio

# Popula o banco de dados com dados iniciais (seed)
npx prisma db seed

# Reseta o banco de dados (CUIDADO: remove todas as tabelas e dados)
npx prisma migrate reset
```

> **Dica:** O comando `npx prisma migrate reset` já executa as migrations e a seed automaticamente. Use em ambiente de desenvolvimento!

## Abre o studio

```bash
npx prisma studio
```

#### 🛠️ Development

```bash
npm run dev              # Servidor desenvolvimento
npm run build            # Build produção
npx eslint .             # Lint código
npx prettier --check .   # Verifica formatação prettier
npx prettier --write .   # Formata código com prettier
```

### 🔧 Setup Rápido

**Clone e instale**

```bash
git clone <repo>
cd backend-2025
npm install
```

**Configure ambiente**

```bash
cp .env.example .env
# Edite .env com suas credenciais
```

**Inicie desenvolvimento**

```bash
npm run dev
```

### 📚 Documentação

- **[MIGRATIONS.md](MIGRATIONS.md)** - Guia completo de migrations
- **API Endpoints** - Documentação das rotas

### 📊 Ajustes de Performance

- ✅ **Sistema de cache** com ETag support
- ✅ **Error handling robusto** com logging
- ✅ **Rate limiting** inteligente
- ✅ **CORS e Security headers**
- ✅ **Database query optimization**

### 🔐 Ajustes de Segurança

- 🔒 JWT Authentication com refresh tokens
- 🛡️ CORS configurado
- 🔐 Helmet security headers
- ⚡ Rate limiting por IP
- 🚨 Error logging estruturado
- 🔍 Request tracking completo
