import React, { useEffect, useState } from 'react';
import { useGame } from '../pages/game/[id]';
import { firestore } from '../util/db';

function Leaderboard( { result, uid } )
{

    const { data, users } = useGame();
    const [ leaderboard, setLeaderboard ] = useState( () =>
    {
        return data.result.map( e => ( { ...e, ...users[ e.id ] } ) );
    } );

    useEffect( () =>
    {
        setLeaderboard( data.result.map( e => ( { ...users[ e.id ], ...e, } ) ) );
    }, [ data, users ] );


    function sort( arr )
    {
        return arr.sort( ( a, b ) =>
        {
            return b.accScores - a.accScores;
        } );
    }

    return (
        <div>
            <hr />
            <h3>Leaderboard</h3>
            <hr />
            <button onClick={ () =>
            {

                const usi = data.result.map( e => e.id ).indexOf( uid );
                const us = data.result[ usi ];

                us.accScores = us.accScores + 1;

                data.result[ usi ] = us;

                firestore.collection( 'games' ).doc( data.id ).update( {
                    result: data.result
                } );
            } }>Increase score</button>
            <button onClick={ () =>
            {

                const usi = data.result.map( e => e.id ).indexOf( uid );
                const us = data.result[ usi ];

                us.accScores = us.accScores - 1;

                data.result[ usi ] = us;

                firestore.collection( 'games' ).doc( data.id ).update( {
                    result: data.result
                } );
            } }>Decrease score</button>
            <ul>
                {
                    sort( leaderboard ).map( lb =>
                    {
                        return (
                            <li key={ lb.id } style={ { textDecoration: uid === lb.id ? 'underliner' : 'none' } }>
                                { lb.username } | Scores: { lb.accScores } | Q : { lb.scores.length === 0 ? 1 : lb.scores.length }
                            </li>
                        );
                    } )
                }
            </ul>
        </div>
    );
}

export default Leaderboard;