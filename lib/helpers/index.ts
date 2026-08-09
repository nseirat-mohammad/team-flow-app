import { colorCombinations } from "@/constant/data";

//! Function to get color workspaces:
export const getWorkspaceColor = (id: string): string => {
  const chartSum = id
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const colorIndex = chartSum % colorCombinations.length;
  return colorCombinations[colorIndex];
};

//! Function to get the display name: full name if available, otherwise first part of email
export const getDisplayName = (
  givenName: string | null,
  familyName: string | null,
  email: string | null,
): string => {
  const fullName = [givenName, familyName].filter(Boolean).join(" ");
  if (fullName) return fullName;
  return email?.split("@")[0] ?? "User";
};

//! Function to get Fallback initials from name, or email if name isn't defined
export const getFallbackName = (
  givenName: string | null,
  familyName: string | null,
  email: string | null,
): string => {
  const initials = [givenName?.charAt(0), familyName?.charAt(0)]
    .filter(Boolean)
    .join("")
    .toUpperCase();

  if (initials) return initials;

  const emailPrefix = email?.split("@")[0];
  return emailPrefix?.slice(0, 2).toUpperCase() ?? "M";
};

//! Function to transform channel name by removing spaces and converting to lowercase
export const transformChannelName = (name: string) => {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with dashes
    .replace(/[^a-z0-9-]/g, "") // Remove special characters keep only(letters, numbers, and dashes)
    .replace(/-+/g, "-") // Replace multiple dashes with a single dash
    .replace(/^-|-$/g, ""); // Remove leading and trailing dashes
};


//! function to get the Avatat if thereis no picture :
export const getAvatar = (userPicture: string | null | undefined, userEmail: string) => {
  return userPicture ?? `https://avatar.vercel.sh/${userEmail}`
}
