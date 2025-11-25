import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // 1. TRANG KHÁCH (Login/Register)
    { 
      path: "/login", 
      name: "login", 
      component: () => import("@/components/LoginView.vue"), 
      meta: { guestOnly: true } 
    },
    { 
      path: "/register", 
      name: "register", 
      component: () => import("@/components/Register.vue"), 
      meta: { guestOnly: true } 
    },

    // 2. TRANG ADMIN (Nhân viên)
    {
      path: "/admin",
      // Nếu bạn muốn router.push({ name: 'admin' }) hoạt động, hãy đặt name ở đây
      // Hoặc redirect thẳng vào trang con đầu tiên
      name: "admin", 
      redirect: { name: "admin-books" }, 
      component: () => import("@/layouts/AdminLayout.vue"),
      meta: { requiresAuth: true },
      children: [
        { 
          path: "QLSach",     // => /admin/QLSach
          name: "admin-books", 
          component: () => import("@/components/AdminBooks.vue") 
        },
        { 
          path: "QLDocGia",   // => /admin/QLDocGia
          name: "admin-readers", 
          component: () => import("@/components/AdminReaders.vue") 
        },
        { 
          path: "QLNhanVien", // => /admin/QLNhanVien
          name: "admin-employees", 
          component: () => import("@/components/AdminNV.vue") 
        },
        { 
          path: "QLMuonTra", 
          name: "admin-loans",   
          component: () => import("@/components/AdminLoans.vue") 
        },
        { 
          path: "QLNXB", 
          name: "admin-publishers",   
          component: () => import("@/components/AdminPublishers.vue") 
        },
      ],
    },

    // 3. TRANG ĐỘC GIẢ (User)
    {
      path: "/", // Trang chủ
      component: () => import("@/layouts/userLayout.vue"),
      meta: { requiresAuth: true }, // Hoặc false nếu muốn ai cũng xem được
      children: [
        { 
          path: "", // Link mặc định của "/"
          name: "home", // 👈 Tên này để khớp với router.push({ name: 'home' })
          component: () => import("@/components/Home.vue") 
        },
        // Nếu muốn trang /user/QLSach thì thêm vào đây, nhưng thường trang chủ là list sách rồi
      ],
    },
    
    // 4. CÁC TRANG LỖI (Tùy chọn)
    { 
        path: "/:pathMatch(.*)*", 
        redirect: { name: "home" } 
    }
  ],
});

// --- Middleware kiểm tra đăng nhập ---
router.beforeEach(async (to) => {
  const auth = useAuthStore();
  
  // Tải thông tin user nếu có token nhưng chưa có data user
  if (!auth.user && auth.token) await auth.fetchMe().catch(() => {});

  // Nếu trang yêu cầu đăng nhập mà chưa đăng nhập
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: "login", query: { redirect: to.fullPath } };
  }

  // Nếu trang chỉ dành cho khách (Login/Register) mà đã đăng nhập rồi
  if (to.meta.guestOnly && auth.isAuthenticated) {
    // Check role để chuyển hướng đúng
    if (auth.user?.role === 'admin' || auth.user?.role === 'staff') {
        return { name: "admin" };
    }
    return { name: "home" };
  }

  return true;
});

export default router;