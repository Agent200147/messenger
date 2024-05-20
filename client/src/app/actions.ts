'use server'

import { cookies } from 'next/headers'
import {UserTypeWithoutPassword} from "@/Models/User/userModel";

export async function deleteUserCookies() {
    cookies().delete('auth')
}
