import { ThemeToggle } from '@/components/ui/theme-toggle'
import React from 'react'

const ChannelHeader = () => {
    return (
        <div className='flex items-center justify-between h-14 px-4 border-b border-primary/30'>
            <h1 className='text-2xl font-[400]'># Super Channel</h1>
            {/* Theme Toggle, Memebers */}
            <div className='flex items-center gap-3'>
                <ThemeToggle />
            </div>
        </div>
    )
}

export default ChannelHeader