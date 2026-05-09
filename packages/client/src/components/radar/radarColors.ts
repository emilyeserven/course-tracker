export const SLICE_PILL_CLASSES = [
  "bg-blue-100 text-blue-800 ring-1 ring-blue-300",
  "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300",
  "bg-amber-100 text-amber-800 ring-1 ring-amber-300",
  "bg-rose-100 text-rose-800 ring-1 ring-rose-300",
  "bg-violet-100 text-violet-800 ring-1 ring-violet-300",
];

export const RING_PILL_CLASSES = [
  "bg-slate-100 text-slate-800 ring-1 ring-slate-300",
  "bg-slate-200 text-slate-900 ring-1 ring-slate-400",
  "bg-slate-300 text-slate-900 ring-1 ring-slate-500",
  "bg-slate-400 text-slate-50 ring-1 ring-slate-500",
  "bg-slate-500 text-white ring-1 ring-slate-600",
  "bg-slate-700 text-white ring-1 ring-slate-800",
];

export function pillClassByIndex(palette: string[], idx: number): string {
  if (palette.length === 0) {
    return "";
  }
  const clamped = Math.max(0, Math.min(idx, palette.length - 1));
  return palette[clamped];
}
