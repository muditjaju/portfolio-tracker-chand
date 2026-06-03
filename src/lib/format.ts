export const fmt = (n: number | null, decimals = 2): string => {
  if (n === null || isNaN(n)) return "—";
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
};

export const fmtLakh = (n: number | null): string => {
  if (n === null || isNaN(n)) return "—";
  return `₹${fmt(n / 100000)} L`;
};
