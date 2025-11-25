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
                   class="border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" required>

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
                      class="bg-accent text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                      :disabled="loading">
                {{ loading ? "Đang lưu..." : (editingId ? "Cập nhật" : "Thêm Nhân Viên") }}
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

                <tr v-else v-for="emp in pagedEmployees" :key="emp._id" class="border-t hover:bg-gray-50">
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
                      <button class="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 text-sm"
                              @click="startEdit(emp)">Sửa</button>
                      <button class="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 text-sm"
                              @click="removeEmployee(emp._id)">Xóa</button>
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
            <span class="px-3 py-1">Trang {{ page }} / {{ totalPages }}</span>
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
// LƯU Ý: Bạn cần tạo file api/employees.api.js tương tự như books.api.js
import * as EmpApi from "@/api/employees.api"; 

// --- State ---
const employees = ref([]);
const loading = ref(false);
const error = ref("");
const okMsg = ref("");
const editingId = ref(null);

// Pagination & Search
const page = ref(1);
const limit = ref(10);
const q = ref("");

// Form
const form = reactive({
  code: "",
  fullName: "",
  role: "staff", // mặc định là nhân viên
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

// 1. Load danh sách
async function loadEmployees() {
  loading.value = true;
  try {
    // Gọi API lấy danh sách
    const res = await EmpApi.listEmployees(); 
    employees.value = Array.isArray(res.data) ? res.data : [];
  } catch (e) {
    console.error(e);
    // Nếu chưa có API thì dùng data giả để test giao diện
    // employees.value = [
    //   { _id: '1', code: 'NV001', fullName: 'Nguyễn Văn A', role: 'admin', createdAt: new Date() },
    //   { _id: '2', code: 'NV002', fullName: 'Trần Thị B', role: 'staff', createdAt: new Date() }
    // ];
  } finally {
    loading.value = false;
  }
}

// 2. Chuyển trang
function go(p) {
  if (p >= 1 && p <= totalPages.value) page.value = p;
}
function handleSearch() {
  page.value = 1;
}

// 3. Reset form
function resetForm() {
  Object.assign(form, { code: "", fullName: "", role: "staff", phone: "", address: "", password: "" });
  error.value = "";
  okMsg.value = "";
}

// 4. Bắt đầu sửa
function startEdit(emp) {
  editingId.value = emp._id;
  // Copy dữ liệu vào form (trừ password)
  Object.assign(form, {
    code: emp.code,
    fullName: emp.fullName,
    role: emp.role,
    phone: emp.phone,
    address: emp.address,
    password: "" // Reset password field khi sửa
  });
  // Scroll lên đầu
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 5. Hủy sửa
function cancelEdit() {
  editingId.value = null;
  resetForm();
}

// 6. Lưu (Thêm mới hoặc Cập nhật)
async function saveEmployee() {
  loading.value = true; error.value = ""; okMsg.value = "";
  try {
    const payload = { ...form };
    
    // Nếu đang sửa mà không nhập password thì xóa field đó đi để backend không update password rỗng
    if (editingId.value && !payload.password) {
      delete payload.password;
    }
    let message = "";
    if (!editingId.value) {
      // --- CREATE ---
      await EmpApi.createEmployee(payload);
      message = "Thêm nhân viên thành công!";
    } else {
      // --- UPDATE ---
      // Thường không cho sửa code, nên tách ra
      const { code, ...updateData } = payload;
      await EmpApi.updateEmployee(editingId.value, updateData);
      message = "Cập nhật thành công!";
      editingId.value = null;
    }

    await loadEmployees(); // Load lại list
    if(!editingId.value) resetForm(); // Chỉ reset nếu là thêm mới, sửa xong thì form tự clear ở trên rồi
okMsg.value = message;
  } catch (e) {
    error.value = e?.response?.data?.message || "Có lỗi xảy ra!";
  } finally {
    loading.value = false;
  }
}

// 7. Xóa
async function removeEmployee(id) {
  if (!confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) return;
  
  loading.value = true;
  try {
    await EmpApi.deleteEmployee(id);
    okMsg.value = "Đã xóa nhân viên.";
    await loadEmployees();
  } catch (e) {
    error.value = e?.response?.data?.message || "Xóa thất bại!";
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