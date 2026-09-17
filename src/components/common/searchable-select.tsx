"use client"

/**
 * Select con búsqueda reutilizable (combobox): un trigger tipo
 * botón que abre un panel con un campo de texto y una lista de
 * opciones filtrables por nombre. Componente presentacional
 * controlado por el padre (value + onValueChange).
 */

import { useState } from "react"
import { ChevronsUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { cn } from "cn"

export type SearchableSelectOption = { value: string; label: string }

interface SearchableSelectProps {
    /** Valor actual (debe existir en options para mostrar su label). */
    value: string
    onValueChange: (value: string) => void
    options: SearchableSelectOption[]
    /** Texto del trigger cuando ninguna opción coincide con value. */
    placeholder?: string
    /** Placeholder del campo de búsqueda del panel. */
    searchPlaceholder?: string
    /** Texto cuando la búsqueda no arroja resultados. */
    emptyText?: string
    triggerClassName?: string
    contentClassName?: string
    ariaLabel?: string
    /** Marca el trigger como inválido (aria-invalid), para form errors. */
    ariaInvalid?: boolean
    /** Id del mensaje de error asociado al trigger (aria-describedby). */
    ariaDescribedby?: string
    disabled?: boolean
}

export function SearchableSelect({
    value,
    onValueChange,
    options,
    placeholder,
    searchPlaceholder,
    emptyText = "Sin resultados",
    triggerClassName,
    contentClassName,
    ariaLabel,
    ariaInvalid,
    ariaDescribedby,
    disabled,
}: SearchableSelectProps) {
    const [open, setOpen] = useState(false)

    const selected = options.find((option) => option.value === value)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
                render={
                    <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        aria-label={ariaLabel}
                        aria-invalid={ariaInvalid || undefined}
                        aria-describedby={ariaDescribedby}
                        disabled={disabled}
                        className={cn(
                            "justify-between font-normal",
                            triggerClassName
                        )}
                    >
                        <span className="truncate">
                            {selected ? selected.label : placeholder}
                        </span>
                        <ChevronsUpDown
                            className="size-4 shrink-0 opacity-50"
                            aria-hidden="true"
                        />
                    </Button>
                }
            />
            <PopoverContent
                align="start"
                className={cn("w-(--anchor-width) p-0", contentClassName)}
            >
                <Command>
                    <CommandInput placeholder={searchPlaceholder} />
                    <CommandList>
                        <CommandEmpty>{emptyText}</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.value}
                                    keywords={[option.label]}
                                    data-checked={
                                        value === option.value || undefined
                                    }
                                    onSelect={() => {
                                        onValueChange(option.value)
                                        setOpen(false)
                                    }}
                                >
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}