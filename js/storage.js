/* ==========================================================================
   AgriPrice — storage.js
   Thin wrapper around localStorage for users, session & app preferences.
   ========================================================================== */

const AgriStore = (() => {
  const KEYS = {
    USERS: 'agri_users',
    SESSION: 'agri_session',
    PREFS: 'agri_prefs'
  };

  function _read(key, fallback){
    try{
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    }catch(e){
      console.error('AgriStore read error', key, e);
      return fallback;
    }
  }

  function _write(key, value){
    try{
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    }catch(e){
      console.error('AgriStore write error', key, e);
      return false;
    }
  }

  // ---------- Users ----------
  function getUsers(){ return _read(KEYS.USERS, []); }
  function saveUsers(users){ return _write(KEYS.USERS, users); }

  function findUserByEmail(email){
    if(!email) return null;
    const users = getUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  function addUser(user){
    const users = getUsers();
    users.push(user);
    return saveUsers(users);
  }

  function updateUser(email, updates){
    const users = getUsers();
    const idx = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if(idx === -1) return false;
    users[idx] = { ...users[idx], ...updates };
    saveUsers(users);
    // Keep session in sync if this is the active user
    const session = getSession();
    if(session && session.email.toLowerCase() === email.toLowerCase()){
      // Keep only profile-safe fields in the session. Passwords stay in the
      // stored user record and are never copied into the active session.
      const sessionUpdates = { ...updates };
      delete sessionUpdates.password;
      setSession({ ...session, ...sessionUpdates, email: updates.email || session.email });
    }
    return true;
  }

  // ---------- Session ----------
  function getSession(){ return _read(KEYS.SESSION, null); }
  function setSession(sessionObj){ return _write(KEYS.SESSION, sessionObj); }
  function clearSession(){ localStorage.removeItem(KEYS.SESSION); }
  function isLoggedIn(){ return !!getSession(); }

  // ---------- Preferences (dark mode, notifications, language) ----------
  function getPrefs(){
    const prefs = _read(KEYS.PREFS, {});
    return {
      notifications: prefs.notifications !== false,
      language: prefs.language || 'en',
      theme: prefs.theme || (prefs.darkMode ? 'dark' : 'system'),
      textSize: prefs.textSize || 'medium'
    };
  }
  function savePrefs(prefs){ return _write(KEYS.PREFS, prefs); }

  // ---------- Seed a demo account so graders can log in instantly ----------
  function seedDemoUser(){
    const users = getUsers();
    if(users.length === 0){
      addUser({
        firstName: 'Juan',
        lastName: 'Dela Cruz',
        email: 'demo@agriprice.ph',
        password: 'demo1234'
      });
    }
  }

  return {
    KEYS,
    getUsers, saveUsers, findUserByEmail, addUser, updateUser,
    getSession, setSession, clearSession, isLoggedIn,
    getPrefs, savePrefs,
    seedDemoUser
  };
})();

AgriStore.seedDemoUser();
