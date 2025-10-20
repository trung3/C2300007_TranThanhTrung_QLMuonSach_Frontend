import http from "./http";

/** GET /api/books */
export const listBooks = (params) => http.get("/books", { params });

/** POST /api/books */
export const createBook = (data) => http.post("/books", data);

/** PUT /api/books/:id */
export const updateBook = (id, data) => http.put(`/books/${id}`, data);

/** DELETE /api/books/:id */
export const deleteBook = (id) => http.delete(`/books/${id}`);
