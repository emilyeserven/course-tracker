interface QuadrantsIllustrationProps {
  names: string[];
}

const QUADRANT_COLORS = [
  "fill-blue-100 stroke-blue-300",
  "fill-emerald-100 stroke-emerald-300",
  "fill-amber-100 stroke-amber-300",
  "fill-rose-100 stroke-rose-300",
  "fill-violet-100 stroke-violet-300",
];

export function QuadrantsIllustration({
  names,
}: QuadrantsIllustrationProps) {
  const cleanNames = names.map(n => n.trim());
  const slots = cleanNames.length > 0 ? cleanNames : ["", "", "", "", ""];
  const count = slots.length;

  const cx = 100;
  const cy = 100;
  const r = 80;
  const labelRadius = 50;

  const angleSize = (Math.PI * 2) / count;
  const startOffset = -Math.PI / 2 - angleSize / 2;

  const sectors = slots.map((name, idx) => {
    const startAngle = startOffset + idx * angleSize;
    const endAngle = startAngle + angleSize;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = angleSize > Math.PI ? 1 : 0;

    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    const midAngle = startAngle + angleSize / 2;
    const lx = cx + labelRadius * Math.cos(midAngle);
    const ly = cy + labelRadius * Math.sin(midAngle);

    return {
      key: idx,
      path,
      lx,
      ly,
      label: name || `${idx + 1}`,
      colorClass: QUADRANT_COLORS[idx % QUADRANT_COLORS.length],
    };
  });

  return (
    <svg
      viewBox="0 0 200 200"
      className="size-40"
      role="img"
      aria-label="Quadrants illustration"
    >
      {sectors.map(s => (
        <path
          key={s.key}
          d={s.path}
          className={`
            stroke-1
            ${s.colorClass}
          `}
        />
      ))}
      {sectors.map(s => (
        <text
          key={`t-${s.key}`}
          x={s.lx}
          y={s.ly}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-foreground text-[7px] font-medium"
        >
          {s.label.length > 14 ? `${s.label.slice(0, 13)}…` : s.label}
        </text>
      ))}
    </svg>
  );
}

interface RingsIllustrationProps {
  names: string[];
}

export function RingsIllustration({
  names,
}: RingsIllustrationProps) {
  const cleanNames = names.map(n => n.trim());
  const slots = cleanNames.length > 0 ? cleanNames : [""];
  const count = slots.length;

  const cx = 100;
  const cy = 100;
  const maxR = 80;
  const minR = 12;

  const step = count > 1 ? (maxR - minR) / (count - 1) : 0;

  const ringRadii = slots.map((_, idx) => maxR - idx * step);

  return (
    <svg
      viewBox="0 0 200 200"
      className="size-40"
      role="img"
      aria-label="Rings illustration"
    >
      {ringRadii.map((rad, idx) => (
        <circle
          key={idx}
          cx={cx}
          cy={cy}
          r={rad}
          className="fill-none stroke-muted-foreground/40"
          strokeWidth={1}
        />
      ))}
      {slots.map((name, idx) => {
        const labelY = cy - ringRadii[idx]
          + (idx === slots.length - 1 ? minR / 2 + 2 : step / 2 + 2);
        const label = name.trim() || `${idx + 1}`;
        return (
          <text
            key={idx}
            x={cx}
            y={labelY}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-foreground text-[7px] font-medium"
          >
            {label.length > 14 ? `${label.slice(0, 13)}…` : label}
          </text>
        );
      })}
    </svg>
  );
}
