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

export type AuthenticatedUserType = Omit<UserType, 'password'> & { token: string}
export type UserLoginType = Pick<UserType, 'email' | 'password'>
export type UserRegisterType = Omit<UserType, 'id' | 'avatar' | 'lastOnline' | 'createdAt'>
export type UserInChatType = Omit<UserType, 'password'>