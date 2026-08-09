"use client";

import { useChannelData } from "./use-channel-data";
export const useMembers = () => {
    const { data: { members } } = useChannelData()
    return { members }
}