"use client";

import Image from "next/image";
import { Button } from "../ui/Button";
import logo from "@/public/su-cropped.png";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, LayoutDashboard, Repeat } from "lucide-react";

type AdminMenuItem = {
  label: string;
  icon: React.ReactNode;
  href: string;
};

const adminMenu: AdminMenuItem[] = [
  {
    label: "Dashboard",
    icon: <LayoutDashboard size={18} />,
    href: "/admin/dashboard",
  },
  {
    label: "Tests",
    icon: <FileText size={18} />,
    href: "/admin/tests",
  },
  {
    label: "Attempts",
    icon: <Repeat size={18} />,
    href: "/admin/attempts",
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:max-w-64 h-screen bg-white border-r border-black/10 flex flex-col">
      <div className="px-5 py-4 border-b border-black/10">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <Image
            src={logo}
            alt="Logo"
            width={38}
            height={38}
            className="rounded-md"
            priority
          />
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-base">Admin Panel</span>
            <span className="text-xs opacity-70">Ship Test</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1.5">
        {adminMenu.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-black text-white"
                  : "text-black/75 hover:text-black hover:bg-black/5"
              }`}
            >
              <span>{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-black/10">
        <Button variant="inverted" className="w-full justify-center">
          Logout
        </Button>
      </div>
    </aside>
  );
}
