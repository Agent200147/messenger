import React, {FC} from 'react';
import styles from './header.module.css'
import {Playfair} from "next/font/google";
import cn from 'classnames'
import Nav from "@/components/Nav/Nav";
import {getUserFromCookies} from "@/utils";
// const poor_Story = Playfair({subsets: ["latin"]});
const Header = () => {
    const user = getUserFromCookies()

    return (
        <header className={ cn([styles.header, !user ? styles.headerNonAuth : '']) }>
            <div className={styles.logo}>
                Aesthetic Messenger
            </div>

            <Nav user={user}/>
        </header>
    );
};

export default Header;