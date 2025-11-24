import api from "./http";

export const getAllLoans = () => api.get("/loans");
export const createLoan = (data) => api.post("/loans", data);
export const returnBook = (id) => api.patch(`/loans/${id}/return`);
