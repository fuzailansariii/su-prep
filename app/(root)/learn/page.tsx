import Container from "@/components/container";
import {
  Search,
  CreditCard,
  Target,
  Trophy,
  ArrowRight,
  ShieldCheck,
  Zap,
  Star,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "How it Works | SU Mock Test",
  description: "Learn how to prepare for your maritime entrance exams using the SU Mock Test platform.",
};

const steps = [
  {
    icon: Search,
    title: "Browse & Select",
    description: "Explore our curated catalog of industry-standard mock tests. Each test is designed by maritime experts to mirror the latest exam patterns.",
    color: "bg-blue-500",
  },
  {
    icon: CreditCard,
    title: "Secure Enrollment",
    description: "Purchase instant access to your chosen test sets via our secure Razorpay integration. Get lifetime access to your purchased materials.",
    color: "bg-purple-500",
  },
  {
    icon: Target,
    title: "Take the Exam",
    description: "Enter our simulation environment with real-time timers, section-wise navigation, and a focus-driven UI to build your exam temperament.",
    color: "bg-emerald-500",
  },
  {
    icon: Trophy,
    title: "Analyze & Rank",
    description: "Get instant results with precise decimal scoring and negative marking. Compare your performance on the global leaderboard.",
    color: "bg-amber-500",
  },
];

const features = [
  {
    icon: ShieldCheck,
    title: "Precision Scoring",
    description: "Our algorithm calculates marks with exact decimal precision, including proper -0.25 negative marking weights.",
  },
  {
    icon: Zap,
    title: "Real Interface",
    description: "Designed to match the look and feel of major maritime entrance exams (IMU-CET, DNS, and more).",
  },
  {
    icon: Star,
    title: "Detailed Insights",
    description: "Track your time spent per question and identify your weak areas across different exam sections.",
  },
];

export default function LearnPage() {
  return (
    <div className="bg-[#F9FAFF] min-h-screen">
      {/* Hero Section */}
      <section className="relative py-10 md:py-16 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div className="absolute top-10 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl" />
        </div>

        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-heading font-black text-slate-900 tracking-tight mb-6">
              Master the Exams with <span className="text-brand-primary">Precision</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 font-sans leading-relaxed mb-10">
              The SU Mock Test platform is built specifically for aspiring maritime officers. 
              Here is how we help you bridge the gap between preparation and success.
            </p>
          </div>
        </Container>
      </section>

      {/* Steps Section */}
      <section className="pb-14">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <div key={idx} className="relative group">
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-[2px] bg-slate-200 -translate-x-1/2 z-0" />
                )}
                <div className="relative z-10 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300">
                  <div className={`w-14 h-14 ${step.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-current/20`}>
                    <step.icon className="text-white w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-heading font-bold text-slate-800 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-500 font-sans leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Features Grid */}
      <section className="py-10 bg-white border-y border-slate-100">
        <Container>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-heading font-bold text-slate-900">
              Why Choose SU Mock Tests?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {features.map((feature, idx) => (
              <div key={idx} className="flex gap-5">
                <div className="shrink-0 w-12 h-12 bg-brand-label rounded-xl flex items-center justify-center">
                  <feature.icon className="text-brand-primary w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-heading font-bold text-slate-800 mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-slate-500 font-sans leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <Container>
          <div className="bg-slate-900 rounded-[32px] p-8 md:p-16 relative overflow-hidden text-center">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,#3b82f6_0%,transparent_50%)]" />
            </div>

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-6">
                Ready to Start Your Journey?
              </h2>
              <p className="text-slate-400 font-sans mb-10 text-lg">
                Join hundreds of successful candidates who used our platform to clear their exams with flying colors.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg" className="bg-brand-primary hover:bg-brand-primary/90 text-white font-heading font-bold px-8 rounded-xl h-14">
                  <Link href="/mock-tests">
                    Explore Mock Tests <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="bg-transparent border-white/20 text-white hover:bg-white/10 font-heading font-bold px-8 rounded-xl h-14">
                  <Link href="/dashboard">
                    Go to Dashboard
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
