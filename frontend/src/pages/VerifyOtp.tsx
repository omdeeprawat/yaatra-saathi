import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

import InputField from "@/components/ui/InputField";
import Spinner from "@/components/ui/Spinner";
import { authApi } from "@/services/api";
import projectLogo from "@/assets/Logo maker project.png";

interface VerifyState {
  userId?: number;
  email?: string;
}

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as VerifyState) || {};

  const [userId, setUserId] = useState<string>(state.userId ? String(state.userId) : "");
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const userIdNum = Number(userId);

  const canSubmit = Number.isInteger(userIdNum) && userIdNum > 0 && otp.trim().length === 6;

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();

    if (!canSubmit) {
      toast.error("Enter valid User ID and 6-digit OTP");
      return;
    }

    setIsVerifying(true);
    try {
      const result = await authApi.verifyOtp({
        user_id: userIdNum,
        otp: otp.trim(),
      });
      toast.success(result.message || "Email verified. Please sign in.");
      navigate("/login", {
        replace: true,
        state: { email: state.email },
      });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "OTP verification failed. Please try again.";
      toast.error(message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!Number.isInteger(userIdNum) || userIdNum <= 0) {
      toast.error("Enter valid User ID to resend OTP");
      return;
    }

    setIsResending(true);
    try {
      const result = await authApi.resendOtp(userIdNum);
      toast.success(result.message || "OTP resent successfully");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Could not resend OTP right now.";
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
      <div className="relative w-full max-w-md">
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
          <h1 className="font-display text-3xl text-stone-100 mb-2">Verify OTP</h1>
          <p className="font-body text-stone-400">
            {state.email ? `Enter the 6-digit code sent to ${state.email}` : "Enter the OTP sent to your email"}
          </p>
        </div>

        <div className="card border-mountain-600/50">
          <form onSubmit={handleVerify} className="flex flex-col gap-4">
            <InputField
              label="User ID"
              type="number"
              placeholder="e.g. 12"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />

            <InputField
              label="OTP"
              type="text"
              placeholder="6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
            />

            <button
              type="submit"
              disabled={isVerifying}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {isVerifying ? (
                <>
                  <Spinner size="small" />
                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Verify OTP
                </>
              )}
            </button>
          </form>

          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="w-full mt-3 py-2 rounded border border-mountain-600/60 text-stone-300 hover:text-stone-100 hover:border-mountain-500 transition"
          >
            {isResending ? "Resending..." : "Resend OTP"}
          </button>
        </div>

        <p className="text-center font-sans text-sm text-stone-400 mt-6">
          Already verified?{" "}
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
