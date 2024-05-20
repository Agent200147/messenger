export type UserType = {
    id: number,
    name: string,
    secondName: string,
    email: string,
    avatar: string | null,
    password: string,
    lastOnline: string,
    createdAt: string
}

export type UserTypeWithoutPassword = Omit<UserType, 'password'>
export type UserLoginType = Pick<UserType, 'email' | 'password'>
export type UserRegisterType = Omit<UserType, 'id' | 'avatar' | 'lastOnline' | 'createdAt'>
