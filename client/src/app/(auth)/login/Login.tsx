'use client';

import styles  from '@/app/(auth)/auth.module.css'

import type { FC } from "react";

import type { LoginFormData } from "@/app/(auth)/login/LoginSchema";
import type { ServerErrorResponse } from "@/Models/ErrorResponse/errorResponseTypes";

import { loginFormSchema } from "@/app/(auth)/login/LoginSchema";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoginMutation}  from "@/api/auth/authApi";
import { FormLoginInput}  from "@/components/FormInput/FormInput";

const Login: FC = () => {
    const [loginError, setLoginError] = useState('')

    const router = useRouter()
    const form = useForm<LoginFormData>({
        defaultValues:{
            email: '',
            password: '',

        },
        resolver: zodResolver(loginFormSchema),
        mode: 'onChange'
    })

    const [loginUser, {isLoading: isLoadingLogin, error}] = useLoginMutation();
    const serverError = (error as ServerErrorResponse)

    const { register, handleSubmit, formState } = form
    const { errors } = formState;

    const onSubmit = async (data: LoginFormData) => {
        try {
            await loginUser(data).unwrap()
            router.replace('/')
            router.refresh()

            // redirect('/')

        } catch (e) {
            console.log(e)
        }
    }

    useEffect(() => {
        serverError?.data && setLoginError(serverError.data)
    }, [serverError])

    return (
        <div className={styles.formWrapper}>
            <div className={styles.formTitle}>
                <h1>Авторизация</h1>
            </div>
            <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
                <FormLoginInput type='email' name='email' placeholder='Электронная почта' errorMessage={errors.email?.message} register={register}/>
                <FormLoginInput type='password' name='password' placeholder='Пароль' errorMessage={errors.password?.message} register={register}/>
                {
                    loginError &&
                    <div className={styles.serverInternalError}>
                        {loginError}
                    </div>

                }
                <button type='submit'>Войти</button>
            </form>
        </div>

    )
}

export default Login