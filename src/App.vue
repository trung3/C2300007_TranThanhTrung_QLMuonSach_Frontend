<template>
  <router-view />
</template>

<script setup>
import { onMounted, watch } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';

const authStore = useAuthStore();
const cartStore = useCartStore();

// 1. Khi vừa vào web -> Load giỏ hàng (của khách hoặc user đã lưu token)
onMounted(() => {
    cartStore.initCart();
});

// 2. 👇 QUAN TRỌNG: Theo dõi sự thay đổi của User
// - Khi đăng nhập (user null -> có user): Load giỏ của user đó
// - Khi đăng xuất (có user -> null): Load giỏ của khách (guest)
watch(() => authStore.user, () => {
    cartStore.initCart(); 
});
</script>



<style>
body {
  margin: 0;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
}
</style>
