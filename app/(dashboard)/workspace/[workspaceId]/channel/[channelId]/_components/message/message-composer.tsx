import RichTextEditor from '@/components/shared/rich-text-editor/Editor'
import SendButton from '@/components/shared/send-button'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ImageUp } from 'lucide-react'


interface IMessageComposerProps {
    value: string
    onChange: (value: string) => void
    onSubmit : () => void
    isPending: boolean
}

const MessageComposer = ({ value, onChange, onSubmit, isPending }:IMessageComposerProps) => {
    return (
        <>
            <RichTextEditor field={{ value, onChange }} 
            sendButton={<SendButton showLabel onClick={onSubmit} isPending={isPending} />}
            footerLeft={
                <Button
                    type="button"
                    size="sm"
                    onClick={() => {}}
                    className={cn(
                        'flex items-center gap-2 rounded-md px-4',
                        'bg-violet-500/10 text-violet-600 border border-violet-500/20',
                        'hover:bg-violet-500/15 hover:border-violet-500/30',
                        'dark:text-violet-400 dark:bg-violet-400/10 dark:border-violet-400/20',
                        'dark:hover:bg-violet-400/15 dark:hover:border-violet-400/30',
                        'transition-all duration-200 ease-out cursor-pointer'
                    )}
                >
                    <ImageUp className="size-4" />
                    <span className="text-sm font-medium">Attach</span>
                </Button>
}
            />
        </>
    )
}

export default MessageComposer
