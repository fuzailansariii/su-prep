"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";
import { Menu, X, ArrowRight } from "lucide-react";
import { useIsAuthenticated } from "@/src/lib/auth-client";
import { Button } from "../ui/button";
import Logo from "@/public/su-cropped.png";
import { motion, AnimatePresence } from "motion/react";

// ENV (safe)
const authAppUrl = process.env.NEXT_PUBLIC_AUTH_APP_URL ?? "";
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

if (!authAppUrl || !appUrl) {
  throw new Error("Missing public env variables");
}

// Static links
const publicLinks = [
  { label: "Home", href: "/" },
  { label: "Browse Tests", href: "/mock-tests" },
];

export default function PublicNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, isLoaded } = useIsAuthenticated();
  const pathname = usePathname();

  // Scroll lock (safe cleanup)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Auth URL helper
  const getAuthUrl = (type: "sign-in" | "sign-up") =>
    `${authAppUrl}/${type}?redirect_url=${encodeURIComponent(
      `${appUrl}${pathname}`,
    )}`;

  const authLinks = [
    { label: "Login", href: getAuthUrl("sign-in") },
    { label: "Sign Up", href: getAuthUrl("sign-up") },
  ];

  // Avoid flicker
  const linksToShow = !isLoaded
    ? publicLinks
    : isAuthenticated
      ? publicLinks
      : [...publicLinks, ...authLinks];

  // Active link logic
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // Link renderer (handles external)
  const renderLink = (
    link: { label: string; href: string },
    className: string,
    onClick?: () => void,
  ) => {
    const external = link.href.startsWith("http");

    return external ? (
      <a
        key={link.href}
        href={link.href}
        className={className}
        onClick={onClick}
      >
        {link.label}
      </a>
    ) : (
      <Link
        key={link.href}
        href={link.href}
        className={className}
        onClick={onClick}
      >
        {link.label}
      </Link>
    );
  };

  return (
    <>
      {/* Navbar */}
      <header className="sticky top-0 w-full z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xs transition-all duration-300">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 overflow-hidden rounded-xl border border-slate-100 shadow-sm group-hover:shadow-md transition-all duration-300">
              <Image
                src={Logo}
                alt="SU PREP Logo"
                fill
                className="object-cover"
              />
            </div>
            <span className="font-heading font-black text-2xl tracking-tight text-brand-primary">
              SU PREP
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            {linksToShow.map((link) =>
              renderLink(
                link,
                `px-4 py-2.5 rounded-full text-base font-bold font-sans transition-all duration-300 ${
                  isActive(link.href)
                    ? "bg-brand-primary/10 text-brand-primary"
                    : "text-slate-600 hover:bg-slate-50 hover:text-brand-primary"
                }`,
              ),
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Desktop Auth */}
            <div className="hidden md:flex items-center gap-3">
              {isLoaded &&
                (isAuthenticated ? (
                  <SignOutButton>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl font-bold border-slate-200 hover:bg-slate-50 text-slate-700"
                    >
                      Sign Out
                    </Button>
                  </SignOutButton>
                ) : (
                  <Button
                    asChild
                    size="lg"
                    className="bg-brand-primary hover:bg-brand-primary/90 font-heading text-sm text-white font-bold rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group"
                  >
                    <Link href="/mock-tests">
                      Get Started{" "}
                      <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                ))}
            </div>

            {/* Mobile Toggle */}
            <button
              className="relative w-10 h-10 flex items-center justify-center md:hidden bg-slate-50 hover:bg-slate-100 border border-slate-200/50 rounded-xl transition-colors"
              onClick={() => setIsOpen((prev) => !prev)}
              aria-label="Toggle Menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-5 h-5 text-slate-800" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-5 h-5 text-slate-800" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop overlay for clicking out */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 top-20 z-30 bg-slate-900/20 backdrop-blur-sm md:hidden"
            />
            {/* Menu Slide Down */}
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed md:hidden inset-x-0 top-20 z-40 bg-white border-b border-slate-200 overflow-hidden shadow-2xl"
            >
              <div className="flex flex-col p-6 max-h-[calc(100vh-5rem)] overflow-y-auto">
                {/* Links */}
                <nav className="flex flex-col gap-2 mb-8">
                  {linksToShow.map((link) =>
                    renderLink(
                      link,
                      `p-4 rounded-2xl font-bold text-lg font-sans transition-colors ${
                        isActive(link.href)
                          ? "bg-brand-primary/10 text-brand-primary border border-brand-primary/10"
                          : "text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-100"
                      }`,
                      () => setIsOpen(false),
                    ),
                  )}
                </nav>

                {/* Bottom Auth */}
                <div className="mt-auto">
                  {isAuthenticated ? (
                    <SignOutButton>
                      <Button
                        className="w-full rounded-2xl py-6 font-bold text-lg"
                        variant="destructive"
                      >
                        Sign Out
                      </Button>
                    </SignOutButton>
                  ) : (
                    <Button
                      className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white rounded-2xl py-6 font-bold font-sans text-lg shadow-md group"
                      asChild
                    >
                      <Link href="/mock-tests">
                        Explore Tests{" "}
                        <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
