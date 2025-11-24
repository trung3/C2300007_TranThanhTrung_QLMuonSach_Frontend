import http from "./http";

// GET /api/publishers  ->  [ { _id, code, name, ... }, ... ]
export const listPublishers = (params) => http.get("/publishers", { params });


/** POST /api/books */
export const createPublishers = (data) => http.post("/publishers", data);

/** PUT /api/books/:id */
export const updatePublishers = (id, data) => http.put(`/publishers/${id}`, data);

/** DELETE /api/books/:id */
export const deletePublishers = (id) => http.delete(`/publishers/${id}`);
