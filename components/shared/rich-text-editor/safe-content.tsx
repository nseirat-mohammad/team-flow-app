import { convertJsonToHtml } from "@/lib/helpers"
import { type JSONContent } from "@tiptap/react"
import DOMPurify from 'dompurify';
import parse from 'html-react-parser';

interface ISafeContentProps {
    content: JSONContent
    safeClassName?: string
}
const SafeContent = ({ content, safeClassName }: ISafeContentProps) => {
    const htmlContent = convertJsonToHtml(content)
    const cleanContent = DOMPurify.sanitize(htmlContent)
    return (
        <div className="bg-[#DCF8C6] dark:bg-[#005C4B] px-3 py-2 rounded-b-2xl rounded-tr-2xl rounded-tl-sm -mt-px max-w-none">
            <div className={`text-sm text-gray-800 dark:text-gray-50 leading-relaxed break-word
                ${safeClassName}`}>
                    {parse(cleanContent)}
            </div>
        </div>
    )
}

export default SafeContent
