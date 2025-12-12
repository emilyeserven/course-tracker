import type { ReactNode } from "react";

import { useState } from "react";

import { TrashIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

interface DeleteButtonProps {
  onClick?: () => void;
  children?: ReactNode;
}
export function DeleteButton({
  onClick,
  children,
}: DeleteButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  if (isConfirming) {
    return (
      <div className="flex flex-row items-center gap-2">
        Are you sure?
        <div className="flex flex-row gap-1">
          <Button
            variant="destructive"
            onClick={onClick}
            size="icon"
          >
            <TrashIcon />
          </Button>
          <Button
            size="icon"
            onClick={() => setIsConfirming(false)}
          >
            <XIcon />
          </Button>
        </div>
      </div>
    );
  }
  return (
    <Button
      variant="secondary"
      onClick={() => setIsConfirming(true)}
    >
      {children}
      {" "}
      <TrashIcon />
    </Button>
  );
}
