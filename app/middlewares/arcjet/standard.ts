import arcjet, { detectBot, shield } from "@/lib/arcjet";
import { base } from "../base";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";

const buildStandardMiddleware = () =>
  arcjet
    .withRule(
      shield({
        mode: "LIVE",
      }),
    )
    .withRule(
      detectBot({
        mode: "LIVE",
        allow: [
          "CATEGORY:SEARCH_ENGINE",
          "CATEGORY:PREVIEW",
          "CATEGORY:MONITOR",
        ],
      }),
    );

export const requiredStandardMiddleware = base
  .$context<{
    request: Request;
    user: KindeUser<Record<string, unknown>>;
  }>()
  .middleware(async ({ context, next, errors }) => {
    const decision = await buildStandardMiddleware().protect(context.request, {
      userId: context.user.id,
    });
    if (decision.isDenied()) {
      if (decision.reason.isBot()) {
        throw errors.FORBIDDEN({
          message: "Access denied: automated traffic detected.",
        });
      }

      if (decision.reason.isShield()) {
        throw errors.FORBIDDEN({
          message:
            "Access denied: request blocked by our security policy (WAF).",
        });
      }
      // Catch-all for any other denial reason not explicitly handled above
      throw errors.FORBIDDEN({
        message: "Access denied: request blocked by security rules.",
      });
    }

    return next();
  });
