"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useIsAdmin } from "@/src/lib/auth-client";
import thumbnail from "@/public/watch-point.jpg";

export function HeroClient() {
  const admin = useIsAdmin();

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16 w-full">
      <div className="flex flex-col justify-center gap-6 max-w-xl lg:max-w-2xl text-center lg:text-left mx-auto lg:mx-0">
        <h1 className="text-4xl md:text-5xl text-black font-body font-semibold tracking-tight leading-tight">
          Crack Your <br className="md:hidden" />
          <span className="text-brand-primary font-bold">Shipping</span>
          <br />
          Entrance Exam
        </h1>

        <p className="text-brand-muted/80 font-sans text-base md:text-lg leading-relaxed mx-auto lg:mx-0 max-w-lg lg:max-w-none">
          Master the high seas of examinations with our real-pattern MCQ tests
          designed by industry maritime experts. Precision prep for future
          officers.
        </p>

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
            <Link href="/mock-tests">Browse Tests</Link>
          </Button>
        </div>
      </div>

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
    </div>
  );
}
