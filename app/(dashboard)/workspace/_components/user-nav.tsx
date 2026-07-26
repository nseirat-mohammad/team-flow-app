"use client"

import { AvatarWrapper } from '@/components/shared/avatar-wrapper'
import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownWrapper } from '@/components/shared/dropdown-wrapper'
import { Button } from '@/components/ui/button'
import { useCurrentUser } from '@/lib/hooks/use-current-user'
import { LogoutLink, PortalLink } from '@kinde-oss/kinde-auth-nextjs/components'
import { CreditCard, LogOut, User } from 'lucide-react'

export const UserNav = () => {
    const { user, avatarSrc, displayName, fallbackName } = useCurrentUser()
    return (
        <>
            <DropdownWrapper
                contentClassName='min-w-[250px] shadow-lg border border-primary/50 bg-gradient-to-br from-card to-popover backdrop-blur-sm'
                align='end' side='right' sideoffset={20}
                triggerClassName='bg-priamry'
                trigger={
                    <Button size={"icon"} className='size-14 shadow-md rounded-xl hover:rounded-lg bg-primary/40  border-primary/80 hover:bg-priamry/50 hover:ring-2
                hover:ring-offset-0 hover:outline-none hover:ring-primary transition-all duration-300 ease-out hover:text-accent-foreground '>
                        <AvatarWrapper src={avatarSrc} className='object-cover' fallback={fallbackName} />
                    </Button>
                }
                iconOnly
                tooltipContent={displayName} tooltipSide={'top'}
                labelClassName='flex text-left font-mormal gap-2 items-center px-1 py-1.5'
                label={
                    <>
                        <div className='size-12 flex items-center justify-center shadow-md rounded-lg  bg-primary/20  hover:bg-priamry/50 ring-2
                ring-offset-0 outline-none ring-primary transition-all duration-300 ease-out hover:text-accent-foreground '>

                            <AvatarWrapper src={avatarSrc} className='object-cover size-9 rounded-lg' fallback={fallbackName} />
                        </div>
                        <div className='grid flex-1 text-left text-base leading-tight'>
                            <p className='truncate font-medium text-foreground'>{user.given_name}</p>
                            <p className='text-muted-foreground italic text-xs truncate'>{user.email}</p>
                        </div>
                    </>
                }
            >
                <DropdownMenuGroup className='grid flex-1 gap-2'>
                    <DropdownMenuItem asChild className='group/item cursor-pointer bg-info/10 text-info focus:bg-info/20 focus:text-info'>
                        <PortalLink>
                            <User className='size-4' />
                            <span>Account</span>
                        </PortalLink>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className='group/item cursor-pointer bg-warning/10 text-warning focus:bg-warning/20 focus:text-warning'>
                        <PortalLink>
                            <CreditCard className='size-4' />
                            <span>Billing</span>
                        </PortalLink>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className='group/item cursor-pointer bg-destructive/10 text-destructive hover:text-destructive hover:bg-destructive/20 focus:bg-destructive/20 focus:text-destructive'>
                    <LogoutLink className='flex items-center gap-2 w-full'>
                        <LogOut className='size-4' />
                        <span>Log Out</span>
                    </LogoutLink>
                </DropdownMenuItem>
            </DropdownWrapper>
        </>
    )
}

