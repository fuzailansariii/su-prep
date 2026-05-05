import { auth, currentUser } from "@clerk/nextjs/server";

type Role = "admin" | "user";

// Get role from session
export async function getRole(): Promise<Role | undefined> {
  const { sessionClaims } = await auth();
  return sessionClaims?.role as Role | undefined;
}

export async function isAdmin(): Promise<boolean> {
  const { sessionClaims } = await auth();

  if (sessionClaims?.role === "admin") return true;
  const user = await currentUser();
  return user?.publicMetadata?.role === "admin";
}

export async function requireAdmin() {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }
}

// Check authentication
export async function isAuthenticated(): Promise<boolean> {
  const { userId } = await auth();
  return !!userId;
}

export async function requireAuth() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthenticated");
  }

  return userId;
}
