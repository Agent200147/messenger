import type {Metadata} from "next";
import PublicProvider from "@/providers/PublicProvider";
import {redirect} from "next/navigation";
import {getIsAuth} from "@/utils";
import styles from "@/app/(auth)/auth.module.css";


export default async function PublicLayout({children}: Readonly<{ children: React.ReactNode }>) {
    const isAuth = await getIsAuth()
    if (isAuth) redirect('/')

    return (
        <div className={styles.wrapper}>
            {children}
        </div>
    )
}
