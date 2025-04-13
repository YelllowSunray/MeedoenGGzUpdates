'use client';
import React from 'react';
import Link from 'next/link';
import styles from './navbar.module.css';

const Navbar = () => {
    return (
        <nav className={styles.navbar}>
            <Link href="/" className={styles.siteName}>Meedoen</Link>
            <div className={styles.navLinks}>
                <Link href="/" className={styles.navLink}>Home</Link>
                <Link href="/activiteiten" className={styles.navLink}>Activiteiten</Link>
            </div>
        </nav>
    );
};

export default Navbar;
