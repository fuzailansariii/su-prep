import { cn } from "@/lib/utils";
import { DIFFICULTY_VARIANT_MAP } from "../contants/test.constants";

type Difficulty = keyof typeof DIFFICULTY_VARIANT_MAP;

export function DifficultyBadge({
  difficulty,
  className,
}: {
  difficulty: Difficulty;
  className?: string;
}) {
  const variant = DIFFICULTY_VARIANT_MAP[difficulty];

  if (!variant) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center text-[11px] font-heading font-bold border rounded-lg px-2 py-0.5 capitalize",
        variant,
        className,
      )}
    >
      {difficulty}
    </span>
  );
}
