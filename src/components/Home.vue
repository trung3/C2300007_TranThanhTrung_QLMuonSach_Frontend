<template>
  <section class="bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-20 rounded-xl mb-10 shadow-lg">
        <div class="container mx-auto px-4 text-center">
            <h1 class="text-4xl md:text-6xl font-bold mb-4">Chào Mừng Đến Thư Viện Số</h1>
            <p class="text-xl mb-8">Khám phá kho sách điện tử đa dạng và mượn sách dễ dàng</p>
            <a href="#books-section" class="bg-white text-indigo-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition inline-block shadow-md">
                Bắt Đầu Mượn Sách
            </a>
        </div>
    </section>

    <section id="books-section" class="py-4">
        <div class="container mx-auto">
            <h2 class="text-3xl font-bold text-center mb-12 text-indigo-600">Kho Sách Điện Tử</h2>

            <div class="mb-8 flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div class="relative w-full md:w-96">
                    <input 
                        v-model="searchText"
                        type="text" 
                        placeholder="Tìm kiếm sách..." 
                        class="w-full pl-10 pr-4 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    >
                    <span class="absolute left-3 top-2.5 text-indigo-500">
                        <i data-feather="search" class="w-4 h-4"></i>
                    </span>
                </div>

                <select 
                    v-model="selectedCategory"
                    class="border border-indigo-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-auto cursor-pointer"
                >
                    <option>Tất cả thể loại</option>
                    <option>Văn học</option>
                    <option>Khoa học</option>
                    <option>Lịch sử</option>
                    <option>Kỹ năng sống</option>
                </select>
            </div>

            <div v-if="isLoading" class="text-center py-20">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p class="text-gray-500">Đang tải dữ liệu...</p>
            </div>

            <div v-else>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[500px]">
                    <div 
                        v-for="book in paginatedBooks" 
                        :key="book._id" 
                        class="book-card bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100 flex flex-col"
                    >
                        <div class="relative h-64 overflow-hidden bg-gray-200 group">
                           <img 
    :src="book.image || 'https://placehold.co/300x400?text=No+Image'" 
    :alt="book.title"
    class="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
    @error="$event.target.src='https://placehold.co/300x400?text=Error'"
>
                            <div class="absolute top-2 right-2 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded shadow">
                                {{ Number(book.price).toLocaleString() }} đ
                            </div>
                        </div>

                        <div class="p-6 flex flex-col flex-grow">
                            <h3 class="font-bold text-xl mb-2 text-gray-800 line-clamp-1" :title="book.title">
                                {{ book.title }}
                            </h3>
                            
                            <p class="text-gray-600 mb-1 text-sm">
                                <i data-feather="user" class="w-3 h-3 inline mr-1"></i> 
                                Tác giả: <span class="font-medium">{{ book.author }}</span>
                            </p>
                            
                            <p class="text-gray-500 mb-4 text-xs">
                                <i data-feather="calendar" class="w-3 h-3 inline mr-1"></i> 
                                Năm XB: {{ book.yearOfPublication }}
                            </p>

                            <div class="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                                <div>
                                    <span class="block text-xs text-gray-500">Kho sách</span>
                                    <span 
                                        class="font-bold" 
                                        :class="book.qty > 0 ? 'text-green-600' : 'text-red-500'"
                                    >
                                        {{ book.qty > 0 ? `Còn ${book.qty} cuốn` : 'Hết hàng' }}
                                    </span>
                                </div>
                                
                                <button 
                                    @click="handleAddToCart(book)" 
                                    :disabled="book.qty <= 0"
                                    class="px-4 py-2 rounded-lg font-medium transition-all shadow-md text-sm flex items-center gap-2"
                                    :class="book.qty > 0 
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95' 
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'"
                                >
                                    <i data-feather="shopping-cart" class="w-4 h-4"></i>
                                    {{ book.qty > 0 ? 'Thêm' : 'Hết' }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="filteredBooks.length === 0" class="text-center py-10">
                    <img src="https://cdni.iconscout.com/illustration/premium/thumb/search-result-not-found-2130361-1800925.png" alt="Not found" class="w-40 mx-auto opacity-50 mb-4">
                    <p class="text-gray-500">Không tìm thấy cuốn sách nào phù hợp.</p>
                </div>

                <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-12">
                    <button 
                        @click="changePage(currentPage - 1)" 
                        :disabled="currentPage === 1"
                        class="px-3 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        <i data-feather="chevron-left" class="w-4 h-4"></i>
                    </button>

                    <button 
                        v-for="page in totalPages" 
                        :key="page"
                        @click="changePage(page)"
                        class="px-4 py-2 rounded-lg font-medium transition"
                        :class="currentPage === page ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white border hover:bg-gray-50 text-gray-700'"
                    >
                        {{ page }}
                    </button>

                    <button 
                        @click="changePage(currentPage + 1)" 
                        :disabled="currentPage === totalPages"
                        class="px-3 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        <i data-feather="chevron-right" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        </div>
    </section>

  </template>

<script setup>
import { ref, onMounted, computed, onUpdated, watch, nextTick } from 'vue';
import { listBooks } from '@/api/books.api';
import { useCartStore } from '@/stores/cart.store';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'vue-router';
// Import Swal nếu bạn muốn thông báo đẹp
import Swal from 'sweetalert2';

const cartStore = useCartStore();
const auth = useAuthStore();
const router = useRouter();

const books = ref([]);
const searchText = ref("");
const selectedCategory = ref("Tất cả thể loại");
const isLoading = ref(false);

// --- CẤU HÌNH PHÂN TRANG ---
const currentPage = ref(1);
const itemsPerPage = 6; // Số sách mỗi trang (nên là bội số của 3 vì grid 3 cột)

// Hàm cập nhật Icon (Dùng nextTick để tránh lỗi)
const updateIcons = () => {
    nextTick(() => {
        if (window.feather) window.feather.replace();
    });
};

const retrieveBooks = async () => {
    isLoading.value = true;
    try {
        const response = await listBooks();
        books.value = Array.isArray(response) ? response : response.data || [];
    } catch (error) {
        console.log("Lỗi tải sách:", error);
    } finally {
        isLoading.value = false;
        updateIcons();
    }
};

// 1. Lọc sách (Toàn bộ kết quả phù hợp)
const filteredBooks = computed(() => {
    return books.value.filter((book) => {
        const bookName = book.title || book.TenSach || ""; 
        const matchName = bookName.toLowerCase().includes(searchText.value.toLowerCase());
        const matchCategory = selectedCategory.value === "Tất cả thể loại" || book.TheLoai === selectedCategory.value;
        return matchName && matchCategory;
    });
});

// 2. Tính tổng số trang
const totalPages = computed(() => {
    return Math.ceil(filteredBooks.value.length / itemsPerPage);
});

// 3. Cắt danh sách để hiển thị theo trang hiện tại
const paginatedBooks = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredBooks.value.slice(start, end);
});

// 4. Hàm chuyển trang
const changePage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
        // Cuộn nhẹ lên đầu danh sách sách
        document.getElementById('books-section')?.scrollIntoView({ behavior: 'smooth' });
    }
};

// 5. Watcher: Khi tìm kiếm hoặc lọc -> Reset về trang 1
watch([searchText, selectedCategory], () => {
    currentPage.value = 1;
});

// 6. Watcher: Khi chuyển trang -> Cập nhật lại Icon Feather
watch(currentPage, () => {
    updateIcons();
});

const handleAddToCart = (book) => {
    cartStore.addToCart(book);
    // Thông báo đẹp (Optional)
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    })
    Toast.fire({
        icon: 'success',
        title: 'Đã thêm vào giỏ hàng'
    })
};

onMounted(() => {
    retrieveBooks();
});

// onUpdated không cần thiết lắm nếu đã dùng watch và nextTick, nhưng giữ lại cũng không sao
onUpdated(() => {
    updateIcons();
});
</script>

<style scoped>
.book-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.book-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.15), 0 8px 10px -6px rgba(79, 70, 229, 0.15);
}
</style>