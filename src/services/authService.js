const SESSION_KEY = "agriprice.session.v2";

export const authService = {
  getSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; }
  },
  setSession(user) { localStorage.setItem(SESSION_KEY, JSON.stringify({ id: user.id })); },
  clearSession() { localStorage.removeItem(SESSION_KEY); },
  login(users, email, password) {
    const user = users.find((item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.password === password && item.status === "Active");
    return user || null;
  },
  verifyCurrentPassword(user, password) { return Boolean(user && password && user.password === password); },
  changePassword(user, currentPassword, nextPassword) { if (!this.verifyCurrentPassword(user, currentPassword)) return false; user.password = nextPassword; return true; },
  register(users, account) {
    if (users.some((user) => user.email.toLowerCase() === account.email.toLowerCase())) throw new Error("An account with this email address already exists.");
    return account;
  },
};
