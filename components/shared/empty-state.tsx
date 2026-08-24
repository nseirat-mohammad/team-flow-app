import { LucideIcon, Sparkles } from "lucide-react"
import { ReactNode } from "react"

interface EmptyStateProps {
  icon: LucideIcon
  eyebrow?: string
  title: string
  description: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon,
  eyebrow,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
        <div
        className={`relative flex w-full max-w-md flex-col items-center justify-center gap-5 rounded-2xl border border-primary/30 bg-gradient-to-br from-orange-500/15 dark:from-orange-500/10 to-blue-500/15 dark:to-blue-500/10 p-16 text-center shadow-sm ${className}`}
        >
        {/* icon */}
        <div className="relative flex h-16 w-16 items-center justify-center rounded-md bg-primary/20">
            <Icon className="h-7 w-7 text-primary-foreground dark:text-primary" />

            <Sparkles className="absolute -right-1.5 -top-1.5 h-4 w-4 text-primary animate-[twinkleA_3s_ease-in-out_infinite]" />
            <Sparkles className="absolute -left-1.5 -bottom-1 h-3.5 w-3.5 text-primary animate-[twinkleB_3s_ease-in-out_infinite]" />
        </div>

        {/* eyebrow + title */}
        <div className="animate-[fadeInUp_0.5s_ease-out]">
            {eyebrow && (
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {eyebrow}
            </p>
            )}
            <h1 className="mt-1.5 text-xl font-bold text-foreground capitalize">{title}</h1>
        </div>

        {/* description */}
        <p className="max-w-xs text-sm leading-relaxed text-muted-foreground animate-[fadeInUp_0.6s_ease-out]">
            {description}
        </p>

        {action && (
            <div className="mt-1 animate-[fadeInUp_0.7s_ease-out]">{action}</div>
        )}

        <style>{`
            @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
            }
            @keyframes twinkleA {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0; transform: scale(0.6); }
            }
            @keyframes twinkleB {
            0%, 100% { opacity: 0; transform: scale(0.6); }
            50% { opacity: 1; transform: scale(1); }
            }
        `}</style>
        </div>
)}