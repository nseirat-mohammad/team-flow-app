import React from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
interface ITooltipWrapperProps {
    children: React.ReactNode;
    side?: "top" | "bottom" | "left" | "right";
    align?: "start" | "center" | "end";
    content: string;
}

const TooltipWrapper = ({ children, side = "bottom", align = "center", content }: ITooltipWrapperProps) => {
    return (
        <>
            <Tooltip>
                <TooltipTrigger asChild>
                    {children}
                </TooltipTrigger>
                <TooltipContent side={side} align={align}>
                    {content}
                </TooltipContent>
            </Tooltip>
        </>
    )
}

export default TooltipWrapper

{/*
Usage:
    <TooltipWrapper content="More info" side="right">
        <Info className="h-4 w-4 cursor-pointer" />
    </TooltipWrapper> 
      */}