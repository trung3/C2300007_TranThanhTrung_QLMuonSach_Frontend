import { defineStore } from "pinia";
import { login as apiLogin, getMe } from "@/api/auth.api";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: localStorage.getItem("token") || null,
    loading: false,
    error: null,
  }),
  getters: { isAuthenticated: (s) => !!s.token },
  actions: {
    async login({ code, password }) {
  this.loading = true;
  this.error = null;
  try {
    const payload = { code, username: code, employeeCode: code, password };
    const { data } = await apiLogin(payload);

    const tk = data?.token || data?.accessToken || data?.jwt;
    if (tk) {
      this.token = tk;
      localStorage.setItem("token", tk);
    }

    // ✅ SỬA: Lấy luôn user từ response của hàm Login
    // Không gọi getMe() ở đây nữa để tránh bị ghi đè dữ liệu thiếu
    this.user = data?.user || null; 

  } catch (e) {
    this.error = e?.response?.data?.message || e?.message || "Đăng nhập thất bại";
    this.token = null;
    localStorage.removeItem("token");
  } finally {
    this.loading = false;
  }
},

    async fetchMe() {
      if (!this.token) return;
      try {
        const me = await getMe();
        this.user = me?.data?.user || null; // <-- luôn là object user
      } catch {
        this.logout();
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem("token");
    },
  },
});
