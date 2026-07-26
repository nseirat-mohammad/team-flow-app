"use client";

import { toast } from "sonner";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "warning" | "info";
type ToastPosition =
    | "top-left"
    | "top-center"
    | "top-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right";

interface IToastOptions {
    title: string;
    description?: string;
    /** ms. Defaults: 4000 for success/error/warning, Infinity for info */
    duration?: number;
    /** Force show/hide the close (X) button. Default: true */
    closable?: boolean;
    /** Force show/hide the bottom progress bar. Defaults: true unless duration is Infinity */
    showProgress?: boolean;
    /** Default: "bottom-right" */
    position?: ToastPosition;
    action?: { label: string; onClick: () => void };
}

const DEFAULT_DURATION = 5000;
const DEFAULT_POSITION: ToastPosition = "top-right";

const TOAST_CONFIG: Record<
    ToastType,
    {
        icon: React.ElementType;
        border: string;
        bg: string;
        iconBg: string;
        iconColor: string;
        titleColor: string;
        progress: string;
    }
> = {
    success: {
        icon: CheckCircle2,
        border: "border-l-emerald-500 dark:border-l-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-950",
        iconBg: "bg-white dark:bg-emerald-900",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        titleColor: "text-emerald-700 dark:text-emerald-300",
        progress: "bg-emerald-500 dark:bg-emerald-400",
    },
    error: {
        icon: AlertCircle,
        border: "border-l-red-500 dark:border-l-red-400",
        bg: "bg-red-50 dark:bg-red-950",
        iconBg: "bg-white dark:bg-red-900",
        iconColor: "text-red-600 dark:text-red-400",
        titleColor: "text-red-700 dark:text-red-300",
        progress: "bg-red-500 dark:bg-red-400",
    },
    warning: {
        icon: AlertTriangle,
        border: "border-l-amber-500 dark:border-l-amber-400",
        bg: "bg-amber-50 dark:bg-amber-950",
        iconBg: "bg-white dark:bg-amber-900",
        iconColor: "text-amber-600 dark:text-amber-400",
        titleColor: "text-amber-700 dark:text-amber-300",
        progress: "bg-amber-500 dark:bg-amber-400",
    },
    info: {
        icon: Info,
        border: "border-l-blue-500 dark:border-l-blue-400",
        bg: "bg-blue-50 dark:bg-blue-950",
        iconBg: "bg-white dark:bg-blue-900",
        iconColor: "text-blue-600 dark:text-blue-400",
        titleColor: "text-blue-700 dark:text-blue-300",
        progress: "bg-blue-500 dark:bg-blue-400",
    },
};


interface IToastCardProps {
    id: string | number;
    type: ToastType;
    title: string;
    description?: string;
    duration: number;
    closable: boolean;
    showProgress: boolean;
    action?: { label: string; onClick: () => void };
}

const ToastCard = ({
    id,
    type,
    title,
    description,
    duration,
    closable,
    showProgress,
    action,
}: IToastCardProps) => {
    const config = TOAST_CONFIG[type];
    const Icon = config.icon;
    const isInfinite = duration === Infinity;

    return (
        <div
            className={cn(
                "relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-lg border-l-4 p-4 pr-10 shadow-md",
                config.border,
                config.bg
            )}
        >
            <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-full", config.iconBg)}>
                <Icon className={cn("size-4", config.iconColor)} />
            </div>

            <div className="flex-1 space-y-1">
                <p className={cn("text-base font-bold", config.titleColor)}>{title}</p>
                {description && <p className="text-sm text-muted-foreground">{description}</p>}
                {action && (
                    <button
                        onClick={() => {
                            action.onClick();
                            toast.dismiss(id);
                        }}
                        className="text-sm font-medium text-foreground underline underline-offset-2"
                    >
                        {action.label}
                    </button>
                )}
            </div>

            {closable && (
                <button
                    onClick={() => toast.dismiss(id)}
                    className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full bg-background/80 text-muted-foreground transition hover:text-foreground"
                >
                    <X className="size-3.5" />
                </button>
            )}

            {showProgress && !isInfinite && (
                <span
                    className={cn("absolute bottom-0 left-0 h-1 animate-toast-progress", config.progress)}
                    style={{ animationDuration: `${duration}ms` }}
                />
            )}
        </div>
    );
};

export const showToast = (type: ToastType, options: IToastOptions) => {
    const duration = options.duration ?? DEFAULT_DURATION;
    const closable = options.closable ?? true;
    const showProgress = options.showProgress ?? duration !== Infinity;
    const position = options.position ?? DEFAULT_POSITION;

    toast.custom(
        (id) => (
            <ToastCard
                id={id}
                type={type}
                title={options.title}
                description={options.description}
                duration={duration}
                closable={closable}
                showProgress={showProgress}
                action={options.action}
            />
        ),
        { duration, position }
    );
};

export const toastSuccess = (options: IToastOptions) => showToast("success", options);
export const toastError = (options: IToastOptions) => showToast("error", options);
export const toastWarning = (options: IToastOptions) => showToast("warning", options);
export const toastInfo = (options: IToastOptions) => showToast("info", options);