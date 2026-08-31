import arcjet, { createMiddleware, detectBot } from "@arcjet/next";
import { withAuth } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse,NextProxy } from "next/server";



const aj = arcjet({
    key: process.env.ARCJET_KEY!,
    rules:[
        detectBot({
            mode: "LIVE",
            allow:[
                "CATEGORY:SEARCH_ENGINE",
                "CATEGORY:PREVIEW",
                "CATEGORY:MONITOR",
                "CATEGORY:WEBHOOK"
            ]
        })
    ]
})

const existingMiddleware = async (req:NextRequest) =>{
    const anyRequest = req as {
        nextUrl: NextRequest["nextUrl"],
        kindeAuth?: {
            user?:any ,
            token?:any
        },
    }

    //! 1-get the url
    const url = anyRequest.nextUrl
    //! 2- get the org code from the claim
    const orgCode = anyRequest?.kindeAuth?.user?.org_code ||
        anyRequest?.kindeAuth?.token?.org_code ||
        anyRequest?.kindeAuth?.token?.claims?.org_code

    if(url.pathname.startsWith("/workspace") && !url.pathname.includes( orgCode || "")){
        url.pathname = `/workspace/${orgCode}`
        return NextResponse.redirect(url)
    }
    return NextResponse.next()


}
export default createMiddleware(aj, withAuth(existingMiddleware,{
    publicPaths: ["/","/api/uploadthing"]
}) as NextProxy)

//* create Matcher:
export const config = {
  // matcher tells Next.js which routes to run the middleware on.
  // This runs the middleware on all routes except for static assets.
    matcher: ["/((?!_next/static|_next/image|favicon.ico|/rpc).*)"],
};