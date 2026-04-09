"use client";

import Link from "next/link";
import { Button } from "../ui/Button";
import Logo from "@/public/su-cropped.png";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useIsAuthenticated } from "@/src/lib/auth-client";
import { SignOutButton } from "@clerk/nextjs";

const links = [
  { label: "Home", href: "/" },
  { label: "Browse Tests", href: "/mock-tests" },
];

export default function PublicNavbar() {
  const { isAuthenticated, isLoaded } = useIsAuthenticated();
  console.log("isLoaded:", isLoaded, "isAuthenticated:", isAuthenticated);

  const pathname = usePathname();

  return (
    <header className="w-full border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" aria-label="Go to homepage">
            <Image
              src={Logo}
              alt="ShipTest Logo"
              className="w-10 h-10 object-contain rounded-full"
            />
          </Link>

          <Link
            href="/"
            className="font-heading font-bold text-xl text-primary hidden md:block"
          >
            SHIPTEST
          </Link>
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-8 font-body">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-base font-medium transition-colors ${
                pathname === link.href
                  ? "text-primary"
                  : "text-slate-600 hover:text-primary"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth buttons */}
        <div className="flex items-center gap-3">
          {!isLoaded ? null : isAuthenticated ? (
            <Button variant="secondary">
              <SignOutButton />
            </Button>
          ) : (
            <>
              <Link
                href={`https://shippingupdates.in/sign-up?redirect_url=${encodeURIComponent("http://localhost:3000/")}`}
              >
                <Button variant="primary">Register</Button>
              </Link>
              <Link
                href={`https://shippingupdates.in/sign-in?redirect_url=${encodeURIComponent("http://localhost:3000/")}`}
              >
                <Button variant="secondary">Login</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
