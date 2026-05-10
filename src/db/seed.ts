import { nanoid } from "nanoid";
import { options, questions, tests, sets, sections } from "./schema";
import { db } from "./index";

async function seed() {
  // 1️⃣ Create Test
  const testId = nanoid();

  await db.insert(tests).values({
    id: testId,
    title: "Shipping Mock Test 1",
    description: "Sample test for practice",
    totalQuestions: 5,
    price: 0,
    status: "published",
    createdAt: new Date(),
  });

  console.log("✅ Test created");

  // 2️⃣ Create Set
  const setId = nanoid();
  await db.insert(sets).values({
    id: setId,
    testId,
    title: "Set 1",
    duration: 30, // 30 mins
    totalQuestions: 5,
    totalMarks: 20,
    order: 1,
    status: "published",
  });

  console.log("✅ Set created");

  // 3️⃣ Create Section
  const sectionId = nanoid();
  await db.insert(sections).values({
    id: sectionId,
    setId,
    name: "General Knowledge",
    order: 1,
  });

  console.log("✅ Section created");

  // 4️⃣ Create 5 Questions
  for (let i = 1; i <= 5; i++) {
    const questionId = nanoid();

    await db.insert(questions).values({
      id: questionId,
      setId,
      sectionId,
      questionText: `Sample Question ${i}?`,
      marks: 4,
      order: i,
      createdAt: new Date(),
    });

    // 5️⃣ Create Options (4 per question)
    const optionData = [
      { text: "Option A", isCorrect: i === 1 },
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
