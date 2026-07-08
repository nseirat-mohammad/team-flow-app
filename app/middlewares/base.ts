import { os } from "@orpc/server";

export const base = os.$context<{ request: Request }>().errors({
    RATE_LIMITED: {
        message: "You've made too many requests. Please wait a moment and try again.",
    },
    FORBIDDEN: {
        message: "You don't have permission to access this resource.",
    },
    BAD_REQUEST: {
        message: "The request was invalid or could not be processed.",
    },
    NOT_FOUND: {
        message: "The requested resource could not be found.",
    },
    UNAUTHORIZED: {
        message: "You must be authenticated to access this resource.",
    },
    INTERNAL_SERVER_ERROR: {
        message: "Something went wrong on our end. Please try again later.",
    },
});