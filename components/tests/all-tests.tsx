"use client";
import FeaturedTestCard from "../feature-tests-card";
import { mockFeaturedTests } from "./mock-tests-data";

export default function Tests() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
      {mockFeaturedTests.map((test) => (
        <FeaturedTestCard test={test} key={test.id} />
      ))}
    </div>
  );
}
