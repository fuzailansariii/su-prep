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

export default function SignUpPage() {
  const [currentStep, setCurrentStep] = useState<Step>("email");
  const [email, setEmail] = useState("");

  const { signUp } = useSignUp();
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

  const handleEmailSubmit = async (
    emailAddress: string,
    firstName?: string,
    lastName?: string,
  ) => {
    try {
      // create user in clerk with emailAddress
      await signUp.create({
        emailAddress,
        firstName: firstName || "",
        lastName: lastName || "",
      });

      // send verification email to user and redirect to verification page
      await signUp.verifications.sendEmailCode();
      // set email state
      setEmail(emailAddress);
      toast.success("Verification code sent to your email!");
      // redirect to verification page
      setCurrentStep("verification");
    } catch (error) {
      let errorMessage = "An unexpected error occurred";

      if (isClerkAPIResponseError(error)) {
        const clerkError = error.errors[0];

        if (clerkError?.code === "form_identifier_exists") {
          errorMessage =
            "This email is already registered. Please sign in instead.";
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
    }
  };

  // handle verify otp
  const handleVerify = async (code: string) => {
    try {
      await signUp.verifications.verifyEmailCode({ code });
      if (signUp.status === "complete") {
        await signUp.finalize();
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
      await signUp.verifications.sendEmailCode();
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
      await signUp.sso({
        strategy: "oauth_google",
        redirectUrl: "/dashboard",
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
