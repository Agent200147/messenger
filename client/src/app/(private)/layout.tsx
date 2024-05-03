import type { Metadata } from "next";
import styles from "@/app/(private)/private.module.css";
import AsideChats from "@/components/AsideChats/AsideChats";
import NewsServer from "@/components/News/News.server";

export const metadata: Metadata = {
    title: "Auth",
}

export default async function PrivateLayout({children}: Readonly<{ children: React.ReactNode }>) {
    return (
        <section className={styles.sectionWrapper}>
            <AsideChats/>
            {children}
            <NewsServer/>
        </section>
    )
}
