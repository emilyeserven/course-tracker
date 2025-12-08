import { CheckIcon, XIcon } from "lucide-react";

export function YesNoDisplay({
  value,
}: { value: boolean }) {
  return (
    <p className="flex flex-row items-center gap-1">
      {value
        ? (
          <>
            <CheckIcon size={14} />
            {" "}
            Yes
          </>
        )
        : (
          <>
            <XIcon size={14} />
            {" "}
            No
          </>
        )}
    </p>
  );
}
