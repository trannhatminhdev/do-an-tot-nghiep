import { createResolver } from '@nuxt/kit';
import type { NuxtPage } from '@nuxt/schema';

const resolver = createResolver(import.meta.url);

export default [
  {
    name: 'user-cart',
    path: '/cart',
    file: resolver.resolve('./views/CartView.vue'),
    meta: {
      layout: 'user',
    },
  },
] satisfies NuxtPage[];
