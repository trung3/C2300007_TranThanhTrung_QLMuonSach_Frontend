import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/login", name: "login", component: () => import("@/components/LoginView.vue"), meta:{ guestOnly:true } },
    { path: "/", name: "dashboard", component: () => import("@/components/AdminBooks.vue"), meta:{ requiresAuth:true } },

    // Admin layout + nested pages
    {
  path: "/admin",
  component: () => import("@/layouts/AdminLayout.vue"),
  meta: { requiresAuth: true },
  children: [
    { path: "QLSach",    name: "admin-books",  component: () => import("@/components/AdminBooks.vue") },
    { path: "QLDocGia",  name: "admin-readers", component: () => import("@/components/AdminReaders.vue") },
    { path: "QLMuonTra", name: "admin-loans",   component: () => import("@/components/AdminLoans.vue") },
    { path: "QLNXB", name: "admin-publishers",   component: () => import("@/components/AdminPublishers.vue") },
    { path: "", redirect: { name: "admin-books" } },
  ],
}

    
    
    
    
    
    
    
    
    
    
    
  ],
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  if (!auth.user && auth.token) await auth.fetchMe().catch(()=>{});
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: "login", query: { redirect: to.fullPath } };
  }
  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: "dashboard" };
  }
  return true;
});

export default router;
