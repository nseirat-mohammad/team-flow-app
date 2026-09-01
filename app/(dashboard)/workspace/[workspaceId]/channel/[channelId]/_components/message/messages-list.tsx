
"use client";
import { useInfiniteQuery } from "@tanstack/react-query"
import { MessageItem } from "./message-item"
import { orpc } from "@/lib/orpc"
import { useChannelId } from "@/lib/hooks/channels/use-channel-id";
import { Message } from "@/lib/generated/prisma/client";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, Loader, MessageCircleOff } from "lucide-react";
import { formatDateSeparator, isSameDay } from "@/lib/helpers";
import { EmptyState } from "@/components/shared/empty-state";
import { FloatingStatusIndicator } from "@/components/shared/floating-indicator";
import { queryKey } from "@/lib/constant";

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

//! reset all scroll-related state whenever we switch channels, otherwise
//! leftover state (ex: hasInitialScroll=true from an empty channel) causes
//! a visible animated scroll instead of an instant jump on the next channel
useEffect(() => {
    setHasInitialScroll(false)
    setIsAtBottom(false)
    setNewMessages(false)
    setNewMessagesCount(0)
    setShowTooltip(false)
    setButtonMounted(false)
    lastItemIdRef.current = undefined
    if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current)
}, [channelId])

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
        queryKey : queryKey(channelId),
        initialPageParam: undefined,
        getNextPageParam: (lastPage: { items: Message[]; nextCursor?: string | undefined; }) => lastPage.nextCursor,
        select: (data) => ({
            pages: [...data.pages].map((p) => ({ ...p, items: [...p.items].reverse() })).reverse(),
            pageParams: [...data.pageParams].reverse()
        })
    })

    const { data, hasNextPage, fetchNextPage, 
        isFetchingNextPage, isLoading, isFetching,error } = useInfiniteQuery({
        ...infiniteOptions,
        staleTime: 30_000,
        refetchOnWindowFocus: false
    })

    //* Scroll to the bottom when the message in the first load:
    useEffect(() => {
        if (!hasInitialScroll && data?.pages.length) {
            const el = scrollRef.current
            if (el) {
                bottomRef.current?.scrollIntoView({block:"end", behavior:"auto"})
                setHasInitialScroll(true)
                setIsAtBottom(true)
            }
        }
    }, [hasInitialScroll, data?.pages.length])
    //! keep view pinned at the bottom when late content load (ex: Image.)
    useEffect(() =>{
        const el = scrollRef.current
        if(!el) return;
        const scrollToTheBottomIfNeeded = () =>{
            if(isAtBottom || !hasInitialScroll){
                requestAnimationFrame(() =>{
                    bottomRef.current?.scrollIntoView({block:"end",  behavior: hasInitialScroll ? "smooth" : "auto" })
                })
            }
        }

        //! function when image Load:
        const onImageLoad = (e : Event) =>{
            if(e.target instanceof HTMLImageElement){
                scrollToTheBottomIfNeeded()
            }
        }
        el.addEventListener("load",onImageLoad,true)

        //! resizeObserver to detect when the content is resized and changed in the container:
        const resizeObserver = new ResizeObserver(() =>{
            scrollToTheBottomIfNeeded()
        })
        resizeObserver.observe(el)

        //! mutationObserver to detect any changes in the DOM that may affect the scroll position (ex: image loading, content update):
        const mutationObserver = new MutationObserver(() =>{
            scrollToTheBottomIfNeeded()
        })
        //! register the mutationObserver
        mutationObserver.observe(el,{
            childList:true,
            subtree:true,
            attributes:true,
            characterData: true
        })

        //! cleanup functions
        return () => {
            el.removeEventListener("load",onImageLoad,true)
            resizeObserver.disconnect()
            mutationObserver.disconnect()
        }
    },[isAtBottom, hasInitialScroll])

  

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
        bottomRef.current?.scrollIntoView({block:"end", behavior:"smooth"})
        setNewMessages(false)
        setNewMessagesCount(0)
        setShowTooltip(false)
        setButtonMounted(false)
        setIsAtBottom(true)
        if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current)
    }


    // const showTrailingTodayIndicator = !isLoading && items.length === 0
    const isEmpty = !isLoading && !error && items.length === 0
    return (
        <div className='h-full relative bg-[#FCF5EB] dark:bg-[#141210]'>
            <div ref={scrollRef} onScroll={handleScroll} className='overflow-y-auto px-4 h-full flex flex-col space-y-1 workspace-scroll'>

{isEmpty ? (
        <div className="flex items-center justify-center h-full">

            <EmptyState
            icon={MessageCircleOff}
            eyebrow="Empty Channel"
            title={"No messages yet"}
            description={ "This channel is quiet for now. Be the first to break the ice and start the conversation."}
        />
        </div>
    ):(
        <>
            {items && items.map((message, index) => {
                    const currentDate = new Date(message.createdAt)
                    const previousMessage = items[index - 1]
                    const previousDate = previousMessage ? new Date(previousMessage.createdAt) : null
                    const showDateSeparator = !previousDate || !isSameDay(currentDate, previousDate)
                    return (
                        <div key={message.id}>
                            {showDateSeparator && (
                                <div className="z-10 flex items-center justify-center gap-3 my-4 px-4">
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
        </>
    )}
                <div ref={bottomRef}></div>
            </div>

                {isFetchingNextPage && (<FloatingStatusIndicator icon={Loader} label="loading more messages..."/>)}
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