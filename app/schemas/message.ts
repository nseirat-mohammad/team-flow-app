import z from "zod";


export const createMessageSchema = z.object({
    channelId: z.string(),
    content: z.string().min(2,"Content is too short,at least 2 characters")
    .max(20000,"Content is too long, maximum 20000 characters"),
    imageUrl: z.url().optional(),
})


export type CreateMessageType = z.infer<typeof createMessageSchema>;
