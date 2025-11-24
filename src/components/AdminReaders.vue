<template>
  <div class="bg-gray-50 min-h-screen">
    <section id="readers" class="py-16 bg-secondary">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12 text-primary">
          Quản Lý Độc Giả
        </h2>

        <!-- Form thêm/sửa -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-8 border border-primary/10">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-semibold text-primary">
              {{ editingId ? "Sửa Độc Giả" : "Thêm Độc Giả" }}
            </h3>
            <span v-if="editingId" class="text-sm text-secondary">
              Đang sửa: <b>{{ form.fullName }}</b>
            </span>
          </div>

          <form class="grid grid-cols-1 md:grid-cols-3 gap-4" @submit.prevent="saveReader">
            
            <input v-model.trim="form.code" placeholder="Mã độc giả (VD: DG001)"
                   :disabled="editingId"
                   class="border border-primary rounded-lg px-4 py-2" required>

            <input v-model.trim="form.fullName" placeholder="Họ và tên"
                   class="border border-primary rounded-lg px-4 py-2" required>

            <select v-model.number="form.gender"
                    class="border border-primary rounded-lg px-4 py-2" required>
              <option :value="1">Nam</option>
              <option :value="0">Nữ</option>
            </select>

            <input v-model="form.dob" type="date"
                   class="border border-primary rounded-lg px-4 py-2" required>

            <input v-model.trim="form.address" placeholder="Địa chỉ"
                   class="border border-primary rounded-lg px-4 py-2" required>

            <input v-model.trim="form.phone" placeholder="Số điện thoại"
                   class="border border-primary rounded-lg px-4 py-2" required>
            
      <div class="md:col-span-3 flex items-center gap-3">
        <button type="submit"
                class="bg-accent text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                :disabled="loading">
          {{ loading ? "Đang lưu..." : (editingId ? "Cập nhật" : "Thêm") }}
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
                         
      
       

        <!-- Danh sách độc giả -->
        <div class="bg-white rounded-lg shadow-lg p-6 border border-primary/10">
          
          <div class="flex flex-wrap items-center justify-between mb-4">
            <h3 class="text-xl font-semibold text-primary">Danh Sách Độc Giả</h3>

            <input v-model.trim="q"
                   @input="handleSearch"
                   placeholder="Tìm theo tên, mã, địa chỉ..."
                   class="border rounded px-3 py-2 w-64 focus:outline-none">
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full border border-gray-200 rounded-lg">
              <thead class="bg-gray-50">
                <tr class="text-left text-sm text-gray-600">
                  <th class="px-4 py-3">Mã</th>
                  <th class="px-4 py-3">Họ tên</th>
                  <th class="px-4 py-3">Giới tính</th>
                  <th class="px-4 py-3">Ngày sinh</th>
                  <th class="px-4 py-3">Địa chỉ</th>
                  <th class="px-4 py-3">Số điện thoại</th>
                  <th class="px-4 py-3">Tạo lúc</th>
                  <th class="px-4 py-3 text-right">Hành động</th>
                </tr>
              </thead>

              <tbody>
                <tr v-if="loading">
                  <td colspan="8" class="text-center p-4 text-gray-500">Đang tải…</td>
                </tr>

                <tr v-else-if="!pagedReaders.length">
                  <td colspan="8" class="text-center p-4 text-gray-500">Không có dữ liệu.</td>
                </tr>

                <tr v-for="r in pagedReaders" :key="r._id" class="border-t hover:bg-gray-50">
                  <td class="px-4 py-3 text-indigo-600 font-medium">#{{ r.code }}</td>
                  <td class="px-4 py-3">{{ r.fullName }}</td>
                  <td class="px-4 py-3">{{ r.gender === 1 ? "Nam" : "Nữ" }}</td>
                  <td class="px-4 py-3">{{ formatDate(r.dob) }}</td>
                  <td class="px-4 py-3">{{ r.address }}</td>
                  <td class="px-4 py-3">{{ r.phone }}</td>
                  <td class="px-4 py-3">
                    {{ new Date(r.createdAt).toLocaleString("vi-VN") }}
                  </td>

                  <td class="px-4 py-3">
                    <div class="flex justify-end gap-2">
                      <button class="px-3 py-1 rounded bg-blue-500 text-white"
                              @click="startEdit(r)">Sửa</button>
                      <button class="px-3 py-1 rounded bg-red-500 text-white"
                              @click="removeReader(r._id)">Xóa</button>
                    </div>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>

          <div class="mt-4 flex items-center justify-center gap-2">
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
import { ref, reactive, onMounted, computed } from "vue";
import * as Readers from "@/api/readers.api";

const page = ref(1);
const limit = ref(10);
const q = ref("");

const readers = ref([]);
const loading = ref(false);
const error = ref("");
const okMsg = ref("");

const editingId = ref(null);

const form = reactive({
  code: "",
  fullName: "",
  gender: 1,
  dob: "",
  address: "",
  phone: ""
});

function resetForm() {
  Object.assign(form, {
    code: "",
    fullName: "",
    gender: 1,
    dob: "",
    address: "",
    phone: ""
  });
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("vi-VN");
}

// Load độc giả
async function loadReaders() {
  loading.value = true;
  error.value = "";
  try {
    const { data } = await Readers.listReaders();
    readers.value = data;
  } catch {
    error.value = "Không tải được danh sách";
  } finally {
    loading.value = false;
  }
}

// Search
const filteredReaders = computed(() => {
  if (!q.value) return readers.value;
  const kw = q.value.toLowerCase();
  return readers.value.filter(r =>
    r.fullName.toLowerCase().includes(kw) ||
    r.code.toLowerCase().includes(kw) ||
    r.address.toLowerCase().includes(kw) ||
    r.phone.includes(kw)
  );
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredReaders.value.length / limit.value))
);

const pagedReaders = computed(() => {
  const start = (page.value - 1) * limit.value;
  return filteredReaders.value.slice(start, start + limit.value);
});

function go(p) {
  if (p < 1 || p > totalPages.value) return;
  page.value = p;
}

function handleSearch() {
  page.value = 1;
}

function startEdit(r) {
  editingId.value = r._id;
  Object.assign(form, r);
}

function cancelEdit() {
  editingId.value = null;
  resetForm();
}

async function saveReader() {
  loading.value = true;
  error.value = "";
  okMsg.value = "";

  try {
    if (!editingId.value) {
      await Readers.createReader({ ...form });
      okMsg.value = "Đã thêm độc giả.";
    } else {
      await Readers.updateReader(editingId.value, { ...form });
      okMsg.value = "Đã cập nhật.";
      editingId.value = null;
    }

    await loadReaders();
    resetForm();
  } catch (e) {
    error.value = e?.response?.data?.message || "Thao tác thất bại";
  } finally {
    loading.value = false;
  }
}

async function removeReader(id) {
  if (!confirm("Xóa độc giả này?")) return;
  loading.value = true;

  try {
    await Readers.deleteReader(id);
    await loadReaders();
    okMsg.value = "Đã xóa.";
  } catch {
    error.value = "Xóa thất bại";
  } finally {
    loading.value = false;
  }
}

onMounted(loadReaders);
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
