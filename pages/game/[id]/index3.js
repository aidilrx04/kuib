import axios from 'axios';
import next from 'next';
import React, { createContext, useReducer, useEffect, useContext, useState } from 'react';
import { useAuth } from '../../../components/AuthProvider';
import server from '../../../config/server';
import { arrayUnion, firestore } from '../../../util/db';
import shuffle from '../../../util/shuffle';

const initState = {
    gameData: null,
    phase: "WAITING", // WAITING, PLAYING, FINISH,
    randomizedQuestions: null,
    users: {},
    currentPlayer: {
        scores: [],
        accScores: 0,
        currentQuestion: 0,
    }
};

const GameContext = createContext( initState );
function useGame()
{
    return useContext( GameContext );
}

function reducer( state, action )
{
    switch ( action.type )
    {
        case 'SET_USERS':
            return {
                ...state, users: action.payload
            };
        case 'SET_PHASE':
            return { ...state, phase: action.payload };
        case 'SET_GAME_DATA':
            return {
                ...state, gameData: action.payload
            };
        case 'SET_USERS':
            return { ...state, users: action.payload };
        case 'SET_CURRENT_QUESTION':
            return {
                ...state, currentPlayer: { ...state.currentPlayer, currentQuestion: action.payload }
            };
        default: return state;
    }
}
function randomizeQuestion( questions )
{
    return shuffle( questions );
}
function isChanged( a, b )
{
    return a !== b;
}

async function fetchUsers( uids )
{
    const users = [];

    for ( let i = 0; i < uids.length; i++ )
    {
        const userData = await firestore.collection( 'users' ).doc( uids[ i ] ).get();

        if ( userData.exists )
        {
            users.push( userData.data() );
        }
    }

    return users;

}

export default function GameProvider( { valid, gameData } )
{
    const [ data, dispatch ] = useReducer( reducer, { ...initState, gameData, randomizedQuestions: randomizeQuestion( gameData.kuibData.questions ), phase: gameData.status } );
    const { userData, loading } = useAuth();

    useEffect( () => { console.log( data ); /* console.log( JSON.stringify( data ) ); */ }, [ data ] );

    useEffect( () =>
    {

        const gameResult = data.gameData.result;
        // onInit staff
        if ( Object.keys( data.users ).length === 0 && gameResult.length > 0 )
        {
            const uids = gameResult.map( e => e.id );
            fetchUsers( uids ).then( users =>
            {
                dispatch( {
                    type: 'SET_USERS',
                    payload: users.reduce( ( acc, cur ) => ( { ...acc, [ cur.id ]: cur } ), {} )
                } );
            } );
        }

        const detacher = firestore.collection( 'games' ).doc( data.gameData.id ).onSnapshot( d =>
        {
            const doc = d.data();
            const prevDoc = data.gameData;

            if ( isChanged( doc.status, prevDoc.status ) )
                updatePlayerPhase( doc.status );
            if ( isChanged( doc.result.length, prevDoc.result.length ) )
            {
                updateUsers( doc.result );
            }
            if ( isChanged( doc.status, prevDoc.status ) )
                updatePhase( doc.status );


            dispatch( {
                type: "SET_GAME_DATA",
                payload: doc
            } );
        } );
        return () =>
        {
            detacher();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [] );

    // updates
    function updatePlayerPhase( phase )
    {
        dispatch( {
            type: "SET_PHASE",
            payload: phase
        } );
    }
    async function updateUsers( resultArray )
    {
        const users = data.users;
        const uids = Object.keys( users );

        if ( resultArray.length > uids.length )
        {
            for ( let i = 0; i < resultArray.length; i++ )
            {
                const u = resultArray[ i ];

                if ( uids.indexOf( u.id ) < 0 )
                {
                    const user = await firestore.collection( 'users' ).doc( u.id ).get();
                    const userData = user.data();
                    users[ u.id ] = userData;

                }
            }
        }
        // else if ( resultArray.length < uids.length )
        // {
        //     // ! incomplete
        //     // one or many users have been removed
        //     console.log( 'hey' );
        //     const mappedResult = resultArray.map( e => e.id );
        //     uids.forEeach( uid =>
        //     {

        //         if ( mappedResult.indexOf( uid ) < 0 )
        //         {
        //             delete users[ uid ];
        //         }
        //     } );
        // }

        dispatch( {
            type: "SET_USERS",
            payload: users
        } );
    }
    function updatePhase( phase )
    {
        dispatch( {
            type: "SET_PHASE",
            payload: phase
        } );
    }

    // uitl
    function start()
    {
        firestore.collection( 'games' ).doc( data.gameData.id ).update( {
            status: 'PLAYING'
        } );
    }
    function next()
    {
        dispatch( {
            type: "SET_CURRENT_QUESTION",
            payload: data.currentPlayer.currentQuestion + 1
        } );
    }


    if ( !valid ) return 'Invalid shit';
    if ( loading ) return 'Loading jap ';
    if ( !userData ) return 'Please login';


    return (
        <GameContext.Provider value={ {
            data,
            dispatch,
            start,
            userData,
            next,
            randomizedQuestions: data.randomizedQuestions
        } }>
            {

                data.gameData.result.map( e => e.id ).indexOf( userData.id ) < 0
                    ? <JoinLobby />
                    : <Game />
            }
        </GameContext.Provider>
    );
}

function JoinLobby()
{
    const { data, userData } = useGame();

    function joinLobby()
    {
        firestore.collection( 'games' ).doc( data.gameData.id ).update( {
            result: arrayUnion( {
                id: userData.id,
                scores: [],
                accScores: 0
            } )
        } );
    }

    return (
        <div className="d">
            Playing as <b>{ userData.username }</b>
            <br />
            <button onClick={ joinLobby }>join</button>
        </div>
    );
}

function Game()
{
    const { data } = useGame();

    return (
        <div className="game">
            {
                data.phase === 'WAITING'
                && <Lobby />
            }
            {
                data.phase === 'PLAYING'
                && <GamePlay />
            }
        </div>
    );
}

function GamePlay()
{
    const { data: { currentPlayer: { currentQuestion, accScores }, gameData }, userData, next, randomizedQuestions: questions } = useGame();
    const [ cq, setCq ] = useState( questions[ currentQuestion ] );

    useEffect( () =>
    {
        setCq( questions[ currentQuestion ] );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ currentQuestion ] );


    function updateUserScore( qid, aid )
    {
        function isCorrect( aid, caid )
        {
            return aid === caid;
        }
        const question = questions[ questions.map( e => e.id ).indexOf( qid ) ];
        let correct = isCorrect( question.correctAnswerId, aid );

        const usi = gameData.result.map( e => e.id ).indexOf( userData.id );
        const us = gameData.result[ usi ];

        us.scores = [ ...us.scores, { qid, aid, accScores: accScores + correct ? 1 : 0 } ];
        us.accScores = accScores + correct ? 1 : 0;

        gameData.result[ usi ] = us;

        firestore.collection( 'games' ).doc( gameData.id ).update( {
            result: gameData.result
        } ).then( () =>
        {
            next();
        } );
    }

    return (
        <div className="questions">
            <Question cq={ currentQuestion + 1 } question={ cq } answers={ shuffle( cq.answers ) } handler={ updateUserScore } />
        </div>
    );
}

function Question( { question, cq, answers, handler, ...rest } )
{
    // const [ answers, setAns ] = useState( shuffle( question.answers ) );
    // useEffect( () =>
    // {
    //     setAns( shuffle( question.answers ) );
    // }, [ cq ] );
    console.log( answers );
    return (
        <div className="q">
            <b>{ cq }.</b> { question.text }

            <div>
                { answers.map( ans =>
                {
                    return (
                        <div className="an" key={ ans.id }>
                            <button onClick={ () => handler( question.id, ans.id ) }>{ ans.text }</button>
                        </div>
                    );
                } ) }
            </div>
        </div>
    );
}

function Answer( { answer, handler, qid } )
{
    return (
        <div className="answer">
            <button onClick={ () =>
            {
                // handler( qid, answer.id );
            } }>{ answer.text }</button>
        </div>
    );
}


function Lobby()
{
    const { data, userData, start } = useGame();
    const [ loading, setLoading ] = useState( true );

    useEffect( () =>
    {
        if ( Object.keys( data.users ).length !== 0 )
            setLoading( false );
    }, [ loading, data.users ] );
    return (
        !loading
            ? (
                <div className="lobby">
                    <div className="start-sect">
                        <center>
                            {
                                ( data.gameData.type === 'LIVE' && userData.id === data.gameData.creator )
                                    ? (
                                        <div>
                                            <b>{ userData.username }</b>
                                            <br />
                                            <StartButton handler={ start } />
                                        </div>
                                    )
                                    : (
                                        <div>
                                            <b>{ data.users[ data.gameData.creator ].username }</b>
                                        </div>
                                    )
                            }
                        </center>
                    </div>
                    <hr />
                    <div className="contester">
                        <center>
                            {
                                Object.keys( data.users ).map( u =>
                                {
                                    const user = data.users[ u ];

                                    if ( user.id === data.gameData.creator ) return null;

                                    return (
                                        <div key={ user.id } style={ { display: 'inline-block', border: `1px solid ${user.id === userData.id ? 'red' : 'black'}` } }>
                                            <b>{ user.username }</b>
                                        </div>
                                    );
                                } )
                            }
                        </center>
                    </div>
                </div>
            )
            : 'loading users'
    );
}

function StartButton( { handler } )
{
    return (
        <button className="button" onClick={ handler }>Start</button>
    );
}


export async function getServerSideProps( ctx )
{
    const { id } = ctx.query;

    try
    {
        const gameData = await axios.get( `${server}/api/game/${id}` );

        return {
            props: {
                valid: true,
                gameData: gameData.data
            }
        };
    } catch ( error )
    {
        return {
            props: {
                valid: false
            }
        };
    }
}