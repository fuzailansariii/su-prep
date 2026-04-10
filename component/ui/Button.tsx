type Variant = "primary" | "secondary" | "inverted" | "outlined";

const variants: Record<Variant, string> = {
  primary: "bg-[#4F46E5] text-white hover:opacity-90 font-body",
  secondary:
    "bg-transparent text-gray-800 border border-gray-300 hover:bg-gray-100 font-body font-semibold",
  inverted: "bg-[#1E293B] text-white hover:opacity-90 font-heading",
  outlined:
    "bg-transparent text-gray-800 border border-[#4F46E5] hover:bg-indigo-50",
};

export function Button({
  variant = "primary",
  children,
  ...props
}: {
  variant?: Variant;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex w-full justify-center items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
        transition-all active:scale-95 ${variants[variant]}`}
      {...props}
    >
      {children}
    </button>
  );
}
