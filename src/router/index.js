import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";
import Swal from 'sweetalert2'; 
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
          component: () => import("@/components/AdminBooks.vue"), 
          meta: { requiresStaff: true }
        },

        { 
          path: "QLDocGia",   // => /admin/QLDocGia
          name: "admin-readers", 
          component: () => import("@/components/AdminReaders.vue"),
          meta: { requiresStaff: true } 
        },
        { 
          path: "QLNhanVien", // => /admin/QLNhanVien
          name: "admin-employees", 
          component: () => import("@/components/AdminNV.vue") ,
          meta: { requiresStaff: true }
        },
        { 
          path: "QLMuonTra", 
          name: "admin-loans",   
          component: () => import("@/components/AdminLoans.vue") ,
          meta: { requiresStaff: true }
        },
        { 
          path: "QLNXB", 
          name: "admin-publishers",   
          component: () => import("@/components/AdminPublishers.vue") ,
          meta: { requiresStaff: true }
        },
      ],
    },

    // 3. TRANG ĐỘC GIẢ (User)
    {
      path: "/", // Trang chủ
      component: () => import("@/layouts/userLayout.vue"),
       // Hoặc false nếu muốn ai cũng xem được
      children: [
        { 
          path: "", // Link mặc định của "/"
          name: "home", // 👈 Tên này để khớp với router.push({ name: 'home' })
          component: () => import("@/components/Home.vue") 
        },
        { 
          path: "/cart", // Link mặc định của "/"
          name: "cart", // 👈 Tên này để khớp với router.push({ name: 'home' })
          component: () => import("@/components/Cart.vue"), 
          meta: { requiresAuth: true }
        },
        { 
          path: "/profile", // Link mặc định của "/"
          name: "profile", // 👈 Tên này để khớp với router.push({ name: 'home' })
          component: () => import("@/components/profile.vue") , 
          meta: { requiresAuth: true }
        },{ 
          path: "/history", // Link mặc định của "/"
          name: "history", // 👈 Tên này để khớp với router.push({ name: 'home' })
          component: () => import("@/components/history.vue") ,
          meta: { requiresAuth: true }
        },
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
router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore();

  // 1. QUAN TRỌNG: Nếu F5 (reload) mà mất thông tin User, phải tải lại ngay
  if (!auth.user && localStorage.getItem('token')) {
      try {
        await auth.fetchMe();
      } catch (e) {
        auth.logout(); // Token lỗi thì đăng xuất luôn
        return next({ name: 'login' });
      }
  }

  // 2. LOGIC CHẶN ĐỘC GIẢ (Cái bạn đang cần)
  if (to.meta.requiresStaff) {
      const role = auth.user?.role;
      
      // Nếu quyền KHÔNG PHẢI là 'admin' VÀ KHÔNG PHẢI 'staff'
      if (role !== 'admin' && role !== 'staff') {
         Swal.fire({
            icon: 'error',
            title: 'Bạn không có quyền truy cập trang quản trị!',
            // text: 'Bạn không có quyền truy cập trang quản trị!',
        });  
          return next({ name: "home" }); // Đá về trang chủ
      }
  }

  // 3. Logic chặn người chưa đăng nhập (Giữ nguyên)
  if (to.meta.requiresAuth && !auth.user) {
      return next({ name: "login", query: { redirect: to.fullPath } });
  }

  // 4. Logic chặn người đã đăng nhập quay lại trang Login (Giữ nguyên)
  if (to.meta.guestOnly && auth.user) {
      return next({ name: "home" });
  }

  // Cho phép đi tiếp
  next();
});

export default router;