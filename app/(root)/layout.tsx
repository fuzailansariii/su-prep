import PublicNavbar from "@/components/navbar/public-navbar";
import Footer from "@/components/footer";
import { isAdmin } from "@/src/lib/auth-helper";
import { auth } from "@clerk/nextjs/server";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  const admin = await isAdmin();
  const isAuthenticated = !!userId;

  return (
    <div className="flex flex-col min-h-screen">
      <PublicNavbar isAuthenticated={isAuthenticated} admin={admin} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
