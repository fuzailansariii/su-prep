import Container from "@/components/container";
import FeaturedTests from "@/components/tests/featured-tests";
import { HeroClient } from "@/components/home/hero-client";
import WhyUs from "@/components/home/why-us";
import HowItWorks from "@/components/home/how-it-works";
import Link from "next/link";
import {
  Award,
  CreditCard,
  NotepadText,
  PlayCircle,
  SquareCheckBig,
  Timer,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const WHY_US_FEATURES = [
  {
    icon: NotepadText,
    title: "Real Exam Pattern",
    description:
      "Practice with realistic exam patterns to improve your time management and accuracy.",
  },
  {
    icon: Timer,
    title: "Timed Tests",
    description:
      "Practice with realistic exam patterns to improve your time management and accuracy.",
  },
  {
    icon: Award,
    title: "Instant Results",
    description:
      "Get instant feedback on your performance to track your progress and identify areas for improvement.",
  },
];

const HOW_IT_WORKS_STEPS = [
  {
    step: "1",
    title: "Sign Up",
    description:
      "Create your free account to access our platform and explore available maritime entrance exams.",
    icon: UserPlus,
  },
  {
    step: "2",
    title: "Pick a Test",
    description:
      "Choose from a wide range of mock tests designed by industry experts to match the real exam pattern.",
    icon: CreditCard,
  },
  {
    step: "3",
    title: "Start Practicing",
    description:
      "Pick your tests and start practicing instantly with real-world exam simulations and tracking.",
    icon: SquareCheckBig,
  },
];

export default function Home() {
  return (
    <main className="flex flex-col">
      <Container className="bg-neutral-50/50">
        <HeroClient />
      </Container>

      {/* Why us */}
      <div className="bg-white w-full py-12 md:py-16">
        <WhyUs
          title="Why Us"
          description="Everything you need to excel in your maritime entrance exams and secure your dream career."
          features={WHY_US_FEATURES}
        />
      </div>

      {/* How it works */}
      <div className="bg-neutral-50/50 w-full py-12 md:py-24">
        <HowItWorks
          title="How It Works"
          description="Start your exam preparation journey in three simple steps. Get exam-ready with our comprehensive mock test platform."
          steps={HOW_IT_WORKS_STEPS}
        />
      </div>

      {/* Popular Mock Tests */}
      <div className="bg-white w-full py-12 md:py-24">
        <Container className="flex flex-col gap-10 md:gap-16 py-0 md:py-0 lg:py-0">
          <div className="text-center mx-auto max-w-3xl">
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-black mb-4">
              Popular Mock Tests
            </h2>
            <p className="text-brand-muted/90 text-base md:text-lg leading-relaxed">
              Explore our top-rated practice exams and kickstart your maritime
              career.
            </p>
          </div>
          <FeaturedTests />
        </Container>
        <div className="flex justify-center w-full">
          <Button
            variant="default"
            className="max-w-lg mx-auto lg:self-center w-full bg-brand-primary hover:bg-brand-primary-hover h-10 font-heading text-sm text-white font-bold"
            asChild
          >
            <Link href="/mock-tests">Explore All Mock Tests</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
