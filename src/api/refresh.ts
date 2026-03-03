// src/api/refresh.ts
import axios from "axios";
import { api } from "./api";

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      const refresh = localStorage.getItem("refresh_token");
      if (!refresh) throw error;

      const r = await axios.post("http://127.0.0.1:8000/api/token/refresh/", {
        refresh,
      });

      localStorage.setItem("access_token", r.data.access);

      // retry original request
      error.config.headers.Authorization = `Bearer ${r.data.access}`;
      return api.request(error.config);
    }
    throw error;
  }
);
