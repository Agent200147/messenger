import styles from './profile.module.css'

import {useSelector} from "react-redux";
import {selectUser} from "@/store/slices/authSlice";
import type { FormEvent } from "react";
import {useRouter} from "next/navigation";
import Image from "next/image";
import {getUserFromCookies} from "@/utils";
import Profile from "@/app/(private)/profile/Profile";
import {AuthenticatedUserType} from "@/Models/User/userModel";
import {Metadata} from "next";

export const metadata: Metadata = {
    title: "Профиль",
}

const ProfilePage = () => {
    const user = getUserFromCookies()
    if (!user) throw 'ProfilePage: Ошибка'

    return <Profile user={user} />
}

export default ProfilePage