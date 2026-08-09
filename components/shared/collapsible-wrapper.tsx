"use client"

import * as React from "react"
import { ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface CollapsibleWrapperProps {
    title: React.ReactNode
    summary?: React.ReactNode
    children: React.ReactNode
    defaultOpen?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
    className?: string
    triggerClassName?: string
    contentClassName?: string
}
export function CollapsibleWrapper({
    title,
    summary,
    children,
    defaultOpen = false,
    open,
    onOpenChange,
    className,
    triggerClassName,
    contentClassName,
}: CollapsibleWrapperProps) {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)

    const isOpen = open ?? uncontrolledOpen
    const setIsOpen = onOpenChange ?? setUncontrolledOpen

    return (
        <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className={cn("flex w-full max-w-[350px] flex-col gap-2", className)}
        >
            <CollapsibleTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        "group cursor-pointer flex w-full items-center justify-between gap-4 rounded-md px-4 py-2 text-left",
                        "transition-colors duration-200",
                        "bg-primary/0 hover:bg-primary/10 active:bg-primary/15",
                        "data-[state=open]:bg-primary/20",
                        "text-muted-foreground data-[state=open]:text-foreground",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        triggerClassName
                    )}
                >
                    <h4 className="text-sm font-semibold">{title}</h4>
                    <ChevronUp
                        className={cn(
                            "size-4 shrink-0 text-muted-foreground transition-transform duration-300 ease-in-out",
                            "group-hover:text-foreground",
                            isOpen && "rotate-180"
                        )}
                    />
                    <span className="sr-only">Toggle details</span>
                </button>
            </CollapsibleTrigger>

            {summary && (
                <div className="flex items-center justify-between rounded-md border px-4 py-2 text-sm">
                    {summary}
                </div>
            )}

            <CollapsibleContent
                className={cn(
                    "overflow-hidden",
                    "data-[state=open]:animate-[collapsible-down_300ms_cubic-bezier(0.4,0,0.2,1)]",
                    "data-[state=closed]:animate-[collapsible-up_300ms_cubic-bezier(0.4,0,0.2,1)]",
                    contentClassName
                )}
            >
                <div className="flex flex-col gap-2 pt-1">{children}</div>
            </CollapsibleContent>
        </Collapsible>
    )
}