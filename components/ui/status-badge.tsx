import { cn } from "@/lib/utils";
import { STATUS_MAP } from "../contants/test.constants";

type Status = keyof typeof STATUS_MAP;

export function StatusBadge({ status }: { status: Status }) {
  const s = STATUS_MAP[status];

  if (!s) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-heading font-bold border rounded-lg px-2.5 py-1",
        s.cls,
      )}
    >
      <span className="relative flex h-2 w-2">
        {s.ping && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        )}
        <span
          className={cn("relative inline-flex rounded-full h-2 w-2", s.dot)}
        />
      </span>
      {s.label}
    </span>
  );
}
