"use client";

import Container from "@/components/container";
import { Button } from "@/components/ui/button";
import { useIsAdmin } from "@/src/lib/auth-client";
import Image from "next/image";
import Link from "next/link";
import thumbnail from "@/public/watch-point.jpg";
import { FeatureCard } from "@/components/feature-card";
import {
  Award,
  NotepadText,
  Timer,
  UserPlus,
  CreditCard,
  PlayCircle,
} from "lucide-react";
import { motion } from "motion/react";
import StepLayout from "@/components/step-layout";
import FeaturedTestCard, {
  type MockTest,
} from "@/components/feature-tests-card";

const mockApiTests: MockTest[] = [
  {
    id: "1",
    title: "Shipping Aptitude Test (SAT) - Full Length",
    description:
      "Comprehensive 2-hour mock test covering all sections of the SAT exam. Track your progress with detailed section analytics.",
    imageUrl: "/watch-point.jpg",
    tags: "FULL LENGTH",
    durationMins: 120,
    questionCount: 100,
    sections: "All Sections",
    price: 299,
    originalPrice: 499,
  },
  {
    id: "2",
    title: "Maritime Deck Cadet Exam Simulator",
    description:
      "Practice the exact pattern of leading shipping company entrance exams tailored specifically for Deck Cadets.",
    imageUrl: "/watch-point.jpg",
    tags: "DECK CADET",
    durationMins: 90,
    questionCount: 75,
    sections: "Math, Physics, English",
    price: 199,
    originalPrice: 399,
  },
];

export default function Home() {
  const admin = useIsAdmin();

  return (
    <main className="flex flex-col">
      <Container className="flex flex-col bg-neutral-50/50 lg:flex-row items-center justify-between gap-12 lg:gap-16">
        <div className="flex flex-col justify-center gap-6 max-w-xl lg:max-w-2xl text-center lg:text-left mx-auto lg:mx-0">
          {/* Heading */}
          <h1 className="text-4xl md:text-5xl text-black font-body font-semibold tracking-tight leading-tight">
            Crack Your <br className="md:hidden" />
            <span className="text-brand-primary font-bold">Shipping</span>
            <br />
            Entrance Exam
          </h1>

          {/* Description */}
          <p className="text-brand-muted/80 font-sans text-base md:text-lg leading-relaxed mx-auto lg:mx-0 max-w-lg lg:max-w-none">
            Master the high seas of examinations with our real-pattern MCQ tests
            designed by industry maritime experts. Precision prep for future
            officers.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 font-heading">
            <Button
              size="lg"
              className="h-12 px-6 text-base font-semibold rounded-2xl bg-brand-primary hover:bg-brand-primary-hover"
              asChild
            >
              <Link href="/mock-tests">Start Practicing</Link>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="h-12 px-6 text-base font-semibold rounded-2xl"
              asChild
            >
              <Link href="/learn">How It Works</Link>
            </Button>

            {admin && (
              <Button
                variant="secondary"
                size="lg"
                className="h-12 px-6 text-base font-medium rounded-2xl"
                asChild
              >
                <Link href="/admin">Admin Panel</Link>
              </Button>
            )}
          </div>
        </div>
        {/* Right side image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          whileHover={{ scale: 1.05 }}
          className="bg-white p-2 md:p-3 rounded-2xl w-full max-w-md mx-auto lg:max-w-lg xl:max-w-xl"
        >
          <Image
            src={thumbnail}
            alt="Exam preparation illustration"
            className="w-full rounded-xl shadow-lg object-cover"
            loading="eager"
          />
        </motion.div>
      </Container>

      {/* Why us */}
      <div className="bg-white w-full py-12 md:py-16">
        <Container className="flex flex-col gap-10 md:gap-14 py-0 md:py-0 lg:py-0">
          <div className="text-center mx-auto">
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-black mb-4">
              Why Us
            </h2>
            <p className="text-brand-muted/90 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
              Everything you need to excel in your maritime entrance exams and
              secure your dream career.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <FeatureCard
              icon={NotepadText}
              title="Real Exam Pattern"
              description="Practice with realistic exam patterns to improve your time management and accuracy."
            />
            <FeatureCard
              icon={Timer}
              title="Timed Tests"
              description="Practice with realistic exam patterns to improve your time management and accuracy."
            />
            <FeatureCard
              icon={Award}
              title="Instant Results"
              description="Get instant feedback on your performance to track your progress and identify areas for improvement."
            />
          </div>
        </Container>
      </div>

      {/* How it works */}
      <div className="bg-neutral-50/50 w-full py-12 md:py-24">
        <Container className="flex flex-col gap-10 md:gap-16 py-0 md:py-0 lg:py-0">
          <div className="text-center mx-auto max-w-3xl">
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-black mb-4">
              How It Works
            </h2>
            <p className="text-brand-muted/90 text-base md:text-lg leading-relaxed">
              Start your exam preparation journey in three simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
            {/* Connecting Line (Desktop only) */}

            {/* Step 1 */}
            <StepLayout
              step="1"
              title="Sign Up"
              description="Create your free account to access our platform and explore available maritime entrance exams."
              icon={UserPlus}
            />

            {/* Step 2 */}
            <StepLayout
              step="2"
              title="Pick a Test"
              description="Choose from a wide range of mock tests designed by industry experts to match the real exam pattern."
              icon={CreditCard}
            />

            {/* Step 3 */}
            <StepLayout
              step="3"
              title="Start Practicing"
              description="Pick your tests and start practicing instantly with real-world exam simulations and tracking."
              icon={PlayCircle}
            />
          </div>
        </Container>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {mockApiTests.map((test) => (
              <FeaturedTestCard key={test.id} test={test} />
            ))}
          </div>
        </Container>
      </div>
    </main>
  );
}
