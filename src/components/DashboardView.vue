<template>
  <div>
    <h2>Trang Dashboard</h2>
    <p v-if="auth.user">Xin chào,
      <b>
        {{ auth.user?.name || auth.user?.username || auth.user?.code || "bạn" }}
      </b>
    </p>
    <button class="btn" @click="logout">Đăng xuất</button>
  </div>
</template>

<script setup>
import { useAuthStore } from "@/stores/auth.store";
import { useRouter } from "vue-router";
const auth = useAuthStore();
const router = useRouter();
function logout() { auth.logout(); router.push({ name: "login" }); }
</script>

<style scoped>
.btn { padding:8px 12px; border:1px solid #ddd; border-radius:8px; background:#fff; cursor:pointer; }
</style>
