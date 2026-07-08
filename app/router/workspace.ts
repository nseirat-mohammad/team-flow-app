import { KindeOrganization, KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import z from "zod";
import { base } from "../middlewares/base";
import { requiredAuthMiddleware } from "../middlewares/auth";
import { requiredWorkspaceMiddleware } from "../middlewares/workspace";
import { workspaceSchema } from "../schemas/workspace";
import { init, Organizations } from "@kinde/management-api-js"

export const listWorkspaces = base
    .use(requiredAuthMiddleware)
    .use(requiredWorkspaceMiddleware)
    .route({
        method: "GET",
        path: "/workspace",
        summary: "list all workspaces",
        tags: ["workspaces"]
    })
    .input(z.void())
    .output(z.object({
        workspaces: z.array(
            z.object({
                id: z.string(),
                name: z.string(),
                avatar: z.string()
            })
        ),
        user: z.custom<KindeUser<Record<string, unknown>>>(),
        currentWorkspace: z.custom<KindeOrganization<unknown>>()
    }))
    .handler(async ({ context, errors }) => {
        const { getUserOrganizations } = getKindeServerSession()

        const organizations = await getUserOrganizations()

        if (!organizations) {
            throw errors.FORBIDDEN()
        }
        const workspaces = organizations.orgs
            .map((org) => ({
                id: org.code,
                name: org.name ?? "My WorkSpace",
                avatar: org.name?.charAt(0).toUpperCase() ?? "W"
            }))
            .sort((a, b) => a.id.localeCompare(b.id))
        return {
            workspaces,
            user: context.user,
            currentWorkspace: context.workspace
        }
    })


//! Function to create workspace:
export const createWorkspace = base
    .use(requiredAuthMiddleware)
    .use(requiredWorkspaceMiddleware)
    .route({
        method: "POST",
        path: "/workspace",
        summary: "create a new workespace",
        tags: ["workspace"]
    })
    .input(workspaceSchema)
    .output(z.object({
        orgCode: z.string(),
        workspaceName: z.string()
    }))
    .handler(async ({ input, context, errors }) => {
        //! Init() from kinde management Api :
        init()

        let data: Awaited<ReturnType<typeof Organizations.createOrganization>>; //* define the data

        //? first try and catch to create new workspace:
        try {
            data = await Organizations.createOrganization({
                requestBody: {
                    name: input.name
                }
            });
        } catch {
            throw errors.FORBIDDEN()
        }

        if (!data.organization?.code) {
            throw errors.FORBIDDEN({
                message: "Org code is not defined!"
            })
        }

        //* the sewcond try and catch to add user to the organization:
        try {
            await Organizations.addOrganizationUsers({
                orgCode: data.organization.code,
                requestBody: {
                    users: [{
                        id: context.user.id,
                        roles: ["admin"]
                    }]
                }
            })
        } catch {
            throw errors.FORBIDDEN()
        }
        //! refresh the tokens:
        const { refreshTokens } = getKindeServerSession()
        await refreshTokens()
        return {
            orgCode: data.organization.code,
            workspaceName: input.name
        }
    })

/*
==================================================
const { refreshTokens } = getKindeServerSession()
await refreshTokens()
kinde store the data in the accesstoken and this get generated when the user log in 
by using refreshTokens() method.
since we create new workspace we want to update the token and tell kind specifically hey kind the
user hand now access the new workspace(organization)
please update the token with new data and every thing will work smoothly...
==================================================
*/