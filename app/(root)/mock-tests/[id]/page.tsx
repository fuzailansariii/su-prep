import Container from "@/components/container";
import React from "react";
import { mockFeaturedTests } from "@/components/tests/mock-tests-data";
import TestDetails from "@/components/tests/test-details";
import { notFound } from "next/navigation";

interface TestDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TestDetailsPage({
  params,
}: TestDetailsPageProps) {
  const { id } = await params;
  const normalizedId = decodeURIComponent(id).trim();
  const test = mockFeaturedTests.find((item) => item.id === normalizedId);

  if (!test) {
    notFound();
  }

  return (
    <Container>
      <TestDetails test={test} key={test.id} />
    </Container>
  );
}
