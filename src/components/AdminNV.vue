<template>
  <div class="bg-gray-50 min-h-screen">
    <section id="employees" class="py-16 bg-secondary">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12 text-primary">Quản Lý Nhân Viên</h2>

        <div class="bg-white rounded-lg shadow-lg p-6 mb-8 border border-primary/10">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-semibold text-primary">
              {{ editingId ? "Sửa Nhân Viên" : "Thêm Nhân Viên Mới" }}
            </h3>
            <span v-if="editingId" class="text-sm text-secondary">
              Đang sửa: <b>{{ form.fullName }}</b>
            </span>
          </div>

          <form class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" @submit.prevent="saveEmployee">
            <input v-model.trim="form.code" placeholder="Mã NV (vd: NV001)"
                   :disabled="!!editingId"
                   class="border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100" required>

            <input v-model.trim="form.fullName" placeholder="Họ và tên"
                   class="border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" required>

            <select v-model="form.role"
                    class="border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" required>
              <option value="staff">Nhân viên (Staff)</option>
              <option value="admin">Quản lý (Admin)</option>
            </select>

            <input v-model.trim="form.phone" placeholder="Số điện thoại"
                   class="border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary">

            <input v-model.trim="form.address" placeholder="Địa chỉ"
                   class="border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary">

            <input v-model.trim="form.password" type="password" 
                   :placeholder="editingId ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu'"
                   :required="!editingId"
                   class="border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary">

            <div class="md:col-span-2 lg:col-span-3 flex items-center gap-3 mt-2">
              <button type="submit"
                      class="bg-accent text-white px-6 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                      :disabled="loading">
                <span v-if="loading" class="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
                <span>{{ loading ? "Đang lưu..." : (editingId ? "Cập nhật" : "Thêm Nhân Viên") }}</span>
              </button>

              <button v-if="editingId" type="button" class="px-4 py-2 rounded-lg border hover:bg-gray-50 text-gray-700 transition"
                      @click="cancelEdit" :disabled="loading">
                Hủy
              </button>
            </div>
          </form>
        </div>

        <div class="bg-white rounded-lg shadow-lg p-6 border border-primary/10">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 class="text-xl font-semibold text-primary">Danh Sách Nhân Viên</h3>

            <div class="flex items-center gap-2">
              <input v-model.trim="q"
                     @input="handleSearch"
                     placeholder="Tìm theo tên, mã, sđt..."
                     class="border rounded px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-primary"/>
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
                  <th class="px-4 py-3">Mã NV</th>
                  <th class="px-4 py-3">Họ tên</th>
                  <th class="px-4 py-3">Chức vụ</th>
                  <th class="px-4 py-3">SĐT</th>
                  <th class="px-4 py-3">Địa chỉ</th>
                  <th class="px-4 py-3">Ngày tạo</th>
                  <th class="px-4 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loading && !employees.length">
                  <td colspan="7" class="px-4 py-6 text-center text-gray-500">Đang tải…</td>
                </tr>
                <tr v-else-if="!pagedEmployees.length">
                  <td colspan="7" class="px-4 py-6 text-center text-gray-500">
                    Không có nhân viên nào.
                  </td>
                </tr>

                <tr v-else v-for="emp in pagedEmployees" :key="emp._id" class="border-t hover:bg-gray-50 transition">
                  <td class="px-4 py-3 text-indigo-600 font-medium font-mono">{{ emp.code }}</td>
                  <td class="px-4 py-3 font-medium">{{ emp.fullName }}</td>
                  <td class="px-4 py-3">
                    <span :class="emp.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'" 
                          class="px-2 py-1 rounded text-xs font-bold uppercase">
                      {{ emp.role }}
                    </span>
                  </td>
                  <td class="px-4 py-3">{{ emp.phone || "—" }}</td>
                  <td class="px-4 py-3">{{ emp.address || "—" }}</td>
                  <td class="px-4 py-3 text-sm text-gray-500">
                    {{ new Date(emp.createdAt).toLocaleDateString("vi-VN") }}
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex justify-end gap-2">
                      <button class="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 text-sm font-medium transition"
                              @click="startEdit(emp)">Sửa</button>
                      <button class="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 text-sm font-medium transition"
                              @click="removeEmployee(emp._id)">Xóa</button>
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
import { ref, reactive, computed, onMounted } from "vue";
import * as EmpApi from "@/api/employees.api"; 
import Swal from 'sweetalert2'; // 👈 IMPORT SWAL

const employees = ref([]);
const loading = ref(false);
const editingId = ref(null);

const page = ref(1);
const limit = ref(10);
const q = ref("");

const form = reactive({
  code: "",
  fullName: "",
  role: "staff",
  phone: "",
  address: "",
  password: ""
});

// --- Computed ---
const filteredEmployees = computed(() => {
  if (!q.value) return employees.value;
  const kw = q.value.toLowerCase();
  return employees.value.filter(e => 
    (e.fullName || "").toLowerCase().includes(kw) ||
    (e.code || "").toLowerCase().includes(kw) ||
    (e.phone || "").includes(kw)
  );
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredEmployees.value.length / limit.value)));

const pagedEmployees = computed(() => {
  const start = (page.value - 1) * limit.value;
  return filteredEmployees.value.slice(start, start + limit.value);
});

// --- Actions ---
async function loadEmployees() {
  loading.value = true;
  try {
    const res = await EmpApi.listEmployees(); 
    employees.value = Array.isArray(res.data) ? res.data : [];
  } catch (e) {
    Swal.fire('Lỗi', 'Không tải được danh sách nhân viên', 'error');
  } finally {
    loading.value = false;
  }
}

function go(p) {
  if (p >= 1 && p <= totalPages.value) page.value = p;
}
function handleSearch() {
  page.value = 1;
}

function resetForm() {
  Object.assign(form, { code: "", fullName: "", role: "staff", phone: "", address: "", password: "" });
}

function startEdit(emp) {
  editingId.value = emp._id;
  Object.assign(form, {
    code: emp.code,
    fullName: emp.fullName,
    role: emp.role,
    phone: emp.phone,
    address: emp.address,
    password: "" 
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelEdit() {
  editingId.value = null;
  resetForm();
}

// ✅ Hàm lưu đã sửa (Dùng Swal)
async function saveEmployee() {
  loading.value = true;
  try {
    const payload = { ...form };
    
    if (editingId.value && !payload.password) {
      delete payload.password;
    }

    if (!editingId.value) {
      await EmpApi.createEmployee(payload);
      Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: 'Thêm nhân viên mới thành công!',
          timer: 2000,
          showConfirmButton: false
      });
    } else {
      const { code, ...updateData } = payload;
      await EmpApi.updateEmployee(editingId.value, updateData);
      Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: 'Cập nhật thông tin nhân viên thành công!',
          timer: 2000,
          showConfirmButton: false
      });
      editingId.value = null;
    }

    await loadEmployees();
    if(!editingId.value) resetForm(); 
  } catch (e) {
    Swal.fire({
        icon: 'error',
        title: 'Thất bại',
        text: e?.response?.data?.message || "Có lỗi xảy ra!"
    });
  } finally {
    loading.value = false;
  }
}

// ✅ Hàm xóa đã sửa (Dùng Swal Confirm)
async function removeEmployee(id) {
  const result = await Swal.fire({
      title: 'Bạn chắc chắn?',
      text: "Xóa nhân viên này sẽ không thể khôi phục!",
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
    await EmpApi.deleteEmployee(id);
    await loadEmployees();
    Swal.fire(
      'Đã xóa!',
      'Nhân viên đã được xóa khỏi hệ thống.',
      'success'
    );
  } catch (e) {
    Swal.fire(
      'Lỗi!',
      e?.response?.data?.message || 'Xóa thất bại',
      'error'
    );
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadEmployees();
});
</script>

<style scoped>
.bg-primary { background-color: #4f46e5; }
.bg-secondary { background-color: #f8fafc; }
.bg-accent { background-color: #10b981; }

.text-primary { color: #4f46e5; }
.text-secondary { color: #64748b; }

.border-primary { border-color: #4f46e5; }
</style>