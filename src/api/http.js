import axios from "axios";

const http = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

http.interceptors.request.use(
  (config) => {
    // 1. Thử lấy token trực tiếp
    let token = localStorage.getItem("token");

    // 2. Nếu không có, thử lấy từ object "user" (Do Pinia thường lưu kiểu này)
    if (!token) {
        const userStr = localStorage.getItem("user"); // Hoặc 'auth' tùy bạn đặt tên
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                // Backend trả về tên biến là 'token' hay 'accessToken'?
                token = user.token || user.accessToken; 
            } catch (e) {
                console.error("Lỗi parse user từ LocalStorage", e);
            }
        }
    }

    // 3. Nếu tìm thấy token thì gắn vào Header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default http;