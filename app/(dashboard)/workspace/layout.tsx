import { CreateWorkspace } from "./_components/create-workspace";
import { UserNav } from "./_components/user-nav";
import { WorkspaceList } from "./_components/workspace-list";

const WorkspaceLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className=" flex w-full h-screen">
            <div className=" flex flex-col items-center px-4 py-3 border-r-2 border-border h-full w-16 bg-secondary">
                <WorkspaceList />

                <div className="mt-4">
                    <CreateWorkspace />
                </div>

                <div className="mt-auto">
                    <UserNav />
                </div>
            </div>
            {children}
        </div>

    )
}


export default WorkspaceLayout;