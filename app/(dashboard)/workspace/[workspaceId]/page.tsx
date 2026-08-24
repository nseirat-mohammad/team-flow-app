// import { client } from "@/lib/orpc"
// import { redirect } from "next/navigation"


// const WorkSpaceIdPage = async () => {
//   const {channels,currentWorkspace} = await client.channel.list()
//   //* redirect the user to the first channel if there is one
//   // if(channels.length > 0) {
//   //   return redirect(`/workspace/${currentWorkspace.orgCode}/channel/${channels[0].id}`)
//   // }
//   return (
//     <div></div>
//   )
// }

// export default WorkSpaceIdPage


import { client } from "@/lib/orpc"
import { redirect } from "next/navigation"
import { Hash } from "lucide-react"
import { EmptyState } from "@/components/shared/empty-state"

interface IWorkspaceIdProps{
  params: Promise<{ workspaceId: string }>
}


const WorkSpaceIdPage = async ({params}:IWorkspaceIdProps) => {
  const { workspaceId } = await params
  const { channels,currentWorkspace } = await client.channel.list()

  if (channels.length > 0) {
    return redirect(`/workspace/${workspaceId}/channel/${channels[0].id}`)
  }

  return (
        <div className="flex min-h-screen w-full items-center justify-center p-4">
          <EmptyState
            icon={Hash}
            eyebrow="Current workspace"
            title={currentWorkspace.orgName || ""}
            description="No channels yet. Create your first channel to start collaborating with your team 🚀"
          />
    </div>
  )
}

export default WorkSpaceIdPage