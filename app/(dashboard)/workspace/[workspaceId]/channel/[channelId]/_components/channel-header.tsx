import { Skeleton } from '@/components/shared/skeleton'
import { ThemeToggle } from '@/components/ui/theme-toggle'

interface IChannelHeaderProps {
    channelName: string | undefined
    isLoading: boolean
}

const ChannelHeader = ({ channelName, isLoading }:IChannelHeaderProps) => {
    return (
        <div className='flex items-center justify-between h-14 px-4 border-b border-primary/30'>
            {isLoading ? (
                <Skeleton isChannelHeader/>
            ) : (
                <h1 className='text-2xl font-[400] capitalize'># {channelName}</h1>
            )}
            {/* Theme Toggle, Memebers */}
            <div className='flex items-center gap-3'>
                <ThemeToggle />
            </div>
        </div>
    )
}

export default ChannelHeader