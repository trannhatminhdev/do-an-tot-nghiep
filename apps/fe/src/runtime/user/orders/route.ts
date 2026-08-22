import { createResolver } from '@nuxt/kit';
import type { NuxtPage } from '@nuxt/schema';

const resolver = createResolver(import.meta.url);

export default [
  {
    name: 'user-orders',
    path: '/orders',
    file: resolver.resolve('./views/UserOrdersView.vue'),
    meta: {
      layout: 'user',
    },
  },
] satisfies NuxtPage[];
