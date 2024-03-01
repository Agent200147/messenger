'use client'

import type {ReactNode} from "react";
import {Provider, useSelector} from "react-redux";
import {store} from "@/store/store";
import {selectUser} from "@/store/slices/authSlice";
import {redirect, useRouter} from "next/navigation";

const PrivateProvider = ({ children }: Readonly<{ children: ReactNode }>) => {
    const user = useSelector(selectUser)
    if (user) {
        redirect('/')
    }
    return children
};

export default PrivateProvider;