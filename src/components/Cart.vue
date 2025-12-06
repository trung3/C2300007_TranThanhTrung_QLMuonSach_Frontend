<script setup>
import { ref, onMounted, nextTick, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cart.store';
import { useAuthStore } from '@/stores/auth.store';
import http from "@/api/http"; 
import Swal from 'sweetalert2'; // 👈 1. Import thư viện Popup

const cartStore = useCartStore();
const authStore = useAuthStore();
const router = useRouter();

// --- LOGIC TÍNH NGÀY (CHỈ CHO MƯỢN 7 NGÀY) ---
const addDays = (dateString, days) => {
    const result = new Date(dateString);
    result.setDate(result.getDate() + days);
    return result.toISOString().split('T')[0];
};

const today = new Date().toISOString().split('T')[0];
const defaultReturn = addDays(today, 7); 

const borrowDate = ref(today);
const returnDate = ref(defaultReturn);
const note = ref("");
const loading = ref(false);

const maxReturnDate = computed(() => {
    return addDays(borrowDate.value, 7);
});

const updateIcons = () => {
    nextTick(() => {
        if (window.feather) window.feather.replace();
    });
};

const handleSubmit = async () => {
    // 1. Check đăng nhập (Thay alert bằng Popup Warning)
    if (!authStore.user) {
        Swal.fire({
            icon: 'warning',
            title: 'Chưa đăng nhập',
            text: 'Bạn cần đăng nhập để thực hiện mượn sách!',
            confirmButtonText: 'Đăng nhập ngay',
            showCancelButton: true,
            cancelButtonText: 'Để sau'
        }).then((result) => {
            if (result.isConfirmed) {
                router.push('/login');
            }
        });
        return;
    }
    
    // 2. Check giỏ hàng (Thay alert bằng Popup Info)
    if (!cartStore.items || cartStore.items.length === 0) {
        Swal.fire({
            icon: 'info',
            title: 'Giỏ hàng trống',
            text: 'Hãy chọn vài cuốn sách trước nhé!',
        });
        return;
    }

    // 3. VALIDATE NGÀY TRẢ (Thay alert bằng Popup Error)
    if (returnDate.value > maxReturnDate.value) {
        Swal.fire({
            icon: 'error',
            title: 'Ngày trả không hợp lệ',
            text: 'Quy định: Bạn chỉ được mượn tối đa 7 ngày!',
        });
        returnDate.value = maxReturnDate.value; 
        return;
    }
    
    if (returnDate.value < borrowDate.value) {
        Swal.fire({
            icon: 'error',
            title: 'Ngày trả không hợp lệ',
            text: 'Ngày trả không được nhỏ hơn ngày mượn!',
        });
        return;
    }

    // 4. XÁC NHẬN MƯỢN (Thay confirm bằng Popup Question)
    const confirmResult = await Swal.fire({
        title: 'Xác nhận mượn sách?',
        text: `Bạn muốn mượn ${cartStore.totalItems} cuốn sách này?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Đồng ý mượn',
        cancelButtonText: 'Hủy bỏ'
    });

    if (!confirmResult.isConfirmed) return; // Nếu bấm Hủy thì dừng lại

    loading.value = true;
    let successCount = 0;
    let failCount = 0;

    // 5. Gửi API
    for (const book of cartStore.items) {
        try {
            const userId = authStore.user._id || authStore.user.sub;
            if (!userId) {
                Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Không tìm thấy ID người dùng. Hãy đăng nhập lại.' });
                loading.value = false;
                return;
            }

            const payload = {
                readerId: userId,  
                bookId: book._id, 
                borrowDate: borrowDate.value,
                returnDate: returnDate.value,
                note: note.value
            };

            await http.post('/loans', payload); 
            successCount++;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Lỗi không xác định";
            console.error(`❌ Lỗi mượn sách ${book.title}:`, errorMessage);
            
            // Thông báo lỗi từng cuốn (dùng Toast nhỏ góc trên)
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: `Lỗi cuốn "${book.title}": ${errorMessage}`,
                showConfirmButton: false,
                timer: 4000
            });
            
            failCount++;
        }
    }

    loading.value = false;

    // 6. Kết quả cuối cùng
    if (successCount > 0) {
        let msg = `Đã gửi yêu cầu mượn ${successCount} cuốn thành công.`;
        if (failCount > 0) msg += `<br><span style="color:red">(Có ${failCount} cuốn bị lỗi) do bạn đã chỉ được mượn 5 quyển</span>`;
        
        Swal.fire({
            icon: 'success',
            title: 'Hoàn tất!',
            html: msg, // Dùng html để format chữ
            confirmButtonText: 'OK'
        }).then(() => {
            cartStore.clearCart(); 
            router.push('/'); 
        });     
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Mượn thất bại',
            text: 'Bạn đang mượn cuốn "CONAN" (chưa trả).',
        });
    }
}; 

onMounted(() => {
    updateIcons();
});
</script>

<template>
    <div class="container mx-auto px-4 max-w-6xl py-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-2">
            <i data-feather="shopping-cart" class="text-blue-600"></i>
            Giỏ Sách Của Bạn
        </h1>

        <div v-if="!cartStore.items || cartStore.items.length === 0" class="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-100">
            <div class="text-6xl mb-4">🛒</div> 
            <p class="text-gray-500 text-lg mb-6">Chưa có cuốn sách nào trong giỏ.</p>
            <router-link to="/" class="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition font-medium">
                Quay lại chọn sách
            </router-link>
        </div>

        <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2 space-y-4">
                <div v-for="book in cartStore.items" :key="book._id" class="flex gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition relative group">
                    <img :src="book.image || 'https://placehold.co/100x150'" class="w-24 h-32 object-cover rounded border" @error="$event.target.src='https://placehold.co/100x150'">
                    <div class="flex-grow flex flex-col justify-between">
                        <div>
                            <h3 class="font-bold text-lg text-gray-800 line-clamp-2">{{ book.title }}</h3>
                            <p class="text-gray-500 text-sm mb-1">Tác giả: {{ book.author }}</p>
                            <p class="text-blue-600 font-bold text-lg mt-1">{{ Number(book.price).toLocaleString() }} đ</p>
                        </div>
                        <div class="flex justify-end mt-2">
                            <button @click="cartStore.removeItem(book._id)" class="flex items-center gap-1 text-red-500 hover:text-red-700 transition text-sm font-medium px-2 py-1 rounded hover:bg-red-50">
                                <i data-feather="trash-2" class="w-4 h-4"></i> Xóa
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="lg:col-span-1">
                <div class="bg-white p-6 rounded-lg shadow-lg border border-blue-100 sticky top-24">
                    <h3 class="font-bold text-xl mb-4 text-gray-800 border-b pb-2">Thông tin phiếu mượn</h3>
                    <div class="space-y-4 mb-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Người mượn</label>
                            <div class="w-full border rounded px-3 py-2 bg-gray-50 text-gray-700 font-medium">
                                {{ authStore.user?.fullName || 'Chưa đăng nhập' }}
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-sm text-gray-600 mb-1">Ngày mượn</label>
                                <input v-model="borrowDate" type="date" class="w-full border rounded px-3 py-2 bg-gray-50 text-gray-500" readonly>
                            </div>
                            <div>
                                <label class="block text-sm text-gray-600 mb-1">
                                    Ngày trả <span class="text-red-500 text-xs">(Max 7 ngày)</span>
                                </label>
                                <input 
                                    v-model="returnDate" 
                                    type="date" 
                                    :min="borrowDate"
                                    :max="maxReturnDate"
                                    class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm text-gray-600 mb-1">Ghi chú</label>
                            <textarea v-model="note" rows="3" class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
                        </div>
                    </div>

                    <div class="border-t pt-4 mb-6 space-y-2">
                        <div class="flex justify-between text-gray-600">
                            <span>Số lượng sách:</span>
                            <span class="font-bold">{{ cartStore.totalItems }} cuốn</span>
                        </div>
                       
                    </div>

                    <button @click="handleSubmit" :disabled="loading" class="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg disabled:bg-gray-400 flex justify-center items-center gap-2">
                        <span v-if="loading" class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                        <span v-else>Xác Nhận Mượn Sách</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>