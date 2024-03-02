'use client'
import styles from './links.module.css'
import Link from "next/link";
import {useDispatch, useSelector} from "react-redux";
import {selectUser, setUser} from "@/store/slices/authSlice";
import {cookies} from "next/headers";
import {useEffect, useLayoutEffect} from "react";
import {AuthenticatedUserType} from "@/Models/User/userModel";
import {isEmpty} from "@/utils/ClientServices";
import {useRouter} from "next/navigation";
import Image from "next/image";
import avatarImg from "@/public/img/avatar.svg";
import {Routes} from "@/Routes/routes";

export const AuthLinks = ({user}: { user: AuthenticatedUserType }) => {
    const router = useRouter()
    // console.log(user)
    return (
        <nav className={styles.authLinks}>
            {/*<h1 onClick={() => router.push(Routes.PROFILE)} className={styles.username}>{user?.name} {user?.secondName}</h1>*/}
            {/*<div className={styles.avatarWrapper}>*/}
            {/*    <Image fill className={styles.avatar} src={ user.avatar ? `${process.env.SERVER_URL}/${user.avatar}` : avatarImg}*/}
            {/*           alt={'Аватарка'}/>*/}
            {/*</div>*/}

            {/*<h1>{'authCookie'}</h1>*/}
        </nav>
    );
};

export const NonAuthLinks = () => {
    return (
        <nav className={styles.nonAuthLinks}>
            <Link href={Routes.REGISTER} className={styles.nonAuthLink}>
                Регистрация
            </Link>
            <Link href={Routes.LOGIN} className={styles.nonAuthLink}>
                Вход
            </Link>
        </nav>
    );
};
