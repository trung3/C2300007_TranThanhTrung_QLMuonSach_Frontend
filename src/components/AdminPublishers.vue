<template>
  <div class="bg-gray-50 min-h-screen">
    <section id="books" class="py-16 bg-secondary">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12 text-primary">Quản Lý Nhà Xuất Bản</h2>

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
                   :disabled="!!editingId" 
                   class="border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100" required>

            <input v-model.trim="form.name" placeholder="Tên NXB"
                   class="border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" required>

            <input v-model.trim="form.address" placeholder="Địa chỉ"
                   class="border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" required>

            <div class="md:col-span-3 flex items-center gap-3">
              <button type="submit"
                      class="bg-accent text-white px-6 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                      :disabled="loading">
                <span v-if="loading" class="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
                <span>{{ loading ? "Đang lưu..." : (editingId ? "Cập nhật" : "Thêm NXB") }}</span>
              </button>

              <button v-if="editingId" type="button" class="px-4 py-2 rounded-lg border hover:bg-gray-50 text-gray-700 transition"
                      @click="cancelEdit" :disabled="loading">
                Hủy
              </button>
            </div>
          </form>
        </div>

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
                <tr v-if="loading && !publishers.length">
                  <td colspan="5" class="px-4 py-6 text-center text-gray-500">Đang tải dữ liệu...</td>
                </tr>
                <tr v-else-if="!pagedPublishers.length">
                  <td colspan="5" class="px-4 py-6 text-center text-gray-500">Không tìm thấy NXB nào.</td>
                </tr>

                <tr v-else v-for="b in pagedPublishers" :key="b._id" class="border-t hover:bg-gray-50 transition">
                  <td class="px-4 py-3 text-indigo-600 font-medium">#{{ b.code }}</td>
                  <td class="px-4 py-3 font-medium">{{ b.name }}</td>
                  <td class="px-4 py-3">{{ b.address || "—" }}</td>
                  <td class="px-4 py-3 text-sm text-gray-500">
                    {{ new Date(b.createdAt).toLocaleDateString("vi-VN") }}
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex justify-end gap-2">
                      <button class="px-3 py-1 rounded bg-blue-100 text-blue-600 hover:bg-blue-200 text-sm font-medium transition"
                              @click="startEdit(b)">Sửa</button>
                      <button class="px-3 py-1 rounded bg-red-100 text-red-600 hover:bg-red-200 text-sm font-medium transition"
                              @click="removePublishers(b._id)">Xóa</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mt-6 flex items-center justify-center gap-2">
            <button class="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50" 
                    :disabled="page===1 || loading"
                    @click="go(page-1)">« Trước</button>
            <span class="px-3 py-1 font-medium text-primary">Trang {{ page }} / {{ totalPages }}</span>
            <button class="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50" 
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
import * as Publishers from "@/api/publishers.api";
import Swal from 'sweetalert2'; // 👈 IMPORT SWAL

const page = ref(1);
const limit = ref(12);
const q = ref("");
const publishers = ref([]);
const loading = ref(false);
const editingId = ref(null);

const form = reactive({
  code: "",
  name: "",
  address: "",
});

// ✅ Load danh sách NXB
async function loadPublishers() {
  loading.value = true;
  try {
    const { data } = await Publishers.listPublishers();
    publishers.value = Array.isArray(data) ? data : (data?.items || []);
  } catch (e) {
    Swal.fire({
        icon: 'error',
        title: 'Lỗi tải dữ liệu',
        text: e?.response?.data?.message || "Không tải được danh sách NXB",
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
    });
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

// ✅ Lưu hoặc cập nhật NXB (Dùng Swal)
async function savePublishers() {
  loading.value = true;
  try {
    const payload = { ...form };

    if (!editingId.value) {
      await Publishers.createPublishers(payload);
      Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: 'Đã thêm Nhà xuất bản mới!',
          timer: 2000,
          showConfirmButton: false
      });
    } else {
      const { code, ...patch } = payload;
      await Publishers.updatePublishers(editingId.value, patch);
      Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: 'Cập nhật thông tin NXB thành công!',
          timer: 2000,
          showConfirmButton: false
      });
      editingId.value = null;
    }

    await loadPublishers();
    resetForm();
  } catch (e) {
    Swal.fire({
        icon: 'error',
        title: 'Thất bại',
        text: e?.response?.data?.message || "Có lỗi xảy ra khi lưu NXB"
    });
  } finally {
    loading.value = false;
  }
}

// ✅ Xóa NXB (Dùng Swal Confirm)
async function removePublishers(id) {
  const result = await Swal.fire({
      title: 'Xóa NXB này?',
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
    await Publishers.deletePublishers(id);
    await loadPublishers();
    Swal.fire(
      'Đã xóa!',
      'Nhà xuất bản đã được xóa khỏi hệ thống.',
      'success'
    );
  } catch (e) {
    Swal.fire(
      'Lỗi!',
      e?.response?.data?.message || 'Xóa NXB thất bại',
      'error'
    );
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await loadPublishers();
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