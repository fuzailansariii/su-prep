import UserNavbar from "@/component/navbar/user-navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <UserNavbar />
      <main>{children}</main>
    </div>
  );
}
