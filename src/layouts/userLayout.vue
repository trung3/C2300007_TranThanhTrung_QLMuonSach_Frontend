<script setup>
import { onMounted, onUpdated } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";
// 1. Import Store Giỏ hàng
import { useCartStore } from "@/stores/cart.store";

const auth = useAuthStore();
const cartStore = useCartStore(); // 2. Khởi tạo
const router = useRouter();

function logout() {
  auth.logout();
  router.push({ name: "login" });
}

// Cập nhật icon mỗi khi giao diện thay đổi (để hiện icon giỏ hàng)
const updateIcons = () => {
  if (window.feather) window.feather.replace();
};

onMounted(() => {
  updateIcons();
});

onUpdated(() => {
  updateIcons();
});
</script>

<template>
  <div class="app-container min-h-screen flex flex-col">
    
    <header class="bg-blue-600 text-white p-4 shadow-md sticky top-0 z-50">
       <nav class="container mx-auto flex justify-between items-center">
          
          <router-link to="/" class="font-bold text-xl flex items-center gap-2 hover:text-blue-100 transition">
            <i data-feather="book"></i>
            <span>Thư Viện Số</span>
          </router-link>
          
          <div class="flex items-center gap-6">
            <router-link to="/" class="hover:text-blue-200 font-medium hidden md:block">Trang chủ</router-link>

            <router-link to="/cart" class="relative group">
                <div class="p-2 hover:bg-blue-500 rounded-full transition">
                    <i data-feather="shopping-cart" class="w-6 h-6"></i>
                </div>

                <span 
                    v-if="cartStore.totalItems > 0" 
                    class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-blue-600"
                >
                    {{ cartStore.totalItems }}
                </span>
            </router-link>
            <div v-if="!auth.user">
                <router-link 
                    to="/login" 
                    class="hover:text-blue-200 font-medium"
                >
                    Đăng nhập
                </router-link>
            </div>

            <div v-else class="flex items-center gap-3 pl-4 border-l border-blue-400">
                <span class="text-blue-100 hidden md:inline">
                    Xin chào, 
                    <span class="font-bold text-white">
                        {{ auth.user?.name || auth.user?.username || "Bạn" }}
                    </span>
                </span>
                
                <button 
                    @click="logout" 
                    class="bg-white text-blue-600 px-3 py-1 rounded-md text-sm font-bold hover:bg-gray-100 transition shadow-sm"
                >
                    Đăng xuất
                </button>
            </div>
          </div>

       </nav>
    </header>

    <main class="flex-grow container mx-auto p-4 py-8">
       <router-view /> 
    </main>

    <footer class="bg-gray-800 text-white text-center p-4 mt-auto">
       <p>© 2024 Dự án Quản Lý Mượn Sách</p>
    </footer>

  </div>
</template>