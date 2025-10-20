import http from "./http";

export const login = (payload) => http.post("/auth/login", payload); // {username, password}
export const getMe = () => http.get("/auth/me");
