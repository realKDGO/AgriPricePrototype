import { initialData } from "../data/mock/seed";
const KEY = "agriprice.local.v3";
export const mockRepository = {
  async load() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : structuredClone(initialData);
    } catch {
      return structuredClone(initialData);
    }
  },
  save(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  },
  reset() {
    localStorage.removeItem(KEY);
    return structuredClone(initialData);
  },
};
