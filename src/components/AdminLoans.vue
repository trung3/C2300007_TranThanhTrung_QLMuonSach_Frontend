<template>
  <div class="bg-gray-50 min-h-screen">
    <section id="loans" class="py-16 bg-secondary">
      <div class="container mx-auto px-4">

        <h2 class="text-3xl font-bold text-center mb-12 text-primary">
          Quản Lý Mượn – Trả Sách
        </h2>

        <!-- FORM MƯỢN -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-8 border border-primary/10">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-semibold text-primary">Tạo Phiếu Mượn</h3>
          </div>

          <form class="grid grid-cols-1 md:grid-cols-3 gap-4" @submit.prevent="saveLoan">

            <!-- Độc giả -->
            <select v-model="form.readerId" class="border border-primary rounded-lg px-4 py-2" required>
              <option value="">Chọn Độc Giả</option>
              <option v-for="r in readers" :key="r._id" :value="r._id">
                {{ r.fullName }} ({{ r.code }})
              </option>
            </select>

            <!-- Sách -->
            <select v-model="form.bookId" class="border border-primary rounded-lg px-4 py-2" required>
              <option value="">Chọn Sách</option>
              <option v-for="b in books" :key="b._id" :value="b._id">
                {{ b.title }} (#{{ b.code }})
              </option>
            </select>

            <!-- Ngày mượn -->
            <input v-model="form.borrowDate"
                   type="date"
                   class="border border-primary rounded-lg px-4 py-2"
                   required>

            <div class="md:col-span-3 flex items-center gap-3">
              <button type="submit"
                      class="bg-accent text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                      :disabled="loading">
                {{ loading ? "Đang lưu..." : "Mượn Sách" }}
              </button>

              <span v-if="error" class="text-red-600 ml-3">{{ error }}</span>
              <span v-if="okMsg" class="text-green-600 ml-3">{{ okMsg }}</span>
            </div>

          </form>
        </div>

        <!-- DANH SÁCH ĐANG MƯỢN -->
        <div class="bg-white rounded-lg shadow-lg p-6 border border-primary/10">

          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-semibold text-primary">Đang Mượn</h3>

            <input v-model.trim="q"
                   @input="handleSearch"
                   placeholder="Tìm độc giả, sách..."
                   class="border rounded px-3 py-2 w-64">
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full border border-gray-200">
              <thead class="bg-gray-50">
                <tr class="text-left text-sm text-gray-600">
                  <th class="px-4 py-3">Độc giả</th>
                  <th class="px-4 py-3">Sách</th>
                  <th class="px-4 py-3">Ngày mượn</th>
                  <th class="px-4 py-3">Trạng thái</th>
                  <th class="px-4 py-3 text-right">Hành động</th>
                </tr>
              </thead>

              <tbody>

                <tr v-if="loading">
                  <td colspan="5" class="text-center p-4">Đang tải…</td>
                </tr>

                <tr v-else-if="!pagedLoans.length">
                  <td colspan="5" class="text-center p-4">Không có dữ liệu.</td>
                </tr>

                <tr v-for="l in pagedLoans" :key="l._id">
  <td>{{ l.readerName }}</td>
  <td>{{ l.bookTitle }}</td>
  <td>{{ formatDate(l.borrowDate) }}</td>
  <td>{{ l.statusText }}</td>

  <td class="px-4 py-3 text-right">

    <!-- Nếu còn đang mượn → hiện nút Trả -->
<button
    v-if="l.status === 'borrowing'"
    class="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
    @click="returnBook(l._id)"
  >
    Trả
  </button>

  <!-- Nút “Đã trả” khi đã trả -->
  <button
    v-else
    class="px-3 py-1 rounded bg-gray-400 text-white cursor-not-allowed"
    disabled
  >
    Đã trả
  </button>




















  </td>
</tr>

                
                
                
                

                
                
                
                
                
                
                

              </tbody>
            </table>
          </div>

          <div class="mt-4 flex justify-center gap-2">
            <button class="px-3 py-1 border rounded"
                    :disabled="page===1"
                    @click="go(page-1)">« Trước</button>
            <span>Trang {{ page }} / {{ totalPages }}</span>
            <button class="px-3 py-1 border rounded"
                    :disabled="page===totalPages"
                    @click="go(page+1)">Sau »</button>
          </div>

        </div>
      </div>
    </section>
  </div>
</template>


<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import * as Loans from "@/api/loans.api.js";
import * as Readers from "@/api/readers.api.js";
import * as Books from "@/api/books.api.js";

const readers = ref([]);
const books = ref([]);
const loans = ref([]);

const loading = ref(false);
const error = ref("");
const okMsg = ref("");

const q = ref("");

const form = reactive({
  readerId: "",
  bookId: "",
  borrowDate: new Date().toISOString().substring(0,10)
});

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("vi-VN");
}

/* Tải dữ liệu */
async function loadAll() {
  loading.value = true;
  error.value = "";

  try {
    const r = await Readers.listReaders();
    readers.value = r.data;

    const b = await Books.listBooks();
    books.value = b.data;

    const l = await Loans.getAllLoans();
    loans.value = l.data;
loans.value = l.data.map(item => ({
  ...item,
  statusText: item.status === "borrowing" ? "Đang mượn" : "Đã trả"
}));

  } catch (e) {
    error.value = "Không tải được dữ liệu";
  }

  loading.value = false;
}

/* Tìm kiếm */
const filteredLoans = computed(() => {
  if (!q.value) return loans.value;

  const kw = q.value.toLowerCase();

  return loans.value.filter(l =>
    (l.readerName || "").toLowerCase().includes(kw) ||
    (l.bookTitle || "").toLowerCase().includes(kw) ||
    (l.statusText || "").toLowerCase().includes(kw) ||
    (l.status || "").toLowerCase().includes(kw)
  );
});



/* Phân trang */
const page = ref(1);
const limit = ref(10);

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredLoans.value.length / limit.value))
);

const pagedLoans = computed(() => {
  const start = (page.value - 1) * limit.value;
  return filteredLoans.value.slice(start, start + limit.value);
});

function go(p) {
  if (p >= 1 && p <= totalPages.value) page.value = p;
}

function handleSearch() {
  page.value = 1;
}

/* Lưu phiếu mượn */
async function saveLoan() {
  loading.value = true;
  error.value = "";
  okMsg.value = "";

  try {
    await Loans.createLoan({ ...form });
    okMsg.value = "Đã tạo phiếu mượn.";
    await loadAll();
  } catch (e) {
    error.value = e.response?.data?.message || "Lỗi khi lưu";
  }

  loading.value = false;
}

/* Trả sách */
/* Trả sách */
/* Trả sách */
/* Trả sách */
/* Trả sách */
/* Trả sách */
async function returnBook(id) {
  if (!confirm("Xác nhận trả sách?")) return;

  loading.value = true;
  error.value = "";
  okMsg.value = "";

  try {
    // 1. Gọi API
    const { data } = await Loans.returnBook(id); //
    okMsg.value = data?.message || "Đã trả sách thành công.";
    
    // 2. QUAN TRỌNG: Tải lại dữ liệu ngay lập tức
    await loadAll(); 

  } catch (e) {
    // Hiển thị lỗi từ Back-end (ví dụ: đã trả rồi mà bấm tiếp)
    const serverMsg = e.response?.data?.message;
    error.value = serverMsg || e.message || "Không thể trả sách.";
  } finally {
    loading.value = false;
  }
}
onMounted(loadAll);
</script>


<style scoped>
.bg-primary { background-color: #4f46e5; }
.bg-secondary { background-color: #f8fafc; }
.bg-accent { background-color: #10b981; }
.text-primary { color: #4f46e5; }
.border-primary { border-color: #4f46e5; }
</style>
