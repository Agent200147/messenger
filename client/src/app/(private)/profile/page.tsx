import styles from './profile.module.css'

import {useSelector} from "react-redux";
import {selectUser} from "@/store/slices/authSlice";
import type { FormEvent } from "react";
import {useRouter} from "next/navigation";
import Image from "next/image";
import {getUserFromCookies} from "@/utils";
import ProfilePage from "@/app/(private)/profile/ProfilePage";
import {AuthenticatedUserType} from "@/Models/User/userModel";

const Page = () => {
    const user = getUserFromCookies() as AuthenticatedUserType

    return (
        <>
            <ProfilePage user={user} />
        </>
    );
};

export default Page;