import type { TaskResourceLevel } from "@emstack/types";

export function LevelTriad({
  easeOfStarting,
  timeNeeded,
  interactivity,
  onChange,
}: {
  easeOfStarting: TaskResourceLevel | "";
  timeNeeded: TaskResourceLevel | "";
  interactivity: TaskResourceLevel | "";
  onChange: (
    patch: Partial<{
      easeOfStarting: TaskResourceLevel | "";
      timeNeeded: TaskResourceLevel | "";
      interactivity: TaskResourceLevel | "";
    }>,
  ) => void;
}) {
  function levelSelect(
    label: string,
    value: TaskResourceLevel | "",
    key: "easeOfStarting" | "timeNeeded" | "interactivity",
  ) {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">
          {label}
        </label>
        <select
          value={value}
          onChange={e =>
            onChange({
              [key]: (e.target.value || "") as TaskResourceLevel | "",
            })}
          className="
            flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm
          "
        >
          <option value="">—</option>
          <option value="low">low</option>
          <option value="medium">medium</option>
          <option value="high">high</option>
        </select>
      </div>
    );
  }
  return (
    <div
      className="
        grid grid-cols-1 gap-3
        md:grid-cols-3
      "
    >
      {levelSelect("Ease of Starting", easeOfStarting, "easeOfStarting")}
      {levelSelect("Time Needed", timeNeeded, "timeNeeded")}
      {levelSelect("Interactivity", interactivity, "interactivity")}
    </div>
  );
}
