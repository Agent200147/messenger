import type {Metadata} from "next";
import {redirect} from "next/navigation";
import {getIsAuth} from "@/utils";
import styles from "@/app/(auth)/auth.module.css";


export default async function PublicLayout({children}: Readonly<{ children: React.ReactNode }>) {
    const isAuthUser = await getIsAuth()
    if (isAuthUser && 'user' in isAuthUser) redirect('/')

    return (
        <div className={styles.wrapper}>
            {children}
        </div>
    )
}
