<template>
  <div class="bg-gray-50 min-h-screen">
    <section id="loans" class="py-16 bg-secondary">
      <div class="container mx-auto px-4">

        <h2 class="text-3xl font-bold text-center mb-12 text-primary">
          Quản Lý Mượn – Trả Sách
        </h2>

        <div class="bg-white rounded-lg shadow-lg p-6 mb-8 border border-primary/10">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-semibold text-primary">Tạo Phiếu Mượn</h3>
          </div>

          <form class="grid grid-cols-1 md:grid-cols-3 gap-4" @submit.prevent="saveLoan">

            <select v-model="form.readerId" class="border border-primary rounded-lg px-4 py-2" required>
              <option value="">Chọn Độc Giả</option>
              <option v-for="r in readers" :key="r._id" :value="r._id">
                {{ r.fullName }} ({{ r.code }})
              </option>
            </select>

            <select v-model="form.bookId" class="border border-primary rounded-lg px-4 py-2" required>
              <option value="">Chọn Sách</option>
              <option v-for="b in books" :key="b._id" :value="b._id">
                {{ b.title }} (#{{ b.code }})
              </option>
            </select>

            <input v-model="form.borrowDate"
                   type="date"
                   class="border border-primary rounded-lg px-4 py-2"
                   required>

            <div class="md:col-span-3 flex items-center gap-3">
              <button type="submit"
                      class="bg-accent text-white px-6 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                      :disabled="loading">
                <span v-if="loading" class="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
                <span>{{ loading ? "Đang xử lý..." : "Mượn Sách" }}</span>
              </button>
            </div>

          </form>
        </div>

        <div class="bg-white rounded-lg shadow-lg p-6 border border-primary/10">

          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-semibold text-primary">Đang Mượn</h3>

            <input v-model.trim="q"
                   @input="handleSearch"
                   placeholder="Tìm độc giả, sách..."
                   class="border rounded px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-primary">
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

                <tr v-if="loading && !loans.length">
                  <td colspan="5" class="text-center p-4">Đang tải…</td>
                </tr>

                <tr v-else-if="!pagedLoans.length">
                  <td colspan="5" class="text-center p-4">Không có dữ liệu.</td>
                </tr>

                <tr v-else v-for="l in pagedLoans" :key="l._id" class="border-t hover:bg-gray-50">
                  <td class="px-4 py-3 font-medium">{{ l.readerName }}</td>
                  <td class="px-4 py-3">{{ l.bookTitle }}</td>
                  <td class="px-4 py-3">{{ formatDate(l.borrowDate) }}</td>
                  <td class="px-4 py-3">
                    <span :class="l.status === 'borrowing' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'"
                          class="px-2 py-1 rounded text-xs font-bold uppercase">
                      {{ l.statusText }}
                    </span>
                  </td>

                  <td class="px-4 py-3 text-right">
                    <button v-if="l.status === 'borrowing'"
                            class="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 text-sm transition"
                            @click="returnBook(l._id)">
                      Trả Sách
                    </button>

                    <button v-else
                            class="px-3 py-1 rounded bg-gray-200 text-gray-500 cursor-not-allowed text-sm"
                            disabled>
                      Đã trả
                    </button>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>

          <div class="mt-4 flex justify-center gap-2">
            <button class="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                    :disabled="page===1"
                    @click="go(page-1)">« Trước</button>
            <span class="px-3 py-1 text-primary font-medium">Trang {{ page }} / {{ totalPages }}</span>
            <button class="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
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
import Swal from 'sweetalert2'; // 👈 IMPORT SWAL

const readers = ref([]);
const books = ref([]);
const loans = ref([]);
const loading = ref(false);
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
  try {
    const [rRes, bRes, lRes] = await Promise.all([
        Readers.listReaders(),
        Books.listBooks(),
        Loans.getAllLoans()
    ]);

    readers.value = rRes.data;
    books.value = Array.isArray(bRes.data) ? bRes.data : [];
    
    loans.value = lRes.data.map(item => ({
      ...item,
      statusText: item.status === "borrowing" ? "Đang mượn" : "Đã trả"
    }));

  } catch (e) {
    Swal.fire('Lỗi', 'Không tải được dữ liệu', 'error');
  } finally {
    loading.value = false;
  }
}

/* Tìm kiếm */
const filteredLoans = computed(() => {
  if (!q.value) return loans.value;
  const kw = q.value.toLowerCase();
  return loans.value.filter(l =>
    (l.readerName || "").toLowerCase().includes(kw) ||
    (l.bookTitle || "").toLowerCase().includes(kw) ||
    (l.statusText || "").toLowerCase().includes(kw)
  );
});

/* Phân trang */
const page = ref(1);
const limit = ref(10);

const totalPages = computed(() => Math.max(1, Math.ceil(filteredLoans.value.length / limit.value)));

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

/* Lưu phiếu mượn (Dùng Swal) */
async function saveLoan() {
  loading.value = true;
  try {
    await Loans.createLoan({ ...form });
    
    Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: 'Đã tạo phiếu mượn mới!',
        timer: 2000,
        showConfirmButton: false
    });

    await loadAll();
    // Reset form nhẹ (giữ ngày mượn)
    form.readerId = "";
    form.bookId = "";
  } catch (e) {
    Swal.fire({
        icon: 'error',
        title: 'Thất bại',
        text: e.response?.data?.message || "Lỗi khi tạo phiếu mượn"
    });
  } finally {
    loading.value = false;
  }
}

/* Trả sách (Dùng Swal Confirm) */
async function returnBook(id) {
  const result = await Swal.fire({
      title: 'Xác nhận trả sách?',
      text: "Đánh dấu cuốn sách này là đã trả?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy'
  });

  if (!result.isConfirmed) return;

  // Optimistic UI Update (Cập nhật giao diện trước)
  const index = loans.value.findIndex(item => item._id === id);
  const oldStatus = loans.value[index]?.status; // Backup để rollback

  if (index !== -1) {
      loans.value[index].status = "returned";
      loans.value[index].statusText = "Đã trả";
      loans.value[index].returnDate = new Date().toISOString();
  }

  try {
    await Loans.returnBook(id);
    Swal.fire('Thành công!', 'Sách đã được trả.', 'success');
  } catch (e) {
    // Rollback nếu lỗi
    if (index !== -1) {
        loans.value[index].status = oldStatus;
        loans.value[index].statusText = "Đang mượn";
    }
    // Swal.fire('Lỗi', 'Không thể cập nhật trạng thái trả sách', 'error');
    await loadAll();
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