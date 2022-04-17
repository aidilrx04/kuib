import Link from 'next/link';
import React from 'react';
import { fireauth } from '../util/db';
import { useAuth } from './AuthProvider';

function Navigation() {
    const { userData, loading } = useAuth();

    // console.log(userData, loading)
    return (
        <nav className='bg-grey'>
            <h2 className="brand-name">
                Kuib
            </h2>
            <ul className='nav-links'>
                <li className='nav-link'>
                    <Link href="/">Home</Link>
                </li>
                {
                    (loading || !loading) && !userData && <>
                        <li className='nav-link'>
                            <Link href="/auth/signup" >
                                Sign Up
                            </Link>
                        </li>
                        <li className='nav-link'>
                            <Link href="/auth/signin">
                                Log in
                            </Link>
                        </li>
                    </>
                }
                {
                    !loading && userData !== null && (
                        <>
                            <li className='nav-link'>
                                <a href='#' onClick={(e) => { fireauth.signOut(); e.preventDefault(); }}>Logout</a>
                            </li>
                            <li className='nav-link'>
                                <Link href="/profile">
                                    Profile
                                </Link>
                            </li>
                            <li className='nav-link'>
                                <Link href="/kuib/create">
                                    Create
                                </Link>
                            </li>
                        </>
                    )
                }
            </ul>

        </nav>
    );
}

export default Navigation;