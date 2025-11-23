import { useState } from "react";

import { CheckIcon, CopyIcon } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/dialog";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupTextarea } from "@/components/input-group";

export function SaveDialog() {
  const [isCopied, setIsCopied] = useState(false);

  function copy_to_clipboard(elm_id: string) {
    const text = document.getElementById(elm_id)?.innerHTML;

    navigator.clipboard.writeText(text ?? "");
    setIsCopied(true);
  }

  return (
    <Dialog onOpenChange={() => setIsCopied(false)}>
      <DialogTrigger>
        Save/Backup Data
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Backup/Save Data</DialogTitle>
          <DialogDescription>
            Copy the below and save it somewhere to backup your onboarding data.
          </DialogDescription>
        </DialogHeader>

        <div className="grid w-full max-w-md gap-4">
          <InputGroup>
            <InputGroupTextarea
              id="copyContent"
              value={localStorage.getItem("courseData") ?? ""}
              className="min-h-[200px]"
              readOnly={true}
            />
            <InputGroupAddon
              align="block-start"
              className="flex justify-between border-b"
            >
              <span>LocalStorage Data</span>
              <InputGroupButton
                variant="ghost"
                size="icon-xs"
                onClick={() => copy_to_clipboard("copyContent")}
              >
                {isCopied ? <CheckIcon /> : <CopyIcon />}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </DialogContent>
    </Dialog>
  );
}
