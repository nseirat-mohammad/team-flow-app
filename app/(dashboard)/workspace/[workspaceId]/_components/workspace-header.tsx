"use client";

import { useChannelData } from "@/lib/hooks/channels/use-channel-data";

const WorkspaceHeader = () => {
    const { data } = useChannelData()
    return (
        <h2 className='text-xl font-medium text-center capitalize '>{data.currentWorkspace.orgName}</h2>
    )
}

export default WorkspaceHeader