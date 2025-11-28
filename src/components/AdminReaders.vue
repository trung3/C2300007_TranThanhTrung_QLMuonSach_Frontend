<template>
  <div class="bg-gray-50 min-h-screen">
    <section id="readers" class="py-16 bg-secondary">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12 text-primary">
          Quản Lý Độc Giả
        </h2>

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
                   :disabled="!!editingId"
                   class="border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100" required>

            <input v-model.trim="form.fullName" placeholder="Họ và tên"
                   class="border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" required>

            <select v-model.number="form.gender"
                    class="border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" required>
              <option :value="1">Nam</option>
              <option :value="0">Nữ</option>
            </select>

            <input v-model="form.dob" type="date"
                   class="border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" required>

            <input v-model.trim="form.address" placeholder="Địa chỉ"
                   class="border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" required>

            <input v-model.trim="form.phone" placeholder="Số điện thoại"
                   class="border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" required>
            
            <div class="md:col-span-3 flex items-center gap-3">
              <button type="submit"
                      class="bg-accent text-white px-6 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                      :disabled="loading">
                <span v-if="loading" class="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
                <span>{{ loading ? "Đang lưu..." : (editingId ? "Cập nhật" : "Thêm") }}</span>
              </button>

              <button v-if="editingId" type="button" class="px-4 py-2 rounded-lg border hover:bg-gray-50 text-gray-700 transition"
                      @click="cancelEdit" :disabled="loading">
                Hủy
              </button>
            </div>
          </form>
        </div>

        <div class="bg-white rounded-lg shadow-lg p-6 border border-primary/10">
          
          <div class="flex flex-wrap items-center justify-between mb-4 gap-3">
            <h3 class="text-xl font-semibold text-primary">Danh Sách Độc Giả</h3>

            <div class="flex items-center gap-2">
              <input v-model.trim="q"
                     @input="handleSearch"
                     placeholder="Tìm theo tên, mã, địa chỉ..."
                     class="border rounded px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-primary">
              <select v-model.number="limit" @change="go(1)" class="border rounded px-2 py-2">
                <option :value="5">5 / trang</option>
                <option :value="10">10 / trang</option>
                <option :value="20">20 / trang</option>
              </select>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full border border-gray-200 rounded-lg overflow-hidden">
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
                <tr v-if="loading && !readers.length">
                  <td colspan="8" class="text-center p-4 text-gray-500">Đang tải…</td>
                </tr>

                <tr v-else-if="!pagedReaders.length">
                  <td colspan="8" class="text-center p-4 text-gray-500">Không có dữ liệu.</td>
                </tr>

                <tr v-else v-for="r in pagedReaders" :key="r._id" class="border-t hover:bg-gray-50 transition">
                  <td class="px-4 py-3 text-indigo-600 font-medium font-mono">#{{ r.code }}</td>
                  <td class="px-4 py-3 font-medium">{{ r.fullName }}</td>
                  <td class="px-4 py-3">{{ r.gender === 1 ? "Nam" : "Nữ" }}</td>
                  <td class="px-4 py-3">{{ formatDate(r.dob) }}</td>
                  <td class="px-4 py-3">{{ r.address }}</td>
                  <td class="px-4 py-3">{{ r.phone }}</td>
                  <td class="px-4 py-3 text-sm text-gray-500">
                    {{ new Date(r.createdAt).toLocaleDateString("vi-VN") }}
                  </td>

                  <td class="px-4 py-3">
                    <div class="flex justify-end gap-2">
                      <button class="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 text-sm font-medium transition"
                              @click="startEdit(r)">Sửa</button>
                      <button class="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 text-sm font-medium transition"
                              @click="removeReader(r._id)">Xóa</button>
                    </div>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>

          <div class="mt-4 flex items-center justify-center gap-2">
            <button class="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                    :disabled="page===1"
                    @click="go(page-1)">« Trước</button>
            <span class="px-3 py-1 font-medium text-primary">Trang {{ page }} / {{ totalPages }}</span>
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
import { ref, reactive, onMounted, computed } from "vue";
import * as Readers from "@/api/readers.api";
import Swal from 'sweetalert2'; // 👈 IMPORT SWAL

const page = ref(1);
const limit = ref(10);
const q = ref("");

const readers = ref([]);
const loading = ref(false);
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

// Format date for Input type="date" (YYYY-MM-DD)
function formatDateInput(d) {
    if(!d) return "";
    return new Date(d).toISOString().split('T')[0];
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("vi-VN");
}

// Load độc giả
async function loadReaders() {
  loading.value = true;
  try {
    const { data } = await Readers.listReaders();
    readers.value = Array.isArray(data) ? data : [];
  } catch {
    Swal.fire('Lỗi', 'Không tải được danh sách độc giả', 'error');
  } finally {
    loading.value = false;
  }
}

// Search
const filteredReaders = computed(() => {
  if (!q.value) return readers.value;
  const kw = q.value.toLowerCase();
  return readers.value.filter(r =>
    (r.fullName || "").toLowerCase().includes(kw) ||
    (r.code || "").toLowerCase().includes(kw) ||
    (r.address || "").toLowerCase().includes(kw) ||
    (r.phone || "").includes(kw)
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
  Object.assign(form, {
      ...r,
      dob: formatDateInput(r.dob) // Format lại ngày để hiển thị lên input date
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelEdit() {
  editingId.value = null;
  resetForm();
}

// ✅ Hàm lưu dùng Swal
async function saveReader() {
  loading.value = true;

  try {
    const payload = { ...form };

    if (!editingId.value) {
      await Readers.createReader(payload);
      Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: 'Đã thêm độc giả mới!',
          timer: 2000,
          showConfirmButton: false
      });
    } else {
      // Remove code from payload to prevent update
      const { code, ...updateData } = payload;
      await Readers.updateReader(editingId.value, updateData);
      Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: 'Đã cập nhật thông tin độc giả!',
          timer: 2000,
          showConfirmButton: false
      });
      editingId.value = null;
    }

    await loadReaders();
    resetForm();
  } catch (e) {
    Swal.fire({
        icon: 'error',
        title: 'Thất bại',
        text: e?.response?.data?.message || "Thao tác thất bại"
    });
  } finally {
    loading.value = false;
  }
}

// ✅ Hàm xóa dùng Swal Confirm
async function removeReader(id) {
  const result = await Swal.fire({
      title: 'Bạn chắc chắn?',
      text: "Xóa độc giả này khỏi hệ thống?",
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
    await Readers.deleteReader(id);
    await loadReaders();
    Swal.fire(
      'Đã xóa!',
      'Độc giả đã được xóa thành công.',
      'success'
    );
  } catch {
    Swal.fire('Lỗi', 'Xóa thất bại', 'error');
  } finally {
    loading.value = false;
  }
}

onMounted(loadReaders);
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