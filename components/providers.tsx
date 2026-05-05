"use client";
import { ClerkProvider } from "@clerk/nextjs";
import React from "react";
import { ImageKitProvider } from "@imagekit/next";
import { Toaster } from "./ui/sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
  // const authState = aut
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!;

  return (
    <ClerkProvider>
      <Toaster position="bottom-right" />
      {children}
    </ClerkProvider>
  );
}
