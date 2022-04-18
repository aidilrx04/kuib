import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { Card, Form, Alert, Button } from 'react-bootstrap';
import FAI from '../../components/FAI';
import { fireauth } from '../../util/db';

function SignIn({ handleNext = true }) {

    const [data, setData] = useState({
        email: '',
        password: ''
    });
    const router = useRouter();
    const [error, setError] = useState(null)
    const [disabled, setDisabled] = useState(false)


    function handleSubmit(e) {
        e.preventDefault();
        setError(null)
        setDisabled(true)
        fireauth.signInWithEmailAndPassword(data.email, data.password)
            .then(cred => {
                console.log("Login Success");
                console.log(cred);
                if (handleNext) {
                    router.push(router.query.next as string || '/');
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
                        <Link href={`/auth/signup${router.query.next ? `?next=${router.query.next}` : ''}`} passHref>
                            <a className='link-light'>Register</a>
                        </Link>
                    </div>
                    <Button variant="primary" className="" type="submit" disabled={disabled}>
                        <FAI icon={disabled ? 'spinner' : 'sign-in-alt'} spin={disabled} />
                        <span> Login</span>
                    </Button>
                </Card.Footer>
            </Form>
        </Card >
    )
}
export default SignIn;