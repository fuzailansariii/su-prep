import Container from "@/components/container";
import { MockTest } from "@/components/feature-tests-card";
import Tests from "@/components/tests/all-tests";
import React from "react";

export default function MockTests() {
  return (
    <Container className="flex flex-col gap-10 md:gap-16 py-8">
      <div className="flex flex-col gap-4">
        <div className="text-left md:text-center mx-auto max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-black">
            Mock Tests
          </h1>
          <p className="text-brand-muted/90 font-sans text-base md:text-lg leading-relaxed max-w-lg">
            Choose a subject and start practicing today. High-precision maritime
            exam simulations tailored for professional deck officers.
          </p>
        </div>
      </div>
      <Tests />
    </Container>
  );
}
