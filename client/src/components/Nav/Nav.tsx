'use client';

import { AuthLinks, NonAuthLinks } from "@/components/Links/Links";
import {useDispatch, useSelector} from "react-redux";
import {selectUser, setUser} from "@/store/slices/auth.slice";
import {useEffect} from "react";
import {UserTypeWithoutPassword} from "@/Models/User/userModel";

const Nav = ({ user }: { user: UserTypeWithoutPassword | false  }) => {
    const userFromStore = useSelector(selectUser)

    // useEffect(() => {
    //     dispatch(setUser(user))
    // }, [dispatch])

    return (
        <>
            {
                user || userFromStore
                    ? <AuthLinks user={!userFromStore ? user as UserTypeWithoutPassword : userFromStore}/>
                    : <NonAuthLinks/>
            }
        </>
    )
}

export default Nav