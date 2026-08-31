"use client"

import { CollapsibleWrapper } from '@/components/shared/collapsible-wrapper'
import { useChannelsList } from '@/lib/hooks/channels/use-channels-list'
import { cn } from '@/lib/utils'
import { Check, Hash } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

const ChannelsList = () => {
    const { workspaceId,channelId} = useParams<{ workspaceId: string,channelId: string }>()
    const { channels: ChannelListData } = useChannelsList();
    
    return (
        <>
            <CollapsibleWrapper defaultOpen title={"Channels"} triggerClassName='uppercase bg-primary/5 border-b border-primary/50  font-semibold uppercase tracking-wide'>
                <div className={cn("space-y-1 px-2 py-1")}>
                    {ChannelListData.map((channel) => {
                        const isActive =channel.id === channelId  

                        return (
                            <Link
                                href={`/workspace/${workspaceId}/channel/${channel.id}`}
                                key={channel.id}
                                className={cn(
                                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors duration-150",
                                    "text-muted-foreground hover:bg-sky-500/10 hover:text-foreground",
                                    isActive &&
                                    "bg-sky-500/15 font-medium text-sky-700 dark:text-sky-300"
                                )}
                            >
                                <Hash
                                    className={cn(
                                        "size-4 shrink-0",
                                        isActive
                                            ? "text-sky-600 dark:text-sky-400"
                                            : "text-muted-foreground"
                                    )}
                                />
                                <span className="truncate">{channel.name}</span>

                                {isActive && (
                                    <Check
                                        className="ml-auto size-4 shrink-0 text-amber-500 dark:text-amber-400 animate-pulse"
                                        aria-hidden="true"
                                    />
                                )}
                            </Link>
                        )
                    })}
                </div>
            </CollapsibleWrapper>

        </>
    )
}

export default ChannelsList