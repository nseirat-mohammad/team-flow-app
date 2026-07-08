import { getQueryClient, HydrateClient } from "@/lib/query/hydration";
import { CreateWorkspace } from "./_components/create-workspace";
import { UserNav } from "./_components/user-nav";
import { WorkspaceList } from "./_components/workspace-list";
import { orpc } from "@/lib/orpc";

const WorkspaceLayout = async ({ children }: { children: React.ReactNode }) => {
    //* prefetch to get the data using tanstack query :
    const queryClient = getQueryClient()

    await queryClient.prefetchQuery(orpc.workspace.list.queryOptions())
    return (
        <div className=" flex w-full h-screen">
            <div className=" flex flex-col items-center px-4 py-3 border-r-2 border-border h-full w-16 bg-secondary">
                <HydrateClient client={queryClient}>
                    <WorkspaceList />
                </HydrateClient>

                <div className="mt-4">
                    <CreateWorkspace />
                </div>

                <div className="mt-auto">
                    <HydrateClient client={queryClient}>
                        <UserNav />
                    </HydrateClient>
                </div>
            </div>
            {children}
        </div>
    )
}


export default WorkspaceLayout;


/**
 * ============================================================
 * SERVER-SIDE PREFETCHING WITH TANSTACK QUERY (prefetchQuery + HydrateClient)
 * ============================================================
 *
 * WHAT IS THIS PATTERN ?
 * -----------------------
 * Normally, TanStack Query runs on the CLIENT: the browser sends a request,
 * waits, shows a loading spinner, then renders the data once it arrives.
 *
 * With Next.js Server Components, we can fetch the data on the SERVER
 * instead — before the page is even sent to the browser. This way, the
 * user gets the page already filled with data (no spinner, no waiting).
 *
 * HOW IT WORKS (step by step):
 * -----------------------------
 * 1. `getQueryClient()` creates a TanStack QueryClient instance that lives
 *    on the server for the duration of this request.
 *
 * 2. `queryClient.prefetchQuery(...)` runs the query on the SERVER and
 *    stores the result inside that QueryClient's cache.
 *    - It does NOT return the data directly to you.
 *    - It just "warms up" the cache so the data is ready.
 *
 * 3. `<HydrateClient client={queryClient}>` takes that server-side cache
 *    and serializes it, sending it down to the browser. On the client,
 *    it "hydrates" TanStack Query's cache with that same data.
 *
 * 4. Any client component inside `<HydrateClient>` that calls the SAME
 *    query (e.g. `useQuery(orpc.workspace.list.queryOptions())`) will:
 *      - Instantly get the prefetched data (no loading state, no flicker)
 *      - Automatically refetch in the background if needed (staleTime)
 *
 * WHY USE THIS INSTEAD OF FETCHING DIRECTLY ON THE SERVER ?
 * -----------------------------------------------------------
 * You could fetch data on the server and pass it down as props — but then
 * you lose all of TanStack Query's client-side features (caching,
 * background refetching, retries, invalidation, etc.) for that data.
 *
 * Prefetch + Hydrate gives you the BEST OF BOTH WORLDS:
 *   ✅ Fast initial load (data is already there, rendered on the server)
 *   ✅ Full TanStack Query features still work on the client afterward
 *   ✅ No duplicate network request on mount (cache is already warm)
 *
 * IMPORTANT RULES:
 * ------------------
 * - The query key used in `prefetchQuery` on the server MUST match
 *   exactly the query key used in `useQuery` on the client, or hydration
 *   won't connect them (they'd be treated as two different queries).
 *   → `orpc.workspace.list.queryOptions()` guarantees this because both
 *     server and client generate the key from the same source.
 *
 * - `<HydrateClient>` should only wrap the components that actually
 *   need that prefetched data (here: `WorkspaceList`), not the whole page.
 *
 * ============================================================
 */