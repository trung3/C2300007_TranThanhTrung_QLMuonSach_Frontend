import http from "./http";

export const uploadBookImage = (file) => {
    // 1. Phải tạo FormData
    const formData = new FormData();
    
    // 2. 'image' là tên trường mà Backend (Multer) đang chờ
    // (Phải khớp với bên Backend, xem Bước B)
    formData.append("image", file); 

    return http.post("/uploads/book", formData, {
        headers: {
            "Content-Type": "multipart/form-data", // Bắt buộc dòng này
        },
    });
};