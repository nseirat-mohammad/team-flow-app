"use client";
import { useQuery } from "@tanstack/react-query"
import { MessageItem } from "./message-item"
import { orpc } from "@/lib/orpc"
import { useChannelId } from "@/lib/hooks/channels/use-channel-id";


const MessagesList = () => {
    const channelId = useChannelId()
    const {data: messages} = useQuery(
        orpc.message.list.queryOptions({
            input:{
                channelId
            }
        })
    )
    return (
        <div className='h-full relative bg-[#FCF5EB] dark:bg-[#141210]'>
            <div className='overflow-y-auto px-4 h-full'>
                {messages && messages.map((message) =>(
                    <MessageItem key={message.id} message={message} />
                ))}
            </div>
        </div>
    )
}

export default MessagesList