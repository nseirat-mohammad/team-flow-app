import 'server-only'

import { headers } from 'next/headers'
import { createRouterClient } from '@orpc/server'
import { router } from '@/app/router'

globalThis.$client = createRouterClient(router, {
    context: async () => {
        const headersList = await headers()
        return {
            request: new Request('http://localhost', {
                headers: headersList,
            }),
        }
    },
})