"use client";

/**
 * Barra de paginación reutilizable.
 * Muestra el resumen de registros y permite cambiar de página.
 * El padre controla la página actual mediante onPageChange.
 *
 * Usa componentes de shadcn y un Input para escribir directamente
 * el número de página. El input se actualiza cuando cambia page.
 */

import type { FocusEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
} from "@/components/ui/pagination";
import { cn } from "cn";

interface PaginationBarProps {
    /** Índice de página actual (base 0). */
    page: number;
    /** Cantidad total de páginas. */
    pageCount: number;
    /** Notifica el nuevo índice de página (base 0). */
    onPageChange: (page: number) => void;
    /** Si se provee, muestra "Mostrando X–Y de N" a la izquierda del control. */
    summary?: {
        from: number;
        to: number;
        total: number;
        /** Formatea el total con la etiqueta del recurso (ej. "5 productos"). */
        formatCount: (count: number) => string;
    };
    /** Texto del landmark nav. */
    ariaLabel?: string;
    className?: string;
}

const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);

/** Interpreta el texto del input (1-based) y devuelve un índice de
 * página (0-based) dentro de rango. Si el texto no es un número,
 * devuelve la página actual. */
const parsePageInput = (
    raw: string,
    currentPage: number,
    pageCount: number,
) => {
    const parsed = Number.parseInt(raw, 10);
    if (Number.isNaN(parsed)) return currentPage;
    return clamp(parsed - 1, 0, pageCount - 1);
};

export function PaginationBar({
    page,
    pageCount,
    onPageChange,
    summary,
    ariaLabel = "Paginación",
    className,
}: PaginationBarProps) {
    const safePageCount = Math.max(1, pageCount);
    const isSinglePage = safePageCount <= 1;
    const lastPage = safePageCount - 1;

    const goToPage = (target: number) => onPageChange(clamp(target, 0, lastPage));

    const handlePageChange = (event: FocusEvent<HTMLInputElement>) => {
        const target = parsePageInput(
            event.currentTarget.value,
            page,
            safePageCount,
        );
        onPageChange(target);
        event.currentTarget.value = String(target + 1);
    };

    return (
        <div className="grid w-full grid-cols-[1fr_auto] items-center justify-between gap-3">
            {summary && summary.total > 0 && (
                <p className="min-w-0 truncate text-sm text-muted-foreground">
                    Mostrando{" "}
                    <span className="font-semibold text-primary">
                        {summary.from}–{summary.to}
                    </span>{" "}
                    de {summary.formatCount(summary.total)}
                </p>
            )}

            <Pagination
                aria-label={ariaLabel}
                className={cn(
                    "inline-flex w-fit shrink-0 items-center rounded-xl border border-primary/25 bg-gradient-to-b from-primary/10 to-primary/5 p-1 shadow-sm backdrop-blur-sm transition-colors hover:border-primary/40 hover:shadow-md",
                    className,
                )}
            >
                <PaginationContent className="gap-0.5">
                    <PaginationItem>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-lg text-primary transition-colors hover:bg-primary/15 hover:text-primary focus-visible:ring-primary/40 disabled:opacity-30"
                            aria-label="Página anterior"
                            onClick={() => goToPage(page - 1)}
                            disabled={isSinglePage || page <= 0}
                        >
                            <ChevronLeft className="size-4" aria-hidden="true" />
                        </Button>
                    </PaginationItem>
                    <PaginationItem>
                        <div className="mx-0.5 flex h-8 items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 text-xs font-medium text-primary/80">
                            <Input
                                key={page}
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                defaultValue={page + 1}
                                onBlur={handlePageChange}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        event.currentTarget.blur();
                                    }
                                }}
                                disabled={isSinglePage}
                                aria-label="Ir a la página"
                                className="h-6 w-9 rounded-md border-transparent bg-transparent px-1 text-center text-xs font-semibold tabular-nums text-primary shadow-none transition-colors focus-visible:border-primary/40 focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary/30 disabled:opacity-100"
                            />
                            <span className="select-none text-primary/30">/</span>
                            <span className="tabular-nums text-primary/70">
                                {safePageCount}
                            </span>
                        </div>
                    </PaginationItem>
                    <PaginationItem>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-lg text-primary transition-colors hover:bg-primary/15 hover:text-primary focus-visible:ring-primary/40 disabled:opacity-30"
                            aria-label="Página siguiente"
                            onClick={() => goToPage(page + 1)}
                            disabled={isSinglePage || page >= lastPage}
                        >
                            <ChevronRight className="size-4" aria-hidden="true" />
                        </Button>
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}