import { useParams } from "next/navigation";

export const useChannelId = () => {
    const { channelId } = useParams<{ channelId: string }>();
    return channelId;
};