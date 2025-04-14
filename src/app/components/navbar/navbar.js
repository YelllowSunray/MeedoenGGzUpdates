'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './navbar.module.css';

const Navbar = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/auth/check');
                const data = await response.json();
                setIsAuthenticated(data.authenticated);
            } catch (error) {
                console.error('Auth check error:', error);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };
        checkAuth();
    }, []);

    const handleLogout = async () => {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
            });
            
            if (response.ok) {
                setIsAuthenticated(false);
                router.push('/');
                router.refresh();
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    if (isLoading) {
        return null;
    }

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
