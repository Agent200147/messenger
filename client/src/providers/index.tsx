'use client'

import { Provider } from "react-redux";
import { store } from "@/store/store";
import type { ReactNode } from "react";
import SocketInitProvider from "@/providers/SocketInit.provider";

const MainProvider = ({ children }: Readonly<{ children: ReactNode }>) => {
    return (
        <Provider store={store}>
            <SocketInitProvider>
                { children }
            </SocketInitProvider>
        </Provider>
    );
};

export default MainProvider;

