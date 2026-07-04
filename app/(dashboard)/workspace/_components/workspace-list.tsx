import TooltipWrapper from '@/components/shared/tooltip-wrapper'
import { Button } from '@/components/ui/button'
import { workspaces } from '@/constant/data'
import { getWorkspaceColor } from '@/lib/helpers'
import { cn } from '@/lib/utils'


export const WorkspaceList = () => {
    return (
        <>
            <div className='flex flex-col gap-2'>
                {
                    workspaces.map((ws) => (
                        <TooltipWrapper side='right' key={ws.id} content={ws.name}>
                            <Button size={"icon"} className={cn("size-14 transition-all duration-300", getWorkspaceColor(ws.id))}>
                                <span className='text-sm font-medium'>{ws.avatar}</span>
                            </Button>
                        </TooltipWrapper>
                    ))
                }


            </div>
        </>
    )
}
