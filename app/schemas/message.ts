
import { z } from "zod"

export const createMessageSchema = z
    .object({
        channelId: z.string(),
        content: z.string(),
        imageUrl: z.string().url().optional(),
    })
    .superRefine((data, ctx) => {
        const trimmed = data.content.trim()
        const hasImage = !!data.imageUrl

        //! لو ما فيه صورة، لازم يرجع قيد الـ min(2) يشتغل زي الأول
        if (!hasImage && trimmed.length < 2) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["content"],
                message: trimmed.length === 0
                    ? "Message cannot be empty"
                    : "Content is too short, at least 2 characters",
            })
        }
    })

export type CreateMessageType = z.infer<typeof createMessageSchema>