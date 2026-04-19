"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, LayoutDashboard, Repeat, Settings, X } from "lucide-react";
import logo from "@/public/su-cropped.png";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

type AdminMenuItem = {
  label: string;
  icon: React.ReactNode;
  href: string;
};

const adminMenu: AdminMenuItem[] = [
  {
    label: "DASHBOARD",
    icon: <LayoutDashboard size={18} />,
    href: "/admin",
  },
  {
    label: "TESTS",
    icon: <FileText size={18} />,
    href: "/admin/tests",
  },
  {
    label: "ATTEMPTS",
    icon: <Repeat size={18} />,
    href: "/admin/attempts",
  },
  {
    label: "STUDENTS",
    icon: <Settings size={18} />,
    href: "/admin/students",
  },
];

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AdminSidebar({ isOpen, onClose }: Props) {
  const pathname = usePathname();

  // Lock scroll when sidebar is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close sidebar on route change
  useEffect(() => {
    onClose();
  }, [pathname]);

  const renderMenu = () => (
    <nav className="flex flex-col gap-1 mt-6">
      {adminMenu.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/admin" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm md:text-xs font-heading transition font-bold tracking-wider
              ${
                isActive
                  ? "bg-white text-[#3B4EFF]"
                  : "text-[#64748B] hover:bg-white hover:text-[#3B4EFF]"
              }`}
          >
            <span
              className={`${isActive ? "text-[#3B4EFF]" : "text-[#64748B]"}`}
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
    <div className="flex items-center gap-5">
      <Image
        src={logo}
        alt="Logo"
        width={36}
        height={36}
        className="rounded-md"
      />
      <div className="leading-tight font-heading">
        <p className="text-lg font-bold text-[#3730A3]">SU PREP</p>
        <p className="text-[10px] text-[#64748B] tracking-widest text-center font-semibold">
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
      <Button className="w-full h-10 text-sm" asChild>
        <Link href="/admin/tests/create">+ Create New Exam</Link>
      </Button>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-[#EEF2FF] shadow-xl px-4 py-6">
        {renderHeader()}
        {renderMenu()}
        {renderFooter()}
      </aside>

      {/* Mobile Sidebar with Animation */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 w-64 h-screen flex flex-col bg-[#F5F7FB] shadow-xl px-4 py-6 md:hidden"
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
            </motion.aside>

            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40 md:hidden"
              onClick={onClose}
            />
          </>
        )}
      </AnimatePresence>
    </>
  );
}
