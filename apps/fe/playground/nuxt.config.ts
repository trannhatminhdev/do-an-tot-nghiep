export default defineNuxtConfig({
  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap',
        },
      ],
    },
  },
  modules: ['../src/module'],
  devtools: { enabled: true },
  compatibilityDate: 'latest',
  aiCommerceFe: {},
  devServer: {
    port: parseInt(process.env.FE_PORT || '3001', 10),
  },
});
