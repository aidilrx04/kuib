import React from 'react';
import { useGame } from '../pages/game/[id]';
import UserSimpleCard from './UserSimpleCard';
import { v4 } from 'uuid'
import { Button } from 'react-bootstrap';
import FAI from './FAI';

function Lobby() {
    const { data, user, users, start } = useGame();
    return (
        <div className='lobby container p-2'>
            <h2 className='text-center text-primary border-bottom border-2 py-2 border-primary'>Lobby</h2>

            {
                (data.type === 'LIVE' && user.id === data.creator)
                    ? (
                        <div className='mx-auto'>
                            {/* <b style={{ border: '1px solid red' }}>{user.username}</b> */}

                            <div className="d-flex justify-content-center">
                                <UserSimpleCard user={user} highlight />
                            </div>
                            {/* <button onClick={() => start}>Start</button> */}
                            <Button variant="success" className='d-block mx-auto px-2 mt-2' onClick={() => start()}>
                                <FAI icon={'play'} className='mx-2' />
                                <span>Start</span>
                            </Button>
                        </div>
                    )
                    : (
                        <div>
                            {/* <b style={{ border: '1px solid black' }}>{users[users.map(e => e.id).indexOf(data.creator)].username}</b> */}
                            <div className="d-flex justify-content-center">
                                <UserSimpleCard user={users[users.map(e => e.id).indexOf(data.creator)]} />
                            </div>
                            <div className='text-center'>Waiting for Room creator to start...</div>
                        </div>
                    )
            }
            <hr />
            <div className="mb-3 fs-5 fw-bold text-primary text-center">Players</div>
            <div className="users d-flex justify-content-center">
                {
                    data.result.map(u => {
                        const _user = users[users.map(e => e.id).indexOf(u.id)];
                        if (_user?.id === data.creator) return null;
                        return (
                            <UserSimpleCard key={_user?.id ?? v4()} user={_user} highlight={user.id === _user?.id} />
                        );
                    })
                }
            </div>
        </div>
    );
}

export default Lobby;