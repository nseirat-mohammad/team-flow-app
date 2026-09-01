    // components/ui/skeleton.tsx
    import { cn } from "@/lib/utils"

    interface SkeletonProps extends React.ComponentProps<"div"> {
    isChannelHeader?: boolean
    }

    function Skeleton({ className, isChannelHeader, ...props }: SkeletonProps) {
    if (isChannelHeader) {
        return (
        <div className="flex items-center gap-2">
            {/* placeholder للـ # */}
            <Skeleton className="h-5 w-5 rounded" />
            {/* placeholder لاسم القناة */}
            <Skeleton className="h-6 w-32 rounded-md" />
        </div>
        )
    }

    return (
        <div
        className={cn(
            "rounded-md bg-gradient-to-r from-primary/10 via-primary/25 to-primary/10",
            "bg-[length:200%_100%] animate-shimmer",
            className
        )}
        {...props}
        />
    )
    }

export { Skeleton }

// components/ui/skeleton.tsx
// import { cn } from "@/lib/utils"

// function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
//   return (
//     <div
//       className={cn("animate-pulse rounded-md bg-primary/10", className)}
//       {...props}
//     />
//   )
// }

// export { Skeleton }