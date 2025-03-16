"use client"

import * as React from "react"
import { X, Check, ChevronsUpDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type Option = {
  value: string
  label: string
}

interface MultiSelectProps {
  options: Option[]
  selected: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  className?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Selecione...",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const handleUnselect = (option: string) => {
    onChange(selected.filter((s) => s !== option))
  }

  const handleSelect = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option))
    } else {
      onChange([...selected, option])
    }
  }

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="w-full relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between", className)}
          >
            <div className="flex flex-wrap gap-1 truncate">
              {selected.length > 0 ? (
                <span className="text-sm">
                  {selected.length} selecionado{selected.length !== 1 ? "s" : ""}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[var(--radix-popover-trigger-width)] p-2 bg-white shadow-md border rounded-md z-50" 
          align="start"
          side="bottom"
          sideOffset={4}
        >
          <div className="space-y-2">
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8"
            />
            <div className="max-h-[200px] overflow-auto space-y-1">
              {filteredOptions.length === 0 ? (
                <div className="text-sm text-muted-foreground py-1.5 px-2">
                  Nenhuma opção encontrada.
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      "flex items-center gap-2 w-full rounded-sm px-2 py-1.5 text-sm hover:bg-gray-100 focus:bg-gray-100 active:bg-gray-200 outline-none",
                      selected.includes(option.value) && "bg-gray-50"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-sm border transition-colors",
                        selected.includes(option.value)
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-gray-300"
                      )}
                    >
                      <Check
                        className={cn(
                          "h-3 w-3 transition-opacity",
                          selected.includes(option.value) ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </div>
                    <span className="flex-1 text-left truncate">{option.label}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selected.map((value) => {
            const option = options.find((o) => o.value === value)
            return (
              <Badge
                key={value}
                variant="secondary"
                className="rounded-sm px-1 font-normal"
              >
                {option?.label}
                <button
                  className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onClick={(e) => {
                    e.preventDefault()
                    handleUnselect(value)
                  }}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            )
          })}
        </div>
      )}
    </div>
  )
} 