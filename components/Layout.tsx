import Head from 'next/head'
import React from 'react'
import Footer from './Footer'
import Navigation from './Navigation'

function Layout({ children }) {
    return (
        <>
            <Head>
                <title>Kuib</title>
                <meta charSet='utf-8' />
                <meta name="description" content="Kuib web game" />
                <meta name="keywords" content="kuib, quiz" />
            </Head>
            <Navigation />
            <main>
                {children}
            </main>
            <Footer></Footer>
        </>
    )
}

export default Layout