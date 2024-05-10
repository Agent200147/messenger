import styles from './profile.module.css'

import {useSelector} from "react-redux";
import {selectUser} from "@/store/slices/authSlice";
import type { FormEvent } from "react";
import {redirect, useRouter} from "next/navigation";
import Image from "next/image";
import {getIsAuth, getUserFromCookies} from "@/utils";
import Profile from "@/app/(private)/profile/Profile";
import {AuthenticatedUserType} from "@/Models/User/userModel";
import {Metadata} from "next";

export const metadata: Metadata = {
    title: "Профиль",
}

const ProfilePage = async () => {
    const user = await getIsAuth()
    if (!user) redirect('/login')
    if('error' in user) throw Error('ProfilePage: Ошибка')

    return <Profile user={user.user} />
}

export default ProfilePage