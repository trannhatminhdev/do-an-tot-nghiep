# Quy tắc Frontend (Nuxt Module + Vue 3 Composition API)

Dự án Frontend (`apps/fe`) là một **Nuxt Module**. Agent PHẢI tuân thủ các quy tắc sau.

## Quy tắc bắt buộc

### 1. Composition API Only

- **LUÔN** sử dụng `<script setup lang="ts">` cho mọi Vue component
- **KHÔNG BAO GIỜ** dùng Options API (`data()`, `methods`, `computed` dạng object, `watch` dạng object)
- Sử dụng `ref()`, `reactive()`, `computed()`, `watch()` từ Vue 3 Composition API

```vue
<!-- ✅ ĐÚNG -->
<script setup lang="ts">
import { ref, computed } from 'vue'

const count = ref(0)
const doubled = computed(() => count.value * 2)
</script>

<!-- ❌ SAI - Không dùng Options API -->
<script>
export default {
  data() { return { count: 0 } },
  computed: { doubled() { return this.count * 2 } }
}
</script>
```

### 2. TypeScript bắt buộc

- Tất cả file `.ts` và `<script setup lang="ts">`
- Sử dụng `defineProps<T>()` với generic type thay vì runtime declaration
- Sử dụng `defineEmits<T>()` với generic type

```vue
<script setup lang="ts">
// ✅ ĐÚNG - Type-based props
defineProps<{
  title: string
  count?: number
}>()

// ❌ SAI - Runtime declaration
defineProps({
  title: { type: String, required: true }
})
</script>
```

### 3. Cấu trúc Nuxt Module (Feature-Driven Modular Architecture)

- Mọi runtime code PHẢI nằm trong `apps/fe/src/runtime/`:
  - `core/`: Chứa global components (prefix `App`), shared composables, `api.service.ts`, core types.
  - `admin/<feature>/`: Feature modules của Admin Portal (`views/`, `services/`, `composables/`, `types/`, `constants.ts`, `route.ts`).
  - `user/<feature>/`: Feature modules của Storefront (`views/`, `route.ts`, ...).
- Mọi composable và service PHẢI được đăng ký qua `addImportsDir` trong `apps/fe/src/module.ts`.
- Mọi route PHẢI được khai báo qua `extendPages` trong `apps/fe/src/module.ts`.
- Test trong `apps/fe/test/` (Vitest) và kiểm tra tương tác tại `apps/fe/playground/`.

### 4. Naming Convention

| Loại | Convention | Ví dụ |
|------|-----------|-------|
| Core Component file | PascalCase với prefix `App` | `AppModal.vue`, `AppPagination.vue`, `AppTable.vue` |
| View / Page component | PascalCase với suffix `View` | `AdminProductsView.vue`, `AdminOrderDetailView.vue` |
| Composable file | camelCase với prefix `use` | `useAdminProducts.ts`, `useToast.ts` |
| Service file | kebab-case với suffix `.service.ts` | `admin-products.service.ts`, `api.service.ts` |
| Type definition file | kebab-case với suffix `.types.ts` | `product.types.ts`, `api.types.ts` |
| Route file | kebab-case | `route.ts`, `routes.ts` |

### 5. Composables & Services Pattern

- Tên composable PHẢI bắt đầu bằng `use` (VD: `useAdminProducts`, `useAdminOrders`).
- Composable PHẢI return một object (không return array).
- Services đóng vai trò gọi API thông qua `apiService` singleton, trả về `Promise<T>`.
- Composable quản lý `state`, `loading`, `error`, `pagination` và gọi qua Service.

### 6. State Management

- Ưu tiên sử dụng composables + `useState()` / `ref()` cho reactive state.
- Sử dụng `useToast()` cho hiển thị thông báo phản hồi thao tác người dùng.
