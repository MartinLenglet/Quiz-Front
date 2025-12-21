import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";

type Option = { id: number; label: string; description?: string };

type Props = {
  values: number[];
  onChange: (next: number[]) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
};

export function MultiSelectCombobox({ values, onChange, options, placeholder = "Sélectionner…", disabled }: Props) {
  const [open, setOpen] = React.useState(false);

  const selected = options.filter((o) => values.includes(o.id));

  function toggle(id: number) {
    if (values.includes(id)) onChange(values.filter((v) => v !== id));
    else onChange([...values, id]);
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" className="w-full justify-between" disabled={disabled}>
            <span className={cn(selected.length === 0 && "text-muted-foreground")}>
              {selected.length === 0 ? placeholder : `${selected.length} sélectionné(s)`}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder="Rechercher…" />
            <CommandEmpty>Aucun résultat</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => {
                const isSelected = values.includes(opt.id);
                return (
                  <CommandItem
                    key={opt.id}
                    value={opt.label}
                    onSelect={() => toggle(opt.id)}
                    className="flex items-start gap-2"
                  >
                    <Check className={cn("mt-0.5 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                    <div className="flex flex-col">
                      <span>{opt.label}</span>
                      {opt.description ? (
                        <span className="text-xs text-muted-foreground">{opt.description}</span>
                      ) : null}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {selected.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selected.map((s) => (
            <Badge key={s.id} variant="secondary" className="cursor-pointer" onClick={() => toggle(s.id)}>
              {s.label}
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}
