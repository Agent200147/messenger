import type { FC } from "react";
import styles from './messageInput.module.css'

type SvgSendIconProps = {
    active: boolean,
    onClick: () => void
}
const SendButton: FC<SvgSendIconProps> = ({ active, onClick }) => {
    return (
        <button disabled={!active} onClick={onClick}>
            <svg className={active ? styles.active : ''} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M27.5624 0.171875C27.9062 0.421875 28.0468 0.755208 27.9843 1.17188L23.9843 25.1719C23.9322 25.474 23.7655 25.7083 23.4843 25.875C23.3384 25.9583 23.177 26 22.9999 26C22.8853 26 22.7603 25.974 22.6249 25.9219L15.5468 23.0312L11.7655 27.6406C11.578 27.8802 11.3228 28 10.9999 28C10.8645 28 10.7499 27.9792 10.6562 27.9375C10.4582 27.8646 10.2994 27.7422 10.1796 27.5703C10.0598 27.3984 9.99991 27.2083 9.99991 27V21.5469L23.4999 5L6.79678 19.4531L0.624905 16.9219C0.239488 16.776 0.0311551 16.4896 -9.49433e-05 16.0625C-0.0209283 15.6458 0.145738 15.3385 0.499905 15.1406L26.4999 0.140625C26.6562 0.046875 26.8228 0 26.9999 0C27.2082 0 27.3957 0.0572917 27.5624 0.171875Z"
                    fill="var(--gray)" fillOpacity='0.7'/>
            </svg>
        </button>

    );
};

export default SendButton;