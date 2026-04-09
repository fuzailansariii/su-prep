"use client";
import { useUser } from "@clerk/nextjs";

export function useRole() {
  const { user } = useUser();
  return user?.publicMetadata?.role as string | undefined;
}

export function useIsAdmin() {
  const role = useRole();
  return role === "admin";
}

// src/lib/auth-client.ts
export function useIsAuthenticated() {
  const { isSignedIn, isLoaded } = useUser();
  return { isAuthenticated: !!isSignedIn, isLoaded };
}
