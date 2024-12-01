import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InputFileProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function InputFile({ onChange }: InputFileProps) {
  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="picture">Picture</Label>
      <Input id="picture" type="file" onChange={onChange} />
    </div>
  );
}
