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
                {/* <script src="https://apis.google.com/js/platform.js" async defer></script>
                <meta name="google-signin-client_id" content="343047123354-lqeo2s4qk1dm57cgvhshb1lpc6c80ac0.apps.googleusercontent.com" /> */}
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