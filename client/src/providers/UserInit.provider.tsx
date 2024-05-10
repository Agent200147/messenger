'use client'

import type { ReactNode } from "react";
import type { AuthenticatedUserType } from "@/Models/User/userModel";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {setUser} from "@/store/slices/authSlice";

const UserInitProvider = ({ children, user }: Readonly<{ children: ReactNode, user: AuthenticatedUserType }>) => {
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setUser(user))
    }, [user])

    return <>{children}</>
}

export default UserInitProvider