import { colorCombinations } from "@/constant/data"

//! Function to get color workspaces:
export const getWorkspaceColor = (id: string): string => {
    const chartSum = id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)
    const colorIndex = chartSum % colorCombinations.length
    return colorCombinations[colorIndex]
}


//! Function to get the display name: full name if available, otherwise first part of email
export const getDisplayName = (
    givenName: string | null,
    familyName: string | null,
    email: string | null
): string => {
    const fullName = [givenName, familyName].filter(Boolean).join(" ")
    if (fullName) return fullName
    return email?.split("@")[0] ?? "User"
}

//! Function to get Fallback initials from name, or email if name isn't defined
export const getFallbackName = (
    givenName: string | null,
    familyName: string | null,
    email: string | null
): string => {
    const initials = [givenName?.charAt(0), familyName?.charAt(0)]
        .filter(Boolean)
        .join("")
        .toUpperCase()

    if (initials) return initials

    const emailPrefix = email?.split("@")[0]
    return emailPrefix?.slice(0, 2).toUpperCase() ?? "M"
}