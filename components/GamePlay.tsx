import React, { useEffect, useState } from 'react';
import { useGame } from '../pages/game/[id]';
import JustGame from './JustGame';
import Lobby from './Lobby';

function combine2Object(a, b) {
    return { ...a, ...b };
}

function GamePlay() {
    const { data } = useGame();

    return (
        <div>
            {
                data.type === 'LIVE'
                    ?
                    <>
                        {
                            data.status === 'WAITING' && <Lobby />
                        }
                        {
                            data.status === 'PLAYING' && (
                                <>
                                    <JustGame />
                                    {/* <Leaderboard result={ data.result } uid={ user.id } /> */}
                                </>
                            )
                        }
                    </>
                    : <>
                        <JustGame />
                    </>
            }
        </div>
    );
}

export default GamePlay;