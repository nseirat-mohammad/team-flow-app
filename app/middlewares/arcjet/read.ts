import arcjet, { slidingWindow } from "@/lib/arcjet";
import { base } from "../base";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";

const buildReadMiddleware = () =>
  arcjet.withRule(
    slidingWindow({
      mode: "LIVE",
      interval: "2m",
      max: 180,
    }),
  );

export const requiredReadSecurityMiddleware = base
  .$context<{
    request: Request;
    user: KindeUser<Record<string, unknown>>;
  }>()
  .middleware(async ({ context, next, errors }) => {
    const decision = await buildReadMiddleware().protect(context.request, {
      userId: context.user.id,
    });
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        throw errors.RATE_LIMITED({
          message:
            "You've made too many requests in a short time. Please slow down and try again shortly",
        });
      }
      throw errors.FORBIDDEN({
        message:
          "This request was blocked for security reasons. please Slow down.",
      });
    }
    return next();
  });
