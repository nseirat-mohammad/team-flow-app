import React from 'react'
import WorkspaceHeader from './_components/workspace-header'
import CreateNewChannel from './_components/create-new-channel'
import ChannelsList from './_components/channels-list'
import MembersList from './_components/members-list'
import { getQueryClient, HydrateClient } from '@/lib/query/hydration'
import { orpc } from '@/lib/orpc'

const ChannelListLayout = async ({ children }: { children: React.ReactNode }) => {
  const queryClient = getQueryClient()

  await queryClient.prefetchQuery(orpc.channel.list.queryOptions())
  return (
    <>
      <div className='h-full w-80 bg-secondary border-r border-border flex flex-col'>
        {/* Header */}
        <div className='flex items-center px-4 h-14 border-b border-border'>
          <HydrateClient client={queryClient}>
            <WorkspaceHeader />
          </HydrateClient>
        </div>
        {/* Create New Channel */}
        <div className='px-4 py-2'>
          <CreateNewChannel />
        </div>

        {/* Channel List */}
        <div className='flex-1 overflow-y-auto px-4 py-2'>
          <HydrateClient client={queryClient}>
            <ChannelsList />
          </HydrateClient>
        </div>

        {/* Members List */}
        <div className='px-4 py-2 border-t  border-border'>
          <HydrateClient client={queryClient}>
            <MembersList />
          </HydrateClient>
        </div>
      </div>
    </>
  )
}

export default ChannelListLayout