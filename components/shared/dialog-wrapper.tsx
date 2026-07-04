import { cn } from '@/lib/utils';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import TooltipWrapper from './tooltip-wrapper';
import { X } from 'lucide-react';
import BorderAnimatedContainer from './border-animated-container';

interface IDialogWrapperProps {
    trigger: React.ReactNode;
    iconOnly?: boolean;
    tooltipContent?: string
    tooltipSide?: "top" | "left" | "right" | "bottom"
    open: boolean;
    onOpenChange: (open: boolean) => void;
    dialogContentClassName?: string
    icon?: React.ReactNode
    iconClassName?: string
    title?: string
    description?: string
    children: React.ReactNode
    footer?: React.ReactNode
    footerClassName?: string
    triggerClassName?: string
    titleClassName?: string
    descriptionClassName?: string


}

export const DialogWrapper = ({ trigger, triggerClassName, open = false, onOpenChange, icon, iconClassName, iconOnly = false, tooltipContent, tooltipSide = "bottom", dialogContentClassName, children, title, titleClassName, description, descriptionClassName, footer, footerClassName }: IDialogWrapperProps) => {

    const triggerElment = <DialogTrigger className={triggerClassName} asChild>{trigger}</DialogTrigger>
    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>

                {/* Dispaly the dialog trigger based on the iconOnly or not: */}
                {iconOnly && tooltipContent ? (
                    <TooltipWrapper side={tooltipSide} content={tooltipContent}>
                        {triggerElment}
                    </TooltipWrapper>
                ) : (
                    <>
                        {triggerElment}
                    </>
                )}
                {/* Dialog Content */}
                <DialogContent className={cn(
                    "bg--zinc-200 dark:bg-zinc-950 border border-border/60",
                    dialogContentClassName
                )}>
                    {(icon || title || description) && (
                        <DialogHeader className={icon ? "flex-row items-center gap-3 " : undefined}>
                            {icon && (
                                <div className={cn(
                                    "flex items-center justify-center size-14 rounded-lg bg-primary/30 shrink-0",
                                    iconClassName
                                )}>
                                    {icon}
                                </div>
                            )}
                            <div className="flex flex-col gap-1">
                                {title && (
                                    <DialogTitle className={cn(
                                        "text-xl font-[400] tracking-wide text-foreground",
                                        titleClassName
                                    )}>
                                        {title}
                                    </DialogTitle>
                                )}
                                {description && (
                                    <DialogDescription className={cn(
                                        "text-sm text-muted-foreground",
                                        descriptionClassName
                                    )}>
                                        {description}
                                    </DialogDescription>
                                )}
                            </div>
                        </DialogHeader>
                    )}
                    {children}

                </DialogContent>
                <div className="h-px w-full mx-auto bg-secondary" />
                {footer && (
                    <DialogFooter className={footerClassName}>{footer}</DialogFooter>
                )}
            </Dialog>
        </>
    )
}


/*
Usage:
<GlobalDialog
  trigger={
    <Button size="icon" variant="ghost">
      <Plus />
    </Button>
  }
  iconOnly
  tooltip="Add workspace"
  title="Create workspace"
  description="Give your new workspace a name."
  footer={<Button type="submit">Create</Button>}
>
  <Input placeholder="Workspace name" />
</GlobalDialog>


*/