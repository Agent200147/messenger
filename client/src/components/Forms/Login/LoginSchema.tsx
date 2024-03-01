import { z } from 'zod'

export const loginFormSchema = z.object({
    email: z.string().min(1, {message: 'Заполните email'}).email('Введите корректный email'),
    password: z.string().min(6, {message: 'Пароль должен быть от 6 символов'}),
})

export type LoginFormData = z.infer<typeof loginFormSchema>