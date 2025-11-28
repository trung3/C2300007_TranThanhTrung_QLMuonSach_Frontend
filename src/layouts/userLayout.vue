<script setup>
import { ref, onMounted, onUpdated } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";
import { useCartStore } from "@/stores/cart.store";

const auth = useAuthStore();
const cartStore = useCartStore();
const router = useRouter();

// 👇 1. Thêm biến quản lý trạng thái menu
const isMenuOpen = ref(false);

// 👇 2. Hàm bật/tắt menu
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

// 👇 3. Hàm đóng menu (dùng khi click vào item bên trong)
const closeMenu = () => {
  isMenuOpen.value = false;
};

function logout() {
  auth.logout();
  closeMenu(); // Nhớ đóng menu khi logout
  router.push({ name: "login" });
}

// Giữ nguyên phần updateIcons
const updateIcons = () => {
  if (window.feather) window.feather.replace();
};

onMounted(() => updateIcons());
onUpdated(() => updateIcons());
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
                <span v-if="cartStore.totalItems > 0" class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-blue-600">
                    {{ cartStore.totalItems }}
                </span>
            </router-link>

            <div v-if="!auth.user">
                <router-link to="/login" class="hover:text-blue-200 font-medium">
                    Đăng nhập
                </router-link>
            </div>

            <div v-else class="relative ml-4 pl-4 border-l border-blue-400">
    
    <button 
        @click="toggleMenu" 
        class="flex items-center gap-2 text-blue-100 hover:text-white focus:outline-none transition"
    >
        <span class="font-bold">
            {{ auth.user?.fullName || auth.user?.code || "Bạn" }}
        </span>
        <i data-feather="chevron-down" class="w-4 h-4"></i>
    </button>

    <div 
        v-show="isMenuOpen" 
        class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200 animate-fade-in"
    >
        <router-link 
            to="/profile" 
            @click="closeMenu"
            class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition flex items-center gap-2"
        >
            <i data-feather="user" class="w-4 h-4"></i>
            Hồ sơ cá nhân
        </router-link>

        <button 
            @click="logout" 
            class="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-2"
        >
            <i data-feather="log-out" class="w-4 h-4"></i>
            Đăng xuất
        </button>
    </div>

    <div 
        v-if="isMenuOpen" 
        @click="closeMenu" 
        class="fixed inset-0 z-40 cursor-default"
    ></div>
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