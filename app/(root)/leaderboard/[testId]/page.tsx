import Container from "@/components/container";
import { db } from "@/src/db";
import { tests } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getLeaderboard } from "@/src/lib/leaderboard";
import { clerkClient } from "@clerk/nextjs/server";
import { Trophy, Clock, Target, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Image } from "@imagekit/next";

interface LeaderboardPageProps {
  params: Promise<{
    testId: string;
  }>;
}

export default async function LeaderboardPage({
  params,
}: LeaderboardPageProps) {
  const { testId } = await params;

  // 1. Fetch test details
  const test = await db.query.tests.findFirst({
    where: eq(tests.id, testId),
  });

  if (!test) {
    notFound();
  }

  // 2. Fetch leaderboard entries
  const leaderboardEntries = await getLeaderboard(testId);

  // 3. Fetch user details from Clerk for those entries
  let enrichedEntries: any[] = [];

  if (leaderboardEntries.length > 0) {
    try {
      const userIds = leaderboardEntries.map((e) => e.clerkUserId);
      // Ensure unique IDs
      const uniqueUserIds = Array.from(new Set(userIds));

      const client = await clerkClient();
      const userList = await client.users.getUserList({
        userId: uniqueUserIds,
      });

      const userMap = new Map(userList.data.map((user) => [user.id, user]));

      enrichedEntries = leaderboardEntries.map((entry) => {
        const user = userMap.get(entry.clerkUserId);
        return {
          ...entry,
          user: {
            firstName: user?.firstName || "Anonymous",
            lastName: user?.lastName || "",
            imageUrl: user?.imageUrl,
          },
        };
      });
    } catch (error) {
      console.error("Error fetching users from clerk:", error);
      // Fallback
      enrichedEntries = leaderboardEntries.map((entry) => ({
        ...entry,
        user: { firstName: "Candidate", lastName: "", imageUrl: null },
      }));
    }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <Container className="py-12 max-w-5xl">
      <div className="mb-8">
        <Link
          href="/leaderboard"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-primary font-sans text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to all leaderboards
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex w-fit items-center gap-2 bg-brand-primary/10 text-brand-primary px-3 py-1.5 rounded-lg text-sm font-bold tracking-widest uppercase font-heading mb-3">
              <Trophy size={16} />
              <span>Leaderboard</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 mb-2">
              {test.title}
            </h1>
            <p className="text-slate-500 font-sans max-w-2xl">
              Ranking of candidates who have completed this test. Ranks are
              determined by scored marks, then percentage, then time taken.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        {enrichedEntries.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-sans">
            No one has completed this test yet. Be the first to claim the top
            spot!
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left font-sans">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-bold">
                    <th className="px-6 py-4 rounded-tl-3xl">Rank</th>
                    <th className="px-6 py-4">Candidate</th>
                    <th className="px-6 py-4">Score</th>
                    <th className="px-6 py-4">Accuracy</th>
                    <th className="px-6 py-4 rounded-tr-3xl">Time Taken</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {enrichedEntries.map((entry, idx) => {
                    return (
                      <tr
                        key={idx}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className={`flex items-center justify-center w-8 h-8 rounded-full font-bold font-heading
                            ${
                              entry.rank === 1
                                ? "bg-yellow-100 text-yellow-700"
                                : entry.rank === 2
                                  ? "bg-slate-200 text-slate-700"
                                  : entry.rank === 3
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {entry.rank}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {entry.user.imageUrl ? (
                              <Image
                                urlEndpoint={
                                  process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!
                                }
                                src={entry.user.imageUrl}
                                alt="Avatar"
                                width={32}
                                height={32}
                                className="rounded-full bg-slate-100 object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold font-heading">
                                {entry.user.firstName.charAt(0)}
                              </div>
                            )}
                            <div className="font-medium text-slate-900">
                              {entry.user.firstName} {entry.user.lastName}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                            <Target size={16} className="text-brand-primary" />
                            {entry.scoredMarks}{" "}
                            <span className="text-slate-400 font-normal text-sm">
                              / {entry.totalMarks}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500 rounded-full"
                                style={{ width: `${entry.percentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-slate-600">
                              {entry.percentage}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <Clock size={16} className="text-slate-400" />
                            {formatTime(entry.timeTaken)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden flex flex-col gap-4 p-4">
              {enrichedEntries.map((entry, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-4 relative overflow-hidden font-sans"
                >
                  {/* Decorative background if top 3 */}
                  {entry.rank <= 3 && (
                    <div
                      className={`absolute -top-4 -right-4 w-20 h-20 opacity-[0.08] rounded-full pointer-events-none ${
                        entry.rank === 1
                          ? "bg-yellow-500"
                          : entry.rank === 2
                            ? "bg-slate-700"
                            : "bg-amber-600"
                      }`}
                    />
                  )}

                  <div className="flex items-center gap-3 relative z-10">
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-full font-bold font-heading shrink-0 text-lg border-4 border-white shadow-sm
                      ${
                        entry.rank === 1
                          ? "bg-yellow-100 text-yellow-700"
                          : entry.rank === 2
                            ? "bg-slate-200 text-slate-700"
                            : entry.rank === 3
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {entry.rank}
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 font-heading mb-0.5">
                        {entry.rank === 1
                          ? "🥇 1st Place"
                          : entry.rank === 2
                            ? "🥈 2nd Place"
                            : entry.rank === 3
                              ? "🥉 3rd Place"
                              : `Rank #${entry.rank}`}
                      </span>
                      <div className="flex items-center gap-2">
                        {entry.user.imageUrl ? (
                          <Image
                            urlEndpoint={
                              process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!
                            }
                            src={entry.user.imageUrl}
                            alt="Avatar"
                            width={20}
                            height={20}
                            className="rounded-full bg-slate-100 object-cover"
                          />
                        ) : (
                          <div className="w-[20px] h-[20px] rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold font-heading text-[9px]">
                            {entry.user.firstName.charAt(0)}
                          </div>
                        )}
                        <span className="font-bold text-slate-900 font-sans text-base line-clamp-1">
                          {entry.user.firstName} {entry.user.lastName}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase tracking-widest font-heading font-bold">
                        <Target size={12} className="text-brand-primary" />
                        Score
                      </div>
                      <div className="flex items-end gap-1 pl-4">
                        <span className="text-sm font-bold text-slate-900">
                          {entry.scoredMarks}
                        </span>
                        <span className="text-xs text-slate-400 font-medium mb-px">
                          / {entry.totalMarks}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase tracking-widest font-heading font-bold">
                        <Trophy size={12} className="text-brand-primary" />
                        Accuracy
                      </div>
                      <span className="text-sm font-bold text-slate-900 pl-4">
                        {entry.percentage}%
                      </span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase tracking-widest font-heading font-bold">
                        <Clock size={12} className="text-brand-primary" />
                        Time
                      </div>
                      <span className="text-sm font-bold text-slate-900 pl-4">
                        {formatTime(entry.timeTaken)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Container>
  );
}
