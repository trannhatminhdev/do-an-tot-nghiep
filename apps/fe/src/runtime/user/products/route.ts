import { createResolver } from '@nuxt/kit';
import type { NuxtPage } from '@nuxt/schema';

const resolver = createResolver(import.meta.url);

export default [
  {
    name: 'user-products',
    path: '/products',
    file: resolver.resolve('./views/ProductsView.vue'),
    meta: {
      layout: 'user',
    },
  },
  {
    name: 'user-product-detail',
    path: '/products/:id',
    file: resolver.resolve('./views/ProductDetailView.vue'),
    meta: {
      layout: 'user',
    },
  },
] satisfies NuxtPage[];
