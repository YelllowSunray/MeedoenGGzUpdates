'use client';

import React from 'react';
import Link from 'next/link'; // Import Link from next/link
import './navbar.css'; // Import the CSS file for styles

const Navbar = () => {
    return (
        <nav className="navbar">
            <Link href="/" className="site-name">Meedoen</Link> {/* Make Meedoen a link to the homepage */}
            <ul className="navbar-list">
                <li className="navbar-item"><Link href="/">Home</Link></li>
                <li className="navbar-item"><Link href="/activiteiten">Activiteiten</Link></li>
            </ul>
        </nav>
    );
};

export default Navbar;
