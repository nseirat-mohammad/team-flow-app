import arcjet, { slidingWindow } from "@/lib/arcjet";
import { base } from "../base";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";

const buildWriteMiddleware = () =>
  arcjet.withRule(
    slidingWindow({
      mode: "LIVE",
      interval: "2m",
      max: 40,
    }),
  );

export const requiredWriteSecurityMiddleware = base
  .$context<{
    request: Request;
    user: KindeUser<Record<string, unknown>>;
  }>()
  .middleware(async ({ context, next, errors }) => {
    const decision = await buildWriteMiddleware().protect(context.request, {
      userId: context.user.id,
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        throw errors.RATE_LIMITED({
          message:
            "You're making changes too quickly. Please wait a moment and try again.",
        });
      }
      throw errors.FORBIDDEN({
        message:
          "This request was blocked for security reasons. If you believe this is a mistake, please contact support.",
      });
    }
    return next();
  });
