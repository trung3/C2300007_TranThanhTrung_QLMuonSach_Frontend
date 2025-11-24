<template>
  <div class="bg-gray-50 min-h-screen">
    <section id="books" class="py-16 bg-secondary">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12 text-primary">Quản Lý Nhà Xuất Bản</h2>

        <!-- Form thêm/sửa NXB -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-8 border border-primary/10">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-semibold text-primary">
              {{ editingId ? "Sửa NXB" : "Thêm NXB Mới" }}
            </h3>
            <span v-if="editingId" class="text-sm text-secondary">
              Đang sửa: <b>{{ form.name }}</b>
            </span>
          </div>

          <form class="grid grid-cols-1 md:grid-cols-3 gap-4" @submit.prevent="savePublishers">
            <input v-model.trim="form.code" placeholder="Mã NXB (vd: NXB001)"
                   :disabled="editingId" 
                   class="border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" required>

            <input v-model.trim="form.name" placeholder="Tên NXB"
                   class="border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" required>

            <input v-model.trim="form.address" placeholder="Địa chỉ"
                   class="border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" required>

            <div class="md:col-span-3 flex items-center gap-3">
              <button type="submit"
                      class="bg-accent text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                      :disabled="loading">
                {{ loading ? "Đang lưu..." : (editingId ? "Cập nhật" : "Thêm NXB") }}
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

        <!-- Danh sách NXB -->
        <div class="bg-white rounded-lg shadow p-6 border border-primary/10 mt-6">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 class="text-xl font-semibold text-primary">Danh Sách NXB</h3>

            <div class="flex items-center gap-2">
              <input v-model.trim="q"
                     @input="handleSearch"
                     placeholder="Tìm kiếm NXB..."
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
                  <th class="px-4 py-3">Mã</th>
                  <th class="px-4 py-3">Tên NXB</th>
                  <th class="px-4 py-3">Địa chỉ</th>
                  <th class="px-4 py-3">Tạo lúc</th>
                  <th class="px-4 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loading">
                  <td colspan="10" class="px-4 py-6 text-center text-gray-500">Đang tải…</td>
                </tr>
                <tr v-else-if="!pagedPublishers.length">
                  <td colspan="10" class="px-4 py-6 text-center text-gray-500">Không có NXB nào.</td>
                </tr>

                <tr v-else v-for="b in pagedPublishers" :key="b._id" class="border-t hover:bg-gray-50">
                  <td class="px-4 py-3 text-indigo-600 font-medium">#{{ b.code }}</td>
                  <td class="px-4 py-3 font-medium">{{ b.name }}</td>
                  <td class="px-4 py-3">{{ b.address || "—" }}</td>
                  <td class="px-4 py-3">{{ b.createdAt }}</td>
                  <td class="px-4 py-3">
                    <div class="flex justify-end gap-2">
                      <button class="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
                              @click="startEdit(b)">Sửa</button>
                      <button class="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
                              @click="removePublishers(b._id)">Xóa</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

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
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import * as Publishers from "@/api/publishers.api"; // ✅ Import module API đúng
import { uploadBookImage } from "@/api/uploads.api";

const page = ref(1);
const limit = ref(12);
const q = ref("");
const publishers = ref([]);
const loading = ref(false);
const error = ref("");
const okMsg = ref("");
const editingId = ref(null);

const form = reactive({
  code: "",
  name: "",
  address: "",
});

// ✅ Load danh sách NXB (chỉ 1 hàm duy nhất)
async function loadPublishers() {
  loading.value = true;
  error.value = "";
  okMsg.value = "";
  try {
    const { data } = await Publishers.listPublishers();
    publishers.value = Array.isArray(data) ? data : (data?.items || []);
  } catch (e) {
    error.value = e?.response?.data?.message || "Không tải được danh sách NXB";
  } finally {
    loading.value = false;
  }
}

// Lọc theo ô tìm kiếm
const filteredPublishers = computed(() => {
  if (!q.value) return publishers.value;
  const kw = q.value.toLowerCase();
  return (publishers.value || []).filter(b =>
    (b.name || "").toLowerCase().includes(kw) ||
    (b.code || "").toLowerCase().includes(kw)
  );
});

// Phân trang
const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredPublishers.value.length / limit.value))
);
const pagedPublishers = computed(() => {
  const start = (page.value - 1) * limit.value;
  return filteredPublishers.value.slice(start, start + limit.value);
});
function go(p) {
  if (p < 1 || p > totalPages.value) return;
  page.value = p;
}
function handleSearch() {
  page.value = 1;
}

// Form helpers
function resetForm() {
  Object.assign(form, { code: "", name: "", address: "" });
}
function startEdit(b) {
  editingId.value = b.id || b._id;
  Object.assign(form, { code: b.code, name: b.name, address: b.address });
}
function cancelEdit() {
  editingId.value = null;
  resetForm();
}

// ✅ Lưu hoặc cập nhật NXB
async function savePublishers() {
  loading.value = true;
  error.value = "";
  okMsg.value = "";
  try {
    const payload = { ...form };

    if (!editingId.value) {
      await Publishers.createPublishers(payload);
      okMsg.value = "Đã thêm NXB.";
    } else {
      const { code, ...patch } = payload;
      await Publishers.updatePublishers(editingId.value, patch);
      okMsg.value = "Đã cập nhật NXB.";
      editingId.value = null;
    }

    await loadPublishers();
    
    resetForm();
  } catch (e) {
    error.value = e?.response?.data?.message || (editingId.value ? "Cập nhật NXB thất bại" : "Thêm NXB thất bại");
  } finally {
    loading.value = false;
  }
}

// ✅ Xóa NXB
async function removePublishers(id) {
  if (!confirm("Xóa NXB này?")) return;
  loading.value = true;
  error.value = "";
  okMsg.value = "";
  try {
    await Publishers.deletePublishers(id);
    await loadPublishers();
    okMsg.value = "Đã xóa NXB.";
  } catch (e) {
    error.value = e?.response?.data?.message || "Xóa NXB thất bại";
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await loadPublishers();
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
