// src/api/auth.ts
import { api } from "./api";

export async function login(username: string, password: string) {
  // ✅ Django SimpleJWT default endpoint
  const res = await api.post("token/", { username, password });

  localStorage.setItem("access_token", res.data.access);
  localStorage.setItem("refresh_token", res.data.refresh);

  return res.data;
}
