import { colorCombinations } from "@/constant/data"

//! Function to get color workspaces:
export const getWorkspaceColor = (id: string): string => {
    const chartSum = id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)
    const colorIndex = chartSum % colorCombinations.length
    return colorCombinations[colorIndex]
}


//! Function to get Fallback from the userName:
export const getFallbackfromgivenName = (name: string): string => {
    const fallbackName = name.slice(0, 2).toUpperCase()
    return fallbackName
}