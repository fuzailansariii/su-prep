"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/Button";

const links = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "▦" },
  { label: "Users", href: "/admin/users", icon: "👤" },
  { label: "Content", href: "/admin/content", icon: "📄" },
  { label: "Settings", href: "/admin/settings", icon: "⚙️" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-secondary flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-white/10">
        <span className="font-headline font-bold text-xl text-white">
          Acme{" "}
          <span className="text-xs font-normal text-white/50 ml-1">Admin</span>
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${
                  active
                    ? "bg-primary text-white"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
            >
              <span className="text-base">{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom user section */}
      <div className="p-4 border-t border-white/10 flex items-center gap-3">
        <Button variant="inverted">Logout</Button>
        <span className="text-sm text-white/60">Admin</span>
      </div>
    </aside>
  );
}
