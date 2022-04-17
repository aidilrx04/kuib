import Link from 'next/link'
import React from 'react'
import { Alert, Button } from 'react-bootstrap'

function GameNotFound({ id }: { id: string }) {
    return (
        <div className="">
            <Alert variant='danger' className='my-3'>
                <Alert.Heading>
                    Oh No! An error occured!
                </Alert.Heading>
                <p>
                    No Game with ID: <code>{id}</code> is found!
                </p>

                <Link href='/' passHref>
                    <Button>Go Home</Button>
                </Link>
            </Alert>
        </div>
    )
}

export default GameNotFound