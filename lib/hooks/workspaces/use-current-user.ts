"use client"
import { useMemo } from 'react'
import { useWorkspaceData } from './use-workspace-data'
import { getDisplayName, getFallbackName } from '@/lib/helpers'

export const useCurrentUser = () => {
    const { data: { user } } = useWorkspaceData()

    const displayName = useMemo(
        () => getDisplayName(user.given_name, user.family_name, user.email),
        [user.given_name, user.family_name, user.email]
    )

    const fallbackName = useMemo(
        () => getFallbackName(user.given_name, user.family_name, user.email),
        [user.given_name, user.family_name, user.email]
    )

    return {
        user,
        displayName,
        fallbackName,
        avatarSrc: user.picture ?? undefined, // دائمًا رابط صورة أو undefined، أبدًا حرف
    }
}