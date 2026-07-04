import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { cn } from '@/lib/utils';

interface IAvatarWrapperProps {
    src?: string;
    alt?: string;
    fallback?: string | ((alt?: string) => React.ReactNode);
    className?: string;
    fallbackClassName?: string;
}

export const AvatarWrapper = ({
    src,
    alt,
    fallback,
    className,
    fallbackClassName,
}: IAvatarWrapperProps) => {

    const resolvedFallback =
        typeof fallback === "function"
            ? fallback(alt)
            : fallback ?? getInitialsFromName(alt);

    return (
        <Avatar className={cn("size-10 cursor-pointer  active:scale-90 ", className)}>
            <AvatarImage src={src} alt={alt} className={cn("rounded-[inherit]", className)} />
            <AvatarFallback className={cn("bg-primary/35 cursor-pointer hover:ring-4 hover:ring-offset-0 transition-all duration-300 ease-out hover:ring-primary text-lg text-muted-foreground font-medium", fallbackClassName)}>
                {resolvedFallback}
            </AvatarFallback>
        </Avatar>
    )
}



// helper افتراضي لو محدش بعت fallback ولا function خالص
function getInitialsFromName(name?: string): string {
    if (!name) return "?";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}