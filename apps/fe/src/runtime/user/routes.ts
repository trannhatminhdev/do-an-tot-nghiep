import type { NuxtPage } from '@nuxt/schema';
import homeRoutes from './home/route';
import productsRoutes from './products/route';
import cartRoutes from './cart/route';
import checkoutRoutes from './checkout/route';
import ordersRoutes from './orders/route';

export function setupUserRoutes(pages: NuxtPage[]) {
  pages.push(...homeRoutes);
  pages.push(...productsRoutes);
  pages.push(...cartRoutes);
  pages.push(...checkoutRoutes);
  pages.push(...ordersRoutes);
}
