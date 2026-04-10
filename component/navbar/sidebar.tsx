"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, LayoutDashboard, Repeat, Settings, X } from "lucide-react";
import logo from "@/public/su-cropped.png";
import { Button } from "../ui/Button";

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
  {
    label: "Settings",
    icon: <Settings size={18} />,
    href: "/admin/settings",
  },
];

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AdminSidebar({ isOpen, onClose }: Props) {
  const pathname = usePathname();

  const renderMenu = () => (
    <nav className="flex flex-col gap-1 mt-6">
      {adminMenu.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-base font-heading transition
              ${
                isActive
                  ? "bg-[#E8EDFF] text-[#3B4EFF]"
                  : "text-gray-500 hover:bg-gray-200 hover:text-gray-800"
              }`}
          >
            <span
              className={`${isActive ? "text-[#3B4EFF]" : "text-gray-400"}`}
            >
              {item.icon}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const renderHeader = () => (
    <div className="flex items-center gap-3">
      <Image
        src={logo}
        alt="Logo"
        width={36}
        height={36}
        className="rounded-md"
      />
      <div className="leading-tight font-body">
        <p className="text-sm font-bold text-[#1E2A5A]">SU PREP</p>
        <p className="text-[10px] text-gray-400 tracking-wide font-semibold">
          ADMIN
        </p>
      </div>
    </div>
  );

  const renderFooter = () => (
    <div className="mt-auto">
      {/* User Card */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-white border mb-3">
        <div className="w-8 h-8 rounded-full bg-gray-300" />
        <div className="text-xs">
          <p className="font-medium text-gray-800">Admin User</p>
          <p className="text-gray-400">Chief Officer</p>
        </div>
      </div>

      {/* CTA Button */}
      <Button>+ Create New Exam</Button>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-[#F5F7FB] shadow-xl px-4 py-6">
        {renderHeader()}
        {renderMenu()}
        {renderFooter()}
      </aside>

      {/* Mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-[#F5F7FB] shadow-xl px-4 py-6
        transform transition-transform duration-300 md:hidden
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500"
        >
          <X size={20} />
        </button>

        {renderHeader()}
        {renderMenu()}
        {renderFooter()}
      </aside>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
}
