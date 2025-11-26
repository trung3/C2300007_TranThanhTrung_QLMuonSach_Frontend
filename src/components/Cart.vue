<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
// import UserLayout from '@/layouts/userLayout.vue';
import { useCartStore } from '@/stores/cart.store';
import { useAuthStore } from '@/stores/auth.store';
import { createLoan } from '@/api/loans.api';

const cartStore = useCartStore();
const authStore = useAuthStore();
const router = useRouter();

// Ngày mượn mặc định là hôm nay, ngày trả là 7 ngày sau
const today = new Date().toISOString().split('T')[0];
const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

const borrowDate = ref(today);
const returnDate = ref(nextWeek);
const note = ref("");
const loading = ref(false);

// Xử lý gửi yêu cầu mượn
// --- Thay thế hàm handleSubmit cũ bằng hàm này ---

const handleSubmit = async () => {
    // 1. Check đăng nhập
    if (!authStore.user) {
        alert("Bạn cần đăng nhập!");
        router.push('/login');
        return;
    }
    
    // 2. DEBUG: In thông tin User ra xem có _id không?
    console.log("👉 User đang đăng nhập:", authStore.user);

    if (cartStore.cart.length === 0) {
        alert("Giỏ hàng trống!");
        return;
    }

    if (!confirm(`Xác nhận mượn ${cartStore.totalItems} cuốn sách?`)) return;

    loading.value = true;
    let successCount = 0;
    let failCount = 0;

    for (const book of cartStore.cart) {
        try {
            // Lấy ID người dùng. Thử nhiều trường hợp để tránh bị undefined
            // Backend MongoDB thường dùng _id
            const userId = authStore.user.sub || authStore.user._id;

            if (!userId) {
                alert("Lỗi: Không tìm thấy ID người dùng. Vui lòng đăng xuất và đăng nhập lại.");
                loading.value = false;
                return; // Dừng lại ngay
            }

            const payload = {
                readerId: userId,  // <-- Quan trọng nhất
                bookId: book._id,  // ID sách
                borrowDate: borrowDate.value,
                returnDate: returnDate.value,
                note: note.value
            };

            // DEBUG: In gói tin gửi đi để kiểm tra
            console.log("📦 Đang gửi payload:", payload);

            await createLoan(payload);
            successCount++;
        } catch (error) {
            const msg = error.response?.data?.message || "Lỗi không xác định";
    console.error(`❌ Lỗi mượn sách ${book.title}:`, msg);
    
    // Bạn có thể alert luôn lỗi cho user thấy nếu muốn:
    alert(`Cuốn "${book.title}": ${msg}`);
            failCount++;
        }
    }

    loading.value = false;

    if (successCount > 0) {
        alert(`Thành công! Đã mượn ${successCount} cuốn.`);
        cartStore.clearCart();
        router.push('/');
    } else {
        alert("Mượn thất bại. Vui lòng xem lỗi trong Console (F12).");
    }
};
onMounted(() => {
    if (window.feather) window.feather.replace();
});
</script>

<template>
  <UserLayout>
    <div class="container mx-auto px-4 max-w-5xl">
        <h1 class="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-2">
            <i data-feather="shopping-cart" class="text-blue-600"></i>
            Giỏ Sách Của Bạn
        </h1>

        <div v-if="cartStore.cart.length === 0" class="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-100">
            <img src="https://cdni.iconscout.com/illustration/premium/thumb/empty-cart-2130356-1800917.png" alt="Empty" class="w-48 mx-auto opacity-70 mb-4">
            <p class="text-gray-500 text-lg mb-6">Chưa có cuốn sách nào trong giỏ.</p>
            <router-link to="/" class="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition">
                Quay lại chọn sách
            </router-link>
        </div>

        <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div class="lg:col-span-2 space-y-4">
                <div 
                    v-for="(book, index) in cartStore.cart" 
                    :key="book._id"
                    class="flex gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition"
                >
                    <img 
                        :src="book.image || 'https://placehold.co/100x150?text=No+Img'" 
                        class="w-20 h-28 object-cover rounded border"
                        @error="$event.target.src='https://placehold.co/100x150?text=Error'"
                    >
                    
                    <div class="flex-grow">
                        <h3 class="font-bold text-lg text-gray-800">{{ book.title }}</h3>
                        <p class="text-gray-500 text-sm mb-1">Tác giả: {{ book.author }}</p>
                        <p class="text-blue-600 font-semibold text-sm">
                            {{ Number(book.price).toLocaleString() }} đ
                        </p>
                    </div>

                    <button 
                        @click="cartStore.removeFromCart(book._id)" 
                        class="text-gray-400 hover:text-red-500 transition p-2"
                        title="Xóa khỏi giỏ"
                    >
                        <i data-feather="trash-2" class="w-5 h-5"></i>
                    </button>
                </div>
            </div>

            <div class="lg:col-span-1">
                <div class="bg-white p-6 rounded-lg shadow-lg border border-blue-100 sticky top-24">
                    <h3 class="font-bold text-xl mb-4 text-gray-800">Thông tin mượn</h3>
                    
                    <div class="space-y-4 mb-6">
                        <div>
                            <label class="block text-sm text-gray-600 mb-1">Ngày mượn</label>
                            <input v-model="borrowDate" type="date" class="w-full border rounded px-3 py-2 bg-gray-50 text-gray-500" readonly>
                        </div>
                        <div>
                            <label class="block text-sm text-gray-600 mb-1">Ngày trả dự kiến</label>
                            <input v-model="returnDate" type="date" class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                        </div>
                        <div>
                            <label class="block text-sm text-gray-600 mb-1">Ghi chú</label>
                            <textarea v-model="note" rows="2" placeholder="VD: Sách cần bọc bìa..." class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
                        </div>
                    </div>

                    <div class="border-t pt-4 mb-6 space-y-2">
                        <div class="flex justify-between text-gray-600">
                            <span>Số lượng sách:</span>
                            <span class="font-bold">{{ cartStore.totalItems }} cuốn</span>
                        </div>
                    </div>

                    <button 
                        @click="handleSubmit" 
                        :disabled="loading"
                        class="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg disabled:bg-gray-400 flex justify-center items-center gap-2"
                    >
                        <span v-if="loading" class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                        {{ loading ? 'Đang xử lý...' : 'Xác Nhận Mượn Sách' }}
                    </button>
                </div>
            </div>

        </div>
    </div>
  </UserLayout>
</template>