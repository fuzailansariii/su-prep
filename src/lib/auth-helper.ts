import { auth, currentUser } from "@clerk/nextjs/server";

export async function getRole() {
  const { sessionClaims } = await auth();
  return sessionClaims?.role as string | undefined;
}

export async function isAdmin() {
  const role = await getRole();
  return role === "admin";
}

export async function isAuthenticated() {
  const { userId } = await auth();
  return userId;
}
