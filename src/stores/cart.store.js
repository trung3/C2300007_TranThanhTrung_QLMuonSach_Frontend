import { defineStore } from "pinia";
import { useAuthStore } from "./auth.store"; 

export const useCartStore = defineStore("cart", {
  state: () => ({
    items: [], // 👇 Luôn đặt tên là 'items' cho thống nhất
  }),

  getters: {
    // Nếu items bị null thì trả về 0 để không lỗi
    totalItems: (state) => state.items ? state.items.reduce((total, item) => total + (item.qty || 1), 0) : 0,
    
    totalPrice: (state) => state.items ? state.items.reduce((total, item) => total + (item.price || 0) * (item.qty || 1), 0) : 0,
  },

  actions: {
    getStorageKey() {
      const auth = useAuthStore();
      if (auth.user && (auth.user._id || auth.user.sub)) {
        return `cart_${auth.user._id || auth.user.sub}`;
      }
      return "cart_guest";
    },

    initCart() {
      const key = this.getStorageKey();
      const savedCart = localStorage.getItem(key);
      
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart);
          // 👇 Kiểm tra kỹ: Phải là mảng mới lấy, không thì lấy mảng rỗng
          this.items = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          this.items = []; // Nếu JSON lỗi -> Reset rỗng
          localStorage.removeItem(key);
        }
      } else {
        this.items = [];
      }
    },

    saveToLocalStorage() {
      const key = this.getStorageKey();
      localStorage.setItem(key, JSON.stringify(this.items));
    },

    addToCart(product) {
      // Đảm bảo items là mảng trước khi push
      if (!Array.isArray(this.items)) this.items = [];

      const existingItem = this.items.find((item) => item._id === product._id);
      if (existingItem) {
        existingItem.qty = (existingItem.qty || 1) + 1;
      } else {
        this.items.push({ ...product, qty: 1 });
      }
      this.saveToLocalStorage();
      
    },

    removeItem(productId) {
      if (!this.items) return;
      this.items = this.items.filter((item) => item._id !== productId);
      this.saveToLocalStorage();
    },

    clearCart() {
      this.items = [];
      this.saveToLocalStorage();
    }
  },
});