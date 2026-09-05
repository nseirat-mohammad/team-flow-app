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
import { Skeleton } from "@/components/shared/skeleton";
import { ScrollToBottomButton } from "@/components/shared/scroll-to-bottom-button";

const SETTLE_DELAY = 400 // ! مدة الهدوء المطلوبة (ms) قبل ما نسمح للسكرول يكون "smooth"

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
    const processedMessageIdsRef = useRef<Set<string>>(new Set());
    // const [now, setNow] = useState<Date>(new Date());

    // ! refs تعكس أحدث قيمة للـ state بدون الحاجة لإعادة إنشاء الـ observers
    const isAtBottomRef = useRef(isAtBottom)
    const hasInitialScrollRef = useRef(hasInitialScroll)
    // ! true يعني ما زلنا في فترة "استقرار" بعد تحميل/تبديل القناة → السكرول يكون auto إجباري
    const settlingRef = useRef(true)
    const settleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => { isAtBottomRef.current = isAtBottom }, [isAtBottom])
    useEffect(() => { hasInitialScrollRef.current = hasInitialScroll }, [hasInitialScroll])

    // ! يمدد فترة الاستقرار في كل مرة يصير فيها تغيير (صورة تحمّلت، ارتفاع تغيّر...)
    const extendSettlingWindow = () => {
        settlingRef.current = true
        if (settleTimeoutRef.current) clearTimeout(settleTimeoutRef.current)
        settleTimeoutRef.current = setTimeout(() => {
            settlingRef.current = false
        }, SETTLE_DELAY)
    }

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
        // ! نعيد ضبط refs الـ scroll فورًا (بدون انتظار الـ effect الخاص بها)
        isAtBottomRef.current = false
        hasInitialScrollRef.current = false
        extendSettlingWindow() // ! نبدأ فترة استقرار جديدة لكل قناة
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
                // setNow(new Date())
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
        queryKey: queryKey(channelId),
        initialPageParam: undefined,
        getNextPageParam: (lastPage: { items: Message[]; nextCursor?: string | undefined; }) => lastPage.nextCursor,
        select: (data) => ({
            pages: [...data.pages].map((p) => ({ ...p, items: [...p.items].reverse() })).reverse(),
            pageParams: [...data.pageParams].reverse()
        })
    })

    const { data, hasNextPage, fetchNextPage,
        isFetchingNextPage, isLoading, isFetching, error } = useInfiniteQuery({
        ...infiniteOptions,
        staleTime: 30_000,
        refetchOnWindowFocus: false
    })

    //* Scroll to the bottom when the message in the first load:
    useEffect(() => {
        if (!hasInitialScroll && data?.pages.length) {
            const el = scrollRef.current
            if (el) {
                bottomRef.current?.scrollIntoView({ block: "end", behavior: "auto" })
                setHasInitialScroll(true)
                setIsAtBottom(true)
                // ! نحدّث الـ refs فورًا (بدون انتظار re-render) حتى ما يفوّت أي mutation جاي فورًا بعدها
                hasInitialScrollRef.current = true
                isAtBottomRef.current = true
                extendSettlingWindow() // ! نبدأ عدّاد الاستقرار من هنا (بعد القفزة الفعلية)
            }
        }
    }, [hasInitialScroll, data?.pages.length])

    //! keep view pinned at the bottom when late content load (ex: Image.)
    //! ! ملاحظة: هذا الـ effect الآن يشتغل مرة واحدة فقط ([]) ويقرأ القيم الحيّة من الـ refs
    //! ! بدل الاعتماد على state في الـ dependency array، عشان نتجنب مشكلة الـ closures القديمة
    //! ! اللي كانت تسبب smooth scroll غير مرغوب فيه بعد تبديل القناة مباشرة
    useEffect(() => {
        const el = scrollRef.current
        if (!el) return;

        const scrollToTheBottomIfNeeded = () => {
            if (isAtBottomRef.current || !hasInitialScrollRef.current) {
                const behavior: ScrollBehavior = settlingRef.current ? "auto" : "smooth"
                requestAnimationFrame(() => {
                    bottomRef.current?.scrollIntoView({ block: "end", behavior })
                })
                // ! أي حركة تصير أثناء فترة الاستقرار تمدد الفترة بدل ما تتحول فورًا لـ smooth
                if (settlingRef.current) {
                    extendSettlingWindow()
                }
            }
        }

        //! function when image Load:
        const onImageLoad = (e: Event) => {
            if (e.target instanceof HTMLImageElement) {
                scrollToTheBottomIfNeeded()
            }
        }
        el.addEventListener("load", onImageLoad, true)

        //! resizeObserver to detect when the content is resized and changed in the container:
        const resizeObserver = new ResizeObserver(() => {
            scrollToTheBottomIfNeeded()
        })
        resizeObserver.observe(el)

        //! mutationObserver to detect any changes in the DOM that may affect the scroll position (ex: image loading, content update):
        const mutationObserver = new MutationObserver(() => {
            scrollToTheBottomIfNeeded()
        })
        mutationObserver.observe(el, {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true
        })

        return () => {
            el.removeEventListener("load", onImageLoad, true)
            resizeObserver.disconnect()
            mutationObserver.disconnect()
        }
    }, [])

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

    // ✅ تخطي الرسائل المعلقة (isPending = true)
    const isLastMessagePending = (items[items.length - 1] as any)?.isPending

    if (previousLastId && lastId !== previousLastId && !isLastMessagePending) {
        if (el && isAtBottom) {
            requestAnimationFrame(() => {
                el.scrollTop = el.scrollHeight
            })
            setNewMessages(false)
            setNewMessagesCount(0)
            setButtonMounted(false)
        } else {
            if (!newMessages) {
                setButtonMounted(true)
            }
            setNewMessages(true)
            setNewMessagesCount((prev) => prev + 1) // ✅ الآن = 1 فقط
            triggerNewMessageTooltip()
        }
    }
    lastItemIdRef.current = lastId
}, [items])

    useEffect(() => {
        return () => {
            if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current)
            if (settleTimeoutRef.current) clearTimeout(settleTimeoutRef.current)
        }
    }, [])

    //! when I have new Messages
    const handleScrollToBottom = () => {
        const el = scrollRef.current
        if (!el) return;
        bottomRef.current?.scrollIntoView({ block: "end", behavior: "auto" })
        setNewMessages(false)
        setNewMessagesCount(0)
        setShowTooltip(false)
        setButtonMounted(false)
        setIsAtBottom(true)
        if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current)
    }

//! when I click on the button button Indicator:
    const handlePlainScrollToBottom = () =>{
        bottomRef.current?.scrollIntoView({block:"end",behavior:"auto"})
        setIsAtBottom(true)
    }

    const isEmpty = !isLoading && !error && items.length === 0
    const showScrollToBottomButton = hasInitialScroll && !isAtBottom && !newMessages
    return (
        <div className='h-full relative bg-[#FCF5EB] dark:bg-[#141210]'>
            <div ref={scrollRef} onScroll={handleScroll} className='overflow-y-auto px-4 h-full flex flex-col space-y-1 workspace-scroll'>

                {isLoading ? (
                    <Skeleton isMessageList key={channelId} />
                ) : isEmpty ? (
                    <div className="flex items-center justify-center h-full">
                        <EmptyState
                            icon={MessageCircleOff}
                            eyebrow="Empty Channel"
                            title={"No messages yet"}
                            description={"This channel is quiet for now. Be the first to break the ice and start the conversation."}
                        />
                    </div>
                ) : (
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

            {isFetchingNextPage && (<FloatingStatusIndicator icon={Loader} label="loading more messages..." />)}
            {showScrollToBottomButton && (
                <div className="absolute bottom-4 right-4">
                    <ScrollToBottomButton
                        onClick={handlePlainScrollToBottom}
                        className="hover:scale-105 transition-transform duration-200 animate-in fade-in-0 zoom-in-90 slide-in-from-bottom-2 duration-300"
                        />
                </div>
            )}

            {newMessages && (
                <div className="absolute bottom-4 right-4 flex items-center gap-0">
                    <div className={`relative mr-2.5 bg-popover text-popover-foreground text-sm font-medium whitespace-nowrap px-3 py-1.5 rounded-lg shadow-md border border-border transition-all duration-300 ease-out ${
                    showTooltip
                        ? "opacity-100 translate-x-0 scale-100"
                        : "opacity-0 translate-x-2 scale-95 pointer-events-none"
                }`}>
                    New Message
                    <span className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-popover border-r border-b border-border rotate-[-45deg]" />
                </div>

                <ScrollToBottomButton onClick={handleScrollToBottom}
                    className={`transition-all duration-300 ease-out ${
                        buttonMounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-3 scale-90"
                    }`} >
                    <span className={`absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-primary-foreground text-primary text-[11px] font-semibold leading-none ring-2 ring-primary transition-all duration-300 ease-out ${
                        !showTooltip && newMessagesCount > 0
                            ? "opacity-100 scale-100"
                            : "opacity-0 scale-50"
                    }`}>
                        {newMessagesCount}
                    </span>
                </ScrollToBottomButton>
            </div>
            )}
        </div>
    )}

export default MessagesList