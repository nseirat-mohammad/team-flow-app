//! this file for create scheams for work space ....

import { z } from "zod"
export const workspaceSchema = z.object({
    name: z.string()
        .min(2, "workspace name should be at least 2 characters.")
        .max(50, "workspace name must be less than 50 characters.").trim()
})


//* infer type:
// export const CREATE_WORKSPACE_TYPE =