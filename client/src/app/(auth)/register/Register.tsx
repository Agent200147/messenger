'use client';

import styles  from '@/app/(auth)/auth.module.css'

import type { FC } from "react";

import type { RegisterFormData } from "@/app/(auth)/register/RegisterSchema";
import type { ZodErrorResponse } from "@/Models/ErrorResponse/errorResponseTypes";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { useRegisterMutation } from "@/api/auth/authApi";
import { FormRegisterInput } from "@/components/FormInput/FormInput";
import { registerFormSchema } from "@/app/(auth)/register/RegisterSchema";
import { zodResolver } from "@hookform/resolvers/zod";

const Register: FC = () => {
    const [serverValidationErrors, setServerValidationErrors] = useState<string[]>()
    const [registerError, setRegisterError] = useState('')

    const router = useRouter()
    const form = useForm<RegisterFormData>({
        defaultValues:{
            email: '',
            name: '',
            secondName: '',
            password: '',

        },
        resolver: zodResolver(registerFormSchema),
        mode: 'onChange'
    })

    const [registerUser, { isLoading: isLoadingRegister }] = useRegisterMutation()

    const { register, handleSubmit, formState } = form
    const { errors } = formState

    const onSubmit = async (data: RegisterFormData) => {
        const { confirmPassword, ...formData } = data
        try {
            await registerUser(formData).unwrap()
            router.replace('/')

        } catch (e) {
            console.log(e)

            if(e && typeof e === 'object' && 'status' in e && e.status === 400 && 'data' in e && e.data && typeof e.data === 'object' && 'name' in e.data && e.data.name === "ZodError") {
                setServerValidationErrors((e as ZodErrorResponse).data.errors)
                return
            }
            else {
                setRegisterError('Непредвиденная ошибка на сервере')
            }
        }
    }

    return (
        <div className={styles.formWrapper}>
            <div className={styles.formTitle}>
                <h1>Регистрация</h1>
            </div>
            <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
                <FormRegisterInput type='email' name='email' placeholder='Электронная почта' errorMessage={errors.email?.message} register={register}/>
                <FormRegisterInput type='text' name='name' placeholder='Имя' errorMessage={errors.name?.message} register={register}/>
                <FormRegisterInput type='text' name='secondName' placeholder='Фамилия' errorMessage={errors.secondName?.message} register={register}/>
                <FormRegisterInput type='password' name='password' placeholder='Пароль' errorMessage={errors.password?.message} register={register}/>
                <FormRegisterInput type='password' name='confirmPassword' placeholder='Повторите пароль' errorMessage={errors.confirmPassword?.message} register={register}/>
                {!!serverValidationErrors?.length &&
                    <div>
                        {serverValidationErrors.map((error, index) => {
                            return <div key={index} className={styles.errorMessage}>{index + 1}) {error}</div>
                        })}
                    </div>
                }
                {
                    registerError && <div className={styles.serverInternalError}>{registerError}</div>
                }
                {/*{*/}
                {/*    serverInternalError?.status === 500 &&*/}
                {/*    <div className={styles.serverInternalError}>*/}
                {/*        {serverInternalError?.data}*/}
                {/*    </div>*/}
                {/*}*/}
                <button type='submit'>Зарегистрироваться</button>
            </form>
        </div>
    )
}

export default Register;