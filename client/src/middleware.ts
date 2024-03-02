import type { NextRequest } from "next/server";
import { NextResponse  } from "next/server";
import { getIsAuth } from "@/utils";
import {Routes} from "@/Routes/routes";
const privateRoutes = [Routes.INDEX, Routes.PROFILE];
const publicRoutes = [Routes.LOGIN, Routes.REGISTER, Routes.SERVER_ERROR];


export async function middleware(request: NextRequest) {
    const loginUrl = new URL(Routes.LOGIN, request.url)
    const indexUrl = new URL(Routes.INDEX, request.url)
    const serverErrorUrl = new URL(Routes.SERVER_ERROR, request.url)
    const isAuth = await getIsAuth()

    if (typeof isAuth === 'object' && 'error' in isAuth && request.nextUrl.pathname !== Routes.SERVER_ERROR){
        return NextResponse.redirect(serverErrorUrl)
    }

    if (privateRoutes.includes(request.nextUrl.pathname) || request.nextUrl.pathname.startsWith('/chats')) {
        if (!isAuth) {
            return NextResponse.redirect(loginUrl)
        }
    }
    if (publicRoutes.includes(request.nextUrl.pathname)) {
        if (isAuth === true) {
            return NextResponse.redirect(indexUrl)
        }
    }
    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],

};