# AI Commerce Backend (NestJS)

Backend API phục vụ hệ thống thương mại điện tử AI Commerce, được xây dựng trên nền tảng **NestJS** theo kiến trúc **Hexagonal Architecture (Ports & Adapters)** và **Prisma ORM**.

## 🏗️ Cấu trúc thư mục

```
apps/be/
├── src/
│   ├── main.ts                          # Bootstrap entry point (global pipes, interceptors, CORS)
│   ├── app.module.ts                    # Root module kết nối Core và Feature modules
│   ├── core/                            # Tầng dùng chung của hệ thống
│   │   ├── database/                    # PrismaModule & PrismaService
│   │   ├── guards/                      # JwtAuthGuard, RolesGuard
│   │   ├── decorators/                  # Roles, CurrentUser decorators
│   │   └── filters/                     # Global HttpExceptionFilter
│   ├── modules/                         # Feature Modules (Hexagonal Architecture)
│   │   ├── auth/                        # Xác thực, JWT, Admin & User auth
│   │   ├── products/                    # Quản lý sản phẩm (User storefront & Admin CRUD)
│   │   ├── categories/                  # Danh mục sản phẩm
│   │   ├── orders/                      # Đặt hàng, giỏ hàng, cập nhật trạng thái đơn
│   │   ├── vouchers/                    # Mã giảm giá, kiểm tra áp dụng voucher
│   │   └── reviews/                     # Đánh giá & phản hồi sản phẩm
│   └── shared/                          # Shared DTOs, Enums, Utilities
├── prisma/
│   ├── schema.prisma                    # Prisma Database Schema (SQLite / PostgreSQL)
│   └── migrations/                      # Lịch sử migration
└── test/                                # Unit & E2E Tests (Jest)
```

### Cấu trúc một Feature Module theo Hexagonal Architecture:
```
modules/<feature>/
├── <feature>.module.ts                  # NestJS Module & DI bindings
├── application/
│   ├── interfaces/                      # Ports (Repository & Service interfaces)
│   └── services/                        # Use Cases / Business logic
├── domain/
│   └── entities/                        # Domain entities
├── infrastructure/
│   └── repositories/                    # Adapters (Prisma repository implementations)
└── presentation/
    └── http/                            # HTTP Controllers & DTOs
        ├── <feature>.controller.ts
        ├── admin-<feature>.controller.ts
        └── dtos/
```

## 🚀 Các tính năng chính (API Modules)

- **Auth Module**: Đăng nhập/Đăng ký người dùng, Đăng nhập Admin, JWT Access/Refresh tokens, phân quyền `ADMIN` và `USER`.
- **Products Module**: Quản lý sản phẩm, lọc theo danh mục, tìm kiếm full-text, phân trang, quản lý kho hàng.
- **Categories Module**: Quản lý phân cấp danh mục, danh mục cha-con.
- **Orders Module**: Tạo đơn hàng, tính toán tổng tiền, kiểm tra tồn kho, cập nhật trạng thái đơn hàng và thanh toán.
- **Vouchers Module**: Tạo và áp dụng mã khuyến mãi theo giá trị phần trăm hoặc số tiền cố định, kiểm tra điều kiện đơn hàng tối thiểu.
- **Reviews Module**: Đánh giá sản phẩm kèm xếp hạng sao (1-5 sao) và bình luận.

---

## 🛠️ Hướng dẫn phát triển (Development)

```bash
# 1. Chạy Backend ở chế độ development
pnpm --filter be start:dev

# 2. Chạy Prisma migrations
pnpm --filter be prisma migrate dev

# 3. Mở Prisma Studio để xem dữ liệu
pnpm --filter be prisma studio

# 4. Chạy Unit Tests (Jest)
pnpm --filter be test

# 5. Chạy Test với Coverage
pnpm --filter be test:cov
```

