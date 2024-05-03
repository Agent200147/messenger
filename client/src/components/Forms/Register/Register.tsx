'use client';

import styles from '../Forms.module.css'

import { type FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {redirect, useRouter} from "next/navigation";
import { registerFormSchema, type RegisterFormData } from "@/components/Forms/Register/RegisterSchema";
import { FormRegisterInput } from "@/components/FormInput/FormInput";
import { useRegisterMutation } from "@/api/auth/authApi";
import type { ServerErrorResponse, ZodErrorResponse } from "@/Models/ErrorResponse/errorResponseTypes";

const RegisterForm: FC = () => {
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

    const [registerUser, {isLoading: isLoadingRegister, error}] = useRegisterMutation()

    const { register, handleSubmit, formState } = form
    const { errors } = formState;
    const serverValidationErrors = (error as ZodErrorResponse)?.data.issues
    const serverInternalError = (error as ServerErrorResponse)

    const onSubmit = async (data: RegisterFormData) => {
        const { confirmPassword, ...formData } = data
        try {
            await registerUser(formData).unwrap()
            // redirect('/')
            router.replace('/')

        } catch (e) {
            console.log(e)
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
                            return <div key={index} className={styles.serverError}>{index + 1}. {error.message}</div>
                        })}
                    </div>
                }
                {
                    serverInternalError?.status === 500 &&
                    <div className={styles.serverInternalError}>
                        {serverInternalError?.data}
                    </div>
                }
                <button type='submit'>Зарегистрироваться</button>
            </form>
        </div>
    )
}

export default RegisterForm;