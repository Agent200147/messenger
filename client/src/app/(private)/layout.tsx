import type { Metadata } from "next";
import styles from "@/app/(private)/private.module.css";
import AsideChats from "@/components/AsideChats/AsideChats";
import CanvasComponent from "@/components/Canvas/CanvasComponent";
import {getIsAuth} from "@/utils";
import {redirect} from "next/navigation";
import {NextResponse} from "next/server";
import {Routes} from "@/Routes/routes";
import UserInitProvider from "@/providers/UserInit.provider";

export const metadata: Metadata = {
    title: "Auth",
}

export default async function PrivateLayout({children}: Readonly<{ children: React.ReactNode }>) {
    const isAuth = await getIsAuth()

    if(!isAuth) {
        redirect('/login')
        return
    }

    if(typeof isAuth === 'object' && 'error' in isAuth) {
       throw Error('PrivateLayout: Ошибка')
    }

    return (
        <UserInitProvider user={isAuth.user}>
            <section className={styles.sectionWrapper}>
                <AsideChats/>
                {children}
                <CanvasComponent/>
            </section>
        </UserInitProvider>
    )
}
