import axios from "axios";
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 15000,
  withCredentials: true,
});
// Match these DTOs in the backend adapter.
export const remoteRepository = {
  load: async () => {
    const { data } = await api.get("/frontend/bootstrap");
    return data;
  },
  save: async (collection, record) => {
    const { data } = await api.put(`/${collection}/${record.id}`, record);
    return data;
  },
};
