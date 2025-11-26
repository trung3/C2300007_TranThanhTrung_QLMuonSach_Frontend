import http from "./http";

export const uploadBookImage = (file) => {
  const fd = new FormData();
  fd.append("image", file); // Tên 'image' khớp với upload.single('image')

  // 👇 SỬA THÀNH DÒNG NÀY 👇
  return http.post("/uploads/book", fd); 
};