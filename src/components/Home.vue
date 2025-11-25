<template>
  <div class="bg-gray-50 min-h-screen">
    <!-- Books -->
    <section id="books" class="py-16 bg-secondary">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12 text-primary">Quản Lý Sách</h2>

        <!-- Form thêm/sửa sách -->
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
            <input v-model.trim="form.code" placeholder="Mã sách (vd: S001)"
                   :disabled="editingId" 
                   class="border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" required>

            <input v-model.trim="form.title" placeholder="Tên sách"
                   class="border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" required>

            <input v-model.trim="form.author" placeholder="Tác giả"
                   class="border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" required>

            <input v-model.number="form.price" type="number" min="0" placeholder="Giá (VNĐ)"
                   class="border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" required>

            <input v-model.number="form.qty" type="number" min="0" placeholder="Số lượng (qty)"
                   class="border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" required>

            <!-- Dropdown NXB -->
            <select v-model="form.publisherId"
                    class="border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    required>
              <option value="" disabled>-- Chọn nhà xuất bản --</option>
              <option v-for="p in publishers" :key="p._id" :value="p._id">
                {{ p.name }} ({{ p.code }})
              </option>
            </select>

            <input v-model.trim="form.language" placeholder="Ngôn ngữ (vd: vi)"
                   class="border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" required>

                   <!-- Ảnh bìa -->
<div class="md:col-span-1">
  <label class="block text-sm text-gray-600 mb-1">Ảnh bìa</label>
  <input
    type="file"
    accept="image/*"
    @change="onFileChange"
    class="border border-primary rounded-lg px-4 py-2 w-full"
  />
  <!-- Preview (ưu tiên file mới chọn; nếu không có thì dùng form.cover hiện có khi sửa) -->
  <img
    v-if="previewUrl || form.image"
    :src="previewUrl || form.image"
    alt="preview"
    class="mt-2 h-28 w-full object-cover rounded"
  />
  <div class="mt-2 flex gap-2">
    <button
      v-if="previewUrl || form.image"
      type="button"
      class="px-3 py-1 rounded border hover:bg-gray-50"
      @click="clearImage"
    >Xóa ảnh</button>
  </div>
</div>
<input type="number" min="1900" max="2100" v-model.trim="form.yearOfPublication" placeholder="Năm xuất bản"
       class="border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" required>
            <div class="md:col-span-3 flex items-center gap-3">
              <button type="submit"
                      class="bg-accent text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                      :disabled="loading">
                {{ loading ? "Đang lưu..." : (editingId ? "Cập nhật" : "Thêm Sách") }}
              </button>

              <button v-if="editingId" type="button" class="px-4 py-2 rounded-lg border hover:bg-gray-50"
                      @click="cancelEdit" :disabled="loading">
                Hủy
              </button>

              <span v-if="error" class="text-red-600 ml-3 text-sm">{{ error }}</span>
              <span v-if="okMsg" class="text-green-600 ml-3 text-sm">{{ okMsg }}</span>
            </div>
          </form>
        </div>

        <!-- Danh sách sách -->
        <div class="bg-white rounded-lg shadow-lg p-6 border border-primary/10">
          <!-- Danh Sách Sách (BẢNG) -->

<div class="bg-white rounded-lg shadow p-6 border border-primary/10 mt-6">
  <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
    <h3 class="text-xl font-semibold text-primary">Danh Sách Sách</h3>

    <div class="flex items-center gap-2">
      <input v-model.trim="q"
             @input="handleSearch"
             placeholder="Tìm kiếm sách..."
             class="border rounded px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-primary"/>
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
          <th class="px-4 py-3">Năm xuất bản</th>
          <th class="px-4 py-3">Tạo lúc</th>
          <th class="px-4 py-3 text-right">Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td colspan="10" class="px-4 py-6 text-center text-gray-500">Đang tải…</td>
        </tr>
        <tr v-else-if="!pagedBooks.length">
          <td colspan="10" class="px-4 py-6 text-center text-gray-500">
            Không có sách nào.
          </td>
        </tr>

        <tr v-else v-for="b in pagedBooks" :key="b._id" class="border-t hover:bg-gray-50">
          <td class="px-4 py-3">
            <img v-if="b.image" :src="b.image" :alt="b.title" class="h-12 w-20 object-cover rounded border"/>
          </td>
          <td class="px-4 py-3 text-indigo-600 font-medium">#{{ b.code }}</td>
          <td class="px-4 py-3 font-medium">{{ b.title }}</td>
          <td class="px-4 py-3">{{ b.author || "—" }}</td>
          <td class="px-4 py-3">{{ nameOfPublisher(b.publisherId) }}</td>
          <td class="px-4 py-3">{{ b.qty }}</td>
          <td class="px-4 py-3">{{ formatVnd(b.price) }}</td>
          <td class="px-4 py-3 uppercase">{{ b.language || "—" }}</td>
          <td class="px-4 py-3 uppercase">{{ b.yearOfPublication || "—" }}</td>
          <td class="px-4 py-3">
            {{ new Date(b.createdAt).toLocaleString("vi-VN") }}
          </td>
          <td class="px-4 py-3">
            <div class="flex justify-end gap-2">
              <button class="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
                      @click="startEdit(b)">Sửa</button>
              <button class="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
                      @click="removeBook(b._id)">Xóa</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Phân trang -->
  <div class="mt-4 flex items-center justify-center gap-2">
    <button class="px-3 py-1 border rounded"
            :disabled="page===1 || loading"
            @click="go(page-1)">« Trước</button>
    <span class="px-3 py-1">Trang {{ page }} / {{ totalPages }}</span>
    <button class="px-3 py-1 border rounded"
            :disabled="page===totalPages || loading"
            @click="go(page+1)">Sau »</button>
  </div>
</div>                                                                     
        </div>
      </div>
    </section>

    <!-- (Giữ nguyên 2 section Users/Stats nếu bạn đang dùng) -->
  </div>
</template>

<script setup>
import { RouterLink } from "vue-router";
import { ref, reactive, onMounted } from "vue";
import * as Books from "@/api/books.api";
import { listPublishers } from "@/api/publishers.api";
import { computed } from "vue";
// import { ref } from "vue";
import { uploadBookImage } from "@/api/uploads.api";
const page = ref(1);
const limit = ref(12);
const q = ref("");
const sort = ref("createdAt:desc");
const selectedFile = ref(null);
const previewUrl = ref("");

function onFileChange(e) {
  const file = e.target.files?.[0];
  selectedFile.value = file || null;
  previewUrl.value = file ? URL.createObjectURL(file) : "";
}

function clearImage() {
  selectedFile.value = null;
  previewUrl.value = "";
  form.image = "";            // nếu bạn có field cover, để rỗng
}

const books = ref([]);
const publishers = ref([]);
const loading = ref(false);
const error = ref("");
const okMsg = ref("");

const editingId = ref(null); // <-- đang sửa sách nào (_id) hay null

const form = reactive({
  code: "",
  title: "",
  author: "",
  price: 0,
  qty: 0,
  publisherId: "",
  language: "vi",
  yearOfPublication:"",
  image: "" 
});

function formatVnd(n) {
  if (n == null) return "-";
  try { return Number(n).toLocaleString("vi-VN") + " ₫"; } catch { return n; }
}
function publisherName(id) {
  const p = publishers.value.find(x => x._id === id);
  return p ? p.name : id || "—";
}
const publishersById = computed(() =>
  Object.fromEntries((publishers.value || []).map(p => [p._id, p.name]))
);

function nameOfPublisher(id) {
  return publishersById.value?.[id] || "—";
}
async function loadBooks() {
  loading.value = true; error.value = ""; okMsg.value = "";
  try {
    const { data } = await Books.listBooks();
    books.value = Array.isArray(data) ? data : [];
  } catch (e) {
    error.value = e?.response?.data?.message || "Không tải được danh sách sách";
  } finally {
    loading.value = false;
  }
}
// Lọc theo ô tìm kiếm (title/code/author)
const filteredBooks = computed(() => {
  if (!q.value) return books.value;
  const kw = q.value.toLowerCase();
  return (books.value || []).filter(b =>
    (b.title  || "").toLowerCase().includes(kw) ||
    (b.code   || "").toLowerCase().includes(kw) ||
    (b.author || "").toLowerCase().includes(kw) ||
    (b.language || "").toLowerCase().includes(kw) ||
    (b.yearOfPublication || "").toLowerCase().includes(kw) ||
    nameOfPublisher(b.publisherId).toLowerCase().includes(kw)
    
  );
});

// Tổng số trang
const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredBooks.value.length / limit.value))
);

// Dữ liệu theo trang
const pagedBooks = computed(() => {
  const start = (page.value - 1) * limit.value;
  return filteredBooks.value.slice(start, start + limit.value);
});

// Điều hướng trang + reset khi tìm kiếm
function go(p) {
  if (p < 1 || p > totalPages.value) return;
  page.value = p;
}
function handleSearch() {
  page.value = 1;
}

async function loadPublishers() {
  try {
    const { data } = await listPublishers();
    publishers.value = Array.isArray(data) ? data : (data?.items || []);
  } catch { publishers.value = []; }
}

function resetForm() {
  Object.assign(form, { code:"", title:"", author:"", price:0, qty:0, publisherId:"", language:"vi",yearOfPublication:"",image:"" });
}


function startEdit(b) {
  editingId.value = b._id;
  Object.assign(form, {
    code: b.code, title: b.title, author: b.author,
    price: b.price, qty: b.qty,
    publisherId: b.publisherId, language: b.language ?? "vi",
    yearOfPublication: b.yearOfPublication,
    image: b.image || ""            // 👈 đưa URL cũ vào form
  });
  selectedFile.value = null;        // chưa chọn file mới
  previewUrl.value = "";            // dùng ảnh từ form.cover để hiển thị
  // scroll lên form nếu muốn…
}
function cancelEdit() {
  editingId.value = null;
  resetForm();
}

async function saveBook() {
  loading.value = true; error.value = ""; okMsg.value = "";
  try {
    // 1) Nếu có chọn file mới -> upload trước để lấy URL
    if (selectedFile.value) {
      const up = await uploadBookImage(selectedFile.value);
      form.image = up?.data?.url || "";   // backend trả { url, filename }
    }

    // 2) Tạo payload
    const payload = { ...form };

    if (!editingId.value) {
      await Books.createBook(payload);
      okMsg.value = "Đã thêm sách.";
    } else {
      const { code, ...patch } = payload; // thường không đổi code
      await Books.updateBook(editingId.value, patch);
      okMsg.value = "Đã cập nhật sách.";
      editingId.value = null;
    }

    await loadBooks();
    resetForm();
    clearImage();
  } catch (e) {
    error.value = e?.response?.data?.message || (editingId.value ? "Cập nhật sách thất bại" : "Thêm sách thất bại");
  } finally {
    loading.value = false;
  }
}
async function removeBook(id) {
  if (!confirm("Xóa sách này?")) return;
  loading.value = true; error.value = ""; okMsg.value = "";
  try {
    await Books.deleteBook(id);
    await loadBooks();
    okMsg.value = "Đã xóa sách.";
  } catch (e) {
    error.value = e?.response?.data?.message || "Xóa sách thất bại";
  } finally {
    loading.value = false;
  }
}
onMounted(async () => {
  if (window.feather) window.feather.replace();
  await Promise.all([loadPublishers(), loadBooks()]);
});
</script>
<style scoped>
.book-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
.book-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.1); }

.bg-primary { background-color: #4f46e5; }
.bg-secondary { background-color: #f8fafc; }
.bg-accent { background-color: #10b981; }

.text-primary { color: #4f46e5; }
.text-secondary { color: #64748b; }
.text-accent { color: #10b981; }

.border-primary { border-color: #4f46e5; }
</style>
