import { FC } from 'react';
import styles from "./customToast.module.css";

type CustomToastProps = {
    text: string
}
const CustomToast: FC<CustomToastProps> = ({ text }) => {
    return (
        <p className={styles.toastText}>{text}</p>
    )
}

export default CustomToast;