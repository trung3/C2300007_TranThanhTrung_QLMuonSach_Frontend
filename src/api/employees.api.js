import http from "./http";

export const listEmployees = (params) => http.get("/employees", { params });
export const createEmployee = (data) => http.post("/employees", data);
export const updateEmployee = (id, data) => http.put(`/employees/${id}`, data);
export const deleteEmployee = (id) => http.delete(`/employees/${id}`);