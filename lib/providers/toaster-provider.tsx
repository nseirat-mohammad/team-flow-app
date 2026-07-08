"use client";
import { Toaster as Sonner } from "sonner";
import { useTheme } from "next-themes";

export function ToasterProvider() {
    const { theme } = useTheme();
    return (
        <Sonner
            theme={theme as "light" | "dark" | "system"}
            position="top-right"
            toastOptions={{
                unstyled: true,
                classNames: { toast: "!bg-transparent !shadow-none !p-0" },
            }}
        />
    );
}