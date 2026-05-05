"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Loader2, Mail } from "lucide-react";
import { Button } from "./ui/button";
import logo from "@/public/su-cropped.png";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface OTPVerificationProps {
  email: string;
  mode: "sign-up" | "sign-in";
  onVerify: (code: string) => Promise<void>;
  onResend: () => Promise<void>;
  onBack: () => void;
}

export default function OTPVerification({
  email,
  mode,
  onVerify,
  onResend,
  onBack,
}: OTPVerificationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [otpValue, setOtpValue] = useState("");

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0 && !canResend) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown, canResend]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpValue.length !== 6) return;

    setIsLoading(true);
    try {
      await onVerify(otpValue);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await onResend();
      setCountdown(60);
      setCanResend(false);
      setOtpValue("");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 w-full max-w-md my-3">
        <div className="bg-white/70 dark:bg-neutral-900/50 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-3xl p-8 transition-all duration-300 hover:shadow-primary/10">
          {/* Header */}
          <div className="flex flex-col items-center mb-6">
            <Image
              src={logo}
              alt="Shipping Updates Logo"
              width={100}
              height={40}
              className="mb-6"
              priority
            />

            <h1 className="text-3xl font-heading font-bold text-neutral-900 dark:text-white mb-2 text-center tracking-tight">
              Check your email
            </h1>
            <div className="flex flex-col items-center justify-center text-center space-y-1">
              <p className="text-sm font-sans text-neutral-600 dark:text-neutral-400">
                We've sent a 6-digit verification code to
              </p>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/50 dark:bg-neutral-800/50 rounded-full border border-neutral-200 dark:border-neutral-700 mt-2">
                <Mail className="w-3.5 h-3.5 text-neutral-500" />
                <span className="text-sm font-medium text-neutral-900 dark:text-white truncate max-w-[200px] sm:max-w-[250px]">
                  {email}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otpValue}
                onChange={setOtpValue}
                disabled={isLoading || isResending}
              >
                <InputOTPGroup className="gap-2 sm:gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <InputOTPSlot
                      key={i}
                      index={i}
                      className="w-10 h-12 sm:w-12 sm:h-12 text-lg sm:text-xl font-heading font-semibold rounded-md border-neutral-200 dark:border-neutral-700 bg-white/50 dark:bg-neutral-800/50 focus-visible:ring-primary focus-visible:ring-1 transition-all"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              type="submit"
              disabled={isLoading || isResending || otpValue.length !== 6}
              className="w-full h-11 font-heading rounded-xl text-md font-medium bg-linear-to-r from-primary cursor-pointer to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] group"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </div>
              ) : (
                <>
                  Verify Code
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-4 text-center justify-center text-sm font-sans text-neutral-600 dark:text-neutral-400 flex items-center gap-2">
            <p>Didn't receive the code?</p>
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending || isLoading}
                className="font-semibold text-primary hover:text-primary/80 hover:underline transition-colors cursor-pointer disabled:opacity-50 disabled:no-underline flex items-center gap-2"
              >
                {isResending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Resend Code"
                )}
              </button>
            ) : (
              <p className="text-neutral-500 dark:text-neutral-500">
                Resend code in{" "}
                <span className="font-semibold tabular-nums text-neutral-700 dark:text-neutral-300">
                  0:{countdown.toString().padStart(2, "0")}
                </span>
              </p>
            )}
          </div>
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={onBack}
            disabled={isLoading || isResending}
            className="flex items-center mx-auto gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors my-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to {mode === "sign-up" ? "sign up" : "sign in"}
          </Button>
        </div>
      </div>
    </div>
  );
}
