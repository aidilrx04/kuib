import axios from 'axios';
import React, { useReducer, useEffect, useState } from 'react';
import server from '../../../config/server';
import { firestore } from '../../../util/db';

function reducer( state, action )
{
    switch ( action.type )
    {
        case "SET_USERS":
            return {
                ...state,
                users: action.payload
            };

        case 'SET_SCORES':
            return {
                ...state,
                scores: action.payload
            };
        default: return state;
    }
}

const initState = {
    gameData: null,
    users: null,
    scores: null
};
function LiveUpdate( { gameData } )
{

    const [ data, dispatch ] = useReducer( reducer, { ...initState, gameData } );
    const [ loading, setLoading ] = useState( true );

    useEffect( () => console.log( data ), [ data ] );

    // attach a listener
    useEffect( () =>
    {

        // let detacher = () => undefined;

        const detacher = firestore.collection( 'games' ).doc( data.gameData.id ).onSnapshot( doc =>
        {
            // update users result
            const docData = doc.data();
            const previousResult = data.gameData.result;
            const currentResult = docData.result;

            if ( currentResult.length !== previousResult.length || data.users === null )
            {
                const usersId = currentResult.map( e => e.id );
                fetchUsersData( usersId )
                    .then( users =>
                    {
                        dispatch( {
                            type: "SET_USERS",
                            payload: users
                        } );

                        updateScores( currentResult );
                        setLoading( false );
                    } );
            }
            else
            {
                updateScores( currentResult );
                setLoading( false );
            }
        } );

        return () =>
        {
            detacher();
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [] );

    function updateScores( result )
    {
        const scores = result.reduce( ( acc, score ) =>
        {
            return {
                ...acc,
                [ score.id ]: score.scores
            };
        }, {} );

        dispatch( {
            type: 'SET_SCORES',
            payload: scores
        } );
    }

    async function fetchUsersData( ids )
    {
        const fetchedUsersId = Object.keys( data.users ?? {} );
        const users = data.users ?? {};

        console.log( 'hey' );

        for ( let i = 0; i < ids.length; i++ )
        {
            const id = ids[ i ];

            // skip if already exists
            if ( fetchedUsersId.indexOf( id ) >= 0 )
                continue;

            const user = await firestore.collection( 'users' ).doc( id ).get();

            users[ id ] = user.data();

        }

        return users;

        // ids.forEach( ( id, i ) =>
        // {
        //     if ( fetchedUsersId.indexOf( id ) >= 0 )
        //     {
        //         // user already in the list
        //     }
        //     else
        //     {
        //         const user = await firestore.collection( 'users' ).doc( id ).get().then( user =>
        //         {
        //             users[ id ] = user.data();

        //             if ( i === ids.length - 1 )
        //             {
        //                 dispatch( {
        //                     type: 'SET_USERS',
        //                     payload: users
        //                 } );
        //             }
        //         } );
        //     }
        // } );
    }

    function getTotalCorrectQuestion( scores )
    {
        const questions = data.gameData.kuibData.questions;
        const qids = questions.map( e => e.id );
        let correct = 0;
        scores.forEach( sc =>
        {
            const qidIndex = qids.indexOf( sc.qid );
            const ques = questions[ qidIndex ];

            if ( ques.correctAnswerId === sc.aid )
                correct += 1;
        } );

        return correct;
    }

    return (
        <div>
            <h1>LiveUpdate { gameData.id }</h1>

            { loading && 'LOADING JAP' }
            { !loading && (
                <div className="live-show">
                    {
                        data.scores && Object.keys( data.scores ).map( ( userID ) =>
                        {
                            const score = data.scores[ userID ];
                            const user = data.users[ userID ];

                            return (
                                <div className="e" key={ userID }>
                                    { user.username }({ score.length } / { data.gameData.kuibData.questions.length }) { getTotalCorrectQuestion( score ) } correct
                                </div>
                            );
                        } )
                    }
                </div>
            ) }
        </div>
    );
}

export async function getServerSideProps( ctx )
{
    const { id } = ctx.query;

    const gameData = await axios.get( `${server}/api/game/${id}` );

    return {
        props: {
            gameData: gameData.data
        }
    };
}

export default LiveUpdate;