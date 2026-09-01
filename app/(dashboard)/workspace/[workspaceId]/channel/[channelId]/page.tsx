"use client";
import { useQuery } from "@tanstack/react-query";
import ChannelHeader from "./_components/channel-header"
import MessageInput from "./_components/message/message-input"
import MessagesList from "./_components/message/messages-list"
import { useChannelId } from "@/lib/hooks/channels/use-channel-id";
import { orpc } from "@/lib/orpc";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";

const ChannelMainPage = () => {
    const channelId = useChannelId()
    const {data,isLoading} = useQuery(
        orpc.channel.get.queryOptions({ input:{ channelId }})
    )
    return (
        <div className="h-screen w-full flex">
            {/* Main Channel Area */}
            <div className="flex flex-col flex-1 min-w-0 h-full">
                {/* Fixed Header */}
                <ChannelHeader channelName={data?.channelName} isLoading={isLoading} />

                {/* Scrollable Messages Area */}
                <div className="flex-1 min-h-0 overflow-hidden">
                    <MessagesList />
                </div>

                {/* Fixed Message Input Area */}
                <div className="border-t border-t-primary/30 bg-background p-4">
                    <MessageInput channelId={channelId} currentUser={data?.currentUser as KindeUser<Record<string, unknown>>} />
                </div>
            </div>
        </div>
    )
}

export default ChannelMainPage