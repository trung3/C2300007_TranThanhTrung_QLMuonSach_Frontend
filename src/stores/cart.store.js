import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useCartStore = defineStore('cart', () => {
    // 1. STATE: Danh sách sách trong giỏ
    // Lấy từ LocalStorage ra nếu có, không thì là mảng rỗng
    const cart = ref(JSON.parse(localStorage.getItem('myLibraryCart')) || []);

    // 2. GETTERS: Tính toán số liệu
    // Tổng số sách
    const totalItems = computed(() => cart.value.length);
    
    // 3. ACTIONS: Các hàm xử lý
    
    // Thêm sách vào giỏ
    function addToCart(book) {
        // Kiểm tra xem sách đã có chưa
        const exists = cart.value.find(item => item._id === book._id);
        if (exists) {
            alert("Sách này đã có trong giỏ của bạn rồi!");
        } else {
            cart.value.push(book);
            saveToLocalStorage();
            alert("Đã thêm vào giỏ sách!");
        }
    }

    // Xóa sách khỏi giỏ
    function removeFromCart(bookId) {
        if(confirm("Bạn muốn xóa sách này khỏi giỏ?")) {
            cart.value = cart.value.filter(item => item._id !== bookId);
            saveToLocalStorage();
        }
    }

    // Xóa sạch giỏ (sau khi mượn xong)
    function clearCart() {
        cart.value = [];
        saveToLocalStorage();
    }

    // Hàm phụ: Lưu xuống LocalStorage của trình duyệt
    function saveToLocalStorage() {
        localStorage.setItem('myLibraryCart', JSON.stringify(cart.value));
    }

    // Xuất ra để các component khác dùng
    return { cart, totalItems, addToCart, removeFromCart, clearCart };
});