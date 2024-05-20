'use client';

import type { ReactNode } from "react";
import type { UserTypeWithoutPassword } from "@/Models/User/userModel";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {setIsAuthenticated, setUser} from "@/store/slices/auth.slice";
import {disconnectSocket, initSocket} from "@/store/slices/socket.slice";
import {addNewOnlineUser} from "@/store/slices/chat.slice";
import {useSetLastOnlineOnUnload} from "@/hooks/useSetLastOnlineOnUnload";

const UserSocketInitProvider = ({ children, user }: Readonly<{ children: ReactNode, user: UserTypeWithoutPassword }>) => {
    const dispatch = useDispatch()

    useEffect(() => {
        if (!user) return
        console.log('initSocket')

        dispatch(initSocket())
        dispatch(addNewOnlineUser(user.id))

        dispatch(setUser(user))
        dispatch(setIsAuthenticated(true))

        return () => {
            dispatch(disconnectSocket())
        }
    }, [user])

    useSetLastOnlineOnUnload()

    return <>{children}</>
}

export default UserSocketInitProvider