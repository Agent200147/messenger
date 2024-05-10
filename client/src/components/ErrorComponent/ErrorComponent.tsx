'use client';
import styles from './error.module.css';

import ServerErrorSvg from "@/components/SvgComponents/serverError.svg";

const ErrorComponent = () => {
    return (
        <section className={styles.sectionWrapper}>
            <div className={styles.ServerErrorSvgWrapper}>
                <ServerErrorSvg/>
            </div>
            <div className={styles.info}>
                <h1>Упс..</h1>
                <p>Кажется, произошла небольшая ошибка. Мы уже работаем над ее исправлением. Пожалуйста, попробуйте обновить страницу или вернитесь через некоторое время.</p>
                <button className={styles.btnRetry} onClick={() => window?.location?.reload()}>Повторить попытку</button>
            </div>
        </section>
    )
}

export default ErrorComponent;