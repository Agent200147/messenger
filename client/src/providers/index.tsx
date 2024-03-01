'use client'

import {Provider, useDispatch, useSelector} from "react-redux";
import { store } from "@/store/store";
import {ReactNode, useEffect} from "react";
import { useCurrentQuery } from "@/api/auth/authApi";
import { CookiesProvider } from 'next-client-cookies/server';
import ChatProvider from "@/providers/ChatProvider";
import {selectUser} from "@/store/slices/authSlice";
import {setOnlineUsers} from "@/store/slices/chatSlice";

const MainProvider = ({ children }: Readonly<{ children: ReactNode }>) => {
    return (
        <Provider store={store}>
            <ChatProvider>
                <AuthProvider>
                    { children }
                </AuthProvider>
            </ChatProvider>
        </Provider>
    );
};

export default MainProvider;

const AuthProvider = ({ children }: Readonly<{ children: ReactNode }>) => {
    // useCurrentQuery()
    // const dispatch = useDispatch()
    // const user = useSelector(selectUser)


    // return !isLoading && children
    return <>{children}</>
}