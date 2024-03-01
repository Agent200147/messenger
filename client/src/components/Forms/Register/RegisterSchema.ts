import { z } from 'zod'
import validator from 'validator'
export const registerFormSchema = z.object({
    email: z.string().min(1, {message: 'Заполните email'}).email('Введите корректный email'),
    name: z.string().min(1, {message: 'Заполните Имя'}),
    secondName: z.string().min(1, {message: 'Заполните Фамилию'}),
    password: z.string().min(6, {message: 'Пароль должен быть от 6 символов'}),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Введенные пароли не совпадают',
}).refine((data) => validator.isStrongPassword(data.password), {
    path: ['password'],
    message: 'Пароль должен содержать заглавную букву, специальный символ и цифру',
})

export type RegisterFormData = z.infer<typeof registerFormSchema>