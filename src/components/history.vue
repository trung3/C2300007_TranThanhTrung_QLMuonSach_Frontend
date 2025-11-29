<template>
    <div class="container mx-auto px-4 py-8">
        <div class="flex items-center justify-between mb-6">
            <h1 class="text-2xl font-bold text-gray-800 border-l-4 border-blue-500 pl-4">
                Lịch sử mượn sách
            </h1>
            <router-link to="/" class="text-sm text-blue-600 hover:underline flex items-center gap-1">
                <i class="fas fa-arrow-left"></i> Quay lại trang chủ
            </router-link>
        </div>

        <div v-if="loading" class="flex flex-col items-center justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p class="mt-4 text-gray-500">Đang tải dữ liệu...</p>
        </div>

        <div v-else-if="borrows.length === 0" class="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <div class="text-6xl mb-4">📚</div>
            <h3 class="text-xl font-bold text-gray-700">Bạn chưa mượn cuốn sách nào</h3>
            <p class="text-gray-500 mb-6 mt-2">Hãy ghé thăm thư viện và chọn cho mình một cuốn sách yêu thích nhé!</p>
            <router-link to="/" class="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-500/30">
                Khám phá ngay
            </router-link>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
                v-for="item in borrows" 
                :key="item._id" 
                class="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition duration-300 flex flex-col overflow-hidden group"
            >
                <div class="p-4 flex gap-4">
                    <div class="w-24 h-32 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50 relative">
                        <img 
                            :src="getBookImage(item.bookId)" 
                            alt="Bìa sách" 
                            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            @error="handleImageError"
                        >
                        <div v-if="!item.bookId" class="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs text-center p-1">
                            Sách đã xóa
                        </div>
                    </div>
                    
                    <div class="flex-1 flex flex-col">
                        <h3 class="font-bold text-gray-800 line-clamp-2 mb-1" :title="item.bookId?.title">
                            {{ item.bookId?.title || 'Thông tin sách không khả dụng' }}
                        </h3>
                        <p class="text-sm text-gray-500 mb-auto">
                            <i class="fas fa-pen-nib text-xs mr-1"></i>
                            {{ item.bookId?.author || '---' }}
                        </p>
                        
                        <div class="mt-2">
                            <span :class="getStatusClass(item.status)" class="px-2.5 py-1 text-xs rounded-full font-medium border inline-flex items-center gap-1">
                                <i :class="getStatusIcon(item.status)"></i>
                                {{ translateStatus(item.status) }}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="px-4 py-3 bg-gray-50 border-t border-gray-100 text-sm space-y-1">
                    <div class="flex justify-between">
                        <span class="text-gray-500">Ngày mượn:</span>
                        <span class="font-medium text-gray-700">{{ formatDate(item.borrowDate) }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-500">
                            {{ item.status === 'returned' ? 'Ngày trả:' : 'Hẹn trả:' }}
                        </span>
                        <span class="font-medium" :class="getDateClass(item)">
                            {{ formatDate(item.returnDate) }}
                        </span>
                    </div>
                </div>

                <div 
                    v-if="item.status === 'pending'" 
                    class="p-3 bg-white mt-auto border-t border-gray-100"
                >
                    <button 
                        @click="cancelBorrow(item._id)" 
                        class="w-full py-2 px-4 rounded-lg bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 hover:border-red-200 transition font-medium flex items-center justify-center gap-2 group/btn"
                    >
                        <i class="fas fa-trash-alt group-hover/btn:scale-110 transition-transform"></i> 
                        Hủy yêu cầu
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useAuthStore } from '@/stores/auth.store';

// Cấu hình URL API (Nên chuyển vào file .env trong thực tế: import.meta.env.VITE_API_URL)
const API_URL = 'http://localhost:3000/api'; 

const authStore = useAuthStore();
const borrows = ref([]);
const loading = ref(true);

// --- Helpers ---
const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/150x200?text=No+Image';
};

const getBookImage = (book) => {
    if (book && book.image) return book.image;
    return 'https://via.placeholder.com/150x200?text=No+Image';
};

const getStatusClass = (status) => {
    const classes = {
        'returned': 'bg-green-100 text-green-700 border-green-200',
        'borrowing': 'bg-blue-100 text-blue-700 border-blue-200',
        'overdue': 'bg-red-100 text-red-700 border-red-200',
        'cancel': 'bg-gray-100 text-gray-500 border-gray-200',
        'pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    };
    return classes[status] || 'bg-gray-100 text-gray-600';
};

const getStatusIcon = (status) => {
    const icons = {
        'returned': 'fas fa-check-circle',
        'borrowing': 'fas fa-book-reader',
        'overdue': 'fas fa-exclamation-circle',
        'cancel': 'fas fa-ban',
        'pending': 'fas fa-clock',
    };
    return icons[status] || 'fas fa-info-circle';
};

const translateStatus = (status) => {
    const map = {
        'pending': 'Chờ duyệt',
        'borrowing': 'Đang mượn',
        'returned': 'Đã trả',
        'overdue': 'Quá hạn',
        'cancel': 'Đã hủy'
    };
    return map[status] || status;
};

const getDateClass = (item) => {
    if (item.status === 'returned') return 'text-green-600';
    if (item.status === 'overdue') return 'text-red-600 font-bold';
    // Kiểm tra nếu sắp đến hạn (ví dụ còn < 1 ngày) có thể thêm màu cam
    return 'text-blue-600';
};

const formatDate = (dateString) => {
    if (!dateString) return '--/--/----';
    return new Date(dateString).toLocaleDateString('vi-VN');
};

// --- API Calls ---

const fetchHistory = async () => {
    // Đảm bảo user đã load
    if (!authStore.user?._id) {
        await authStore.fetchMe();
    }
    
    // Nếu vẫn không có user sau khi fetchMe, có thể redirect login
    if (!authStore.user?._id) {
        loading.value = false;
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
            `${API_URL}/loans/user/${authStore.user._id}`, // Sử dụng biến API_URL
            { headers: { Authorization: `Bearer ${token}` } }
        );
        // Sắp xếp: Mới nhất lên đầu
        borrows.value = response.data.sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate));
    } catch (error) {
        console.error('Lỗi tải lịch sử:', error);
        // Có thể thêm toast notification lỗi nhẹ ở đây nếu cần
    } finally {
        loading.value = false;
    }
};

const cancelBorrow = async (borrowId) => {
    const result = await Swal.fire({
        title: 'Hủy yêu cầu?',
        text: "Bạn có chắc muốn hủy phiếu mượn này?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444', // Tailwind red-500
        cancelButtonColor: '#6b7280', // Tailwind gray-500
        confirmButtonText: 'Đồng ý hủy',
        cancelButtonText: 'Đóng'
    });

    if (result.isConfirmed) {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                `${API_URL}/loans/${borrowId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Xóa khỏi danh sách local để không cần reload trang
            borrows.value = borrows.value.filter(item => item._id !== borrowId);
            
            Swal.fire({
                title: 'Thành công!',
                text: 'Đã hủy phiếu mượn.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            console.error(error);
            Swal.fire('Lỗi!', 'Không thể hủy phiếu mượn này. Vui lòng thử lại.', 'error');
        }
    }
};

onMounted(() => {
    fetchHistory();
});
</script>