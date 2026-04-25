"use client";
import { ClerkProvider } from "@clerk/nextjs";
import React from "react";
import { ImageKitProvider } from "@imagekit/next";

export default function Providers({ children }: { children: React.ReactNode }) {
  // const authState = aut
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!;

  return (
    <ClerkProvider
      isSatellite
      domain={process.env.NEXT_PUBLIC_APP_URL}
      signInUrl={`${process.env.NEXT_PUBLIC_AUTH_APP_URL}/sign-in`}
      signUpUrl={`${process.env.NEXT_PUBLIC_AUTH_APP_URL}/sign-up`}
    >
      {children}
    </ClerkProvider>
  );
}
