'use client';
import React from 'react';
import Link from 'next/link';
import styles from './navbar.module.css';

const Navbar = () => {
    return (
        <nav className={styles.navbar}>
            <Link href="/" className={styles.siteName}>Meedoen in Hilversum</Link>
            <div className={styles.navLinks}>
                <Link href="/" className={styles.navLink}>Home</Link>
                <Link href="/organisaties" className={styles.navLink}>Organisaties</Link>
                <Link href="/feedback" className={styles.navLink}>Feedback</Link>
            </div>
        </nav>
    );
};

export default Navbar;
