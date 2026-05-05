import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallback() {
  // This component handles the redirect back from the OAuth provider (e.g., Google).
  // It automatically finishes the sign-in/sign-up process and then redirects
  // the user to the `redirectUrl` we provided (which is `/dashboard`).
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <AuthenticateWithRedirectCallback signUpFallbackRedirectUrl={"/"} />
      </div>
    </div>
  );
}
