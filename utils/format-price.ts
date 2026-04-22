export function toPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

export function formatPrice(paise: number): string {
  if (paise === 0) return "Free";
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}
