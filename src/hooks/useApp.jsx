import { createId } from "../utils/id";
import { createContext, useContext, useEffect, useState } from "react";
import { mockRepository } from "../services/mockRepository";
import { authService } from "../services/authService";
const Context = createContext(null);
export function AppProvider({ children }) {
  const [data, setData] = useState(null), [error, setError] = useState(""), [toast, setToast] = useState("");
  const [session, setSession] = useState(authService.getSession());
  useEffect(() => { mockRepository.load().then(setData).catch(() => setError("Unable to load AgriPrice information. Please try again.")); }, []);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(""), 4200); return () => clearTimeout(timer); }, [toast]);
  useEffect(() => { document.documentElement.style.fontSize = data?.settings.textSize === "large" ? "18px" : data?.settings.textSize === "small" ? "14px" : "16px"; }, [data?.settings.textSize]);
  function commit(next) { try { mockRepository.save(next); setData(next); return true; } catch { setToast("Unable to save your changes. Please try again."); return false; } }
  function save(collection, record) {
    const exists = data[collection].some((item) => item.id === record.id);
    const next = { ...data, [collection]: exists ? data[collection].map((item) => item.id === record.id ? record : item) : [...data[collection], record], audit: [{ id:createId(), date:new Date().toISOString().slice(0,16).replace('T',' '), actor: session?.name || 'AgriPrice user', action:`${exists ? 'Updated' : 'Added'} ${collection} record`, type:'Application activity', status:'Success' }, ...data.audit] };
    if (commit(next)) setToast("Changes saved successfully.");
  }
  function login(email, password) { const user = authService.login(data.users, email, password); if (!user) { setToast("Incorrect email address or password."); return null; } authService.setSession(user); setSession({id:user.id}); return user; }
  function register(account) { try { authService.register(data.users, account); const next = {...data, users:[...data.users, account]}; if (!commit(next)) return null; authService.setSession(account); setSession({id:account.id}); setToast("Account created successfully."); return account; } catch (err) { setToast(err.message); return null; } }
  function logout() { authService.clearSession(); setSession(null); }
  const activeUser = data?.users.find((user) => user.id === session?.id) || null;
  return <Context.Provider value={{data,error,session:activeUser,save,commit,login,register,logout,notify:setToast}}>{children}{toast && <div className="toast" role="status">{toast}</div>}</Context.Provider>;
}
export const useApp = () => useContext(Context);
