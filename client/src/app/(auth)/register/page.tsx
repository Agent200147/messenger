import type { FC } from "react";
import type { Metadata } from "next";
import Register from "@/app/(auth)/register/Register";

export const metadata: Metadata = {
    title: "Регистрация",
}

const RegisterPage: FC = () => <Register/>

export default RegisterPage