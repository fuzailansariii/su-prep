import AdminSidebar from "@/component/navbar/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <AdminSidebar />
      <main>{children}</main>
    </div>
  );
}
