import http from "./http"; // Hoặc import request from "@/utils/request" tùy setup của bạn

export const login = (payload) => http.post("/auth/login", payload);

export const getMe = () => http.get("/auth/me");

// 👇 Chỉ gửi dữ liệu đi, KHÔNG xử lý logic hash pass ở đây
export const updateProfile = (data) => http.put("/auth/profile", data);