<template>
  <div class="min-h-screen gradient-bg flex items-center justify-center">
    <div class="max-w-lg w-full bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all hover:scale-[1.01] duration-300">
      <div class="p-8">
        <div class="flex justify-center mb-8">
          <div class="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center shadow-md">
            <i data-feather="paw" class="text-purple-600 w-10 h-10"></i>
          </div>
        </div>

        <h1 class="text-4xl font-bold text-center text-gray-800 mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Welcome Back!
        </h1>
        <p class="text-gray-500 text-center mb-8 tracking-wide">Login to access your PixelPaws dashboard</p>

        <form class="space-y-6" @submit.prevent="submit">
          <!-- MÃ NHÂN VIÊN (code) -->
          <div>
            <label for="code" class="block text-sm font-medium text-gray-700 mb-1">Mã nhân viên</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i data-feather="mail" class="text-gray-400"></i>
              </div>
              <input
                id="code"
                v-model.trim="form.code"
                class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="username"
                autocomplete="username"
                required
              />
            </div>
          </div>

          <!-- PASSWORD -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i data-feather="lock" class="text-gray-400"></i>
              </div>
              <input
                type="password"
                id="password"
                v-model.trim="form.password"
                class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="••••••••"
                autocomplete="current-password"
                required
              />
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox"
                     class="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded">
              <label for="remember-me" class="ml-2 block text-sm text-gray-700">Remember me</label>
            </div>
            <div class="text-sm">
              <a href="#" class="font-medium text-purple-600 hover:text-purple-500">Forgot password?</a>
            </div>
          </div>

          <button
            type="submit"
            :disabled="auth.loading"
            class="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 btn-glow transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-60">
            {{ auth.loading ? "Đang đăng nhập..." : "Sign In" }}
          </button>

          <p v-if="auth.error" class="text-red-600 text-sm">{{ auth.error }}</p>
        </form>

        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>
          <div class="mt-6 grid grid-cols-3 gap-3 transform transition-all duration-300">
            <button type="button"
              class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
              <i data-feather="facebook" class="text-blue-600"></i>
            </button>
            <button type="button"
              class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
              <i data-feather="twitter" class="text-blue-400"></i>
            </button>
            <button type="button"
              class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
              <i data-feather="github" class="text-gray-800"></i>
            </button>
          </div>
        </div>

        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Don't have an account?
            <a href="#" class="font-medium text-purple-600 hover:text-purple-500">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const form = reactive({ code: "", password: "" });

async function submit() {
  await auth.login(form); // sẽ gửi { code, password }
  if (auth.isAuthenticated) {
    router.push(route.query.redirect || { name: "dashboard" });
  }
}

// kích hoạt feather icons khi mount
onMounted(() => {
  if (window.feather) window.feather.replace();
});
</script>

<style scoped>
.gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.btn-glow:hover { box-shadow: 0 0 15px rgba(118, 75, 162, 0.6); }
</style>
