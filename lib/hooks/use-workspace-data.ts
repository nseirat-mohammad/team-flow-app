"use client"
import { orpc } from '@/lib/orpc'
import { useSuspenseQuery } from '@tanstack/react-query'

export const useWorkspaceData = () => {
    return useSuspenseQuery(orpc.workspace.list.queryOptions())
}