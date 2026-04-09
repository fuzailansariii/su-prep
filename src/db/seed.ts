import { nanoid } from "nanoid";
import { options, questions, tests } from "./schema";
import { db } from "./index";

async function seed() {
  // 1️⃣ Create Test
  const testId = nanoid();

  await db.insert(tests).values({
    id: testId,
    title: "Shipping Mock Test 1",
    description: "Sample test for practice",
    duration: 1800,
    totalMarks: 100,
    totalQuestions: 5,
    price: 0,
    createdAt: new Date(),
  });

  console.log("✅ Test created");

  // 2️⃣ Create 5 Questions
  for (let i = 1; i <= 5; i++) {
    const questionId = nanoid();

    await db.insert(questions).values({
      id: questionId,
      testId,
      questionText: `Sample Question ${i}?`,
      marks: 20,
      order: i,
      createdAt: new Date(),
    });

    // 3️⃣ Create Options (4 per question)
    const optionData = [
      { text: "Option A", isCorrect: i === 1 }, // first question correct A
      { text: "Option B", isCorrect: i === 2 },
      { text: "Option C", isCorrect: i === 3 },
      { text: "Option D", isCorrect: i === 4 },
    ];

    for (const [index, opt] of optionData.entries()) {
      await db.insert(options).values({
        id: nanoid(),
        questionId,
        optionText: opt.text,
        isCorrect: opt.isCorrect,
        order: index + 1,
        createdAt: new Date(),
      });
    }
  }

  console.log("✅ 5 Questions with options created");
}

seed()
  .then(() => {
    console.log("🎉 Seeding done");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error seeding:", err);
    process.exit(1);
  });
