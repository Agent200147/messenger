'use client';

import styles from './profile.module.css'

import {useSelector} from "react-redux";
import {selectUser} from "@/store/slices/authSlice";
import {useRef, useState} from "react";
import type { ChangeEvent, FC } from "react";
import type { FormEvent } from "react";
import {useRouter} from "next/navigation";
import Image from "next/image";
import {AuthenticatedUserType} from "@/Models/User/userModel";
import UploadSvg from "@/components/SvgComponents/UploadSvg";
import cn from "classnames";
import ReadCheckMarkSvg from "@/components/SvgComponents/ReadCheckMarkSvg";
import CancelSvg from "@/components/SvgComponents/CancelSvg";
import {useUploadAvatarMutation} from "@/api/user/usersApi";
import { ToastContainer, toast } from 'react-toastify';

import CustomToast from "@/components/CustomToast/CustomToast";
import avatarImg from "@/public/img/avatar.svg";
import {revalidatePath} from "next/cache";

type ProfilePageProps = {
    user: AuthenticatedUserType,
    // cancelHandler: React.MouseEventHandler<HTMLButtonElement> | undefined
}

const Profile: FC<ProfilePageProps> = ({ user }) => {
    // const user = useSelector(selectUser)
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter()
    const [selectedFile, setSelectedFile] = useState<File>();
    const [imagePreview, setImagePreview] = useState<string | ArrayBuffer | null>('');
    const [error, setError] = useState('');

    const [ upload ] = useUploadAvatarMutation()
    // console.log('error', error)

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (selectedFile) {
            const formData = new FormData()
            formData.append('photo', selectedFile)

            try {
                await upload(formData).unwrap()
                router.refresh()
                setImagePreview(null)
                toast.success(<CustomToast text="Фото профиля успешно обновлено" />)
            } catch (error: any) {
                toast.error(<CustomToast text={error?.data?.message || 'Непредвиденная ошибка'} />)
                // setError(error?.message || 'Непредвиденная ошибка')
            }
        }
    }

    const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files && e.target.files[0]
        if (file) {
            setSelectedFile(file)

            const reader = new FileReader()
            reader.onload = () => {
                console.log('ddd')
                setImagePreview(reader.result)
            }
            reader.readAsDataURL(file)
            if (inputRef.current) {
                inputRef.current.value = ''
            }
        }
    }

    const cancelHandler = () => {
        if (inputRef.current) {
            inputRef.current.value = ''
        }
        setImagePreview(null)
    }

    return (
        <div className={styles.profilePageWrapper}>
            <div className={styles.user}>
                <div className={styles.avatarWrapperMain}>
                    <Image className={styles.avatar} fill src={user.avatar ? (imagePreview || `${process.env.SERVER_URL}/${user.avatar}`) : (imagePreview || avatarImg)}
                           alt="Аватарка"/>

                    <form className={cn([styles.form, imagePreview ? styles.uploadFormWithPreview : styles.uploadForm]) } onSubmit={onSubmit}>
                        {imagePreview
                            ? <div className={styles.uploadBtnWrapper}>
                                <button className={styles.uploadBtn} type="submit">
                                    <ReadCheckMarkSvg isRead={false}/>
                                </button>
                                <button onClick={cancelHandler} className={styles.cancelBtn} type="button">
                                    <CancelSvg/>
                                </button>
                            </div>
                            : <label className={styles.uploadSvgWrapper} htmlFor="inputPhoto">
                                <UploadSvg/>
                            </label>
                        }
                        <input type="file" id="inputPhoto" ref={inputRef} accept=".jpg, .png" onChange={onChangeHandler}/>
                    </form>
                </div>
                <div className={styles.userinfo}>
                    <div>Имя: <div className={styles.colored}>{user.name}</div></div>
                    <div>Фамилия: <div className={styles.colored}>{user.secondName}</div></div>
                    <div>Электронная почта: <div className={styles.colored}>{user.email}</div></div>
                    {/*<div>Зарегистрирован: <div className={styles.colored}>{user.crea}</div></div>*/}
                    <div>Активных чатов: <div className={styles.colored}>{user.email}</div></div>
                </div>
            </div>

        </div>
    )
};

export default Profile;