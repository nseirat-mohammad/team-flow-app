//! this file for create scheams for work space ....

import { transformChannelName } from "@/lib/helpers";
import { z } from "zod";

export const channelSchema = z.object({
  channelName: z
    .string()
    .min(2, "channel name should be at least 2 characters.")
    .max(50, "channel name must be less than 50 characters.")
    .transform((name, ctx) => {
      const transformedName = transformChannelName(name);
      if (transformedName.length < 2) {
        ctx.addIssue({
          code: "custom",
          message:
            "channel name should be at least 2 characters after transformation.",
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        z.NEVER; // Return a special value to indicate validation failure
      }

      return transformedName;
    }),
});

//* infer type:
export type ChannelSchemaType = z.infer<typeof channelSchema>;
