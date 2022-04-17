import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { Card, Form, Alert, Button } from 'react-bootstrap';
import { useAuth } from '../../components/AuthProvider';
import FAI from '../../components/FAI';
import server from '../../config/server';
import { fireauth, firestore } from '../../util/db';
import { User } from '../../util/types';

async function createUserInFirestore(uid, email, username) {
    const docKey = firestore.collection("users").doc().id;

    console.log(docKey);

    return firestore.collection("users")
        .doc(docKey)
        .set({
            id: docKey,
            uid,
            email,
            username
        });

    //fireauth.signOut();
    //axios.delete( `${server}/api/user/${uid}` );
}

function SignUp({ handleNext = true }) {

    const [data, setData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const router = useRouter();
    const [error, setError] = useState(null)
    const [disabled, setDisabled] = useState(false)
    const { userData, loading } = useAuth()


    function handleSubmit(e) {
        e.preventDefault();
        setDisabled(true)

        fireauth.createUserWithEmailAndPassword(data.email, data.password)
            .then(cred => {
                const user = cred.user;

                createUserInFirestore(user.uid, user.email, data.username).then(() => {
                    if (handleNext) {
                        const nex = router.query.next;

                        router.push(nex as string)
                    }
                })
                    .catch(err => {
                        setError('Failed to create user')
                    })
            })
            .catch(error => {
                setError(error.message)
                console.error("ERROR:", error.code, error.message);
            });
    }

    if (loading) return 'Loading'

    return (
        <Card style={{ maxWidth: 350 }} className='mx-auto my-2'>
            <Form onSubmit={handleSubmit}>
                <Card.Header className="bg-secondary text-light">
                    <span className='fs-5'>Sign Up Form</span>
                </Card.Header>
                <Card.Body>
                    {error && <Alert variant="danger" className='py-2'><small>{error}</small></Alert>}


                    <Form.Group className='mb-3'>
                        <Form.FloatingLabel controlId='floatingEmail' label="Email address">
                            <Form.Control type="email" placeholder='Email *' value={data.email} onChange={(e) => {
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
                    <Form.Group className='mb-3'>
                        <Form.FloatingLabel controlId='floatingUsername' label="Username">
                            <Form.Control type="text" placeholder='Username' value={data.username} onChange={(e) => {
                                setData({ ...data, username: e.target.value })
                            }} />
                        </Form.FloatingLabel>
                    </Form.Group>
                </Card.Body>
                <Card.Footer className='d-flex justify-content-between align-items-center bg-secondary text-light'>
                    <div>
                        &middot; &nbsp;
                        <Link href={`/auth/signin${router.query.next ? `?next=${router.query.next}` : ''}`} passHref>
                            <a className='link-light'>Login</a>
                        </Link>
                    </div>
                    <Button variant="primary" className="" type="submit">
                        <FAI icon={'sign-in-alt'} />
                        <span> Sign Up</span>
                    </Button>
                </Card.Footer>
            </Form>
        </Card >
    )
}

export default SignUp

// export default function SignUp()
// {
//     const [ data, setData ] = useState( {
//         email: '',
//         password: '',
//         username: ''
//     } );
//     function handleSubmit( e )
//     {
//         e.preventDefault();

//         fireauth.createUserWithEmailAndPassword( data.email, data.password )
//             .then( cred =>
//             {
//                 const user = cred.user;

//                 createUserInFirestore( user.uid, user.email, data.username );
//             } )
//             .catch( error =>
//             {
//                 console.error( "ERROR:", error.code, error.message );
//             } );
//     }

//     return (
//         <div>
//             <form onSubmit={ handleSubmit }>
//                 <input type="text" placeholder="Your username here" onChange={ e => setData( { ...data, username: e.target.value } ) } value={ data.username } />
//                 <input type="email" placeholder="Your email here" onChange={ e => setData( { ...data, email: e.target.value } ) } value={ data.email } />
//                 <input type="password" placeholder="Your password here" onChange={ e => setData( { ...data, password: e.target.value } ) } value={ data.passwrord } />
//                 <button>Sign Up</button>
//             </form>
//         </div>
//     );
// }
