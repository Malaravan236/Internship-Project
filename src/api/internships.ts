// src/api/internships.ts
import { api } from "./api";

export const getInternships = async () => {
  const res = await api.get("internships/");
  return res.data;
};

export const getApplications = async () => {
  const res = await api.get("applications/");
  return res.data;
};
