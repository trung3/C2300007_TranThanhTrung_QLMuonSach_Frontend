import http from "./http";

// GET /api/publishers  ->  [ { _id, code, name, ... }, ... ]
export const listPublishers = (params) => http.get("/publishers", { params });
