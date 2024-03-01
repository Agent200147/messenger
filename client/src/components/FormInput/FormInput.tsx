import styles from './formInput.module.css'
import type { FC, InputHTMLAttributes } from "react";
import type { FieldValues, UseFormRegister } from 'react-hook-form';
import type { RegisterFormData } from "@/components/Forms/Register/RegisterSchema";
import type { LoginFormData } from "@/components/Forms/Login/LoginSchema";

import cn from "classnames";

type InputProps<T extends FieldValues> = InputHTMLAttributes<HTMLInputElement> & {
    name: keyof T,
    errorMessage: string | undefined,
    register?: UseFormRegister<T>
}
export const FormRegisterInput: FC<InputProps<RegisterFormData>> = ({ type, name, placeholder, errorMessage, register, ...props }) => {
    return (
        <div>
            <input type={type} {...register && register(name)} className={cn([styles.input, errorMessage && styles.inValidInput]) } placeholder={placeholder} {...props}/>
            <div className={styles.error}>{errorMessage}</div>
        </div>
    )
}

export const FormLoginInput: FC<InputProps<LoginFormData>> = ({ type, name, placeholder, errorMessage, register, ...props }) => {
    return (
        <div>
            <input type={type} {...register && register(name)} className={cn([styles.input, errorMessage && styles.inValidInput]) } placeholder={placeholder} {...props}/>
            <div className={styles.error}>{errorMessage}</div>
        </div>
    )
}

