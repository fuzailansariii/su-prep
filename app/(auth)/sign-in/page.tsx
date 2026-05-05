"use client";
import AuthCard from "@/components/auth-card";
import OTPVerification from "@/components/otp-verification";
import { useState, useEffect } from "react";
import { useAuth, useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useIsAdmin } from "@/src/lib/auth-client";
import { toast } from "sonner";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";

type Step = "email" | "verification";

export default function SignInPage() {
  const [currentStep, setCurrentStep] = useState<Step>("email");
  const [email, setEmail] = useState("");

  const { signIn } = useSignIn();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const isAdmin = useIsAdmin();

  // if already signed in redirect to dashboard/admin
  useEffect(() => {
    if (isSignedIn) {
      if (isAdmin) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    }
  }, [isSignedIn, isAdmin, router]);

  if (isSignedIn) return null;

  // handle email submit — sends OTP code
  const handleEmailSubmit = async (emailAddress: string) => {
    try {
      // Initialize a sign-in attempt with the email address
      await signIn.create({ identifier: emailAddress });

      // Send an OTP to the email
      await signIn.emailCode.sendCode({ emailAddress });

      setEmail(emailAddress);
      toast.success("Verification code sent to your email!");
      setCurrentStep("verification");
    } catch (error) {
      let errorMessage = "An unexpected error occurred";

      if (isClerkAPIResponseError(error)) {
        const clerkError = error.errors[0];
        if (clerkError?.code === "form_identifier_not_found") {
          errorMessage =
            "Unable to sign in. Please check your email or sign up.";
        } else if (clerkError?.code === "form_password_incorrect") {
          errorMessage = "Incorrect password. Please try again.";
        } else {
          errorMessage =
            clerkError?.longMessage ||
            clerkError?.message ||
            "An error occurred during sign in.";
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    }
  };

  // handle verify otp
  const handleVerify = async (code: string) => {
    try {
      await signIn.emailCode.verifyCode({ code });
      if (signIn.status === "complete") {
        await signIn.finalize({
          navigate: ({ session, decorateUrl }) => {
            if (session?.currentTask) return;
            const url = decorateUrl(isAdmin ? "/admin" : "/dashboard");
            if (url.startsWith("http")) {
              window.location.href = url;
            } else {
              router.push(url);
            }
          },
        });
        toast.success("Signed in successfully!");
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
      } else if (
        error instanceof Error &&
        error.message !== "Verification incomplete"
      ) {
        toast.error("Failed to verify code");
      }
      throw error;
    }
  };

  // handle resend code
  const handleResend = async () => {
    try {
      await signIn.emailCode.sendCode();
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

  // handle google sign in
  const handleGoogleSignIn = async () => {
    try {
      await signIn.sso({
        strategy: "oauth_google",
        redirectUrl: "/dashboard",
        redirectCallbackUrl: "/sso-callback",
      });
    } catch (error) {
      let errorMessage = "Failed to sign in with Google";
      if (isClerkAPIResponseError(error)) {
        errorMessage =
          error.errors[0]?.longMessage ||
          error.errors[0]?.message ||
          errorMessage;
      }
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  if (currentStep === "verification") {
    return (
      <>
        <OTPVerification
          email={email}
          mode="sign-in"
          onVerify={handleVerify}
          onResend={handleResend}
          onBack={() => setCurrentStep("email")}
        />
        <div id="clerk-captcha" />
      </>
    );
  }

  return (
    <>
      <AuthCard
        mode="sign-in"
        onEmailSubmit={handleEmailSubmit}
        onGoogleAuth={handleGoogleSignIn}
      />
      <div id="clerk-captcha" />
    </>
  );
}
