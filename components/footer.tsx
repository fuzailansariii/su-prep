import Link from "next/link";
import InstagramIcon from "@/icons/instagram";
import Container from "@/components/container";
import YoutubeIcon from "@/icons/youtube";
import FacebookIcon from "@/icons/facebook";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Mock Tests", href: "/mock-tests" },
  { label: "How It Works", href: "/learn" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Contact Us", href: "/contact" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Refund Policy", href: "/refund" },
];

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900">
      <Container className="py-5 md:py6 lg:py-7">
        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-5 border-b border-white/10">
          {/* Brand - takes 2 columns on md+ */}
          <div className="md:col-span-2">
            <h2 className="text-white text-3xl font-bold font-heading tracking-tight mb-3">
              SU PREP
            </h2>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wide uppercase text-brand-primary bg-brand-primary/10 border border-brand-primary/20 rounded-md px-2.5 py-1 mb-5">
              <span>By Shipping Updates</span>
            </div>
            <p className="text-slate-400 text-base leading-relaxed max-w-sm mb-8 font-sans">
              Precision prep for future maritime officers. Master the high seas
              of examinations with real-pattern MCQs designed by industry
              experts.
            </p>
            <div className="flex gap-3 items-center">
              <Link
                href="https://www.youtube.com/@ShippingUpdates"
                target="_blank"
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all duration-300"
                aria-label="Youtube"
              >
                <YoutubeIcon size={20} />
              </Link>
              {/* Instagram */}
              <Link
                href="https://www.instagram.com/shipping_updates"
                target="_blank"
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all duration-300"
                aria-label="Instagram"
              >
                <InstagramIcon size={20} />
              </Link>
              {/* Facebook */}
              <Link
                href="https://www.facebook.com/people/Shipping-Updates/100076258681088/#"
                target="_blank"
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all duration-300"
                aria-label="Facebook"
              >
                <FacebookIcon size={20} />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-6 font-heading">
              Quick Links
            </h3>
            <ul className="flex flex-col gap-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-brand-primary transition-colors font-sans flex items-center gap-2"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-6 font-heading">
              Legal
            </h3>
            <ul className="flex flex-col gap-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-brand-primary transition-colors font-sans"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8">
          <p className="text-sm text-slate-500 font-sans text-center md:text-left">
            © {new Date().getFullYear()} SU PREP · A product by{" "}
            <Link
              href="https://shippingupdates.in"
              target="_blank"
              className="text-brand-primary font-medium"
            >
              Shipping Updates
            </Link>
            <span className="hidden sm:inline"> · 🇮🇳</span>
          </p>
          <div className="flex items-center gap-4 text-sm font-sans">
            <Link
              href="/privacy"
              className="text-slate-500 hover:text-brand-primary transition-colors"
            >
              Privacy
            </Link>
            <span className="text-slate-700">·</span>
            <Link
              href="/terms"
              className="text-slate-500 hover:text-brand-primary transition-colors"
            >
              Terms
            </Link>
            <span className="text-slate-700">·</span>
            <Link
              href="/refund"
              className="text-slate-500 hover:text-brand-primary transition-colors"
            >
              Refund
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
