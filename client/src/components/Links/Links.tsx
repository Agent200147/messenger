'use client'
import styles from './links.module.css'
import Link from "next/link";
import {useDispatch, useSelector} from "react-redux";
import {selectUser, setUser} from "@/store/slices/auth.slice";
import {cookies} from "next/headers";
import {useEffect, useLayoutEffect} from "react";
import {UserTypeWithoutPassword} from "@/Models/User/userModel";
import {isEmpty} from "@/utils/ClientServices";
import {usePathname, useRouter} from "next/navigation";
import Image from "next/image";
import avatarImg from "@/public/img/avatar.svg";
import {Routes} from "@/Routes/routes";
import cn from "classnames";

export const AuthLinks = ({user}: { user: UserTypeWithoutPassword }) => {
    const router = useRouter()
    const pathname = usePathname()
    // console.log('AuthLinks render')
    // const currentUrl = router
    // console.log(user)
    return (
        <>
            <nav className={styles.authLinksWrapper}>
                <Link href={Routes.USERS} className={ cn([styles.link, 'hover-link', pathname === Routes.USERS ? styles.active : ''])}>
                    Пользователи
                </Link>
            </nav>
            <div className={styles.userProfileWrapper}>
                <Link href={Routes.PROFILE} className={cn([styles.userProfile, 'hover-link', pathname === Routes.PROFILE ? styles.active : ''])}>
                    <h1 className={styles.username}>
                        {user?.name} {user?.secondName}
                    </h1>
                    <div className={styles.avatarWrapper}>
                        <Image fill className={styles.avatar}
                               src={user.avatar ? `${process.env.SERVER_URL}/${user.avatar}` : avatarImg}
                               alt={'Аватарка'}/>
                    </div>
                </Link>
            </div>
        </>
    )
}

export const NonAuthLinks = () => {
    const pathname = usePathname()

    return (
        <nav className={styles.nonAuthLinksWrapper}>
            <Link href={Routes.REGISTER} className={cn([styles.link, 'hover-link', pathname === Routes.REGISTER ? styles.active : ''])}>
                Регистрация
            </Link>
            <Link href={Routes.LOGIN} className={cn([styles.link, 'hover-link', pathname === Routes.LOGIN ? styles.active : ''])}>
                Вход
            </Link>
        </nav>
    );
};
