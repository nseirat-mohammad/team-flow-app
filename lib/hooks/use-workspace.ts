"use client"
import { useWorkspaceData } from './use-workspace-data'

export const useWorkspaces = () => {
    const { data: { workspaces, currentWorkspace } } = useWorkspaceData()
    return { workspaces, currentWorkspace }
}