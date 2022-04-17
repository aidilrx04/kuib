import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react'
import { Button, Card, ListGroup, ListGroupItem } from 'react-bootstrap'
import server from '../config/server';
import { Kuib, KuibWCreatorData } from '../util/types';
import { useAuth } from './AuthProvider';
import FAI from './FAI';

type KuibDetailPropTypes = {
    kuib: KuibWCreatorData
}
const COLORS = [
    '#051e3e', '#251e3e', '#451e3e', '#651e3e', '#851e3e',
    '#4a4e4d', '#0e9aa7', '#3da4ab', '#f6cd61', '#fe8a71'
];

function useRandomColor() {
    return COLORS[Math.floor(Math.random() * COLORS.length)]
}

function KuibDetail({ kuib }: KuibDetailPropTypes) {

    const { userData, loading } = useAuth();
    const router = useRouter();
    const [disabled, setDisabled] = useState(loading);
    const uc = useRandomColor()

    useEffect(() => {
        if (!loading)
            setDisabled(false)
    }, [loading])

    function createGame() {
        axios.post(`/api/game/create`, {
            kid: kuib.id,
            uid: userData.id
        }).then(res => {
            console.log(res.data);
            router.push(`/game/${res.data.gameId}`);
        })
            .catch(error => {
                console.log(error);
            });
    }

    function createLiveGame() {
        axios.post(`${server}/api/game/create`, {
            kid: kuib.id,
            uid: userData.id,
            type: 'LIVE'
        }).then(res => {
            if (res.status === 200) {
                router.push(`/game/${res.data.gameId}`)
            }
        });
    }
    return (
        <Card className="m-3">
            <Card.Header style={{
                height: 60,
                backgroundColor: uc
            }} />

            <Card.Body>
                <Card.Title className='fs-4 text-dark fw-bold'>{kuib.title}</Card.Title>
                <Card.Subtitle className='mb-3'>
                    <span>By: </span>
                    <Link href={`/user/${kuib.creator}`}>
                        {kuib.creatorData.username}
                    </Link>
                </Card.Subtitle>

                <ListGroup className='mb-3 col-6'>
                    <ListGroupItem className="d-flex justify-content-between align-items-center">
                        <div>
                            <span className="pill bg-danger px-2 bg-opacity-25 text-danger">
                                <FAI icon={'question'} />
                            </span>
                            <span className="mx-2">Questions</span>
                        </div>
                        <span className="badge pill pill-rounded bg-primary text-white">
                            {kuib.questions.length}
                        </span>
                    </ListGroupItem>
                </ListGroup>

                <div className="float-end">
                    <Button
                        className='mx-2'
                        variant='success'
                        onClick={() => {
                            setDisabled(true)
                            createLiveGame();
                        }}
                        disabled={disabled}
                    >
                        <FAI icon={'play'} />
                        <span> Play</span>
                    </Button>
                    {/* <Button
                        className='mx-2 text-white'
                        variant='info'
                        onClick={() => {
                            setDisabled(true)
                            createLiveGame();
                        }}
                        disabled={disabled}>
                        <FAI icon={'users'} />
                        <span> Play Together</span>
                    </Button> */}
                    <Button
                        className='mx-2'
                        variant='primary'
                        disabled={disabled}
                        onClick={() => {
                            setDisabled(true)
                        }}
                    >
                        <FAI icon={'copy'} />
                        <span> Edit</span>
                    </Button>
                </div>
            </Card.Body>
        </Card>
    )
}
{/* <div className='card m-3'>
                <div className="card-header" style={ {
                    height: 60,
                    backgroundColor: COLORS[ Math.floor( Math.random() * COLORS.length ) ]
                } }></div>

                <div className="card-body">
                    <div className="card-title fs-4 text-dark fw-bold">{ kuib.title }</div>
                    <h6 className="card-subtitle mb-3">
                        <span>By: </span>
                        <Link href={ `/user/${kuib.creator}` }>
                            { kuib.creatorData.username }
                        </Link>
                    </h6>

                    <ul className="list-group mb-3 col-6 ">
                        <li className="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                                <span className="pill bg-danger px-2 bg-opacity-25 text-danger">
                                    <FAI icon={ 'question' } />
                                </span>
                                <span className='mx-2'>Questions</span>
                            </div>
                            <span className="badge pill pill-rounded bg-primary text-white">
                                { kuib.questions.length }
                            </span>
                        </li>
                    </ul>
                    <button
                        onClick={ ( e ) =>
                        {
                            e.target.disabled = true;
                            createGame();
                        } }
                    >Play</button>

                    <button
                        onClick={ () =>
                        {
                            createLiveGame();
                        } }
                    >Play Together</button>
                    total quesiton: { kuib.questions.length }

                </div>
            </div> */}
export default KuibDetail