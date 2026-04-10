"use client";
import { ReactNode, useState } from "react";
import AdminSidebar from "@/component/navbar/sidebar";
import { Menu } from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* main content pushed right on desktop */}
      <div className="flex-1 flex flex-col md:ml-64 overflow-y-auto">
        {/* top navbar with hamburger */}
        <header className="h-14 border-b border-black/10 flex items-center px-4 md:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
