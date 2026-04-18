"use client";
import { ClerkProvider } from "@clerk/nextjs";
import React from "react";
import { ImageKitProvider } from "@imagekit/next";

export default function Providers({ children }: { children: React.ReactNode }) {
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!;

  return (
    <ClerkProvider>
      <ImageKitProvider urlEndpoint={urlEndpoint}>{children}</ImageKitProvider>
    </ClerkProvider>
  );
}
