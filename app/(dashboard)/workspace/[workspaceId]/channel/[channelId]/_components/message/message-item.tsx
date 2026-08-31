import SafeContent from '@/components/shared/rich-text-editor/safe-content'
import { Message } from '@/lib/generated/prisma/client'
import { getAvatar } from '@/lib/helpers'
import Image from 'next/image'

export interface IMessageItemProps {
  message: Message
}

export const MessageItem = ({ message }: IMessageItemProps) => {
  const {authorAvatar, authorEmail, authorName, content, createdAt} = message
  return (
    <div className="flex items-start gap-3 group mt-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] px-3 py-2 rounded-lg transition-all duration-200">
      <Image
        src={getAvatar(authorAvatar,authorEmail)}
        alt="User Avatar"
        width={40}
        height={40}
        className="rounded-full object-cover border border-gray-200 dark:border-gray-700 flex-shrink-0 mt-0.5"
      />

      <div className="flex flex-col space-y-1 items-start max-w-[80%]">
        {/* اسم + تاريخ: زاوية سفلى يسرى حادة */}
        <div className="bg-blue-200 dark:bg-blue-950 px-3 py-1 rounded-t-2xl rounded-br-2xl rounded-bl-sm">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{authorName}</span>
            <span className="text-[11px] text-gray-600 dark:text-gray-300 italic">{new Intl.DateTimeFormat("en-US",{
              day:"numeric",
              month:"short",
              year:"numeric"
            }).format(createdAt)}
            </span>
            <div className='w-1 h-1 rounded-full bg-primary' />
            <span className="text-[11px] text-gray-600 dark:text-gray-300 italic">{new Intl.DateTimeFormat("en-US",{
              hour12:false,
              hour:"2-digit",
              minute:"2-digit"
            }).format(createdAt)}
            </span>
          </div>
        </div>
            <SafeContent 
            safeClassName='text-sm break-words prose dark:prose-invert max-w-none marker:text-primary' 
            content={JSON.parse(content)} />

            {/* Display the Image */}
            {message.imageUrl && (
              <div className='mt-3'>
                <Image
                src={message.imageUrl}
                alt='Message Item'
                width={500}
                height={500}
                className="rounded-md object-contain max-h-[350px] w-auto"
                />
              </div>
            )}
      </div>
    </div>
  )
}