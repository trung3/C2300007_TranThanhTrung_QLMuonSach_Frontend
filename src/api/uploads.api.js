import http from "./http";

// file: File
export const uploadBookImage = (file) => {
  const fd = new FormData();
  fd.append("image", file);          // field name = "image" (đúng với backend)
  // không set Content-Type, axios sẽ tự thêm boundary
  return http.post("/uploads/book", fd);
};
