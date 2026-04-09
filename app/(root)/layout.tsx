import PublicNavbar from "@/component/navbar/public-navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <PublicNavbar />
      <main>{children}</main>
    </div>
  );
}
