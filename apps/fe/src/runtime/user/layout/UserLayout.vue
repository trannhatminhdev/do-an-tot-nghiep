<script setup lang="ts">
import { onMounted } from 'vue';
import { useHead } from '#app';
import { useUserCategories } from '#fe/user/categories/composables/useUserCategories';
import TopNavBar from '#fe/user/layout/components/TopNavBar.vue';
import BottomNavBar from '#fe/user/layout/components/BottomNavBar.vue';
import AppFooter from '#fe/user/layout/components/AppFooter.vue';

useHead({
  link: [
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap',
    },
  ],
});

const { fetchCategories, categories } = useUserCategories();

onMounted(async () => {
  if (categories.value.length === 0) {
    await fetchCategories();
  }
});
</script>

<template>
  <div
    class="min-h-screen bg-[#F8FAFC] text-on-surface flex flex-col font-sans selection:bg-primary/20 selection:text-primary"
  >
    <TopNavBar />
    <main class="flex-grow pt-20">
      <slot />
    </main>
    <AppFooter />
    <BottomNavBar />
    <AppToast />
  </div>
</template>
