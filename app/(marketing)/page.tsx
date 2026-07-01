"use client"
import { buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { RegisterLink, LoginLink, LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components"
import { LayoutDashboard, Loader, LogIn, LogOut, UserPlus } from "lucide-react";
import Link from "next/link";

export default function Home() {
  //! get the user from the kinde browser client:
  const { getUser, isLoading, isAuthenticated } = useKindeBrowserClient()
  const user = getUser()
  console.log(user)
  return (
    <>
      {isLoading ? <Loader className="w-5 h-5 animate-spin text-primary" /> : (
        <div className="flex items-center gap-2 py-4">
          {user ? <>
            <Link
              href="/workspace"
              className={cn(buttonVariants({ size: "lg" }),
                "flex items-center gap-2 bg-primary/50 hover:bg-primary/25 border border-primary transition-all duration-300 ease-out")}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <LogoutLink
              className={cn(
                buttonVariants({ size: "lg" }),
                "flex items-center gap-2 text-gray-50 border border-destructive bg-destructive/50 hover:bg-destructive/25 transition-all duration-300"
              )}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </LogoutLink>
          </> :
            <>
              <RegisterLink className={buttonVariants({ variant: "default", size: "lg", className: "flex items-center gap-2" })}>
                <UserPlus className="h-4 w-4" />
                Sign up
              </RegisterLink>
              <LoginLink className={buttonVariants({ variant: "outline", size: "lg", className: "flex items-center gap-2" })}>
                <LogIn className="h-4 w-4" />
                Login
              </LoginLink>
            </>
          }
        </div>
      )}
    </>

  );
}
