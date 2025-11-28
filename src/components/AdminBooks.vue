<template>
  <div class="bg-gray-50 min-h-screen">
    <section id="books" class="py-16 bg-secondary">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12 text-primary">Quản Lý Sách</h2>

        <div class="bg-white rounded-lg shadow-lg p-6 mb-8 border border-primary/10">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-semibold text-primary">
              {{ editingId ? "Sửa Sách" : "Thêm Sách Mới" }}
            </h3>
            <span v-if="editingId" class="text-sm text-secondary">
              Đang sửa: <b>{{ form.title }}</b>
            </span>
          </div>

          <form class="grid grid-cols-1 md:grid-cols-3 gap-4" @submit.prevent="saveBook">
            <input v-model.trim="form.code" placeholder="Mã sách (vd: S001)" :disabled="!!editingId"
              class="border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
              required>

            <input v-model.trim="form.title" placeholder="Tên sách"
              class="border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              required>

            <input v-model.trim="form.author" placeholder="Tác giả"
              class="border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              required>

            <input v-model.number="form.price" type="number" min="0" placeholder="Giá (VNĐ)"
              class="border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              required>

            <input v-model.number="form.qty" type="number" min="0" placeholder="Số lượng (qty)"
              class="border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              required>

            <select v-model="form.publisherId"
              class="border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              required>
              <option value="" disabled>-- Chọn nhà xuất bản --</option>
              <option v-for="p in publishers" :key="p._id" :value="p._id">
                {{ p.name }} ({{ p.code }})
              </option>
            </select>

            <input v-model.trim="form.language" placeholder="Ngôn ngữ (vd: vi)"
              class="border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              required>

            <div class="md:col-span-1">
              <label class="block text-sm text-gray-600 mb-1 font-semibold">Ảnh bìa</label>
              
              <div class="flex flex-col gap-2">
                <div class="relative w-full h-40 bg-gray-100 rounded-lg border border-dashed border-gray-300 flex items-center justify-center overflow-hidden group">
                    <img 
                        :src="previewUrl || form.image || 'https://placehold.co/400x600?text=No+Image'" 
                        alt="Preview" 
                        class="h-full object-contain"
                        @error="$event.target.src='https://placehold.co/400x600?text=Error'"
                    />
                    
                    <button 
                        v-if="previewUrl || form.image"
                        type="button"
                        @click="clearImage"
                        class="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                        title="Xóa ảnh"
                    >
                        <i data-feather="x" class="w-4 h-4"></i>
                    </button>
                </div>

                <input
                  type="file"
                  ref="fileInput"
                  accept="image/*"
                  @change="onFileChange"
                  class="block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100"
                />
              </div>
            </div>

            <input type="number" min="1900" max="2100" v-model.trim="form.yearOfPublication" placeholder="Năm xuất bản"
              class="border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              required>

            <div class="md:col-span-3 flex items-center gap-3 mt-4">
              <button type="submit"
                class="bg-accent text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-medium shadow-md flex items-center"
                :disabled="loading">
                <span v-if="loading" class="animate-spin mr-2 border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
                <i v-else data-feather="save" class="w-4 h-4 inline mr-1"></i>
                {{ loading ? "Đang xử lý..." : (editingId ? "Cập nhật" : "Thêm Sách") }}
              </button>

              <button v-if="editingId" type="button" class="px-4 py-2 rounded-lg border bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                @click="cancelEdit" :disabled="loading">
                Hủy
              </button>
            </div>
          </form>
        </div>

        <div class="bg-white rounded-lg shadow-lg p-6 border border-primary/10 mt-6">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 class="text-xl font-semibold text-primary">Danh Sách Sách</h3>

            <div class="flex items-center gap-2">
              <input v-model.trim="q" @input="handleSearch" placeholder="Tìm kiếm sách..."
                class="border rounded px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-primary" />
              <select v-model.number="limit" @change="go(1)" class="border rounded px-2 py-2">
                <option :value="6">6 / trang</option>
                <option :value="12">12 / trang</option>
                <option :value="24">24 / trang</option>
              </select>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead class="bg-gray-50">
                <tr class="text-left text-sm text-gray-600">
                  <th class="px-4 py-3">Ảnh</th>
                  <th class="px-4 py-3">Mã</th>
                  <th class="px-4 py-3">Tên sách</th>
                  <th class="px-4 py-3">Tác giả</th>
                  <th class="px-4 py-3">NXB</th>
                  <th class="px-4 py-3">SL</th>
                  <th class="px-4 py-3">Giá</th>
                  <th class="px-4 py-3">Ngôn ngữ</th>
                  <th class="px-4 py-3">Năm XB</th>
                  <th class="px-4 py-3">Tạo lúc</th>
                  <th class="px-4 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loading && !books.length">
                  <td colspan="11" class="px-4 py-6 text-center text-gray-500">Đang tải dữ liệu...</td>
                </tr>
                <tr v-else-if="!pagedBooks.length">
                  <td colspan="11" class="px-4 py-6 text-center text-gray-500">
                    Không tìm thấy sách nào.
                  </td>
                </tr>

                <tr v-else v-for="b in pagedBooks" :key="b._id" class="border-t hover:bg-gray-50 transition">
                  <td class="px-4 py-3">
                    <img 
                        :src="b.image || 'https://placehold.co/100x150?text=No+Img'" 
                        :alt="b.title"
                        class="h-16 w-12 object-cover rounded border bg-gray-100"
                        @error="$event.target.src='https://placehold.co/100x150?text=Error'"
                    />
                  </td>
                  <td class="px-4 py-3 text-indigo-600 font-bold text-sm">#{{ b.code }}</td>
                  <td class="px-4 py-3 font-medium text-gray-800">{{ b.title }}</td>
                  <td class="px-4 py-3 text-gray-600">{{ b.author || "—" }}</td>
                  <td class="px-4 py-3 text-sm">{{ nameOfPublisher(b.publisherId) }}</td>
                  <td class="px-4 py-3 font-bold" :class="b.qty > 0 ? 'text-green-600' : 'text-red-500'">{{ b.qty }}</td>
                  <td class="px-4 py-3 font-medium">{{ formatVnd(b.price) }}</td>
                  <td class="px-4 py-3 uppercase text-xs">{{ b.language || "—" }}</td>
                  <td class="px-4 py-3">{{ b.yearOfPublication || "—" }}</td>
                  <td class="px-4 py-3 text-xs text-gray-500">
                    {{ new Date(b.createdAt).toLocaleDateString("vi-VN") }}
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex justify-end gap-2">
                      <button class="px-3 py-1 rounded bg-blue-100 text-blue-600 hover:bg-blue-200 text-sm font-medium transition"
                        @click="startEdit(b)">Sửa</button>
                      <button class="px-3 py-1 rounded bg-red-100 text-red-600 hover:bg-red-200 text-sm font-medium transition"
                        @click="removeBook(b._id)">Xóa</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mt-6 flex items-center justify-center gap-2">
            <button class="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50" :disabled="page === 1 || loading"
              @click="go(page - 1)">« Trước</button>
            <span class="px-3 py-1 font-medium text-primary">Trang {{ page }} / {{ totalPages }}</span>
            <button class="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50" :disabled="page === totalPages || loading"
              @click="go(page + 1)">Sau »</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { RouterLink } from "vue-router";
import { ref, reactive, onMounted, computed, onUpdated, nextTick } from "vue";
import * as Books from "@/api/books.api";
import { listPublishers } from "@/api/publishers.api";
import { uploadBookImage } from "@/api/uploads.api";
import Swal from 'sweetalert2'; // 👈 IMPORT SWAL

// --- STATE ---
const page = ref(1);
const limit = ref(12);
const q = ref("");
const selectedFile = ref(null);
const previewUrl = ref("");
const fileInput = ref(null);

const books = ref([]);
const publishers = ref([]);
const loading = ref(false);
const editingId = ref(null);

const form = reactive({
  code: "",
  title: "",
  author: "",
  price: 0,
  qty: 0,
  publisherId: "",
  language: "vi",
  yearOfPublication: "",
  image: ""
});

// --- HELPER FUNCTIONS ---
const updateIcons = () => {
    nextTick(() => { if (window.feather) window.feather.replace(); });
};

function onFileChange(e) {
  const file = e.target.files?.[0];
  selectedFile.value = file || null;
  previewUrl.value = file ? URL.createObjectURL(file) : "";
}

function clearImage() {
  selectedFile.value = null;
  previewUrl.value = "";
  form.image = ""; 
  if (fileInput.value) fileInput.value.value = "";
}

function formatVnd(n) {
  if (n == null) return "-";
  try { return Number(n).toLocaleString("vi-VN") + " ₫"; } catch { return n; }
}

const publishersById = computed(() =>
  Object.fromEntries((publishers.value || []).map(p => [p._id, p.name]))
);

function nameOfPublisher(id) {
  return publishersById.value?.[id] || "—";
}

// --- API LOAD ---
async function loadBooks() {
  loading.value = true;
  try {
    const { data } = await Books.listBooks();
    books.value = Array.isArray(data) ? data : [];
  } catch (e) {
    Swal.fire('Lỗi', 'Không tải được danh sách sách', 'error');
  } finally {
    loading.value = false;
    updateIcons();
  }
}

async function loadPublishers() {
  try {
    const { data } = await listPublishers();
    publishers.value = Array.isArray(data) ? data : (data?.items || []);
  } catch { publishers.value = []; }
}

// --- FILTER & PAGINATION ---
const filteredBooks = computed(() => {
  if (!q.value) return books.value;
  const kw = q.value.toLowerCase();
  return (books.value || []).filter(b =>
    (b.title || "").toLowerCase().includes(kw) ||
    (b.code || "").toLowerCase().includes(kw) ||
    (b.author || "").toLowerCase().includes(kw) ||
    nameOfPublisher(b.publisherId).toLowerCase().includes(kw)
  );
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredBooks.value.length / limit.value))
);

const pagedBooks = computed(() => {
  const start = (page.value - 1) * limit.value;
  return filteredBooks.value.slice(start, start + limit.value);
});

function go(p) {
  if (p < 1 || p > totalPages.value) return;
  page.value = p;
}

function handleSearch() {
  page.value = 1;
}

// --- ACTIONS (THÊM / SỬA / XÓA) ---
function resetForm() {
  Object.assign(form, { code: "", title: "", author: "", price: 0, qty: 0, publisherId: "", language: "vi", yearOfPublication: "", image: "" });
  clearImage();
}

function startEdit(b) {
  editingId.value = b._id;
  Object.assign(form, {
    code: b.code, title: b.title, author: b.author,
    price: b.price, qty: b.qty,
    publisherId: b.publisherId, language: b.language ?? "vi",
    yearOfPublication: b.yearOfPublication,
    image: b.image || ""
  });
  selectedFile.value = null;
  previewUrl.value = "";
  
  document.getElementById('books')?.scrollIntoView({ behavior: 'smooth' });
}

function cancelEdit() {
  editingId.value = null;
  resetForm();
}

// 👇 HÀM LƯU ĐÃ SỬA DÙNG SWAL
async function saveBook() {
  loading.value = true;
  try {
    // 1. Upload ảnh
    if (selectedFile.value) {
      const up = await uploadBookImage(selectedFile.value);
      form.image = up?.data?.url || form.image;
    }

    // 2. Gửi API
    const payload = { ...form };

    if (!editingId.value) {
      await Books.createBook(payload);
      Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: 'Thêm sách mới thành công!',
          timer: 2000,
          showConfirmButton: false
      });
    } else {
      const { code, ...patch } = payload;
      await Books.updateBook(editingId.value, patch);
      Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: 'Cập nhật sách thành công!',
          timer: 2000,
          showConfirmButton: false
      });
      editingId.value = null;
    }

    await loadBooks();
    resetForm();
  } catch (e) {
    const msg = e?.response?.data?.message || "Có lỗi xảy ra";
    Swal.fire({
        icon: 'error',
        title: 'Thất bại',
        text: msg
    });
  } finally {
    loading.value = false;
  }
}

// 👇 HÀM XÓA ĐÃ SỬA DÙNG SWAL
async function removeBook(id) {
  // Hiện hộp thoại xác nhận đẹp
  const result = await Swal.fire({
      title: 'Bạn chắc chắn?',
      text: "Hành động này không thể hoàn tác!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xóa ngay',
      cancelButtonText: 'Hủy'
  });

  if (!result.isConfirmed) return;

  loading.value = true;
  try {
    await Books.deleteBook(id);
    await loadBooks();
    
    Swal.fire(
      'Đã xóa!',
      'Sách đã được xóa khỏi hệ thống.',
      'success'
    );
  } catch (e) {
    Swal.fire(
      'Lỗi!',
      e?.response?.data?.message || 'Xóa sách thất bại',
      'error'
    );
  } finally {
    loading.value = false;
  }
}

// --- LIFECYCLE ---
onMounted(async () => {
  updateIcons();
  await Promise.all([loadPublishers(), loadBooks()]);
});

onUpdated(() => {
  updateIcons();
});
</script>

<style scoped>
.bg-primary { background-color: #4f46e5; }
.bg-secondary { background-color: #f8fafc; }
.bg-accent { background-color: #10b981; }

.text-primary { color: #4f46e5; }
.text-secondary { color: #64748b; }
.text-accent { color: #10b981; }

.border-primary { border-color: #4f46e5; }
</style>