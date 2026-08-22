---
name: create-nuxt-feature
description: >-
  Quy trình thêm component, composable, hoặc plugin mới vào Nuxt Module frontend
  (`apps/fe`). Kích hoạt khi người dùng yêu cầu tạo UI component, page, composable,
  hoặc bất kỳ tính năng frontend nào.
---
# Phát triển tính năng cho Nuxt Module Frontend

Frontend (`apps/fe`) là một **Nuxt Module** (không phải Nuxt App thông thường).
Code runtime được đặt trong `apps/fe/src/runtime/` theo cấu trúc **Feature-Driven Modular Architecture** và được đăng ký qua `apps/fe/src/module.ts` bằng các helper từ `@nuxt/kit`.

## Cấu trúc thư mục

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
│       └── server/                      # Server routes / Nitro handlers & tsconfig
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

### Cấu trúc chuẩn của một Feature Module (`admin/<feature>/` hoặc `user/<feature>/`):
```
<feature>/
├── views/                               # Vue page components
│   ├── Admin<Feature>View.vue           # Trang danh sách
│   └── Admin<Feature>DetailView.vue     # Trang chi tiết/tạo mới/chỉnh sửa
├── services/                            # API service gọi Backend
│   └── admin-<feature>.service.ts
├── composables/                         # State & UI logic composable
│   └── useAdmin<Feature>.ts
├── types/                               # TypeScript interface / types
│   └── <feature>.types.ts
├── constants.ts                         # Cột table, status options, constants
└── route.ts                             # Định nghĩa Nuxt route cho feature
```

---

## Quy trình thêm một Feature mới

### 1. Định nghĩa Types (`types/<feature>.types.ts`)

```typescript
export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface CreateProductDto {
  name: string;
  price: number;
  stock: number;
}
```

### 2. Tạo Service API (`services/admin-<feature>.service.ts`)

Sử dụng `apiService` từ `@fe/core/services/api.service`:

```typescript
import { apiService } from '../../core/services/api.service';
import type { Product, CreateProductDto } from '../types/product.types';
import type { ApiResponse, PaginatedResponse } from '../../core/types/api.types';

export class AdminProductService {
  async getProducts(params?: Record<string, any>): Promise<PaginatedResponse<Product>> {
    return apiService.get<PaginatedResponse<Product>>('/admin/products', params);
  }

  async getProductById(id: string): Promise<ApiResponse<Product>> {
    return apiService.get<ApiResponse<Product>>(`/admin/products/${id}`);
  }

  async createProduct(dto: CreateProductDto): Promise<ApiResponse<Product>> {
    return apiService.post<ApiResponse<Product>>('/admin/products', dto);
  }

  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<ApiResponse<void>>(`/admin/products/${id}`);
  }
}

export const adminProductService = new AdminProductService();
```

### 3. Tạo Composable (`composables/useAdmin<Feature>.ts`)

Quản lý state, loading, pagination và tương tác UI:

```typescript
import { ref, reactive } from 'vue';
import { adminProductService } from '../services/admin-products.service';
import type { Product } from '../types/product.types';

export function useAdminProducts() {
  const products = ref<Product[]>([]);
  const loading = ref(false);
  const total = ref(0);
  const { showToast } = useToast();

  const pagination = reactive({
    page: 1,
    limit: 10,
  });

  async function fetchProducts() {
    loading.value = true;
    try {
      const res = await adminProductService.getProducts({
        page: pagination.page,
        limit: pagination.limit,
      });
      products.value = res.data;
      total.value = res.meta?.total || 0;
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi tải danh sách', 'error');
    } finally {
      loading.value = false;
    }
  }

  return {
    products,
    loading,
    total,
    pagination,
    fetchProducts,
  };
}
```

### 4. Tạo Views (`views/Admin<Feature>View.vue`)

- Sử dụng `<script setup lang="ts">`
- Sử dụng các components dùng chung `AppTable`, `AppPagination`, `AppModal`, `ConfirmModal`

```vue
<script setup lang="ts">
import { onMounted } from 'vue';

const { products, loading, total, pagination, fetchProducts } = useAdminProducts();

onMounted(() => {
  fetchProducts();
});
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h1>
    </div>
    
    <!-- Table & Pagination -->
  </div>
</template>
```

### 5. Khai báo Routes (`route.ts`) và Đăng ký vào Admin Routes

Tạo `route.ts`:
```typescript
import type { NuxtPage } from '@nuxt/schema';
import { createResolver } from '@nuxt/kit';

const resolver = createResolver(import.meta.url);

export const productRoutes: NuxtPage[] = [
  {
    name: 'admin-products',
    path: '/admin/products',
    file: resolver.resolve('./views/AdminProductsView.vue'),
    meta: {
      layout: 'admin',
      title: 'Quản lý sản phẩm',
    },
  },
];
```

Đăng ký vào `apps/fe/src/runtime/admin/routes.ts`:
```typescript
import { productRoutes } from './products/route';

export function setupAdminRoutes(pages: NuxtPage[]) {
  // ...
  pages.push(...productRoutes);
}
```

### 6. Đăng ký trong `apps/fe/src/module.ts`

Đăng ký auto-import cho composables và services mới:
```typescript
addImportsDir(resolver.resolve('./runtime/admin/<feature>/composables'));
addImportsDir(resolver.resolve('./runtime/admin/<feature>/services'));
```

### 7. Viết Tests trong `apps/fe/test/`

Tạo file `apps/fe/test/admin-<feature>.test.ts` và chạy:
```bash
pnpm --filter @ai-commerce/fe test
```

---

## Quy tắc quan trọng

1. **LUÔN** dùng `<script setup lang="ts">` cho mọi Vue component (Composition API).
2. **KHÔNG** dùng Options API (`data()`, `methods`, `computed` object syntax).
3. Mọi runtime code PHẢI nằm trong `src/runtime/`, tuân theo cấu trúc phân chia module (`core/`, `admin/`, `user/`).
4. Composables và Services mới PHẢI được đăng ký trong `src/module.ts` qua `addImportsDir`.
5. Core components dùng chung đặt trong `src/runtime/core/components/` với prefix `App`.
6. Routes khai báo qua `extendPages` trong `src/module.ts` (không dùng filesystem routing của playground).
7. Test trong `apps/fe/test/` và chạy playground `pnpm --filter @ai-commerce/fe dev` để kiểm tra trực quan.
