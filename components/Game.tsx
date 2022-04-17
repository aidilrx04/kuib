import React, { useEffect } from 'react';
import { useGame } from '../pages/game/[id]';
import { useAuth } from './AuthProvider';
import GamePlay from './GamePlay';
import JoinLobby from './JoinLobby';

function Game()
{
    const { data, user } = useGame();
    const isCurrentlyJoin = data.result.map( e => e.id ).indexOf( user.id ) >= 0;
    return (
        isCurrentlyJoin
            ? <GamePlay />
            : <JoinLobby />
    );
}
export default Game;