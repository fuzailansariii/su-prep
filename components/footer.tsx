import Link from "next/link";
import Image from "next/image";
import InstagramIcon from "@/icons/instagram";
import YoutubeIcon from "@/icons/youtube";
import FacebookIcon from "@/icons/facebook";
import Logo from "@/public/su-cropped.png";
import { Anchor, ArrowUpRight } from "lucide-react";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Mock Tests", href: "/mock-tests" },
  { label: "How It Works", href: "/learn" },
  { label: "Leaderboard", href: "/leaderboard" },
];

const supportLinks = [
  { label: "Contact Us", href: "/contact" },
  { label: "FAQs", href: "/faqs" },
];

const legalLinks = [
  {
    label: "Privacy Policy",
    href: "https://shippingupdates.in/privacy-policy",
  },
  {
    label: "Terms & Conditions",
    href: "https://shippingupdates.in/terms-condition",
  },
  { label: "Refund Policy", href: "https://shippingupdates.in/refund-policy" },
];

const socials = [
  {
    label: "YouTube",
    href: "https://www.youtube.com/@ShippingUpdates",
    icon: YoutubeIcon,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/shipping_updates",
    icon: InstagramIcon,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/people/Shipping-Updates/100076258681088/#",
    icon: FacebookIcon,
  },
];

export default function Footer() {
  return (
    <footer className="relative bg-slate-950 text-slate-400 overflow-hidden">
      {/* Gradient accent line */}
      <div className="h-[2px] w-full bg-linear-to-r from-transparent via-brand-primary to-transparent" />

      {/* Subtle background glow */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-5 md:px-8 pt-14 md:pt-16 pb-8">
        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 pb-12 border-b border-white/6">
          {/* Brand column */}
          <div className="md:col-span-5">
            <Link href="/" className="flex items-center gap-3 mb-5 group">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-white/10 group-hover:border-brand-primary/40 transition-colors">
                <Image
                  src={Logo}
                  alt="Mock Test | By Shipping Updates Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-white text-2xl font-black font-heading tracking-tight">
                SU Mock Test
              </span>
            </Link>

            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase text-brand-primary bg-brand-primary/10 border border-brand-primary/15 rounded-lg px-3 py-1.5 mb-5">
              <Anchor className="w-3 h-3" />
              By Shipping Updates
            </div>

            <p className="text-slate-400 text-sm leading-relaxed max-w-sm mb-8 font-sans">
              Precision prep for future maritime officers. Master the high seas
              of examinations with real-pattern MCQs designed by industry
              experts.
            </p>

            {/* Socials */}
            <div className="flex gap-2.5">
              {socials.map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  className="w-10 h-10 rounded-xl bg-white/4 border border-white/8 flex items-center justify-center text-slate-500 hover:bg-brand-primary hover:text-white hover:border-brand-primary/50 hover:scale-105 transition-all duration-300"
                  aria-label={s.label}
                >
                  <s.icon size={18} />
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2 md:col-start-7">
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-white/70 mb-5 font-heading">
              Quick Links
            </h3>
            <ul className="flex flex-col gap-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors font-sans group flex items-center gap-1"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 translate-x-0 group-hover:opacity-50 group-hover:translate-y-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="md:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-white/70 mb-5 font-heading">
              Support
            </h3>
            <ul className="flex flex-col gap-3">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors font-sans group flex items-center gap-1"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 translate-x-0 group-hover:opacity-50 group-hover:translate-y-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-7">
          <p className="text-xs text-slate-600 font-sans text-center sm:text-left">
            © {new Date().getFullYear()} SU Mock Test · A product by{" "}
            <Link
              href="https://shippingupdates.in"
              target="_blank"
              className="text-brand-primary/80 hover:text-brand-primary font-medium transition-colors"
            >
              Shipping Updates
            </Link>
            <span className="ml-1.5">🇮🇳</span>
          </p>

          <div className="flex items-center gap-5 text-xs font-sans">
            {legalLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 hover:text-slate-300 transition-colors"
              >
                {link.label.split(" ")[0]}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
