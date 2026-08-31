import { LucideIcon } from "lucide-react"

interface FloatingStatusIndicatorProps {
  icon: LucideIcon
  label?: string
  className?: string
}

export function FloatingStatusIndicator({
    icon: Icon,
    label,
    className = "",
    }: FloatingStatusIndicatorProps) {
    return (
        <div
        className={`pointer-events-none absolute top-3 left-0 right-0 z-20 flex items-center justify-center animate-[fadeInDown_0.25s_ease-out] ${className}`}
        >
        <div
            className={`flex items-center justify-center gap-2 rounded-full border border-primary/20 bg-primary/15 backdrop-blur-sm shadow-md ${
            label ? "px-4 py-2" : "p-2.5"
            }`}
        >
            {label && (
                <span className="text-xs font-medium italic text-muted-foreground">
                    {label}
                </span>
            )}
            <Icon className="w-3.5 h-3.5 animate-spin text-primary" />
        </div>

        <style jsx>{`
            @keyframes fadeInDown {
            from { opacity: 0; transform: translateY(-6px); }
            to { opacity: 1; transform: translateY(0); }
            }
        `}</style>
        </div>
    )
}