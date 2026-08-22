# AI Commerce FE

Module Frontend thương mại điện tử dành cho Nuxt 3/4, hỗ trợ đầy đủ Admin Portal và Storefront.

## 🏗️ Cấu trúc thư mục

```
apps/fe/
├── src/
│   ├── module.ts                        # Nuxt Module definition (đăng ký plugins, layouts, auto-imports, routes)
│   └── runtime/
│       ├── plugin.ts                    # Nuxt plugin (inject runtime utilities)
│       ├── core/                        # Shared/Core UI components & utilities dùng chung
│       │   ├── components/              # Global components (prefix 'App': AppModal, AppTable, AppPagination, ...)
│       │   ├── composables/             # Shared composables (useToast, useImageUrl, ...)
│       │   ├── services/                # Base API client (api.service.ts)
│       │   ├── types/                   # Core TypeScript types (api.types.ts, ...)
│       │   └── utils/                   # Utility helpers
│       ├── admin/                       # Module quản trị (Admin Portal)
│       │   ├── layout/                  # Layout cho admin (AdminLayout.vue)
│       │   ├── routes.ts                # Tổng hợp & cấu hình routes cho Admin
│       │   ├── auth/                    # Feature: Auth (login, logout, token state)
│       │   ├── products/                # Feature: Quản lý sản phẩm (list, detail/create/edit)
│       │   ├── categories/              # Feature: Quản lý danh mục
│       │   ├── orders/                  # Feature: Quản lý đơn hàng
│       │   ├── vouchers/                # Feature: Quản lý mã giảm giá
│       │   └── reviews/                 # Feature: Quản lý đánh giá
│       ├── user/                        # Module storefront cho khách hàng
│       │   └── home/                    # Feature: Trang chủ (views/HomeView.vue, route.ts)
│       └── server/                      # Server routes / Nitro handlers
├── playground/                          # Nuxt App để test module khi dev
│   ├── app.vue
│   └── nuxt.config.ts
└── test/                                # Unit & Integration tests với Vitest
    ├── admin-auth.test.ts
    ├── admin-products.test.ts
    ├── admin-categories.test.ts
    ├── admin-orders.test.ts
    ├── admin-vouchers.test.ts
    ├── admin-reviews.test.ts
    └── api-service.test.ts
```

## 🚀 Các tính năng chính

### 1. Admin Portal (`/admin/*`)

- **Xác thực Admin (`/admin/login`)**: Đăng nhập, lưu trữ token, tự động gắn Bearer Token vào mọi API request.
- **Quản lý sản phẩm (`/admin/products`)**: Bảng danh sách, tìm kiếm, lọc danh mục/trạng thái, phân trang, thêm/sửa/xoá sản phẩm.
- **Quản lý danh mục (`/admin/categories`)**: Danh sách danh mục, modal thêm/chỉnh sửa, xoá danh mục.
- **Quản lý đơn hàng (`/admin/orders`)**: Danh sách đơn hàng, lọc theo trạng thái (`PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`), cập nhật trạng thái đơn hàng và thanh toán.
- **Quản lý mã giảm giá (`/admin/vouchers`)**: Quản lý voucher, loại giảm giá (phần trăm/số tiền cố định), ngày bắt đầu/kết thúc, giới hạn sử dụng.
- **Quản lý đánh giá (`/admin/reviews`)**: Quản lý đánh giá người dùng, duyệt/ẩn đánh giá, phân trang và thống kê sao.

### 2. Core UI Components

- `AppTable`: Component bảng dữ liệu linh hoạt, hỗ trợ custom column render qua slots.
- `AppPagination`: Phân trang tương tác với hiển thị số trang và nút Prev/Next.
- `AppModal` & `ConfirmModal`: Hộp thoại xác nhận thao tác và modal form.
- `AppToast` & `useToast`: Hệ thống thông báo toast notification (success, error, warning, info).

### 3. Storefront (`/`)

- `HomeView`: Giao diện trang chủ hiển thị banner, danh mục nổi bật và danh sách sản phẩm.

---

## 🛠️ Hướng dẫn phát triển (Development)

Trong monorepo, quản lý bằng **pnpm**:

```bash
# 1. Chạy chế độ development với Playground
pnpm --filter @ai-commerce/fe dev

# 2. Chạy Vitest unit tests
pnpm --filter @ai-commerce/fe test

# 3. Chạy Vitest watch mode
pnpm --filter @ai-commerce/fe test:watch

# 4. Kiểm tra Typecheck
pnpm --filter @ai-commerce/fe typecheck

# 5. Build module
pnpm --filter @ai-commerce/fe prepack
```
