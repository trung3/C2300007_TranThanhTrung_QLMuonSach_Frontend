<template>
    <div class="max-w-3xl mx-auto my-10 bg-white p-8 rounded-lg shadow-md border border-gray-200">
        <h2 class="text-2xl font-bold text-blue-700 mb-6 flex items-center gap-2">
            <i data-feather="settings"></i>
            Chỉnh sửa hồ sơ
        </h2>

        <form @submit.prevent="submitUpdate">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Mã độc giả</label>
                    <input :value="localUser.code" disabled class="w-full p-2.5 bg-gray-100 border border-gray-300 rounded cursor-not-allowed font-bold text-gray-500" />
                </div>
                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">Họ và tên <span class="text-red-500">*</span></label>
                    <input v-model="localUser.fullName" required type="text" class="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                    <input v-model="localUser.phone" type="text" class="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                    <select v-model.number="localUser.gender" class="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none">
                        <option :value="1">Nam</option>
                        <option :value="0">Nữ</option>
                        <option :value="2">Khác</option>
                    </select>
                </div>
            </div>

            <div class="mb-4">
                 <label class="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                 <input v-model="localUser.dob" type="date" class="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                <textarea v-model="localUser.address" rows="2" class="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
            </div>

            <div class="border-t border-gray-200 pt-6 mt-6">
                <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <i data-feather="lock" class="w-4 h-4"></i>
                    Đổi mật khẩu <span class="text-sm font-normal text-gray-500 ml-2">(Bỏ trống nếu không muốn đổi)</span>
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                        <input v-model="passwordForm.newPassword" type="password" class="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nhập lại mật khẩu</label>
                        <input v-model="passwordForm.confirmPassword" type="password" class="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" :class="{'border-red-500': passwordError}" />
                        <p v-if="passwordError" class="text-red-500 text-xs mt-1">Mật khẩu không khớp</p>
                    </div>
                </div>
            </div>

            <div v-if="message" :class="`p-3 rounded mb-4 text-sm flex items-center gap-2 ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`">
                <i v-show="isError" data-feather="alert-circle" class="w-4 h-4"></i>
                <i v-show="!isError" data-feather="check-circle" class="w-4 h-4"></i>
                {{ message }}
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t">
                <button type="button" @click="initForm" class="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition font-medium">Hủy / Đặt lại</button>
                <button type="button" @click="submitUpdate" :disabled="loading || passwordError" class="px-6 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition shadow-md flex items-center gap-2 disabled:opacity-70">
                    <span v-if="loading" class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                    {{ loading ? 'Đang lưu...' : 'Lưu hồ sơ' }}
                </button>
            </div>
        </form>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import { updateProfile } from '@/api/auth.api';

// 👇 1. IMPORT THƯ VIỆN THÔNG BÁO
import Swal from 'sweetalert2'; 

const authStore = useAuthStore();
const loading = ref(false);

// (Không cần dùng biến message nữa vì đã có Popup)
const localUser = ref({ code: "", fullName: "", phone: "", address: "", gender: 1, dob: "" });
const passwordForm = ref({ newPassword: "", confirmPassword: "" });

const passwordMismatch = computed(() => {
    const { newPassword, confirmPassword } = passwordForm.value;
    if (!newPassword && !confirmPassword) return false;
    if (!newPassword || !confirmPassword) return true;
    return newPassword !== confirmPassword;
});

const updateIcons = () => {
    nextTick(() => { if (window.feather) window.feather.replace(); });
};

const formatDate = (isoStr) => {
    if (!isoStr) return "";
    try { return new Date(isoStr).toISOString().split('T')[0]; } catch (e) { return ""; }
};

const initForm = () => {
    if (authStore.user) {
        localUser.value = {
            code: authStore.user.code || "",
            fullName: authStore.user.fullName || "",
            phone: authStore.user.phone || "",
            address: authStore.user.address || "",
            gender: authStore.user.gender ?? 1,
            dob: formatDate(authStore.user.dob)
        };
        passwordForm.value.newPassword = "";
        passwordForm.value.confirmPassword = "";
    }
};

watch(() => authStore.user, (newVal) => { if (newVal) initForm(); }, { immediate: true });

onMounted(async () => {
    updateIcons();
    if (!authStore.user || !authStore.user.fullName) {
        if (typeof authStore.fetchMe === 'function') await authStore.fetchMe();
    }
    initForm();
});

const submitUpdate = async () => {
    if (passwordMismatch.value) {
        // 👇 THÔNG BÁO LỖI MẬT KHẨU
        Swal.fire({
            icon: 'error',
            title: 'Lỗi mật khẩu',
            text: 'Mật khẩu xác nhận không khớp!',
            confirmButtonText: 'Đã hiểu'
        });
        return;
    }

    loading.value = true;

    try {
        const payload = {
            fullName: localUser.value.fullName,
            address: localUser.value.address,
            phone: localUser.value.phone,
            gender: Number(localUser.value.gender), 
        };

        if (localUser.value.dob) payload.dob = localUser.value.dob;
        else payload.dob = null;

        if (passwordForm.value.newPassword) payload.password = passwordForm.value.newPassword;

        const res = await updateProfile(payload);
        if (res.data?.user) authStore.user = { ...authStore.user, ...res.data.user };

        // 👇 2. HIỆN POPUP THÀNH CÔNG
        Swal.fire({
            icon: 'success',
            title: 'Thành công!',
            text: 'Hồ sơ của bạn đã được cập nhật.',
            confirmButtonColor: '#3085d6', // Màu xanh
            confirmButtonText: 'OK'
        });

        // Reset ô mật khẩu
        passwordForm.value.newPassword = "";
        passwordForm.value.confirmPassword = "";

    } catch (error) {
        console.error(error);
        // 👇 3. HIỆN POPUP LỖI SERVER
        Swal.fire({
            icon: 'error',
            title: 'Thất bại',
            text: error.response?.data?.message || 'Lỗi cập nhật server (500)',
        });
    } finally {
        loading.value = false;
        updateIcons();
    }
};
</script>