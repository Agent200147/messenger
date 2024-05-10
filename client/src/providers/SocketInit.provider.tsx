'use client'

import type { ReactNode } from "react";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { selectUser } from "@/store/slices/authSlice";
import { addNewOnlineUser } from "@/store/slices/chatSlice";
import { disconnectSocket, initSocket } from "@/store/slices/socket.slice";
import { useSetLastOnlineOnUnload } from "@/hooks/useSetLastOnlineOnUnload";

const SocketInitProvider = ({ children }: Readonly<{ children: ReactNode }>) => {
    const dispatch = useDispatch()
    const user = useSelector(selectUser)

    useEffect(() => {
        if (!user) return

        dispatch(initSocket())
        dispatch(addNewOnlineUser(user.id))
        return () => {
            dispatch(disconnectSocket())
        }
    }, [dispatch, user])

    useSetLastOnlineOnUnload()

    return <>{children}</>
}

export default SocketInitProvider