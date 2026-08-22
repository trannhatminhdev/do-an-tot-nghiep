import { createResolver } from '@nuxt/kit';
import type { NuxtPage } from '@nuxt/schema';

const resolver = createResolver(import.meta.url);

export default [
  {
    name: 'user-checkout',
    path: '/checkout',
    file: resolver.resolve('./views/CheckoutView.vue'),
    meta: {
      layout: 'user',
    },
  },
  {
    name: 'user-order-success',
    path: '/checkout/success',
    file: resolver.resolve('./views/OrderSuccessView.vue'),
    meta: {
      layout: 'user',
    },
  },
] satisfies NuxtPage[];
