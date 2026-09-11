import { get, post, patch } from "./api";
export const userService = {
  profile: (body) => patch("/users/me", body),
  preferences: () => get("/users/me/preferences"),
  savePreferences: (body) => patch("/users/me/preferences", body),
  list: (mao, params) =>
    get(`/admin/${mao ? "mao-accounts" : "users"}`, params),
  save: (mao, id, body) =>
    id
      ? patch(`/admin/${mao ? "mao-accounts" : "users"}/${id}`, body)
      : post("/admin/mao-accounts", body),
};
