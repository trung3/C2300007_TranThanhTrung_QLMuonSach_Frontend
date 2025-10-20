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
          <h3 class="text-xl font-semibold mb-4 text-primary">Danh Sách Sách</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="b in books" :key="b._id" class="book-card bg-white rounded-lg shadow-lg overflow-hidden border border-primary/20">
              <div class="p-4">
                <div class="flex items-center justify-between mb-1">
                  <h3 class="font-semibold text-lg">{{ b.title }}</h3>
                  <span class="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">#{{ b.code }}</span>
                </div>
                <p class="text-gray-600 mb-1">Tác giả: {{ b.author }}</p>
                <p class="text-gray-600 mb-1">NXB: {{ publisherName(b.publisherId) }}</p>
                <p class="text-gray-600 mb-1">Số lượng (qty): <b>{{ b.qty }}</b></p>
                <p class="text-gray-600 mb-3">Giá: {{ formatVnd(b.price) }}</p>

                <div class="flex justify-end gap-2">
                  <button @click="startEdit(b)" class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition">
                    Sửa
                  </button>
                  <button @click="removeBook(b._id)" class="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition">
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          </div>

          <p v-if="!loading && !books.length" class="text-secondary mt-4">Chưa có sách nào.</p>
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
});

function formatVnd(n) {
  if (n == null) return "-";
  try { return Number(n).toLocaleString("vi-VN") + " ₫"; } catch { return n; }
}
function publisherName(id) {
  const p = publishers.value.find(x => x._id === id);
  return p ? p.name : id || "—";
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
async function loadPublishers() {
  try {
    const { data } = await listPublishers();
    publishers.value = Array.isArray(data) ? data : (data?.items || []);
  } catch { publishers.value = []; }
}

function resetForm() {
  Object.assign(form, { code:"", title:"", author:"", price:0, qty:0, publisherId:"", language:"vi" });
}

function startEdit(b) {
  editingId.value = b._id;
  Object.assign(form, {
    code: b.code,            // thường không cho đổi, đã disabled ở input
    title: b.title,
    author: b.author,
    price: b.price,
    qty: b.qty,
    publisherId: b.publisherId,
    language: b.language ?? "vi",
  });
  // cuộn lên form cho tiện
  const el = document.getElementById("books");
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function cancelEdit() {
  editingId.value = null;
  resetForm();
}

async function saveBook() {
  loading.value = true; error.value = ""; okMsg.value = "";
  try {
    const payload = { ...form };
    if (!editingId.value) {
      // THÊM MỚI
      await Books.createBook(payload);
      okMsg.value = "Đã thêm sách.";
    } else {
      // CẬP NHẬT
      // không gửi 'code' nếu backend không cho đổi mã
      const { code, ...patch } = payload;
      await Books.updateBook(editingId.value, patch);
      okMsg.value = "Đã cập nhật sách.";
      editingId.value = null;
    }
    await loadBooks();
    resetForm();
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
