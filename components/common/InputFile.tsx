import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";

interface InputFileProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function InputFile({ onChange }: InputFileProps) {
  return (
    <div className="flex w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="picture" className="shrink-0">
        图片
      </Label>
      <Input id="picture" type="file" onChange={onChange} />
    </div>
  );
}
