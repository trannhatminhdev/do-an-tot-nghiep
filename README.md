# AI Commerce Template

Monorepo template thương mại điện tử hoàn chỉnh với **NestJS Backend** (Hexagonal Architecture) và **Nuxt Module Frontend** (Vue 3 Composition API & Tailwind CSS).

## 🏗️ Cấu trúc dự án

```
ai-commerce-template/
├── apps/
│   ├── be/                          # NestJS Backend (Hexagonal Architecture + Prisma)
│   │   ├── src/
│   │   │   ├── core/                # Database, Guards, Decorators, Filters
│   │   │   ├── modules/             # Auth, Products, Categories, Orders, Vouchers, Reviews
│   │   │   └── shared/              # Shared utilities & DTOs
│   │   └── prisma/                  # Schema & Migrations
│   └── fe/                          # Nuxt Module Frontend (@ai-commerce/fe)
│       ├── src/runtime/
│       │   ├── core/                # Shared components (AppTable, AppPagination, AppModal, ...), services, composables
│       │   ├── admin/               # Admin Portal (Auth, Products, Categories, Orders, Vouchers, Reviews)
│       │   └── user/                # Storefront (Home)
│       ├── playground/              # Nuxt App để dev & test module
│       └── test/                    # Vitest unit tests
├── .env.example                     # Cấu hình biến môi trường mẫu
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── turbo.json
└── package.json
```

## 🚀 Khởi chạy dự án

```bash
# 1. Cài đặt dependencies (từ root monorepo)
pnpm install

# 2. Tạo file biến môi trường từ mẫu
cp .env.example .env

# 3. Chạy Prisma migration cho Backend
pnpm --filter be prisma migrate dev

# 4. Khởi chạy toàn bộ hệ thống (Turborepo)
pnpm dev

# Hoặc khởi chạy riêng lẻ từng workspace:
pnpm --filter be dev                 # Backend (http://localhost:3000/api/v1)
pnpm --filter @ai-commerce/fe dev    # Frontend (http://localhost:3001)
```

### 🧪 Chạy Tests

```bash
# Chạy toàn bộ tests Backend (Jest)
pnpm --filter be test

# Chạy toàn bộ tests Frontend (Vitest)
pnpm --filter @ai-commerce/fe test
```

### 🌐 Các cổng dịch vụ mặc định:
- **Backend API**: [http://localhost:3000/api/v1](http://localhost:3000/api/v1)
- **Frontend App**: [http://localhost:3001](http://localhost:3001)
- **Admin Portal**: [http://localhost:3001/admin/login](http://localhost:3001/admin/login)

