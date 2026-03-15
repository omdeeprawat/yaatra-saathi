import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mountain, Mail, Lock } from "lucide-react";
import { GoogleLogo as GoogleLogoIcon } from "@phosphor-icons/react";
import { useAuth } from "@/hooks/useAuth";
import InputField from "@/components/ui/InputField";
import Spinner from "@/components/ui/Spinner";
import toast from "react-hot-toast";

export default function Login() {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [isLoading, setIsLoading] = useState(false);

  // Redirect to where user was trying to go, or dashboard
  const from = (location.state as { from?: string })?.from || "/dashboard";

  const validate = () => {
    const errs: typeof errors = {};
    if (!form.email) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      errs.email = "Enter a valid email";
    if (!form.password) errs.password = "Password is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await login({ email: form.email, password: form.password });
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Login failed. Please try again.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-saffron-500/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Mountain className="w-8 h-8 text-saffron-500" />
            <span className="font-display text-2xl font-bold text-stone-100">
              Yatra <span className="text-saffron-500">Saathi</span>
            </span>
          </div>
          <h1 className="font-display text-3xl text-stone-100 mb-2">
            Welcome back
          </h1>
          <p className="font-body text-stone-400">
            Sign in to continue your journey
          </p>
        </div>

        {/* Card */}
        <div className="card border-mountain-600/50">
          {/* Google OAuth button */}
          <button
            onClick={googleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded
                       border border-mountain-500/50 hover:border-mountain-400
                       bg-mountain-800/50 hover:bg-mountain-700/50
                       text-stone-200 font-sans text-sm font-medium
                       transition-all duration-200 mb-6"
          >
            <GoogleLogoIcon size={32} />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-mountain-700" />
            <span className="font-sans text-xs text-stone-500">
              or sign in with email
            </span>
            <div className="flex-1 h-px bg-mountain-700" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <InputField
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              error={errors.email}
              autoComplete="email"
            />

            <div className="flex flex-col gap-1.5">
              <InputField
                label="Password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                error={errors.password}
                autoComplete="current-password"
              />
              <div className="text-right">
                <span className="font-sans text-xs text-saffron-400 hover:text-saffron-300 cursor-pointer">
                  Forgot password?
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <Spinner size="small" />
                  Signing in...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>

        {/* Register link */}
        <p className="text-center font-sans text-sm text-stone-400 mt-6">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-saffron-400 hover:text-saffron-300 font-medium"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
