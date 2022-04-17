import React from 'react';
import { Button, Card } from 'react-bootstrap';
import { useGame } from '../pages/game/[id]';
import { arrayUnion, firestore } from '../util/db';
import FAI from './FAI';

function JoinLobby() {
    const { data, user } = useGame();

    function joinGame() {
        firestore.collection('games').doc(data.id).update({
            result: arrayUnion({
                id: user.id,
                scores: [],
                accScores: 0
            })
        });
    }

    return (
        <div className="container p-2">
            <Card className="my-2">
                <Card.Header className='text-center'>
                    <h5>Lobby</h5>
                </Card.Header>
                <Card.Body>
                    <p className="text-center">
                        {
                            data.type === 'LIVE'
                                ? 'Do you want to join this game?'
                                : 'Click play to start 😉'
                        }
                    </p>
                </Card.Body>
                <Card.Footer>
                    <div className="float-end">
                        <Button variant='danger' className="mx-2">
                            <FAI icon={'home'} />
                            <span> No, I want to go home</span>
                        </Button>
                        {
                            data.type === 'LIVE'
                                ? <Button variant='success' className="mx-2" onClick={joinGame}>
                                    <FAI icon={'play'} />
                                    <span> Join</span>
                                </Button>
                                : <Button variant='success' className="mx-2" onClick={joinGame}>
                                    <FAI icon={'play'} />
                                    <span> Start</span>
                                </Button>
                        }
                    </div>
                </Card.Footer>
            </Card>
        </div>
    );
}

export default JoinLobby;