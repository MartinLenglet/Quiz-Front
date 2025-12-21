import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";

type Option = { id: number; name: string };

type Props = {
  valueId?: number | null;
  onChange: (nextId: number) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
};

export function ThemeCombobox({
  valueId,
  onChange,
  options,
  placeholder = "Choisir un thème…",
  disabled,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const selected = options.find((o) => o.id === valueId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          <span className={cn(!selected && "text-muted-foreground")}>
            {selected ? selected.name : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Rechercher…" />
          <CommandEmpty>Aucun résultat</CommandEmpty>
          <CommandGroup>
            {options.map((opt) => (
              <CommandItem
                key={opt.id}
                value={opt.name}
                onSelect={() => {
                  onChange(opt.id);
                  setOpen(false);
                }}
              >
                <Check className={cn("mr-2 h-4 w-4", opt.id === valueId ? "opacity-100" : "opacity-0")} />
                {opt.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
