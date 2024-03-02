'use client';

import styles from './nav.module.css'
import { AuthLinks, NonAuthLinks } from "@/components/Links/Links";
import {useDispatch, useSelector} from "react-redux";
import {selectUser, setUser} from "@/store/slices/authSlice";
import { useCookies } from 'next-client-cookies';
import {cookies} from "next/headers";
import {getUserFromCookies} from "../../utils";
import {useEffect} from "react";
import {isEmpty} from "@/utils/ClientServices";
import {AuthenticatedUserType} from "@/Models/User/userModel";
// import { getCookies, setCookie, deleteCookie, getCookie } from 'cookies-next'
const Nav = ({ user }: { user: AuthenticatedUserType | undefined  }) => {
    // const user = useSelector(selectUser)
    const dispatch = useDispatch()
    const userFromStore = useSelector(selectUser)
    useEffect(() => {
        dispatch(setUser(user))
    }, [dispatch])

    return (
        <>
            {
                user || userFromStore
                    ? <AuthLinks user={!userFromStore ? user as AuthenticatedUserType : userFromStore}/>
                    : <NonAuthLinks/>
            }
        </>
    );
};

export default Nav;