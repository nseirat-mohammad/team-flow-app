"use client";
import { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuGroup,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from '../ui/dropdown-menu'
import TooltipWrapper from './tooltip-wrapper';
import { cn } from '@/lib/utils';

interface IDropdownWrapperProps {
    trigger: React.ReactNode;
    iconOnly?: boolean;
    tooltipContent?: string;
    tooltipSide?: "top" | "left" | "right" | "bottom";
    children: React.ReactNode;
    label?: string | React.ReactNode;
    labelClassName?: string;
    align?: "start" | "center" | "end";
    side?: "top" | "right" | "bottom" | "left";
    contentClassName?: string;
    triggerClassName?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    sideoffset?: number
}

export const DropdownWrapper = ({
    trigger,
    iconOnly = false,
    tooltipContent,
    tooltipSide = "bottom",
    children,
    label,
    labelClassName,
    align = "end",
    side = "bottom",
    contentClassName,
    triggerClassName,
    open: controlledOpen,
    sideoffset = 8,
    onOpenChange: controlledOnOpenChange,
}: IDropdownWrapperProps) => {

    // internal state تشتغل بس لو محدش بعت open/onOpenChange من برّه
    const [internalOpen, setInternalOpen] = useState(false);

    // لو الأب بعت open (حتى لو false)، يبقى controlled. وإلا uncontrolled.
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;

    const handleOpenChange = (nextOpen: boolean) => {
        if (!isControlled) {
            setInternalOpen(nextOpen);
        }
        controlledOnOpenChange?.(nextOpen);
    };

    const triggerElement = (
        <DropdownMenuTrigger className={triggerClassName} asChild>
            {trigger}
        </DropdownMenuTrigger>
    );

    return (
        <DropdownMenu open={open} onOpenChange={handleOpenChange}>
            {iconOnly && tooltipContent ? (
                <TooltipWrapper side={tooltipSide} content={tooltipContent}>
                    {triggerElement}
                </TooltipWrapper>
            ) : (
                triggerElement
            )}

            <DropdownMenuContent
                sideOffset={sideoffset}
                align={align}
                side={side}
                className={cn("min-w-[180px]", contentClassName)}
            >
                {label && (
                    <>
                        <DropdownMenuLabel className={labelClassName}>{label}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                    </>
                )}
                {children}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export {
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuGroup,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
}
/*
Usage:
<DropdownWrapper
  trigger={
    <Button size="icon" variant="ghost">
      <MoreVertical />
    </Button>
  }
  iconOnly
  tooltipContent="More options"
>
  <DropdownMenuItem onClick={() => {}}>
    <Pencil className="size-4" />
    Edit
  </DropdownMenuItem>

  <DropdownMenuItem onClick={() => {}}>
    <Copy className="size-4" />
    Duplicate
  </DropdownMenuItem>

  <DropdownMenuSeparator />

  <DropdownMenuItem
    onClick={() => {}}
    className="text-destructive focus:text-destructive focus:bg-destructive/10"
  >
    <Trash2 className="size-4" />
    Delete
  </DropdownMenuItem>
</DropdownWrapper>
*/