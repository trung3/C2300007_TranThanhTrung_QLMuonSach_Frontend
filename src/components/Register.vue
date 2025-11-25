<template>
  <div class="min-h-screen gradient-bg flex items-center justify-center py-10 px-4">
    <div class="max-w-xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-[1.01]">
      <div class="p-8">
        <div class="flex justify-center mb-6">
          <div class="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center shadow-md">
            <i data-feather="book-open" class="text-cyan-600 w-8 h-8"></i>
          </div>
        </div>

        <h1 class="text-3xl font-bold text-center text-gray-800 mb-2 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
          Đăng Ký Độc Giả
        </h1>
        <p class="text-gray-500 text-center mb-8 tracking-wide">Tạo thẻ thư viện để mượn sách ngay</p>

        <form class="space-y-4" @submit.prevent="submit">
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Mã độc giả</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i data-feather="credit-card" class="text-gray-400 w-4 h-4"></i>
                </div>
                <input v-model.trim="form.maDocGia"
                       class="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                       placeholder="VD: DG202401" required />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i data-feather="user" class="text-gray-400 w-4 h-4"></i>
                </div>
                <input v-model.trim="form.hoTen"
                       class="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                       placeholder="Nguyễn Văn A" required />
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i data-feather="phone" class="text-gray-400 w-4 h-4"></i>
                </div>
                <input v-model.trim="form.dienThoai"
                       class="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                       placeholder="09xx..." required />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i data-feather="map-pin" class="text-gray-400 w-4 h-4"></i>
                </div>
                <input v-model.trim="form.diaChi"
                       class="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                       placeholder="Cần Thơ..." required />
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i data-feather="lock" class="text-gray-400 w-4 h-4"></i>
              </div>
              <input type="password" v-model="form.password"
                     class="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                     placeholder="••••••••" required />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nhập lại mật khẩu</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i data-feather="check-circle" class="text-gray-400 w-4 h-4"></i>
              </div>
              <input type="password" v-model="form.confirmPassword"
                     class="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                     placeholder="••••••••" required />
            </div>
            <p v-if="passwordMismatch" class="text-red-500 text-xs mt-1 font-medium">
              * Mật khẩu không khớp
            </p>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full mt-6 flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 btn-glow transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed">
            {{ loading ? "Đang xử lý..." : "Đăng Ký Thành Viên" }}
          </button>

          <div v-if="error" class="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center">
            <i data-feather="alert-circle" class="w-4 h-4 mr-2"></i> {{ error }}
          </div>
          <div v-if="success" class="mt-4 p-3 bg-green-50 text-green-600 text-sm rounded-lg border border-green-100 flex items-center">
             <i data-feather="check" class="w-4 h-4 mr-2"></i> {{ success }}
          </div>
        </form>

        <div class="mt-6 text-center border-t border-gray-100 pt-4">
          <p class="text-sm text-gray-600">
            Bạn đã có thẻ thư viện?
            <router-link :to="{ name: 'login' }" class="font-bold text-cyan-600 hover:text-cyan-500 transition-colors">
              Đăng nhập ngay
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, onUpdated } from "vue";
import { useRouter } from "vue-router";

// 👇 1. IMPORT HÀM TỪ FILE API BẠN VỪA GỬI
import { createReader } from "@/api/readers.api"; 

const router = useRouter();
const loading = ref(false);
const error = ref("");
const success = ref("");

// Khai báo form khớp với các ô input bên trên
const form = reactive({
  maDocGia: "",
  hoTen: "",
  dienThoai: "",
  diaChi: "",
  password: "",
  confirmPassword: ""
});

const passwordMismatch = computed(() => {
  return form.password && form.confirmPassword && form.password !== form.confirmPassword;
});

// Trong script setup của Register.vue

async function submit() {
  if (passwordMismatch.value) {
    error.value = "Mật khẩu xác nhận không trùng khớp!";
    return;
  }

  loading.value = true;
  error.value = "";
  success.value = "";

  try {
    // 👇 SỬA ĐOẠN NÀY ĐỂ KHỚP VỚI BACKEND
    await createReader({
        code: form.maDocGia,      // Backend cần "code", Form mình là "maDocGia"
        fullName: form.hoTen,     // Backend cần "fullName"
        phone: form.dienThoai,    // Backend cần "phone"
        address: form.diaChi,     // Backend cần "address"
        password: form.password,  // Backend cần "password" (để hash)
        gender: 1                 // Mặc định, hoặc bạn thêm input chọn giới tính vào form
    });
    
    success.value = "Đăng ký thành công! Đang chuyển hướng...";
    
    setTimeout(() => {
        router.push({ name: "login" });
    }, 2000);

  } catch (e) {
    console.log(e); // Log ra để xem lỗi gì nếu có
    // Kiểm tra lỗi trùng mã độc giả (code 409 từ Backend trả về)
    error.value = e?.response?.data?.message || "Đăng ký thất bại.";
  } finally {
    loading.value = false;
  }
}

const loadIcons = () => {
  if (window.feather) window.feather.replace();
};

onMounted(loadIcons);
onUpdated(loadIcons);
</script>

<style scoped>
/* Gradient Xanh Ngọc - Xanh Dương (Knowledge style) */
.gradient-bg { background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); }
.btn-glow:hover { box-shadow: 0 0 15px rgba(6, 182, 212, 0.5); }
</style>