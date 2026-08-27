
"use client";
import { useInfiniteQuery } from "@tanstack/react-query"
import { MessageItem } from "./message-item"
import { orpc } from "@/lib/orpc"
import { useChannelId } from "@/lib/hooks/channels/use-channel-id";
import { Message } from "@/lib/generated/prisma/client";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";
import { formatDateSeparator, isSameDay } from "@/lib/helpers";

const MessagesList = () => {
    const channelId = useChannelId()
    const [hasInitialScroll, setHasInitialScroll] = useState<boolean>(false);
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const [isAtBottom, setIsAtBottom] = useState<boolean>(false);
    const bottomRef = useRef<HTMLDivElement | null>(null);
    const [newMessages, setNewMessages] = useState<boolean>(false);
    const [newMessagesCount, setNewMessagesCount] = useState<number>(0);
    const [showTooltip, setShowTooltip] = useState<boolean>(false);
    const [buttonMounted, setButtonMounted] = useState<boolean>(false);
    const tooltipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastItemIdRef = useRef<string | undefined>(undefined);

        const [now, setNow] = useState<Date>(new Date());

    // ! نجدول تحديث واحد بالظبط عند منتصف الليل، ثم نعيد الجدولة لليوم التالي
    useEffect(() => {
        const scheduleMidnightUpdate = () => {
            const nowValue = new Date()
            const nextMidnight = new Date(
                nowValue.getFullYear(),
                nowValue.getMonth(),
                nowValue.getDate() + 1,
                0, 0, 0, 0
            )
            const msUntilMidnight = nextMidnight.getTime() - nowValue.getTime()

            return setTimeout(() => {
                setNow(new Date())
                timeoutRef.current = scheduleMidnightUpdate()
            }, msUntilMidnight)
        }

        const timeoutRef = { current: scheduleMidnightUpdate() }

        return () => clearTimeout(timeoutRef.current)
    }, [])
    const infiniteOptions = orpc.message.list.infiniteOptions({
        input: (pageParam: string | undefined) => ({
            channelId,
            cursor: pageParam,
            limit: 30
        }),
        initialPageParam: undefined,
        getNextPageParam: (lastPage: { items: Message[]; nextCursor?: string | undefined; }) => lastPage.nextCursor,
        select: (data) => ({
            pages: [...data.pages].map((p) => ({ ...p, items: [...p.items].reverse() })).reverse(),
            pageParams: [...data.pageParams].reverse()
        })
    })

    const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isLoading, isFetching } = useInfiniteQuery({
        ...infiniteOptions,
        staleTime: 30_000,
        refetchOnWindowFocus: false
    })

    useEffect(() => {
        if (!hasInitialScroll && data?.pages.length) {
            const el = scrollRef.current
            if (el) {
                el.scrollTop = el.scrollHeight
                setHasInitialScroll(true)
                setIsAtBottom(true)
            }
        }
    }, [hasInitialScroll, data?.pages.length])

    const handleScroll = () => {
        const el = scrollRef.current
        if (!el) return;

        if (el.scrollTop <= 80 && hasNextPage && !isFetching) {
            const previousScrollTop = el.scrollTop
            const previousScrollHeight = el.scrollHeight
            fetchNextPage().then(() => {
                const newScrollHeight = el.scrollHeight
                el.scrollTop = newScrollHeight - previousScrollHeight + previousScrollTop
            })
        }
        setIsAtBottom(isNearBottom(el))
    }

    const items = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data])

    const isNearBottom = (el: HTMLDivElement) =>
        el.scrollHeight - el.scrollTop - el.clientHeight <= 80;

    // ! تشغيل أنيميشن التنبيه "New Message" لمدة ثانيتين، ثم التحول لعرض العداد
    const triggerNewMessageTooltip = () => {
        setShowTooltip(true)
        if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current)
        tooltipTimeoutRef.current = setTimeout(() => {
            setShowTooltip(false)
        }, 2000)
    }

    useEffect(() => {
        if (!items.length) return;

        const lastId = items[items.length - 1].id
        const previousLastId = lastItemIdRef.current
        const el = scrollRef.current

        if (previousLastId && lastId !== previousLastId) {
            if (el && isAtBottom) {
                requestAnimationFrame(() => {
                    el.scrollTop = el.scrollHeight
                })
                setNewMessages(false)
                setNewMessagesCount(0)
                setButtonMounted(false)
            } else {
                if (!newMessages) {
                    // ! أول ظهور للزر → تشغيل أنيميشن الدخول ثم التولتيب
                    setButtonMounted(true)
                }
                setNewMessages(true)
                setNewMessagesCount((prev) => prev + 1)
                triggerNewMessageTooltip()
            }
        }
        lastItemIdRef.current = lastId
    }, [items])

    useEffect(() => {
        return () => {
            if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current)
        }
    }, [])

    const handleScrollToBottom = () => {
        const el = scrollRef.current
        if (!el) return;
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
        setNewMessages(false)
        setNewMessagesCount(0)
        setShowTooltip(false)
        setButtonMounted(false)
        setIsAtBottom(true)
        if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current)
    }

    const lastMessage = items[items.length - 1]
    const lastMessageDate = lastMessage ? new Date(lastMessage.createdAt) : null
    const showTrailingTodayIndicator = !isLoading && (!lastMessageDate || !isSameDay(lastMessageDate, now))

    return (
        <div className='h-full relative bg-[#FCF5EB] dark:bg-[#141210]'>
            <div ref={scrollRef} onScroll={handleScroll} className='overflow-y-auto px-4 h-full workspace-scroll'>
                    {/* {items && items.map((message, index) => {
                    const currentDate = new Date(message.createdAt)
                    const previousMessage = items[index - 1]
                    const previousDate = previousMessage ? new Date(previousMessage.createdAt) : null
                    const showDateSeparator = !previousDate || !isSameDay(currentDate, previousDate)

                    return (
                        <div key={message.id}>
                                {showDateSeparator && (
                                <div className="sticky top-2 z-10 flex items-center justify-center gap-3 my-4 px-4">
                                    <div className="flex-1 h-px bg-gradient-to-r from-transparent to-primary" />
                                    <span className="shrink-0 bg-background/95 backdrop-blur-sm text-muted-foreground text-xs font-medium px-3 py-1 rounded-full shadow-sm border border-border">
                                        {formatDateSeparator(currentDate)}
                                    </span>
                                    <div className="flex-1 h-px bg-gradient-to-l from-transparent to-primary" />
                                </div>
                            )}
                            <MessageItem message={message} />
                        </div>
                    )
                })} */}

                                {items && items.map((message, index) => {
                    const currentDate = new Date(message.createdAt)
                    const previousMessage = items[index - 1]
                    const previousDate = previousMessage ? new Date(previousMessage.createdAt) : null
                    const showDateSeparator = !previousDate || !isSameDay(currentDate, previousDate)

                    return (
                        <div key={message.id}>
                            {showDateSeparator && (
                                <div className="sticky top-2 z-10 flex items-center justify-center gap-3 my-4 px-4">
                                    <div className="flex-1 h-px bg-gradient-to-r from-transparent to-primary" />
                                    <span className="shrink-0 bg-background/95 backdrop-blur-sm text-muted-foreground text-xs font-medium px-3 py-1 rounded-full shadow-sm border border-border">
                                        {formatDateSeparator(currentDate)}
                                    </span>
                                    <div className="flex-1 h-px bg-gradient-to-l from-transparent to-primary" />
                                </div>
                            )}
                            <MessageItem message={message} />
                        </div>
                    )
                })}

                {showTrailingTodayIndicator && (
                    <div className="flex items-center justify-center gap-3 my-4 px-4">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-primary" />
                        <span className="shrink-0 bg-background/95 backdrop-blur-sm text-muted-foreground text-xs font-medium px-3 py-1 rounded-full shadow-sm border border-border">
                            {formatDateSeparator(now)}
                        </span>
                        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-primary" />
                    </div>
                )}
                <div ref={bottomRef}></div>
            </div>

            {newMessages && (
                <div className="absolute bottom-4 right-4 flex items-center gap-0">
                    <div
                        className={`relative mr-2.5 bg-popover text-popover-foreground text-sm font-medium whitespace-nowrap px-3 py-1.5 rounded-lg shadow-md border border-border transition-all duration-300 ease-out ${
                            showTooltip
                                ? "opacity-100 translate-x-0 scale-100"
                                : "opacity-0 translate-x-2 scale-95 pointer-events-none"
                        }`}
                    >
                        New Message
                        {/* السهم المشير للزر */}
                        <span className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-popover border-r border-b border-border rotate-[-45deg]" />
                    </div>

                    <button
                        onClick={handleScrollToBottom}
                        className={`relative cursor-pointer flex items-center justify-center w-12 h-12 shrink-0 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg rounded-full transition-all duration-300 ease-out ${
                            buttonMounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-3 scale-90"
                        }`}
                    >
                        <ArrowDown className="w-5 h-5 shrink-0" />

                        {/* البادج: دائرة صغيرة في زاوية الزر، تظهر بعد اختفاء التولتيب */}
                        <span
                            className={`absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-primary-foreground text-primary text-[11px] font-semibold leading-none ring-2 ring-primary transition-all duration-300 ease-out ${
                                !showTooltip && newMessagesCount > 0
                                    ? "opacity-100 scale-100"
                                    : "opacity-0 scale-50"
                            }`}
                        >
                            {newMessagesCount}
                        </span>
                    </button>
                </div>
            )}
        </div>
    )
}

export default MessagesList