export const SLICE_PILL_CLASSES = [
  "bg-blue-100 text-blue-800 ring-1 ring-blue-300 dark:bg-blue-900/40 dark:text-blue-200 dark:ring-blue-700",
  "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-200 dark:ring-emerald-700",
  "bg-amber-100 text-amber-800 ring-1 ring-amber-300 dark:bg-amber-900/40 dark:text-amber-200 dark:ring-amber-700",
  "bg-rose-100 text-rose-800 ring-1 ring-rose-300 dark:bg-rose-900/40 dark:text-rose-200 dark:ring-rose-700",
  "bg-violet-100 text-violet-800 ring-1 ring-violet-300 dark:bg-violet-900/40 dark:text-violet-200 dark:ring-violet-700",
];

export const RING_PILL_CLASSES = [
  "bg-slate-100 text-slate-800 ring-1 ring-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700",
  "bg-slate-200 text-slate-900 ring-1 ring-slate-400 dark:bg-slate-700 dark:text-slate-100 dark:ring-slate-600",
  "bg-slate-300 text-slate-900 ring-1 ring-slate-500 dark:bg-slate-600 dark:text-slate-50 dark:ring-slate-500",
  "bg-slate-400 text-slate-50 ring-1 ring-slate-500 dark:bg-slate-500 dark:ring-slate-400",
  "bg-slate-500 text-white ring-1 ring-slate-600 dark:bg-slate-500 dark:ring-slate-400",
  "bg-slate-700 text-white ring-1 ring-slate-800 dark:bg-slate-600 dark:ring-slate-400",
];

export function pillClassByIndex(palette: string[], idx: number): string {
  if (palette.length === 0) {
    return "";
  }
  const clamped = Math.max(0, Math.min(idx, palette.length - 1));
  return palette[clamped];
}
