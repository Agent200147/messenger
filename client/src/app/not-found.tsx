import styles from './page.module.css';

const NotFound = () => {
    return (
        <div className={styles.notFoundWrapper}>
            <div className={styles.notFoundInfo}>
                <span>404</span>
                <div className={styles.vertical}></div>
                <span>Страница не найдена</span>
            </div>
        </div>
    )
}

export default NotFound