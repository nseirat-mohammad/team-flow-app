//! components/ui/skeleton.tsx
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface SkeletonProps extends React.ComponentProps<"div"> {
    isChannelHeader?: boolean
    isMessageList?: boolean
    messageCount?: number
}

const MESSAGE_SKELETON_DEFAULT_COUNT = 5

type MessageSkeletonItem = {
    id: number
    nameWidth: string
    bubbleWidth: string
    hasImage: boolean
}

//! نمط ثابت (deterministic) يُستخدم في أول render على السيرفر والكلاينت،
// حتى لا يختلف الـ HTML الناتج بينهما (يمنع hydration mismatch)
function getStaticMessageSkeletonPattern(count: number): MessageSkeletonItem[] {
    const widths = ["70%", "55%", "85%", "60%", "90%", "50%", "75%", "65%"]
    const nameWidths = ["3.5rem", "4rem", "3rem", "4.5rem", "3.75rem"]

    return Array.from({ length: count }).map((_, i) => ({
        id: i,
        nameWidth: nameWidths[i % nameWidths.length],
        bubbleWidth: widths[i % widths.length],
        hasImage: i === 1 || i === 3, // ثابت، بدون عشوائية
    }))
}

//! النمط العشوائي الحقيقي — يُستدعى فقط بعد الـ mount على الكلاينت
function generateRandomMessageSkeletonPattern(count: number): MessageSkeletonItem[] {
    const widthPool = ["45%", "60%", "70%", "80%", "88%", "92%", "55%", "65%"]
    const nameWidthPool = ["3rem", "3.5rem", "4rem", "4.5rem", "3.75rem"]

    const imageCount = Math.min(2, count)
    const imageIndexes = new Set<number>()
    while (imageIndexes.size < imageCount) {
        imageIndexes.add(Math.floor(Math.random() * count))
    }

    return Array.from({ length: count }).map((_, i) => ({
        id: i,
        nameWidth: nameWidthPool[Math.floor(Math.random() * nameWidthPool.length)],
        bubbleWidth: widthPool[Math.floor(Math.random() * widthPool.length)],
        hasImage: imageIndexes.has(i),
    }))
}

function MessageListSkeletonContent({ messageCount }: { messageCount: number }) {
    // ! نبدأ بنمط ثابت (نفس الشيء على السيرفر والكلاينت) لتفادي hydration mismatch
    const [items, setItems] = useState<MessageSkeletonItem[]>(() =>
        getStaticMessageSkeletonPattern(messageCount)
    )

    useEffect(() => {
        // ! بعد اكتمال الـ hydration، نبدّل لنمط عشوائي حقيقي (تنفيذ كلاينت فقط)
        setItems(generateRandomMessageSkeletonPattern(messageCount))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messageCount])

    return (
        <div className="flex flex-col space-y-4 px-1 pt-2">
            {items.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                    <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                    <div className="flex flex-col gap-2 flex-1">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-3" style={{ width: item.nameWidth }} />
                            <Skeleton className="h-3 w-10" />
                        </div>
                        <Skeleton className="h-4 rounded-md" style={{ width: item.bubbleWidth }} />
                        {item.hasImage && (
                            <Skeleton className="h-44 w-48 rounded-lg mt-1" />
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}

function Skeleton({ className, isChannelHeader, isMessageList, messageCount = MESSAGE_SKELETON_DEFAULT_COUNT, ...props }: SkeletonProps) {
    if (isChannelHeader) {
        return (
            <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-6 w-32 rounded-md" />
            </div>
        )
    }

    if (isMessageList) {
        return <MessageListSkeletonContent messageCount={messageCount} />
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