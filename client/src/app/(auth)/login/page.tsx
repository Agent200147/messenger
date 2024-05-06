import type { FC } from "react";
import type { Metadata } from "next";
import Login from "@/app/(auth)/login/Login";

export const metadata: Metadata = {
    title: "Вход",
}

const LoginPage: FC = () => <Login/>

export default LoginPage