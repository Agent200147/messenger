import styles from './header.module.css'

import type {FC} from 'react';

import cn from 'classnames'
import Nav from "@/components/Nav/Nav";
import { getIsAuth } from "@/utils";

const Header = async () => {
    let isAuthUser = await getIsAuth()

    if(!isAuthUser || 'error' in isAuthUser) {
         isAuthUser = false
    }

    return (
        <header className={ cn([styles.header, !isAuthUser ? styles.headerNonAuth : '']) }>
            <div className={styles.logo}>
                Aesthetic Messenger
            </div>
            <Nav user={isAuthUser && isAuthUser?.user}/>
        </header>
    )
}

export default Header