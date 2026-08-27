import z from "zod";
import { requiredAuthMiddleware } from "../middlewares/auth";
import { base } from "../middlewares/base";
import { requiredWorkspaceMiddleware } from "../middlewares/workspace";
import { requiredStandardMiddleware } from "../middlewares/arcjet/standard";
import { requiredWriteSecurityMiddleware } from "../middlewares/arcjet/write";
import prisma from "@/lib/db";
import { createMessageSchema } from "../schemas/message";
import { getAvatar } from "@/lib/helpers";
import { Message } from "@/lib/generated/prisma/client";
import { requiredReadSecurityMiddleware } from "../middlewares/arcjet/read";


export const createMessage = base
.use(requiredAuthMiddleware)
.use(requiredWorkspaceMiddleware)
.use(requiredStandardMiddleware)
.use(requiredWriteSecurityMiddleware)
.route({
    method: "POST",
    path:"/message",
    summary: "create a new message",
    tags: ["messages"]
}).input(createMessageSchema)
.output(z.custom<Message>())
.handler(async({ input, context, errors}) => {
    //! verify that Channel belongs to the Workspace:
    const channel = await prisma.channel.findFirst({
        where:{
            id: input.channelId,
            workspaceId: context.workspace.orgCode
        },
        select: { id: true }
    })

    if(!channel) {
        throw errors.NOT_FOUND({ message: "Channel not found..." });
    }

    if (!context.user.email) {
        throw errors.UNAUTHORIZED({ message: "User email is required." });
    }
    
    //! after verify alow to create the message:
    const createNewMessage = await prisma.message.create({
        data:{
            content:input.content,
            imageUrl:input.imageUrl,
            channelId: input.channelId,
            authorId: context.user.id,
            authorEmail: context.user.email,
            authorName: context.user.given_name ?? context.user.email?.split("@")[0],
            authorAvatar: getAvatar(context.user.picture, context.user.email)
        }
    })
    return createNewMessage
})


//! Function to Get All Messages:
export const listMessages = base
.use(requiredAuthMiddleware)
.use(requiredWorkspaceMiddleware)
.use(requiredStandardMiddleware)
.use(requiredReadSecurityMiddleware)
.route({
    method:"GET",
    path:"/message",
    summary: "Get all messages",
    tags: ["messages"]
})
.input(z.object({
    channelId: z.string(),
    limit: z.number().min(1).max(100).optional(),
    cursor: z.string().optional()
}))
.output(z.object({
    items:z.array(z.custom<Message>()),
    nextCursor: z.string().optional()
}))
.handler(async({input,context,errors}) =>{
    //* check if the channel belong to spacific workspace then get alll messages that belong to the channel.
    const channel = await prisma.channel.findFirst({
        where:{
            id: input.channelId,
            workspaceId: context.workspace.orgCode
        }
    })
    if(!channel) {
        throw errors.NOT_FOUND({ message: "Channel not found..." });
    }
    /* define the limit and cursor for pagination */
    const limit = input.limit ?? 30
    const messages = await prisma.message.findMany({
        where:{
            channelId :input.channelId
        },
        ...(input.cursor ? 
            {cursor: {id:input.cursor}, skip: 1}
            :{}
        ),
        take: limit,
        orderBy:[
            {createdAt: "desc"},
            {id:"desc"}
        ],
    })

    //! Find the next cursor by using the id of the last message:
    const nextCursor = messages.length === limit ? messages[messages.length -1].id : undefined

    return {
        items: messages,
        nextCursor
    }



})