"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";
import { Menu, X, ArrowRight, LogOut, UserStar, User } from "lucide-react";
import { useIsAuthenticated, useIsAdmin } from "@/src/lib/auth-client";
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
  const isAdmin = useIsAdmin();
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
      <Link
        key={link.href}
        href={link.href}
        className={className}
        onClick={onClick}
      >
        {link.label}
      </Link>
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
                  <div className="flex items-center gap-3">
                    <Button
                      asChild
                      variant="default"
                      size="sm"
                      className="rounded-xl font-bold bg-brand-primary hover:bg-brand-primary-hover text-white hover:text-white h-10 px-6 font-heading flex items-center gap-2"
                    >
                      <Link
                        href={isAdmin ? "/admin" : "/dashboard"}
                        className="flex items-center"
                      >
                        {isAdmin ? (
                          <UserStar className="size-4 mr-1" />
                        ) : (
                          <User className="size-4 mr-1" />
                        )}
                        {isAdmin ? "Admin Panel" : "Dashboard"}
                      </Link>
                    </Button>
                    <SignOutButton>
                      <Button
                        className="rounded-xl font-bold h-10 px-6 font-heading flex items-center gap-2"
                        variant="destructive"
                      >
                        <LogOut className="size-4" />
                        <span>Sign Out</span>
                      </Button>
                    </SignOutButton>
                  </div>
                ) : (
                  <Button
                    asChild
                    size="lg"
                    className="bg-brand-primary hover:bg-brand-primary-hover font-heading text-sm text-white font-bold rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group"
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
                <div className="mt-auto flex flex-col gap-3">
                  {isAuthenticated ? (
                    <>
                      <Button
                        asChild
                        variant="outline"
                        className="w-full rounded-2xl py-6 font-bold text-lg font-heading bg-brand-primary text-white hover:bg-brand-primary-hover"
                        onClick={() => setIsOpen(false)}
                      >
                        <Link href={isAdmin ? "/admin" : "/dashboard"}>
                          {isAdmin ? (
                            <>
                              <UserStar className="mr-2 size-6" />
                              Admin Panel
                            </>
                          ) : (
                            <>
                              <User className="mr-2 size-6" />
                              Dashboard
                            </>
                          )}
                        </Link>
                      </Button>
                      <SignOutButton>
                        <Button
                          className="w-full rounded-2xl py-6 font-bold text-lg font-heading"
                          variant="destructive"
                        >
                          <LogOut className="size-5 mr-1" />
                          <span>Logout</span>
                        </Button>
                      </SignOutButton>
                    </>
                  ) : (
                    <Button
                      className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white rounded-2xl py-6 font-bold font-sans text-lg shadow-md group"
                      asChild
                    >
                      <Link href="/mock-tests">
                        Explore Tests
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
