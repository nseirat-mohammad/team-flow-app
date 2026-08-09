"use client";

import { useChannelData } from "./use-channel-data";


export const useChannelsList = () => {
    const { data: { channels } } = useChannelData();
    return { channels }
}