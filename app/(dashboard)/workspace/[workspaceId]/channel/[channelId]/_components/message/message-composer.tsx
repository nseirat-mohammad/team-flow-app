import RichTextEditor from '@/components/shared/rich-text-editor/Editor'
import ImageUploadModal from '@/components/shared/rich-text-editor/image-upload-modal'
import SendButton from '@/components/shared/send-button'
import { Button } from '@/components/ui/button'
import { type UseAttachmentImageType } from '@/lib/hooks/attchImage/use-attach-Image'
import { cn } from '@/lib/utils'
import { ImageUp } from 'lucide-react'
import ImageView from './image-view'


interface IMessageComposerProps {
    value: string
    onChange: (value: string) => void
    onSubmit : () => void
    isPending: boolean
    upload: UseAttachmentImageType
}

const MessageComposer = ({ value, onChange, onSubmit, isPending,upload }:IMessageComposerProps) => {
    return (
        <>
            <RichTextEditor field={{ value, onChange }} 
            sendButton={<SendButton showLabel onClick={onSubmit} isPending={isPending} />}
            footerLeft={
                upload.stagedUrl ? (
                    <ImageView stagedUrl={upload.stagedUrl} onRemove={upload.clearUrl} />
                ):(
                    <ImageUploadModal
                onUploadedUrl={(url) => upload.uploadedUrl(url)}
                open={upload?.isOpen}
                onOpenChange={upload.setIsOpen}
                triggerImageUpload={
                    <Button type="button"size="sm" onClick={() =>upload.setIsOpen(true)}
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
            }/>
                )
                }
            />
        </>
    )
}

export default MessageComposer
