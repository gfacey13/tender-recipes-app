import { useState } from "react";
import { Eye, EyeOff, AlertCircle, CheckCircle2, Loader2, Mail, Lock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../../lib/supabase"

// Demo credentials
const DEMO_EMAIL = "demotenderrecipes@gmail.com";
const DEMO_PASSWORD = "P@ssword101";

type ValidationState = "idle" | "loading" | "success" | "error";

interface FieldError {
  email?: string;
  password?: string;
  form?: string;
}

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldError>({});
  const [status, setStatus] = useState<ValidationState>("idle");
  const [touched, setTouched] = useState({ email: false, password: false });

  // ── Validators ──────────────────────────────────────────────────────────────
  const validateEmail = (val: string): string | undefined => {
    if (!val.trim()) return "Please enter your email";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) return "Enter a valid email address";
    return undefined;
  };

  const validatePassword = (val: string): string | undefined => {
    if (!val) return "Please enter your password";
    return undefined;
  };

  const validate = (): FieldError => ({
    email: validateEmail(email),
    password: validatePassword(password),
  });

  // ── Blur handlers ────────────────────────────────────────────────────────────
  const handleEmailBlur = () => {
    setTouched(t => ({ ...t, email: true }));
    setErrors(e => ({ ...e, email: validateEmail(email), form: undefined }));
  };

  const handlePasswordBlur = () => {
    setTouched(t => ({ ...t, password: true }));
    setErrors(e => ({ ...e, password: validatePassword(password), form: undefined }));
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setTouched({ email: true, password: true });

    const fieldErrors = validate();
    if (fieldErrors.email || fieldErrors.password) {
      setErrors(fieldErrors);
      return;
    }

    setStatus("loading");
    setErrors({});

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setStatus("error");
      setErrors({ form: error.message });
      return;
    }

    setStatus("success");
    setTimeout(() => onLoginSuccess(), 1000);
  };

  const handleCreateAccount = async () => {
    setTouched({ email: true, password: true });

    const fieldErrors = validate();
    if (fieldErrors.email || fieldErrors.password) {
      setErrors(fieldErrors);
      return;
    }

    setStatus("loading");
    setErrors({});

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setStatus("error");
      setErrors({ form: error.message });
      return;
    }

    setStatus("idle");
    alert("Account created. Now log in.");
  };

  // ── Derived states ───────────────────────────────────────────────────────────
  const isLoading = status === "loading";
  const isSuccess = status === "success";

  const emailError = touched.email ? validateEmail(email) : undefined;
  const passwordError = touched.password ? validatePassword(password) : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto bg-transparent">
        <div className="max-w-[500px] mx-auto flex flex-col px-6">

          {/* ── Hero / Brand ──────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="pt-14 pb-8 flex flex-col items-center"
          >
            <div className="flex flex-col items-center mb-6">
                <div className="flex justify-center w-full">
              <img
                src="/logo.svg"
                alt="Tender Recipes logo"
                className="w-64 object-contain ml-[-70px]"
              />
            </div>

              <p className="text-gray-500 text-center text-base">
                Swipe your way to your next favourite meal
              </p>
            </div>
          </motion.div>

          {/* ── Card ─────────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 p-7 mb-6"
          >
            {/* Welcome heading */}
            <div className="mb-7">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Welcome back 👋</h2>
              <p className="text-sm text-gray-500">Sign in to your account to continue</p>
            </div>

            {/* ── Form-level error ─────────────────────────────────────── */}
            <AnimatePresence>
              {errors.form && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 overflow-hidden"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-600 leading-snug">{errors.form}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Success banner ───────────────────────────────────────── */}
            <AnimatePresence>
              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                  className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-3 overflow-hidden"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <p className="text-sm text-green-700 font-medium">Login successful! Taking you in…</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Email field ──────────────────────────────────────────── */}
            <div className="mb-5">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email address
              </label>
              <div className={`relative flex items-center rounded-2xl border-2 transition-colors bg-gray-50 ${
                emailError
                  ? "border-red-400 bg-red-50"
                  : email && !emailError
                  ? "border-green-400"
                  : "border-gray-200 focus-within:border-amber-400 focus-within:bg-white"
              }`}>
                <Mail className={`absolute left-4 w-5 h-5 pointer-events-none ${
                  emailError ? "text-red-400" : "text-gray-400"
                }`} />
                <input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    if (touched.email) setErrors(prev => ({ ...prev, email: validateEmail(e.target.value), form: undefined }));
                  }}
                  onBlur={handleEmailBlur}
                  placeholder="you@example.com"
                  disabled={isLoading || isSuccess}
                  className="w-full h-14 pl-12 pr-4 bg-transparent text-base text-gray-900 placeholder-gray-400 outline-none rounded-2xl disabled:opacity-60"
                  aria-describedby={emailError ? "email-error" : undefined}
                  aria-invalid={!!emailError}
                />
                {email && !emailError && (
                  <CheckCircle2 className="absolute right-4 w-5 h-5 text-green-500 flex-shrink-0" />
                )}
              </div>
              <AnimatePresence>
                {emailError && (
                  <motion.p
                    id="email-error"
                    role="alert"
                    initial={{ opacity: 0, y: -4, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -4, height: 0 }}
                    className="flex items-center gap-1.5 mt-2 text-sm text-red-500 overflow-hidden"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {emailError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* ── Password field ───────────────────────────────────────── */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  className="text-sm text-amber-500 hover:text-amber-600 font-medium transition-colors"
                  tabIndex={-1}
                >
                  Forgot password?
                </button>
              </div>
              <div className={`relative flex items-center rounded-2xl border-2 transition-colors bg-gray-50 ${
                passwordError
                  ? "border-red-400 bg-red-50"
                  : password && !passwordError
                  ? "border-green-400"
                  : "border-gray-200 focus-within:border-amber-400 focus-within:bg-white"
              }`}>
                <Lock className={`absolute left-4 w-5 h-5 pointer-events-none ${
                  passwordError ? "text-red-400" : "text-gray-400"
                }`} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (touched.password) setErrors(prev => ({ ...prev, password: validatePassword(e.target.value), form: undefined }));
                  }}
                  onBlur={handlePasswordBlur}
                  onKeyDown={e => e.key === "Enter" && !isLoading && !isSuccess && handleSubmit()}
                  placeholder="••••••••"
                  disabled={isLoading || isSuccess}
                  className="w-full h-14 pl-12 pr-12 bg-transparent text-base text-gray-900 placeholder-gray-400 outline-none rounded-2xl disabled:opacity-60"
                  aria-describedby={passwordError ? "password-error" : undefined}
                  aria-invalid={!!passwordError}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword
                    ? <EyeOff className="w-5 h-5" />
                    : <Eye className="w-5 h-5" />
                  }
                </button>
              </div>
              <AnimatePresence>
                {passwordError && (
                  <motion.p
                    id="password-error"
                    role="alert"
                    initial={{ opacity: 0, y: -4, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -4, height: 0 }}
                    className="flex items-center gap-1.5 mt-2 text-sm text-red-500 overflow-hidden"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {passwordError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* ── Login button ─────────────────────────────────────────── */}
            <motion.button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || isSuccess}
              whileTap={!isLoading && !isSuccess ? { scale: 0.97 } : undefined}
              className={`mt-6 w-full h-14 rounded-2xl flex items-center justify-center gap-2.5 font-bold text-base transition-all shadow-lg ${
                isSuccess
                  ? "bg-green-500 shadow-green-400/40 text-white"
                  : "bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 shadow-amber-300/30 text-white disabled:opacity-70 disabled:cursor-not-allowed"
              }`}
              aria-label="Log in"
            >
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              {isSuccess && <CheckCircle2 className="w-5 h-5" />}
              {!isLoading && !isSuccess && <span>Log In</span>}
              {isLoading && <span>Signing in…</span>}
              {isSuccess && <span>Welcome back!</span>}
            </motion.button>
          </motion.div>

          {/* ── Demo hint ─────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mx-2 mb-5 px-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm"
          >
            <p className="text-xs text-gray-700 text-center leading-relaxed">
              <span className="font-bold">Demo credentials</span>{"\n"}
              <span className="font-mono">{DEMO_EMAIL}</span> · <span className="font-mono">P@ssword101</span>
            </p>
            <button
              onClick={() => { setEmail(DEMO_EMAIL); setPassword(DEMO_PASSWORD); setErrors({}); }}
              className="w-full mt-2 text-xs font-semibold text-amber-700 hover:text-amber-800 underline underline-offset-2 transition-colors"
            >
              Tap to autofill demo credentials
            </button>
          </motion.div>

          {/* ── Create account ────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="pb-12 text-center"
          >
            <p className="text-sm text-gray-500">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={handleCreateAccount}
                className="text-amber-500 font-semibold hover:text-amber-600 transition-colors"
              >
                Create account
              </button>
            </p>
          </motion.div>

        </div>
      </div>

    </div>
  );
}

