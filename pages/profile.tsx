import React from 'react';
import { fireauth } from '../util/db';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../components/AuthProvider'
import { Button, Card, Col, Nav, Row, Tab, Tabs } from 'react-bootstrap';
import { User } from '../util/types';
import { v4 } from 'uuid'
import StretchTabs from '../components/StretchTabs';
import UserKuibList from '../components/UserKuibList';
import FAI from '../components/FAI';

function Profile() {

    const { userData, loading } = useAuth()
    const router = useRouter();

    if (loading) return "Loading";
    if (userData === null) {
        router.push(`/auth/signin?next=${router.asPath}`)
        return null
    }

    return (
        <div className="container">
            {
                userData && <UserDetailCard user={userData} />
            }
        </div>
    );
}

export function UserDetailCard({ user }: { user: User }) {
    return (
        <Card className="my-3">
            <Card.Header>
                <span className='fs-5'>User Profile</span>
            </Card.Header>
            <Card.Body>
                <Card.Title>
                    {user.username}
                </Card.Title>
                <Card.Subtitle className='text-muted fs-6 mb-3'>
                    ID: <small>{user.id}</small>
                </Card.Subtitle>

                <div className="d-flex justify-content-end align-items-center flex-wrap">
                    <Link href="/kuib/create" passHref >
                        <Button variant="primary" as='a' className='mx-2 my-1 d-block'>
                            <FAI icon={'plus'} />
                            <span> Create Kuib</span>
                        </Button>
                    </Link>
                    <Button variant='danger' onClick={() => fireauth.signOut()} className='mx-2 my-1 d-block'>
                        <FAI icon={'sign-out-alt'} flip={'horizontal'} />
                        <span> Logout</span>
                    </Button>
                </div>
            </Card.Body>

            <hr />
            <StretchTabs defaultActiveKey="kuib">
                <Tab eventKey="kuib" title="Kuib">
                    <UserKuibList uid={user.id} />
                </Tab>
            </StretchTabs>
        </Card>
    )
}



export default Profile;