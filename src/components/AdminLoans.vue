<template>
  <div class="bg-gray-50 min-h-screen p-6">
    <div class="container mx-auto max-w-7xl">
      
      <div class="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 class="text-3xl font-bold text-gray-800 border-l-4 border-blue-600 pl-4">
          Quản Lý Mượn Trả Sách
        </h1>
        <button @click="loadAll" class="text-blue-600 hover:text-blue-800 flex items-center gap-2 font-medium">
          <i class="fas fa-sync-alt" :class="{'animate-spin': loading}"></i> Làm mới dữ liệu
        </button>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <h3 class="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
          <i class="fas fa-plus-circle text-blue-500"></i> Tạo Phiếu Mượn Tại Quầy
        </h3>
        <form class="grid grid-cols-1 md:grid-cols-4 gap-4" @submit.prevent="createLoan">
          <div class="col-span-1">
            <select v-model="form.readerId" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition" required>
              <option value="">-- Chọn Độc Giả --</option>
              <option v-for="r in readers" :key="r._id" :value="r._id">
                {{ r.fullName }} ({{ r.code || r.email }})
              </option>
            </select>
          </div>

          <div class="col-span-1">
            <select v-model="form.bookId" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition" required>
              <option value="">-- Chọn Sách --</option>
              <option v-for="b in books" :key="b._id" :value="b._id">
                {{ b.title }} (SL: {{ b.quantity }})
              </option>
            </select>
          </div>

          <div class="col-span-1">
            <input v-model="form.borrowDate" type="date" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition" required>
          </div>

          <div class="col-span-1">
            <button type="submit" class="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 flex justify-center items-center gap-2" :disabled="submitting">
              <span v-if="submitting" class="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
              {{ submitting ? 'Đang xử lý...' : 'Tạo Phiếu Ngay' }}
            </button>
          </div>
        </form>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        
        <div class="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
            <div class="flex items-center gap-2 w-full sm:w-auto">
                <span class="font-bold text-gray-700 whitespace-nowrap">Lọc theo:</span>
                <select v-model="filterStatus" class="border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 w-full sm:w-auto cursor-pointer">
                    <option value="">Tất cả trạng thái</option>
                    <option value="pending">⏳ Chờ duyệt</option>
                    <option value="borrowing">📘 Đang mượn</option>
                    <option value="returned">✅ Đã trả</option>
                    <option value="overdue">⚠️ Quá hạn</option>
                </select>
            </div>

            <div class="relative w-full sm:w-72">
                <input v-model="searchQuery" type="text" placeholder="Tìm tên độc giả hoặc sách..." 
                    class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                <span class="absolute left-3 top-2.5 text-gray-400">🔍</span>
            </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                <th class="px-6 py-4 font-semibold">Độc Giả</th>
                <th class="px-6 py-4 font-semibold">Sách Mượn</th>
                <th class="px-6 py-4 font-semibold text-center">Thời Gian</th>
                <th class="px-6 py-4 font-semibold text-center">Trạng Thái</th>
                <th class="px-6 py-4 font-semibold text-right">Hành Động</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-if="loading && loans.length === 0">
                 <td colspan="5" class="px-6 py-8 text-center text-gray-500">Đang tải dữ liệu...</td>
              </tr>
              <tr v-else-if="filteredLoans.length === 0">
                <td colspan="5" class="px-6 py-8 text-center text-gray-500 italic">
                    Không tìm thấy phiếu mượn nào phù hợp.
                </td>
              </tr>

              <tr v-for="loan in pagedLoans" :key="loan._id" class="hover:bg-blue-50/30 transition duration-150 group">
                <td class="px-6 py-4">
                  <div class="font-medium text-gray-900">{{ loan.readerName  || 'Không xác định' }}</div>
                  <div class="text-xs text-gray-500">{{ loan.readerId?.code || loan.readerId?.email }}</div>
                </td>

                <td class="px-6 py-4">
                  <div class="font-medium text-gray-800 line-clamp-1" :title="loan.bookTitle">
                    {{ loan.bookTitle || 'Sách đã xóa' }}
                  </div>
                </td>

                <td class="px-6 py-4 text-center text-sm text-gray-600">
                  <div>Mượn: {{ formatDate(loan.borrowDate) }}</div>
                  <div v-if="loan.status === 'returned'" class="text-green-600 text-xs font-bold mt-1">
                      Đã trả: {{ formatDate(loan.returnDate) }}
                  </div>
                  <div v-else class="text-xs text-gray-400 mt-1">Hẹn trả: {{ formatDate(loan.returnDate) }}</div>
                </td>

                <td class="px-6 py-4 text-center">
                  <span :class="getStatusBadge(loan.status).class" class="px-3 py-1 rounded-full text-xs font-bold border shadow-sm inline-block min-w-[100px]">
                    {{ getStatusBadge(loan.status).text }}
                  </span>
                </td>

                <td class="px-6 py-4 text-right space-x-2">
                    
                  <button v-if="loan.status === 'pending'" @click="updateStatus(loan._id, 'borrowing')" 
                    class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-medium transition shadow-sm" title="Duyệt phiếu này">
                    ✅ Duyệt
                  </button>
                  
                  <button v-if="loan.status === 'pending'" @click="deleteLoan(loan._id)" 
                    class="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded text-xs font-medium transition shadow-sm" title="Từ chối/Hủy">
                    ❌ Hủy
                  </button>

                  <button v-if="['borrowing', 'overdue'].includes(loan.status)" @click="updateStatus(loan._id, 'returned')" 
                    class="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs font-medium transition shadow-sm" title="Xác nhận trả sách">
                    ↩️ Trả sách
                  </button>

                  <span v-if="loan.status === 'returned'" class="text-gray-400 text-xs italic">Hoàn tất</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
            <button @click="currentPage--" :disabled="currentPage === 1" class="px-3 py-1 border rounded bg-white hover:bg-gray-100 disabled:opacity-50 text-sm font-medium text-gray-600">Trước</button>
            <span class="px-3 py-1 text-sm font-medium text-gray-600 flex items-center">Trang {{ currentPage }} / {{ totalPages }}</span>
            <button @click="currentPage++" :disabled="currentPage === totalPages" class="px-3 py-1 border rounded bg-white hover:bg-gray-100 disabled:opacity-50 text-sm font-medium text-gray-600">Sau</button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import Swal from 'sweetalert2';
import http from "@/api/http"; // Dùng instance axios đã cấu hình
import * as Readers from "@/api/readers.api.js";
import * as Books from "@/api/books.api.js";

// --- STATE ---
const readers = ref([]);
const books = ref([]);
const loans = ref([]);
const loading = ref(false);
const submitting = ref(false);

const searchQuery = ref("");
const filterStatus = ref(""); // Biến lọc trạng thái
const currentPage = ref(1);
const itemsPerPage = 8;

const form = reactive({
  readerId: "",
  bookId: "",
  borrowDate: new Date().toISOString().split('T')[0],
});

// --- HELPERS ---
const formatDate = (dateString) => {
  if (!dateString) return "--/--/--";
  return new Date(dateString).toLocaleDateString("vi-VN");
};

// Hàm trả về màu sắc và chữ cho từng trạng thái
const getStatusBadge = (status) => {
    switch(status) {
        case 'pending': return { text: '⏳ Chờ duyệt', class: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
        case 'borrowing': return { text: '📘 Đang mượn', class: 'bg-blue-100 text-blue-700 border-blue-200' };
        case 'returned': return { text: '✅ Đã trả', class: 'bg-green-100 text-green-700 border-green-200' };
        case 'overdue': return { text: '⚠️ Quá hạn', class: 'bg-red-100 text-red-700 border-red-200' };
        case 'cancel': return { text: '❌ Đã hủy', class: 'bg-gray-100 text-gray-600 border-gray-200' };
        default: return { text: 'Không rõ', class: 'bg-gray-100' };
    }
};

// --- API FETCHING ---
const loadAll = async () => {
  loading.value = true;
  try {
    const [loansRes, readersRes, booksRes] = await Promise.all([
        http.get('/loans'),    // Gọi API lấy danh sách phiếu
        Readers.listReaders(), // Lấy danh sách độc giả để hiện trong Select
        Books.listBooks()      // Lấy danh sách sách để hiện trong Select
    ]);

    loans.value = loansRes.data || [];
    readers.value = readersRes.data || [];
    books.value = booksRes.data || [];

  } catch (error) {
    console.error(error);
    Swal.fire("Lỗi", "Không thể tải dữ liệu từ server", "error");
  } finally {
    loading.value = false;
  }
};

// --- CÁC HÀNH ĐỘNG CHÍNH ---

// 1. Tạo phiếu mượn (Admin tạo -> mặc định là đang mượn luôn)
const createLoan = async () => {
    submitting.value = true;
    try {
        // Tính ngày trả (mặc định +7 ngày)
        const borrowDateObj = new Date(form.borrowDate);
        const returnDateObj = new Date(borrowDateObj);
        returnDateObj.setDate(returnDateObj.getDate() + 7);

        const payload = {
            ...form,
            returnDate: returnDateObj.toISOString().split('T')[0],
            status: 'borrowing' // Admin tạo thì duyệt luôn
        };

        await http.post('/loans', payload);
        
        Swal.fire({ icon: 'success', title: 'Thành công', text: 'Đã tạo phiếu mượn mới!', timer: 1500, showConfirmButton: false });
        await loadAll();
        
        // Reset form
        form.readerId = "";
        form.bookId = "";
    } catch (error) {
        Swal.fire("Lỗi", error.response?.data?.message || "Tạo phiếu thất bại", "error");
    } finally {
        submitting.value = false;
    }
};

// 2. Cập nhật trạng thái (DUYỆT hoặc TRẢ)
// status = 'borrowing' (Duyệt), status = 'returned' (Trả)
const updateStatus = async (id, newStatus) => {
    const actionText = newStatus === 'borrowing' ? 'duyệt phiếu mượn này' : 'xác nhận trả sách';
    
    const result = await Swal.fire({
        title: 'Xác nhận?',
        text: `Bạn có chắc muốn ${actionText}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Đồng ý',
        cancelButtonText: 'Hủy'
    });

    if (!result.isConfirmed) return;

    try {
        // Gọi API PUT /loans/:id mà chúng ta đã sửa ở Backend
        await http.put(`/loans/${id}`, { status: newStatus });

        Swal.fire("Thành công", "Cập nhật trạng thái thành công!", "success");
        await loadAll(); // Tải lại dữ liệu mới nhất
    } catch (error) {
        console.error(error);
        Swal.fire("Lỗi", "Không thể cập nhật trạng thái.", "error");
    }
};

// 3. Xóa/Hủy phiếu mượn
const deleteLoan = async (id) => {
    const result = await Swal.fire({
        title: 'Hủy phiếu mượn?',
        text: "Hành động này sẽ xóa phiếu khỏi hệ thống!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Xóa ngay'
    });

    if (result.isConfirmed) {
        try {
            await http.delete(`/loans/${id}`);
            loans.value = loans.value.filter(l => l._id !== id); // Xóa khỏi giao diện
            Swal.fire("Đã xóa", "Phiếu mượn đã bị hủy.", "success");
        } catch (error) {
            Swal.fire("Lỗi", "Không thể xóa phiếu này", "error");
        }
    }
};

// --- COMPUTED (Lọc & Phân trang) ---
const filteredLoans = computed(() => {
    let result = loans.value;

    // 1. Lọc theo Status dropdown
    if (filterStatus.value) {
        result = result.filter(l => l.status === filterStatus.value);
    }

    // 2. Tìm kiếm (Theo tên độc giả hoặc tên sách)
    if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        result = result.filter(l => 
            (l.readerId?.fullName || "").toLowerCase().includes(q) ||
            (l.bookId?.title || "").toLowerCase().includes(q)
        );
    }

    // Sắp xếp: Pending lên đầu để dễ duyệt, sau đó đến ngày mượn mới nhất
    return result.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return new Date(b.borrowDate) - new Date(a.borrowDate);
    });
});

const totalPages = computed(() => Math.ceil(filteredLoans.value.length / itemsPerPage) || 1);

const pagedLoans = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    return filteredLoans.value.slice(start, start + itemsPerPage);
});

// Reset về trang 1 khi filter thay đổi
onMounted(loadAll);
</script>