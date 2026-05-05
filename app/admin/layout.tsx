"use client";
import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/navbar/sidebar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Logo from "@/public/su-cropped.png";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-screen">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* main content pushed right on desktop */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* top navbar with hamburger */}
        <header className="flex justify-between border-b border-black/10 items-center px-4 py-3 md:hidden shrink-0">
          <div className="flex items-center gap-2">
            <Image
              src={Logo}
              alt="Logo"
              width={32}
              height={32}
              className="rounded-md"
            />
            <h1 className="font-body font-bold text-[#1E2A5A] text-xl">
              SU Mock Test
            </h1>
          </div>
          <Button
            onClick={() => setSidebarOpen(true)}
            variant={"outline"}
            className="size-10"
          >
            <Menu className="size-5" />
          </Button>
        </header>

        {/* key={pathname} forces React to remount the page on every navigation
            so useEffect always runs fresh — no stale loading states */}
        <main key={pathname} className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
