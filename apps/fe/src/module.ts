import {
  addImportsDir,
  addLayout,
  addPlugin,
  createResolver,
  defineNuxtModule,
  extendPages,
  installModule,
} from '@nuxt/kit';
import { setupAdminRoutes } from './runtime/admin/routes';
import { setupUserRoutes } from './runtime/user/routes';

// Module options TypeScript interface definition
export interface ModuleOptions {
  /**
   * Base URL của backend API (mặc định: http://localhost:3000/api/v1)
   */
  apiBase?: string;
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'ai-commerce-fe',
    configKey: 'aiCommerceFe',
  },
  // Default configuration options of the Nuxt module
  defaults: {
    apiBase: 'http://localhost:3000/api/v1',
  },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);

    // Register module internal alias
    nuxt.options.alias['#fe'] = resolver.resolve('./runtime');

    // Pass module options to runtime config
    nuxt.options.runtimeConfig.public = nuxt.options.runtimeConfig.public || {};
    nuxt.options.runtimeConfig.public.apiBase =
      (nuxt.options.runtimeConfig.public.apiBase as string) ||
      options.apiBase ||
      'http://localhost:3000/api/v1';

    // Inject Material Symbols font link
    nuxt.options.app.head = nuxt.options.app.head || {};
    nuxt.options.app.head.link = nuxt.options.app.head.link || [];
    nuxt.options.app.head.link.push({
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap',
    });
    nuxt.options.app.head.style = nuxt.options.app.head.style || [];
    nuxt.options.app.head.style.push({
      innerHTML: `
        .material-symbols-outlined {
          font-family: 'Material Symbols Outlined', sans-serif;
          font-weight: normal;
          font-style: normal;
          font-size: 24px;
          line-height: 1;
          letter-spacing: normal;
          text-transform: none;
          display: inline-block;
          white-space: nowrap;
          word-wrap: normal;
          direction: ltr;
          -webkit-font-feature-settings: 'liga';
          -webkit-font-smoothing: antialiased;
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .material-symbols-outlined.fill,
        .material-symbols-outlined.filled {
          font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `,
    });

    await installModule('@nuxtjs/tailwindcss', {
      exposeConfig: true,
      config: {
        darkMode: 'class',
        content: {
          files: [resolver.resolve('./runtime/**/*.{vue,mjs,ts}')],
        },
        theme: {
          extend: {
            colors: {
              primary: {
                DEFAULT: '#0052CC',
                hover: '#0040A2',
                50: '#EBF3FF',
                100: '#D6E6FF',
                200: '#ADC8FF',
                300: '#85AAFF',
                400: '#5C8DFF',
                500: '#0052CC',
                600: '#0040A2',
                700: '#00307A',
              },
              error: {
                DEFAULT: '#EF4444',
                500: '#EF4444',
                600: '#DC2626',
              },
              surface: '#FFFFFF',
              'inverse-surface': '#0B1120',
              'on-surface': '#0F172A',
              'on-surface-variant': '#64748B',
            },
          },
        },
      },
    });

    nuxt.hook('tailwindcss:config', (tailwindConfig) => {
      tailwindConfig.darkMode = 'class';
      tailwindConfig.theme = tailwindConfig.theme || {};
      tailwindConfig.theme.extend = tailwindConfig.theme.extend || {};
      tailwindConfig.theme.extend.colors = {
        ...tailwindConfig.theme.extend.colors,
        primary: {
          DEFAULT: '#0052CC',
          hover: '#0040A2',
          50: '#EBF3FF',
          100: '#D6E6FF',
          200: '#ADC8FF',
          300: '#85AAFF',
          400: '#5C8DFF',
          500: '#0052CC',
          600: '#0040A2',
          700: '#00307A',
        },
        error: {
          DEFAULT: '#EF4444',
          500: '#EF4444',
          600: '#DC2626',
        },
        surface: '#FFFFFF',
        'inverse-surface': '#0B1120',
        'on-surface': '#0F172A',
        'on-surface-variant': '#64748B',
      };
    });

    nuxt.hook('components:dirs', (dirs) => {
      dirs.push({
        path: resolver.resolve('./runtime/core/components'),
        prefix: 'App',
      });
    });

    // Register Core composables & services
    addImportsDir(resolver.resolve('./runtime/core/composables'));
    addImportsDir(resolver.resolve('./runtime/core/services'));

    // Register Admin composables & services
    addImportsDir(resolver.resolve('./runtime/admin/auth/composables'));
    addImportsDir(resolver.resolve('./runtime/admin/auth/services'));
    addImportsDir(resolver.resolve('./runtime/admin/categories/composables'));
    addImportsDir(resolver.resolve('./runtime/admin/categories/services'));
    addImportsDir(resolver.resolve('./runtime/admin/products/composables'));
    addImportsDir(resolver.resolve('./runtime/admin/products/services'));
    addImportsDir(resolver.resolve('./runtime/admin/orders/composables'));
    addImportsDir(resolver.resolve('./runtime/admin/orders/services'));
    addImportsDir(resolver.resolve('./runtime/admin/vouchers/composables'));
    addImportsDir(resolver.resolve('./runtime/admin/vouchers/services'));
    addImportsDir(resolver.resolve('./runtime/admin/reviews/composables'));
    addImportsDir(resolver.resolve('./runtime/admin/reviews/services'));

    // Register User composables & services
    addImportsDir(resolver.resolve('./runtime/user/composables'));
    addImportsDir(resolver.resolve('./runtime/user/products/composables'));
    addImportsDir(resolver.resolve('./runtime/user/products/services'));
    addImportsDir(resolver.resolve('./runtime/user/categories/composables'));
    addImportsDir(resolver.resolve('./runtime/user/categories/services'));
    addImportsDir(resolver.resolve('./runtime/user/cart/composables'));
    addImportsDir(resolver.resolve('./runtime/user/checkout/services'));
    addImportsDir(resolver.resolve('./runtime/user/orders/composables'));
    addImportsDir(resolver.resolve('./runtime/user/orders/services'));
    addImportsDir(resolver.resolve('./runtime/user/vouchers/composables'));
    addImportsDir(resolver.resolve('./runtime/user/vouchers/services'));
    addImportsDir(resolver.resolve('./runtime/user/reviews/composables'));
    addImportsDir(resolver.resolve('./runtime/user/reviews/services'));

    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addPlugin(resolver.resolve('./runtime/plugin'));

    // Register layouts
    addLayout(
      {
        src: resolver.resolve('./runtime/admin/layout/AdminLayout.vue'),
      },
      'admin',
    );
    addLayout(
      {
        src: resolver.resolve('./runtime/user/layout/UserLayout.vue'),
      },
      'user',
    );

    extendPages((pages) => {
      setupAdminRoutes(pages);
      setupUserRoutes(pages);
    });
  },
});
