import React from 'react';
import Link from 'next/link';
import './navbar.css';

const Navbar = () => {
    return (
        <nav className="navbar">
            <Link href="/" className="site-name">Meedoen</Link>
            <div className="nav-links">
                <Link href="/" className="nav-link">Home</Link>
                <Link href="/activiteiten" className="nav-link">Activiteiten</Link>
            </div>
        </nav>
    );
};

export default Navbar;
