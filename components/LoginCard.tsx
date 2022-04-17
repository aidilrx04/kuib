import Link from 'next/link'
import { useRouter } from 'next/router';
import React, { useState } from 'react'
import { Alert, Button, Card, Form } from 'react-bootstrap'
import { fireauth } from '../util/db';
import FAI from './FAI'

function LoginCard({ handleNext = true }) {

    const [data, setData] = useState({
        email: '',
        password: ''
    });
    const router = useRouter();
    const [error, setError] = useState(null)


    function handleSubmit(e) {
        e.preventDefault();
        setError(null)
        fireauth.signInWithEmailAndPassword(data.email, data.password)
            .then(cred => {
                console.log("Login Success");
                console.log(cred);
                if (router.query.next && handleNext) {
                    router.push(router.query.next as string);
                }
            })
            .catch(error => {
                switch (error.code) {
                    case 'auth/wrong-password':
                        setError('Invalid email or password')

                    default: break
                }
                console.log("Login failed", error);
            });
    }

    return (
        <Card style={{ maxWidth: 350 }} className='mx-auto my-2'>
            <Form onSubmit={handleSubmit}>
                <Card.Header className="bg-secondary text-light">
                    <span className='fs-5'>Login Form</span>
                </Card.Header>
                <Card.Body>
                    {error && <Alert variant="danger" className='py-2'><small>{error}</small></Alert>}
                    <Form.Group className='mb-3'>
                        <Form.FloatingLabel controlId='floatingEmail' label="Email address">
                            <Form.Control type="email" placeholder='Email' value={data.email} onChange={(e) => {
                                setData({ ...data, email: e.target.value })
                            }} />
                        </Form.FloatingLabel>

                    </Form.Group>
                    <Form.Group className='mb-3'>
                        <Form.FloatingLabel controlId="floatingPassword" label="Password">
                            <Form.Control type="password" placeholder='Password' value={data.password} onChange={(e) => {
                                setData({ ...data, password: e.target.value })
                            }} />
                        </Form.FloatingLabel>
                    </Form.Group>
                </Card.Body>
                <Card.Footer className='d-flex justify-content-between align-items-center bg-secondary text-light'>
                    <div>
                        &middot; &nbsp;
                        <Link href={`/auth/signup?next=${router.asPath}`} passHref>
                            <a className='link-light'>Register</a>
                        </Link>
                    </div>
                    <Button variant="primary" className="" type="submit">
                        <FAI icon={'sign-in-alt'} />
                        <span> Login</span>
                    </Button>
                </Card.Footer>
            </Form>
        </Card >
    )
}

export default LoginCard