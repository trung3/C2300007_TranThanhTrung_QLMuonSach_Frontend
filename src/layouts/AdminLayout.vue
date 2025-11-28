<template>
  <div class="min-h-screen bg-gray-50">
    <!-- NAVBAR DÙNG CHUNG -->
    <nav class="bg-primary text-white shadow-lg">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center space-x-2">
            <i data-feather="book" class="w-8 h-8"></i>
            <span class="text-xl font-bold">Thư Viện Số - Quản Trị</span>
          </div>

          <div class="flex space-x-6">
            
            <RouterLink to="/admin/QLSach" class="hover:text-blue-200 transition">Quản Lý Sách</RouterLink>
             <RouterLink to="/admin/QLNXB" class="hover:text-blue-200 transition">Quản Lý NXB</RouterLink>
            <RouterLink to="/admin/QLDocGia" class="hover:text-blue-200 transition">Quản Lý Người Dùng</RouterLink>
            <RouterLink to="/admin/QLNhanVien" class="hover:text-blue-200 transition">Quản Lý Nhân Viên</RouterLink>
            <RouterLink to="/admin/QLMuonTra" class="hover:text-blue-200 transition">Quản Lý Mượn/Trả</RouterLink>
            <p v-if="auth.user">Xin chào,
             <b>
            {{ auth.user?.fullName || auth.user?.username || auth.user?.code || "bạn" }}
            </b>
            </p>
            <button class="btn" @click="logout">Đăng xuất</button>
          </div>
        </div>
      </div>
    </nav>

    <!-- NỘI DUNG TRANG CON -->
    <div class="p-6">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { RouterLink, useRouter } from "vue-router";  // ✅ phải có useRouter
import { useAuthStore } from "@/stores/auth.store";  // ✅ đúng đường dẫn store

const auth = useAuthStore();
const router = useRouter();

function logout() {
  auth.logout();
  router.push({ name: "login" });
}

onMounted(() => {
  if (window.feather) window.feather.replace();
});
</script>


<style scoped>
.bg-primary { background-color: #4f46e5; }
</style>
