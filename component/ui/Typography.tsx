type Variant = "h1" | "h2" | "h3" | "body" | "label";

const styles: Record<Variant, string> = {
  h1: "font-[family-name:var(--font-headline)] text-4xl font-bold",
  h2: "font-[family-name:var(--font-headline)] text-2xl font-semibold",
  h3: "font-[family-name:var(--font-headline)] text-xl font-semibold",
  body: "font-[family-name:var(--font-body)] text-base font-normal",
  label: "font-[family-name:var(--font-body)] text-sm font-medium",
};

export function Text({
  variant = "body",
  children,
  className = "",
}: {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
}) {
  const Tag = variant.startsWith("h") ? (variant as "h1" | "h2" | "h3") : "p";
  return <Tag className={`${styles[variant]} ${className}`}>{children}</Tag>;
}
