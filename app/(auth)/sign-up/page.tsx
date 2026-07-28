"use client";
import AuthCard from "@/components/auth-card";
import { useState, useEffect } from "react";
import { useAuth, useSignUp } from "@clerk/nextjs";
import OTPVerification from "@/components/otp-verification";
import { useRouter } from "next/navigation";
import { useIsAdmin } from "@/src/lib/auth-client";
import { toast } from "sonner";
import {
  ClerkAPIResponseError,
  isClerkAPIResponseError,
} from "@clerk/nextjs/errors";

type Step = "email" | "verification";

function getRedirectUrl(): string | null {
  if (typeof window === "undefined") return null;
  const urlParams = new URLSearchParams(window.location.search);
  const redirectUrl = urlParams.get("redirect_url");
  if (!redirectUrl) return null;

  if (redirectUrl.startsWith("http://") || redirectUrl.startsWith("https://")) {
    try {
      const parsed = new URL(redirectUrl);
      return parsed.pathname + parsed.search;
    } catch {
      return redirectUrl;
    }
  }
  return redirectUrl;
}

export default function SignUpPage() {
  const [currentStep, setCurrentStep] = useState<Step>("email");
  const [email, setEmail] = useState("");

  const { signUp } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const isAdmin = useIsAdmin();

  // if already signed in redirect to redirectUrl/dashboard/admin
  useEffect(() => {
    if (isSignedIn) {
      const redirectUrl = getRedirectUrl();
      if (redirectUrl) {
        router.push(redirectUrl);
      } else if (isAdmin) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    }
  }, [isSignedIn, isAdmin, router]);

  if (isSignedIn) return null;

  const handleEmailSubmit = async (
    emailAddress: string,
    firstName?: string,
    lastName?: string,
  ): Promise<boolean> => {
    try {
      // create user in clerk with emailAddress
      const result = await signUp.create({
        emailAddress,
        firstName: firstName || "",
        lastName: lastName || "",
      });
      if (result.error) {
        throw result.error;
      }

      // send verification email to user and redirect to verification page
      const sendCodeResult = await signUp.verifications.sendEmailCode();
      if (sendCodeResult.error) {
        throw sendCodeResult.error;
      }

      // set email state
      setEmail(emailAddress);
      toast.success("Verification code sent to your email!");
      // redirect to verification page
      setCurrentStep("verification");
      return true;
    } catch (error) {
      let errorMessage = "An unexpected error occurred";

      if (isClerkAPIResponseError(error)) {
        const clerkError = error.errors[0];

        if (clerkError?.code === "form_identifier_exists") {
          toast.error("This email is already registered. Redirecting you to sign in...");
          const redirectUrl = getRedirectUrl();
          const signInUrl = `/sign-in?email=${encodeURIComponent(emailAddress)}${
            redirectUrl ? `&redirect_url=${encodeURIComponent(redirectUrl)}` : ""
          }`;
          setTimeout(() => {
            router.push(signInUrl);
          }, 1500);
          return false;
        } else if (clerkError?.code === "form_password_pwned") {
          errorMessage =
            "This password is too common or has been compromised. Please choose a stronger password.";
        } else {
          errorMessage =
            clerkError?.longMessage ||
            clerkError?.message ||
            "An error occurred during sign up.";
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
      return false;
    }
  };

  // handle verify otp
  const handleVerify = async (code: string) => {
    try {
      const verifyResult = await signUp.verifications.verifyEmailCode({ code });
      if (verifyResult.error) {
        throw verifyResult.error;
      }
      if (signUp.status === "complete") {
        await signUp.finalize({
          navigate: ({ session, decorateUrl }) => {
            if (session?.currentTask) return;
            const redirectUrl = getRedirectUrl();
            const target = redirectUrl || (isAdmin ? "/admin" : "/dashboard");
            const url = decorateUrl(target);
            if (url.startsWith("http")) {
              window.location.href = url;
            } else {
              router.push(url);
            }
          },
        });
        toast.success("Account created successfully!");
      } else {
        toast.error("Verification incomplete. Please try again.");
        throw new Error("Verification incomplete");
      }
    } catch (error) {
      if (isClerkAPIResponseError(error)) {
        const errorMessage =
          error.errors[0]?.longMessage ||
          error.errors[0]?.message ||
          "Failed to verify code";
        toast.error(errorMessage);
      } else {
        toast.error("Failed to verify code");
      }
      throw error;
    }
  };

  // handle resend code
  const handleResend = async () => {
    try {
      const resendResult = await signUp.verifications.sendEmailCode();
      if (resendResult.error) {
        throw resendResult.error;
      }
      toast.success("Verification code resent to your email!");
    } catch (error) {
      if (isClerkAPIResponseError(error)) {
        toast.error(error.errors[0]?.message || "Failed to resend code");
      } else {
        toast.error("Failed to resend code");
      }
      throw error;
    }
  };

  // handle google sign up
  const handleGoogleSignUp = async () => {
    try {
      const redirectUrl = getRedirectUrl();
      await signUp.sso({
        strategy: "oauth_google",
        redirectUrl: redirectUrl || "/dashboard",
        redirectCallbackUrl: "/sso-callback",
      });
    } catch (error) {
      const clerkError = error as { errors?: ClerkAPIResponseError[] };
      const errorMessage =
        clerkError.errors?.[0]?.longMessage ||
        clerkError.errors?.[0]?.message ||
        "Failed to sign up with Google";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  if (currentStep === "verification") {
    return (
      <OTPVerification
        email={email}
        mode={"sign-up"}
        onVerify={handleVerify}
        onResend={handleResend}
        onBack={() => setCurrentStep("email")}
      />
    );
  }

  return (
    <>
      <AuthCard
        mode="sign-up"
        onEmailSubmit={handleEmailSubmit}
        onGoogleAuth={handleGoogleSignUp}
      />
      <div id="clerk-captcha" />
    </>
  );
}
