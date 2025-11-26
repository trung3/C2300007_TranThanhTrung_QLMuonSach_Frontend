
<template>
  <UserLayout>
    
    <section class="bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-20 rounded-xl mb-10 shadow-lg">
        <div class="container mx-auto px-4 text-center">
            <h1 class="text-4xl md:text-6xl font-bold mb-4">Chào Mừng Đến Thư Viện Số</h1>
            <p class="text-xl mb-8">Khám phá kho sách điện tử đa dạng và mượn sách dễ dàng</p>
            <a href="#books-section" class="bg-white text-indigo-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition inline-block">
                Bắt Đầu Mượn Sách
            </a>
        </div>
    </section>

    <section id="books-section" class="py-4">
        <div class="container mx-auto">
            <h2 class="text-3xl font-bold text-center mb-12 text-indigo-600">Kho Sách Điện Tử</h2>

            <div class="mb-8 flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-lg shadow-sm">
                <div class="relative w-full md:w-96">
                    <input 
                        v-model="searchText"
                        type="text" 
                        placeholder="Tìm kiếm sách..." 
                        class="w-full pl-10 pr-4 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                    <span class="absolute left-3 top-2.5 text-indigo-500">
                        <i data-feather="search" class="w-4 h-4"></i>
                    </span>
                </div>

                <select 
                    v-model="selectedCategory"
                    class="border border-indigo-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-auto"
                >
                    <option>Tất cả thể loại</option>
                    <option>Văn học</option>
                    <option>Khoa học</option>
                    <option>Lịch sử</option>
                    <option>Kỹ năng sống</option>
                </select>
            </div>

            <div v-if="isLoading" class="text-center py-10 text-gray-500">
                Đang tải dữ liệu...
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                
                <div 
    v-for="book in filteredBooks" 
    :key="book._id" 
    class="book-card bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100 flex flex-col"
>
    <div class="relative h-64 overflow-hidden bg-gray-200 group">
        <img 
            :src="book.image || 'https://placehold.co/300x400?text=No+Image'" 
            :alt="book.title"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
    
    {{ book.qty > 0 ? 'Thêm vào giỏ' : 'Tạm hết' }}
</button>
        </div>
    </div>
</div>

            </div>
            
            <div v-if="!isLoading && filteredBooks.length === 0" class="text-center py-10">
                <img src="https://cdni.iconscout.com/illustration/premium/thumb/search-result-not-found-2130361-1800925.png" alt="Not found" class="w-40 mx-auto opacity-50 mb-4">
                <p class="text-gray-500">Không tìm thấy cuốn sách nào phù hợp.</p>
            </div>
        </div>
    </section>

  </UserLayout>
</template>

<script setup>
import { ref, onMounted, computed, onUpdated } from 'vue';
// import UserLayout from '@/layouts/userLayout.vue';
import { listBooks } from '@/api/books.api';
import { useCartStore } from '@/stores/cart.store'; // Import Store
import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'vue-router';

// 1. Khởi tạo các biến
const cartStore = useCartStore(); // Khởi tạo Cart Store
const auth = useAuthStore();
const router = useRouter();

const books = ref([]);
const searchText = ref("");
const selectedCategory = ref("Tất cả thể loại");
const isLoading = ref(false);

// 2. Hàm lấy sách từ API
const retrieveBooks = async () => {
    isLoading.value = true;
    try {
        const response = await listBooks();
        // Kiểm tra dữ liệu trả về (mảng hoặc object.data)
        books.value = Array.isArray(response) ? response : response.data || [];
    } catch (error) {
        console.log("Lỗi tải sách:", error);
    } finally {
        isLoading.value = false;
    }
};

// 3. Hàm lọc sách (Search)
const filteredBooks = computed(() => {
    return books.value.filter((book) => {
        // Hỗ trợ cả trường 'title' (backend mới) và 'TenSach' (cũ)
        const bookName = book.title || book.TenSach || ""; 
        const matchName = bookName.toLowerCase().includes(searchText.value.toLowerCase());
        
        // Logic lọc thể loại (nếu có)
        const matchCategory = selectedCategory.value === "Tất cả thể loại" || book.TheLoai === selectedCategory.value;
        
        return matchName && matchCategory;
    });
});

// 4. Hàm Thêm vào giỏ (Logic Mới)
const handleAddToCart = (book) => {
    // Gọi action từ store
    cartStore.addToCart(book);
};

// 5. Lifecycle
onMounted(() => {
    retrieveBooks();
    if (window.feather) window.feather.replace();
});

onUpdated(() => {
    if (window.feather) window.feather.replace();
});
</script>


<style scoped>
/* CSS Hover Effect từ file HTML cũ của bạn */
.book-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.book-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
}
</style>