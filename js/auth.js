/* ==========================================================================
   AgriPrice — auth.js
   Register / Login / Logout / Route guarding, all via localStorage.
   ========================================================================== */

const AgriAuth = (() => {

  function requireAuth(){
    if(!AgriStore.isLoggedIn()){
      window.location.href = 'login.html';
    }
  }

  function redirectIfAuthed(){
    if(AgriStore.isLoggedIn()){
      window.location.href = 'dashboard.html';
    }
  }

  function logout(){
    AgriStore.clearSession();
    window.location.href = 'login.html';
  }

  // ---------- Register form wiring ----------
  function initRegisterForm(){
    const form = document.getElementById('registerForm');
    if(!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const firstName = document.getElementById('firstName');
      const lastName = document.getElementById('lastName');
      const email = document.getElementById('email');
      const password = document.getElementById('password');
      const confirmPassword = document.getElementById('confirmPassword');
      const alertBox = document.getElementById('authAlert');

      let valid = true;
      [firstName, lastName, email, password, confirmPassword].forEach(f => {
        AgriUtils.clearFieldError(f.closest('.form-group'));
      });
      if(alertBox) alertBox.style.display = 'none';

      if(!firstName.value.trim()){
        AgriUtils.setFieldError(firstName.closest('.form-group'), 'First name is required.'); valid = false;
      }
      if(!lastName.value.trim()){
        AgriUtils.setFieldError(lastName.closest('.form-group'), 'Last name is required.'); valid = false;
      }
      if(!email.value.trim()){
        AgriUtils.setFieldError(email.closest('.form-group'), 'Email is required.'); valid = false;
      } else if(!AgriUtils.isValidEmail(email.value.trim())){
        AgriUtils.setFieldError(email.closest('.form-group'), 'Enter a valid email address.'); valid = false;
      }
      if(!password.value){
        AgriUtils.setFieldError(password.closest('.form-group'), 'Password is required.'); valid = false;
      } else if(!AgriUtils.isValidPassword(password.value)){
        AgriUtils.setFieldError(password.closest('.form-group'), 'Password must be at least 8 characters.'); valid = false;
      }
      if(!confirmPassword.value){
        AgriUtils.setFieldError(confirmPassword.closest('.form-group'), 'Please confirm your password.'); valid = false;
      } else if(password.value && confirmPassword.value !== password.value){
        AgriUtils.setFieldError(confirmPassword.closest('.form-group'), 'Passwords do not match.'); valid = false;
      }

      if(valid && AgriStore.findUserByEmail(email.value.trim())){
        AgriUtils.setFieldError(email.closest('.form-group'), 'An account with this email already exists.');
        valid = false;
      }

      if(!valid) return;

      const submitBtn = form.querySelector('button[type=submit]');
      const originalHtml = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span> Creating account…';

      setTimeout(() => {
        AgriStore.addUser({
          firstName: firstName.value.trim(),
          lastName: lastName.value.trim(),
          email: email.value.trim(),
          password: password.value
        });

        if(alertBox){
          alertBox.className = 'auth-alert success';
          alertBox.style.display = 'flex';
          alertBox.innerHTML = '<i class="fa-solid fa-circle-check"></i> <div>Account created successfully! Redirecting to login…</div>';
        }
        AgriUtils.toast('Your account has been created.', 'success', 'Welcome to AgriPrice');

        setTimeout(() => { window.location.href = 'login.html'; }, 1400);
      }, 700);
    });
  }

  // ---------- Login form wiring ----------
  function initLoginForm(){
    const form = document.getElementById('loginForm');
    if(!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const email = document.getElementById('email');
      const password = document.getElementById('password');
      const remember = document.getElementById('rememberMe');
      const alertBox = document.getElementById('authAlert');

      [email, password].forEach(f => AgriUtils.clearFieldError(f.closest('.form-group')));
      if(alertBox) alertBox.style.display = 'none';

      let valid = true;
      if(!email.value.trim()){
        AgriUtils.setFieldError(email.closest('.form-group'), 'Email is required.'); valid = false;
      }
      if(!password.value){
        AgriUtils.setFieldError(password.closest('.form-group'), 'Password is required.'); valid = false;
      }
      if(!valid) return;

      const submitBtn = form.querySelector('button[type=submit]');
      const originalHtml = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span> Signing in…';

      setTimeout(() => {
        const user = AgriStore.findUserByEmail(email.value.trim());

        if(!user || user.password !== password.value){
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalHtml;
          if(alertBox){
            alertBox.className = 'auth-alert error';
            alertBox.style.display = 'flex';
            alertBox.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> <div>Incorrect email or password. Please try again.</div>';
          }
          AgriUtils.toast('Incorrect email or password.', 'error', 'Login failed');
          return;
        }

        AgriStore.setSession({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          loggedInAt: new Date().toISOString(),
          remember: !!(remember && remember.checked)
        });

        AgriUtils.toast(`Welcome back, ${user.firstName}!`, 'success', 'Logged in');
        setTimeout(() => { window.location.href = 'dashboard.html'; }, 500);
      }, 650);
    });
  }

  return { requireAuth, redirectIfAuthed, logout, initRegisterForm, initLoginForm };
})();
