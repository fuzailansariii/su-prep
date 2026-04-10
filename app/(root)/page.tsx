"use client";
import { Text } from "@/component/ui/Typography";
import { useIsAdmin } from "@/src/lib/auth-client";

export default function Home() {
  const admin = useIsAdmin();
  return (
    <div>
      {admin ? (
        "Admin Logged in"
      ) : (
        <Text variant="h1">Shipping Updates Prep</Text>
      )}
    </div>
  );
}
