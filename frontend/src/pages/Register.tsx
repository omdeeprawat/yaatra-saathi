import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { GoogleLogo as GoogleLogoIcon } from "@phosphor-icons/react";
import { useAuth } from "@/hooks/useAuth";
import InputField from "@/components/ui/InputField";
import Spinner from "@/components/ui/Spinner";
import toast from "react-hot-toast";
import projectLogo from "@/assets/Logo maker project.png";

interface FormState {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
}

interface FormErrors {
  full_name?: string;
  email?: string;
  password?: string;
  confirm_password?: string;
}

export default function Register() {
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const update =
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.full_name.trim()) errs.full_name = "Full name is required";
    if (!form.email) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      errs.email = "Enter a valid email";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 8)
      errs.password = "Password must be at least 8 characters";
    if (form.password !== form.confirm_password)
      errs.confirm_password = "Passwords do not match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const result = await register({
        email: form.email,
        full_name: form.full_name,
        password: form.password,
      });
      toast.success("OTP sent to your email. Please verify it.");
      navigate("/verify-otp", {
        replace: true,
        state: {
          userId: result.user_id,
          email: form.email,
        },
      });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Registration failed. Please try again.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-saffron-500/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/95 ring-1 ring-mountain-600/70 shrink-0">
              <img
                src={projectLogo}
                alt="Yatra Saathi logo"
                className="w-full h-full object-contain object-center scale-[2.8]"
              />
            </div>
            <span className="font-display text-2xl font-bold text-stone-100">
              Yatra <span className="text-saffron-500">Saathi</span>
            </span>
          </div>
          <h1 className="font-display text-3xl text-stone-100 mb-2">
            Begin your journey
          </h1>
          <p className="font-body text-stone-400">Create your free account</p>
        </div>

        {/* Card */}
        <div className="card border-mountain-600/50">
          {/* Google OAuth */}
          <button
            onClick={googleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded
                       border border-mountain-500/50 hover:border-mountain-400
                       bg-mountain-800/50 hover:bg-mountain-700/50
                       text-stone-200 font-sans text-sm font-medium
                       transition-all duration-200 mb-6"
          >
            <GoogleLogoIcon size={32} />
            Sign up with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-mountain-700" />
            <span className="font-sans text-xs text-stone-500">
              or register with email
            </span>
            <div className="flex-1 h-px bg-mountain-700" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <InputField
              label="Full Name"
              type="text"
              placeholder="omdeep rawat"
              value={form.full_name}
              onChange={update("full_name")}
              error={errors.full_name}
              autoComplete="name"
            />
            <InputField
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={update("email")}
              error={errors.email}
              autoComplete="email"
            />
            <InputField
              label="Password"
              type="password"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={update("password")}
              error={errors.password}
              autoComplete="new-password"
            />
            <InputField
              label="Confirm Password"
              type="password"
              placeholder="Repeat your password"
              value={form.confirm_password}
              onChange={update("confirm_password")}
              error={errors.confirm_password}
              autoComplete="new-password"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <Spinner size="small" />
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </>
              )}
            </button>
          </form>

          <p className="font-sans text-xs text-stone-500 text-center mt-4">
            By creating an account you agree to our Terms of Service.
          </p>
        </div>

        {/* Login link */}
        <p className="text-center font-sans text-sm text-stone-400 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-saffron-400 hover:text-saffron-300 font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
