"use client";

import { orpc } from '@/lib/orpc'
import { useSuspenseQuery } from '@tanstack/react-query'

export const useChannelData = () => {
    return useSuspenseQuery(orpc.channel.list.queryOptions())
}

