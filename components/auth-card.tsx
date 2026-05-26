import React, { useState, useEffect } from "react";
import { FieldErrors, useForm, UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  SignInFormData,
  signInSchema,
  SignUpFormData,
  signUpSchema,
} from "@/src/lib/validations/auth.validation";
import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowRight, Mail, User } from "lucide-react";
import { Input } from "./ui/input";
import logo from "@/public/su-cropped.png";
import Image from "next/image";
import Google from "@/icons/google";

interface AuthCardProps {
  mode: "sign-in" | "sign-up";
  onEmailSubmit: (
    email: string,
    firstName?: string,
    lastName?: string,
  ) => Promise<boolean>;
  onGoogleAuth?: () => Promise<void>;
}

export default function AuthCard({
  mode,
  onEmailSubmit,
  onGoogleAuth,
}: AuthCardProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [emailParam, setEmailParam] = useState<string | null>(null);

  const isSignUp = mode === "sign-up";
  const schema = isSignUp ? signUpSchema : signInSchema;

  // react-hook-form
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<SignUpFormData | SignInFormData>({
    defaultValues: isSignUp
      ? { email: "", firstName: "", lastName: "" }
      : { email: "" },
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setRedirectUrl(params.get("redirect_url"));
      setEmailParam(params.get("email"));
    }
  }, []);

  useEffect(() => {
    if (emailParam) {
      reset(isSignUp 
        ? { email: emailParam, firstName: "", lastName: "" }
        : { email: emailParam }
      );
    }
  }, [emailParam, isSignUp, reset]);

  const signUpRegister = register as unknown as UseFormRegister<SignUpFormData>;
  const signUpError = errors as FieldErrors<SignUpFormData>;

  // handle email submit
  const handleEmailSubmit = async (data: SignInFormData | SignUpFormData) => {
    try {
      setIsLoading(true);
      const signUpData = data as SignUpFormData;
      const success = await onEmailSubmit(
        data.email,
        signUpData.firstName,
        signUpData.lastName,
      );
      if (success) {
        reset();
      }
    } catch (error) {
      setIsLoading(false);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // handle google authentication
  const handleGoogleAuth = async () => {
    if (!onGoogleAuth) return;
    try {
      setGoogleLoading(true);
      await onGoogleAuth();
    } catch (error) {
      console.error("Error with Google authentication:", error);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 w-full max-w-lg my-3">
        <div className="bg-white/70 dark:bg-neutral-900/50 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-3xl p-8 md:py-8 md:px-16 transition-all duration-300 hover:shadow-primary/10">
          {/* Logo/Brand */}
          <div className="flex flex-col items-center mb-3">
            <Image
              src={logo}
              alt="Shipping Updates Mock Test"
              className="w-20 h-20"
            />

            <h1 className="text-3xl font-bold tracking-tight font-heading text-neutral-900 dark:text-neutral-50 mt-4">
              {isSignUp ? "Create an account" : "Welcome back"}
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-2 text-center font-sans leading-5">
              {isSignUp
                ? "Join thousands of students preparing for their shipping entrance exams."
                : "Enter your credentials to access your account and continue your preparation."}
            </p>
          </div>

          {/* form */}
          <form
            onSubmit={handleSubmit(handleEmailSubmit)}
            className="space-y-5"
          >
            <div className="flex flex-col gap-4 font-heading">
              {isSignUp && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 ml-1">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                      <Input
                        type="text"
                        placeholder="Fuzail"
                        {...signUpRegister("firstName")}
                        className="pl-10 text-sm font-heading font-medium bg-white/50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 h-11 rounded-xl focus-visible:ring-primary focus-visible:ring-1 transition-all"
                        disabled={isLoading || googleLoading}
                      />
                    </div>
                    {signUpError.firstName && (
                      <p className="text-sm text-red-500 ml-1">
                        {signUpError.firstName.message}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 ml-1">
                      Last Name
                    </label>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Ansari"
                        {...signUpRegister("lastName")}
                        className="pl-4 text-sm font-heading font-medium bg-white/50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 h-11 rounded-xl focus-visible:ring-primary focus-visible:ring-1 transition-all"
                        disabled={isLoading || googleLoading}
                      />
                    </div>
                    {signUpError.lastName && (
                      <p className="text-sm text-red-500 ml-1">
                        {signUpError.lastName.message}
                      </p>
                    )}
                  </div>
                </div>
              )}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 ml-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    {...register("email")}
                    className="pl-10 text-sm font-heading font-medium bg-white/50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 h-11 rounded-xl focus-visible:ring-primary focus-visible:ring-1 transition-all"
                    disabled={isLoading || googleLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500 ml-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || googleLoading}
              className="w-full h-11 font-heading rounded-xl text-md font-medium bg-linear-to-r from-primary cursor-pointer to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] group"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending Code...
                </div>
              ) : isSignUp ? (
                "Create Account"
              ) : (
                "Continue with Email"
              )}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            {/* <div id="clerk-captcha" /> */}

            <div className="relative font-sans">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-neutral-50/70 dark:bg-[#111111]/70 backdrop-blur-sm text-neutral-500">
                  {isSignUp ? "Or sign up with" : "Or continue with"}
                </span>
              </div>
            </div>

            <div className="flex gap-3 mx-auto">
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleAuth}
                disabled={googleLoading || isLoading}
                size={"icon-lg"}
                className="w-full h-11 rounded-xl bg-white/50 dark:bg-neutral-800/50 cursor-pointer border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
              >
                <Google />
              </Button>
            </div>
          </form>

          <p className="text-center text-sm font-sans text-neutral-600 dark:text-neutral-400 mt-6">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <Link
              href={isSignUp 
                ? `/sign-in${redirectUrl ? `?redirect_url=${encodeURIComponent(redirectUrl)}` : ""}` 
                : `/sign-up${redirectUrl ? `?redirect_url=${encodeURIComponent(redirectUrl)}` : ""}`
              }
              className="font-semibold text-primary hover:text-primary/80 hover:underline transition-colors cursor-pointer"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </Link>
          </p>

          <p className="text-center text-xs font-sans text-neutral-500 dark:text-neutral-500 mt-3">
            By continuing, you agree to our{" "}
            <Link
              href="/terms"
              className="underline underline-offset-2 hover:text-neutral-800 dark:hover:text-neutral-300 transition-colors"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-2 hover:text-neutral-800 dark:hover:text-neutral-300 transition-colors"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
