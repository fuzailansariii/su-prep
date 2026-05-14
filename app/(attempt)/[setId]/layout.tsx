"use client";

import { useEffect, useState } from "react";
import TopBar from "./attempt-topbar";

import { AttemptMobileSidebar } from "@/components/attempt/attempt-mobile-sidebar";

export default function AttemptLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setIsOpen] = useState(false);
  // Prevent back navigation
  useEffect(() => {
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Warn before closing/refreshing tab
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const mobileMenuHandler = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <TopBar onMenuClick={mobileMenuHandler} />
      <AttemptMobileSidebar isOpen={open} onClose={() => setIsOpen(false)} />
      {children}
    </div>
  );
}
