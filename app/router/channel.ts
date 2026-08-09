import z from "zod";
import { requiredHeavyWriteSecurityMiddleware } from "../middlewares/arcjet/heavy-write";
import { requiredStandardMiddleware } from "../middlewares/arcjet/standard";
import { requiredAuthMiddleware } from "../middlewares/auth";
import { base } from "../middlewares/base";
import { requiredWorkspaceMiddleware } from "../middlewares/workspace";
import { channelSchema } from "../schemas/channel";
import prisma from "@/lib/db";
import { Channel, Prisma } from "@/lib/generated/prisma/client";
import { init, organization_user, Organizations } from "@kinde/management-api-js";
import { KindeOrganization } from "@kinde-oss/kinde-auth-nextjs";

//* create channel
export const createChannel = base
    .use(requiredAuthMiddleware)
    .use(requiredWorkspaceMiddleware)
    .use(requiredStandardMiddleware)
    .use(requiredHeavyWriteSecurityMiddleware)
    .route({
        method: "POST",
        path: "/channel",
        summary: "create a new channel",
        tags: ["channels"]
    }).input(channelSchema)
    .output(z.custom<Channel>())
    .handler(async ({ input, context, errors }) => {
        const { user, workspace } = context;
        const { channelName } = input;

        if (!user.id) {
            throw errors.UNAUTHORIZED({
                message: "User identity is missing. Please sign in again.",
            });
        }

        if (!workspace.orgCode) {
            throw errors.FORBIDDEN({
                message: "Workspace is not defined.",
            });
        }

        try {
            const channel = await prisma.channel.create({
                data: {
                    name: channelName,
                    workspaceId: workspace.orgCode,
                    createdById: user.id,
                },
            });

            return channel;
        } catch (err) {
            if (
                err instanceof Prisma.PrismaClientKnownRequestError &&
                err.code === "P2002"
            ) {
                throw new Error(`A channel named "${channelName}" already exists in this workspace.`);
            }

            console.error("Failed to create channel:", err);
            throw new Error("Failed to create channel.");
        }
    });

//* list channels

export const listChannels = base
    .use(requiredAuthMiddleware)
    .use(requiredWorkspaceMiddleware)
    .route({
        method: "GET",
        path: "/channel",
        summary: "list all channels",
        tags: ["channels"]
    })
    .input(z.void())
    .output(z.object({
        channels: z.array(z.custom<Channel>()),
        currentWorkspace: z.custom<KindeOrganization<unknown>>(),
        members: z.array(z.custom<organization_user>())

    }))
    .handler(async ({ context }) => {
        const [channels, members] = await Promise.all([
            prisma.channel.findMany({
                where: {
                    workspaceId: context.workspace.orgCode
                },
                orderBy: {
                    createdAt: "desc"
                }
            }),
            (async () => {
                init()
                const usersInOrg = await Organizations.getOrganizationUsers({
                    orgCode: context.workspace.orgCode,
                    sort: "name_asc"
                })


                return usersInOrg.organization_users ?? []
            })()
        ]);

        return {
            channels,
            members,
            currentWorkspace: context.workspace
        }

    })