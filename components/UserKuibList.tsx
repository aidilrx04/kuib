import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import { ListGroup, ListGroupItem, Spinner } from 'react-bootstrap';
import { firestore } from '../util/db';
import { Kuib } from '../util/types';

function UserKuibList({ uid }: { uid: string }) {

    const [kuibList, setKuibList] = useState<Kuib[]>([]);
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (uid)
            fetchKuibByUser(uid).then(kuibList => {
                if (kuibList) {
                    setKuibList(kuibList)
                }
                setLoading(false)
            })

        return () => {
            setKuibList([])
        }
    }, [uid])

    if (loading) return <div className='d-flex justify-content-center align-items-center py-3'>
        <Spinner variant="info" animation='border' />
    </div>

    if (kuibList.length === 0) return (
        <div>
            No Kuib yet
        </div>
    )

    return (
        <div className="kuibList py-3">
            <h5 >User Kuib</h5>

            <ListGroup>
                {
                    kuibList.map(kuib => {
                        return (
                            <Link key={kuib.id} href={`/kuib/${kuib.id}`} passHref>
                                <ListGroupItem as='a' >
                                    {kuib.title}
                                </ListGroupItem>
                            </Link>
                        )
                    })
                }
            </ListGroup>
        </div>
    )
}

export async function fetchKuibByUser(uid: string) {
    const kuib = await firestore.collection('kuib').where('creator', '==', uid).get();
    if (!kuib.empty) {
        const kuibData = kuib.docs.map(doc => doc.data() as Kuib);

        return kuibData;
    }

    return null
}

export default UserKuibList