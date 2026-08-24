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
    class="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-[#0052cc]/20 selection:text-[#0052cc]"
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

<style>
.material-symbols-outlined {
  font-family: 'Material Symbols Outlined', sans-serif;
  font-variation-settings:
    'FILL' 0,
    'wght' 400,
    'GRAD' 0,
    'opsz' 24;
  user-select: none;
}
.material-symbols-outlined.fill,
.material-symbols-outlined.filled {
  font-variation-settings:
    'FILL' 1,
    'wght' 400,
    'GRAD' 0,
    'opsz' 24;
}
</style>
