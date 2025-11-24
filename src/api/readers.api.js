import http from "./http";

/** GET /api/readers */
export const listReaders = (params) => http.get("/readers", { params });

/** POST /api/readers */
export const createReader = (data) => http.post("/readers", data);

/** PUT /api/readers/:id */
export const updateReader = (id, data) => http.put(`/readers/${id}`, data);

/** DELETE /api/readers/:id */
export const deleteReader = (id) => http.delete(`/readers/${id}`);
