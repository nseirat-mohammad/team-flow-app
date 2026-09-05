import { ArrowDown } from "lucide-react"
interface IScrollToBottomButtonProps {
    onClick: () => void
    className?: string
    children?: React.ReactNode
}

export const ScrollToBottomButton = ({onClick,className = "",children}: IScrollToBottomButtonProps) => {
   return(
    <button onClick={onClick}
        className={`relative cursor-pointer flex items-center justify-center w-12 h-12 shrink-0 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg rounded-full ${className}`}
    >
        <ArrowDown className="w-5 h-5 shrink-0" />
        {children}
    </button>
)}