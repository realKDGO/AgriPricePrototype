import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Brand, Field } from "../../components/common/UI";
import { useApp } from "../../hooks/useApp";
import { authService } from "../../services/authService";

const destination = (role) =>
  role === "MAO" ? "/mao" : role === "ADMIN" ? "/admin" : "/farmer";

function ErrorText({ id, children }) {
  return children ? (
    <small id={id} className="auth-field-error" role="alert">
      {children}
    </small>
  ) : null;
}

function TextField({ label, name, error, ...props }) {
  const errorId = `${name}-error`;
  return (
    <Field label={label}>
      <input
        name={name}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      <ErrorText id={errorId}>{error}</ErrorText>
    </Field>
  );
}

function Password({
  name,
  value,
  onChange,
  onBlur,
  error,
  label = "Password",
  autoComplete = "current-password",
}) {
  const [show, setShow] = useState(false);
  const errorId = `${name}-error`;
  return (
    <Field label={label}>
      <div className="password-field">
        <input
          name={name}
          type={show ? "text" : "password"}
          required
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
        />
        <button
          type="button"
          className="password-toggle"
          aria-label={show ? "Hide password" : "Show password"}
          onClick={() => setShow(!show)}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      <ErrorText id={errorId}>{error}</ErrorText>
    </Field>
  );
}

export default function Auth({ mode = "login" }) {
  const { login, register, notify } = useApp();
  const navigate = useNavigate();
  const formRef = useRef(null);
  const isRegister = mode === "register";
  const isForgot = mode === "forgot";
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm: "",
    rememberMe: false,
    acceptTerms: false,
  });

  const messageFor = (name, values = form) => {
    const value = values[name];
    if (name === "firstName" && !value.trim()) return "First name is required.";
    if (name === "lastName" && !value.trim()) return "Last name is required.";
    if (name === "email") {
      if (!value.trim()) return "Email address is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()))
        return "Enter a valid email address.";
    }
    if (name === "password") {
      if (!value) return "Password is required.";
      if (isRegister && value.length < 8)
        return "Password must contain at least 8 characters.";
    }
    if (name === "confirm") {
      if (!value) return "Please confirm your password.";
      if (value !== values.password) return "Passwords do not match.";
    }
    if (name === "acceptTerms" && !value)
      return "You must agree to the Terms and acknowledge the Privacy Policy.";
    return "";
  };

  const relevantFields = () => [
    ...(isRegister ? ["firstName", "lastName"] : []),
    "email",
    ...(!isForgot ? ["password"] : []),
    ...(isRegister ? ["confirm", "acceptTerms"] : []),
  ];

  const setValue = (name, value) => {
    const next = { ...form, [name]: value };
    setForm(next);
    if (errors[name])
      setErrors((current) => ({ ...current, [name]: messageFor(name, next) }));
    if (name === "password" && errors.confirm)
      setErrors((current) => ({
        ...current,
        confirm: messageFor("confirm", next),
      }));
  };

  const validateField = (name) =>
    setErrors((current) => ({ ...current, [name]: messageFor(name) }));

  const focusField = (name) =>
    requestAnimationFrame(() =>
      formRef.current?.querySelector(`[name="${name}"]`)?.focus(),
    );

  const validateForm = () => {
    const next = Object.fromEntries(
      relevantFields().map((name) => [name, messageFor(name)]),
    );
    setErrors(next);
    const first = relevantFields().find((name) => next[name]);
    if (first) focusField(first);
    return !first;
  };

  const applyServerErrors = (error) => {
    const response = error.response;
    const next = {};
    for (const issue of response?.data?.errors || []) {
      const key = issue.field === "confirmPassword" ? "confirm" : issue.field;
      if (relevantFields().includes(key)) next[key] = issue.message;
    }
    if (!Object.keys(next).length) {
      if (isRegister && response?.status === 409)
        next.email = "An account with this email address already exists.";
      else if (!isRegister && !isForgot && response?.status === 401)
        next.password = "The email address or password is incorrect.";
      else
        next.email =
          response?.data?.message || "Unable to continue. Try again.";
    }
    setErrors((current) => ({ ...current, ...next }));
    const first = relevantFields().find((name) => next[name]);
    if (first) focusField(first);
  };

  async function submit(event) {
    event.preventDefault();
    if (!validateForm()) return;
    setBusy(true);
    try {
      if (isForgot) {
        const result = await authService.forgot(form.email.trim());
        notify(result.message);
        return;
      }
      if (isRegister) {
        const user = await register({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          password: form.password,
          confirmPassword: form.confirm,
          acceptTerms: form.acceptTerms,
        });
        if (user) navigate("/farmer");
        return;
      }
      const user = await login(
        form.email.trim(),
        form.password,
        form.rememberMe,
      );
      if (user) navigate(destination(user.role));
    } catch (error) {
      applyServerErrors(error);
    } finally {
      setBusy(false);
    }
  }

  const heading = isRegister
    ? "Create your account"
    : isForgot
      ? "Forgot your password?"
      : "Sign in";
  const description = isRegister
    ? "Start making data-backed selling decisions today."
    : isForgot
      ? "Enter the email address associated with your AgriPrice account."
      : "Enter your credentials to access your dashboard.";
  const storyTitle = isRegister
    ? "Plan every harvest with confidence."
    : "Welcome back to your harvest dashboard.";
  const storyCopy = isRegister
    ? "Create your account to access crop price forecasts, market comparisons, and profit estimation tools for Rizal Province."
    : "Sign in to check the latest available crop prices, review forecasts, and plan your next sale across Rizal Province markets.";

  return (
    <div className={`auth-shell ${isRegister ? "auth-register" : ""}`}>
      <aside className="auth-story">
        <Brand />
        <div className="auth-story-copy">
          <h2>{isForgot ? "We'll help you get back in." : storyTitle}</h2>
          <p>
            {isForgot
              ? "Contact your AgriPrice administrator for password recovery."
              : storyCopy}
          </p>
        </div>
        <p className="auth-quote">
          Compare available market information and estimated costs before
          planning your sale.
        </p>
      </aside>
      <section className="auth-form">
        <div className="mobile-auth-brand">
          <Brand />
        </div>
        <h1>{heading}</h1>
        <p className="muted auth-description">{description}</p>
        <form ref={formRef} onSubmit={submit} noValidate>
          <div className="form-stack">
            {isRegister && (
              <div className="form-grid">
                <TextField
                  label="First Name"
                  name="firstName"
                  required
                  autoComplete="given-name"
                  placeholder="Juan"
                  value={form.firstName}
                  onChange={(event) =>
                    setValue("firstName", event.target.value)
                  }
                  onBlur={() => validateField("firstName")}
                  error={errors.firstName}
                />
                <TextField
                  label="Last Name"
                  name="lastName"
                  required
                  autoComplete="family-name"
                  placeholder="Dela Cruz"
                  value={form.lastName}
                  onChange={(event) => setValue("lastName", event.target.value)}
                  onBlur={() => validateField("lastName")}
                  error={errors.lastName}
                />
              </div>
            )}
            <TextField
              label="Email Address"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@email.com"
              value={form.email}
              onChange={(event) => setValue("email", event.target.value)}
              onBlur={() => validateField("email")}
              error={errors.email}
            />
            {!isForgot && (
              <>
                <Password
                  name="password"
                  value={form.password}
                  onChange={(event) => setValue("password", event.target.value)}
                  onBlur={() => validateField("password")}
                  error={errors.password}
                  autoComplete={
                    isRegister ? "new-password" : "current-password"
                  }
                />
                {isRegister && (
                  <Password
                    name="confirm"
                    label="Confirm Password"
                    value={form.confirm}
                    onChange={(event) =>
                      setValue("confirm", event.target.value)
                    }
                    onBlur={() => validateField("confirm")}
                    error={errors.confirm}
                    autoComplete="new-password"
                  />
                )}
                {!isRegister && (
                  <div className="auth-options">
                    <label className="auth-check">
                      <input
                        name="rememberMe"
                        type="checkbox"
                        checked={form.rememberMe}
                        onChange={(event) =>
                          setValue("rememberMe", event.target.checked)
                        }
                      />
                      <span>Remember me</span>
                    </label>
                    <Link className="text-link" to="/forgot-password">
                      Forgot Password?
                    </Link>
                  </div>
                )}
              </>
            )}
            {isRegister && (
              <div className="consent-group">
                <label className="auth-check consent">
                  <input
                    name="acceptTerms"
                    type="checkbox"
                    required
                    checked={form.acceptTerms}
                    onChange={(event) =>
                      setValue("acceptTerms", event.target.checked)
                    }
                    onBlur={() => validateField("acceptTerms")}
                    aria-invalid={Boolean(errors.acceptTerms)}
                    aria-describedby={
                      errors.acceptTerms ? "acceptTerms-error" : undefined
                    }
                  />
                  <span>
                    I agree to the <Link to="/terms">Terms and Conditions</Link>{" "}
                    and acknowledge the{" "}
                    <Link to="/privacy-policy">Privacy Policy</Link>.
                  </span>
                </label>
                <ErrorText id="acceptTerms-error">
                  {errors.acceptTerms}
                </ErrorText>
              </div>
            )}
            <button disabled={busy} className="button w-full">
              {busy
                ? "Please wait…"
                : isRegister
                  ? "Create Account"
                  : isForgot
                    ? "Check Recovery Options"
                    : "Sign In"}
            </button>
          </div>
        </form>
        <p className="auth-switch">
          {isRegister ? (
            <>
              Already have an account?{" "}
              <Link className="text-link inline-flex" to="/login">
                Sign in
              </Link>
            </>
          ) : isForgot ? (
            <Link className="text-link" to="/login">
              Remember your password? Sign in
            </Link>
          ) : (
            <>
              Don't have an account?{" "}
              <Link className="text-link inline-flex" to="/register">
                Create one
              </Link>
            </>
          )}
        </p>
      </section>
    </div>
  );
}
