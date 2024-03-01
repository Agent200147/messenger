import { api } from "@/api/api";
import {type AuthenticatedUserType, type UserLoginType, type UserRegisterType, type UserType} from "@/Models/User/userModel";

export const userApi = api.injectEndpoints({
    endpoints: (builder) => ({
        uploadAvatar: builder.mutation({
            query: (formData) => ({
                url: "/users/avatarUpload",
                method: "POST",
                body: formData,
            }),
        }),
    }),
})

export const { useUploadAvatarMutation } = userApi;

// export const {
//     endpoints: { login, register, current },
// } = authApi;