'use client';

import { AuthLinks, NonAuthLinks } from "@/components/Links/Links";
import {useDispatch, useSelector} from "react-redux";
import {selectUser, setUser} from "@/store/slices/authSlice";
import {useEffect} from "react";
import {AuthenticatedUserType} from "@/Models/User/userModel";

const Nav = ({ user }: { user: AuthenticatedUserType | false  }) => {
    const userFromStore = useSelector(selectUser)

    // useEffect(() => {
    //     dispatch(setUser(user))
    // }, [dispatch])

    return (
        <>
            {
                user || userFromStore
                    ? <AuthLinks user={!userFromStore ? user as AuthenticatedUserType : userFromStore}/>
                    : <NonAuthLinks/>
            }
        </>
    )
}

export default Nav