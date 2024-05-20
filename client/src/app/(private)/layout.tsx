import type { Metadata } from "next";
import styles from "@/app/(private)/private.module.css";
import AsideChats from "@/components/AsideChats/AsideChats";
import CanvasComponent from "@/components/Canvas/CanvasComponent";
import {getIsAuth} from "@/utils";
import {redirect} from "next/navigation";
import {NextResponse} from "next/server";
import {Routes} from "@/Routes/routes";
import UserSocketInitProvider from "@/providers/UserSocketInit.provider";

export const metadata: Metadata = {
    title: "Auth",
}

export default async function PrivateLayout({children}: Readonly<{ children: React.ReactNode }>) {
    const isAuth = await getIsAuth()
    console.log('PrivateLayout')
    if(!isAuth) {
        redirect('/login')
        return
    }

    if(typeof isAuth === 'object' && 'error' in isAuth) {
       throw Error('PrivateLayout: Ошибка')
    }

    return (
        <UserSocketInitProvider user={isAuth.user}>
            <section className={styles.sectionWrapper}>
                <AsideChats/>
                {children}
                <CanvasComponent/>
            </section>
        </UserSocketInitProvider>
    )
}
