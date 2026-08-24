'use client'

import { Loader, Send, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import TooltipWrapper from './tooltip-wrapper'

interface ISendButtonProps {
    onClick: () => void
    disabled?: boolean
    icon?: LucideIcon
    label?: string
    showLabel?: boolean
    className?: string
    isPending?: boolean
}

const SendButton = ({
    onClick,
    disabled,
    icon: Icon = Send,
    label = 'Send',
    showLabel = false,
    isPending = false,
    className,
}: ISendButtonProps) => {
    const handleClick = () => {
        if (disabled) return
        onClick()
    }

    const button = (
        <Button
            type="button"
            size={showLabel ? 'default' : 'icon'}
            onClick={handleClick}
            disabled={disabled || isPending}
            aria-label={label}
            className={cn(
                'rounded-md px-4 py-2 bg-primary text-primary-foreground border border-primary/20',
                'hover:bg-primary/90 hover:border-primary/30',
                'active:scale-95',
                'disabled:bg-primary/30 disabled:border-primary/10 disabled:pointer-events-none',
                'data-[state=loading]:cursor-not-allowed data-[state=loading]:opacity-50',
                'transition-all duration-200 ease-out cursor-pointer',
                className
            )}
        >
            <span className="flex items-center gap-2">
                <Icon className="size-4 fill-current text-primary-foreground" />
                {showLabel && ( label)}
            </span>
        </Button>
    )

    if (showLabel) {
        return button
    }

    return (
        <TooltipWrapper content={label}>
            {button}
        </TooltipWrapper>
    )
}

export default SendButton