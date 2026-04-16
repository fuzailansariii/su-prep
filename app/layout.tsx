import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import Footer from "@/components/footer";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-sans" });

const interHeading = Inter({ subsets: ["latin"], variable: "--font-heading" });

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SU PREP | Shipping Mock Tests",
  description:
    "Prepare for shipping entrance exams with realistic mock tests. Analyze your performance and improve your score.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        inter.variable,
        "font-sans",
        manrope.variable,
        interHeading.variable,
      )}
    >
      <body className="min-h-full flex flex-col bg-[#FAF8FF]">
        <ClerkProvider>{children}</ClerkProvider>
        <Footer />
      </body>
    </html>
  );
}
