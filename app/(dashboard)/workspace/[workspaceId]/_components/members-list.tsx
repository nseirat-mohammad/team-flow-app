"use client"
import { AvatarWrapper } from "@/components/shared/avatar-wrapper"
import { CollapsibleWrapper } from "@/components/shared/collapsible-wrapper"
import { useMembers } from "@/lib/hooks/channels/use-memebers"
import { cn } from "@/lib/utils"

const MembersList = () => {
    const { members: MembersListData } = useMembers()
    return (
        <>
            <CollapsibleWrapper
                title="Members"
                triggerClassName="border-t border-white/10 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:bg-white/5 active:bg-white/10 data-[state=open]:bg-white/5 data-[state=open]:text-foreground"

            >
                <div className={cn("divide-y divide-white/10")}>
                    {MembersListData.map((member) => (

                        <div key={member.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors duration-150 hover:bg-sky-500/10 hover:text-foreground">
                            <div className="relative">
                                <AvatarWrapper src={member.picture ?? member.first_name?.charAt(0).toUpperCase()} alt={member.full_name} AvatarImageClassName="object-cover"
                                    fallback={member.full_name ? member.full_name.charAt(0).toUpperCase() : member.email!.split("@")[0].charAt(0).toUpperCase()} className="size-10 rounded-md" />
                            </div>
                            <div>
                                <p className="text-sm font-medium truncate">{member.full_name}</p>
                                <p className="text-xs text-muted-foreground">{member.email}</p>
                            </div>

                        </div>

                    ))}

                </div>
            </CollapsibleWrapper>

        </>
    )
}

export default MembersList