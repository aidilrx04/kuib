import axios from 'axios';
import React, { useEffect, useReducer, createContext, useContext } from 'react';
import server from '../../../config/server';
import { arrayUnion, firestore } from '../../../util/db';
import { useAuth } from '../../../components/AuthProvider';
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
        case "SET_GAME_DATA": {
            return {
                ...state,
                gameData: action.payload
            };
        }

        case "SET_PHASE":
            {
                return {
                    ...state,
                    phase: action.payload
                };
            }
        case "SET_CURRENT_QUESTION":
            return {
                ...state,
                currentQuestion: action.payload
            };

        case "SET_SCORES":
            return {
                ...state,
                scores: action.payload
            };

        case "SET_GAME_RESULT":
            return {
                ...state,
                gameData: {
                    ...state.gameData,
                    result: action.payload
                }
            };

        case 'SET_USERS':
            return {
                ...state,
                users: action.payload
            };

        case "SET_ACC_SCORES":
            return {
                ...state,
                accScores: action.payload
            };

        case 'RESET':
            return initState;

        default: return state;
    }
}

function randomizeQuestion( questions )
{
    return shuffle( questions );
}

async function handleUsersUpdate( pUsers, cUsers, forceFetch = false )
{
    const users = pUsers.reduce( ( acc, curr ) => ( { ...acc, [ curr.id ]: curr } ), {} );
    if ( cUsers.length > pUsers.length || forceFetch )
    {
        const existedIds = Object.keys( users );

        for ( let i = 0; i < cUsers.length; i++ )
        {
            let u = cUsers[ i ];
            if ( existedIds.indexOf( u.id ) >= 0 || forceFetch )
            {
                const userData = await ( await firestore.collection( 'users' ).doc( u.id ).get() ).data();
                console.log( userData );

                u = { ...u, ...userData };

                users[ u.id ] = u;
            }
        }
    }

    return users;
}

export default function GameContextProvider( { gameData, valid } )
{
    const [ data, dispatch ] = useReducer( reducer, { ...initState, gameData: gameData, randomizedQuestions: randomizeQuestion( gameData.kuibData.questions ) } );
    const { userData, loading } = useAuth();
    const gamesRef = firestore.collection( 'games' );

    useEffect( () => console.log( data ), [ data ] );

    // attach listener to current game document
    useEffect( () =>
    {
        const detachListener = gamesRef.doc( gameData.id ).onSnapshot( ( doc ) =>
        {
            // update data
            const docData = doc.data();
            const prevDoc = data.gameData;
            dispatch( {
                type: "SET_GAME_RESULT",
                payload: docData.result
            } );
            if ( Object.keys( data.users ).length > 0 )
            {
                handleUsersUpdate( prevDoc.result, docData.result ).then( ( ue ) =>
                {
                    dispatch( {
                        type: "SET_USERS",
                        payload: ue
                    } );
                } );
            }
            if ( data.phase === 'PLAYING' )
            {
                handleDocUpdate( docData );
            }
        } );

        return () =>
        {
            detachListener();
            console.log( 'detached a listener' );
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [] );

    useEffect( () =>
    {
        if ( Object.keys( data.users ).length === 0 )
        {
            handleUsersUpdate( data.gameData.result, data.gameData.result, true ).then( ue =>
            {
                dispatch( {
                    type: "SET_USERS",
                    payload: ue
                } );
            } );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [] );


    if ( !valid ) return 'not vlaid mf';
    if ( loading ) return 'Loading';

    function handleDocUpdate( data )
    {
        const result = data.result;
        const index = result.map( e => e.id ).indexOf( userData.id );
        const currentUserResult = result[ index ];
        // console.log( currentUserResult );

        updateCurrentUserScore( currentUserResult.scores );
    }

    function updateCurrentUserScore( scores )
    {
        dispatch( {
            type: "SET_SCORES",
            payload: scores
        } );
    }

    function startPlaying()
    {
        // firestore.collection('games').doc(data.gameData.id).onSnapshot()

        gamesRef.doc( data.gameData.id ).update( {
            result: arrayUnion( {
                id: userData.id,
                scores: []
            } )
        } )
            .then( () =>
            {
                console.log( 'Successfully attached a user' );
                dispatch( {
                    type: "SET_PHASE",
                    payload: "PLAYING"
                } );
            } )
            .catch( err => console.log( err ) );
    }

    // assuming game result array dont change the user index
    async function updateUserScore( uid, qid, aid, accScores )
    {
        const _gameData = data.gameData;
        const userScoreIndex = _gameData.result.map( e => e.id ).indexOf( uid );
        const userScore = _gameData.result[ userScoreIndex ];

        console.log( userScore );

        // update the score
        userScore.scores.push( {
            qid,
            aid,
            accScores
        } );
        _gameData.result[ userScoreIndex ] = userScore;

        try
        {
            const res = await gamesRef.doc( _gameData.id ).update( {
                result: _gameData.result
            } );
        }
        catch ( err )
        {
            console.log( err );
        }
    }

    function next()
    {
        const nextQuestionIndex = data.currentQuestion === data.randomizedQuestions.length - 1 ? null : data.currentQuestion + 1;
        if ( nextQuestionIndex === null )
        {
            end();
        }
        else
        {
            dispatch( {
                type: "SET_CURRENT_QUESTION",
                payload: nextQuestionIndex
            } );
        }
    }

    function end()
    {
        dispatch( {
            type: "SET_PHASE",
            payload: "FINISH"
        } );
    }

    return (
        <GameContext.Provider value={ {
            data,
            dispatch,
            startPlaying,
            userData,
            gamesRef,
            updateUserScore,
            next
        } }>
            <CreateGame />
        </GameContext.Provider>
    );
}

function CreateGame()
{
    const { startPlaying, data, dispatch, userData } = useGame();

    return (
        <div>
            {
                data.phase === 'WAITING' && (
                    <div className="makkau">
                        <center>
                            Playing as <b>{ userData.username }</b>
                            <br />
                            <button onClick={ () => startPlaying() }>Start</button>
                        </center>
                        {
                            data.gameData.type === 'LIVE'
                            &&
                            (
                                <div className="contester-list">
                                    <ul>
                                        {
                                            Object.keys( data.users ).map( uid => (
                                                <li key={ uid }>
                                                    { data.users[ uid ].username }
                                                </li>
                                            ) )
                                        }
                                    </ul>
                                </div>
                            )
                        }
                    </div>
                )
            }
            {
                data.phase === 'PLAYING' && (
                    <div className="div">
                        <ShowScore />
                        payling
                        {/* <button onClick={ () => dispatch( { type: "SET_PHASE", payload: "FINISH" } ) }>quit</button> */ }

                        <div className="game">
                            <DisplayQuestion question={ data.randomizedQuestions[ data.currentQuestion ] } handler={ dispatch } />
                        </div>
                    </div>
                )
            }
            {
                data.phase === 'FINISH' && (
                    <div className="finish">
                        Game Finished!

                        <hr />
                        Your score: { getTotalCorrectQuestion( data.scores, data.gameData.kuibData.questions ) }
                        <DisplayAnswered scores={ data.scores } questions={ data.gameData.kuibData.questions } />
                    </div>
                )
            }
        </div>
    );
}



function DisplayAnswered( { scores, questions } )
{
    return (
        scores.map( ( score, index ) =>
        {
            const qid = questions.map( e => e.id ).indexOf( score.qid );
            const question = questions[ qid ];

            return (
                <div key={ question.id } className="q">
                    { index + 1 }. { question.text }

                    { question.answers.map( ans =>
                    {
                        return (
                            <div className="ans" key={ ans.id } style={ {
                                background: ans.id === score.aid
                                    ? isCorrect( ans.id, question.correctAnswerId )
                                        ?
                                        'lime'
                                        : 'red'
                                    : isCorrect( ans.id, question.correctAnswerId )
                                        ? 'lime'
                                        : 'white'
                            } } >
                                <input type="radio" defaultChecked={ ans.id === score.aid } />
                                <span>
                                    { ans.text }
                                </span>
                                <br />

                            </div>
                        );
                    } )
                    }
                    Status: { isCorrect( score.aid, question.correctAnswerId ) ? 'Correct' : 'false' }
                </div>
            );
        } )
    );
}

function getTotalCorrectQuestion( scores, questions )
{
    let correctQuestions = 0;

    scores.forEach( ( score ) =>
    {
        const question = questions[ questions.map( e => e.id ).indexOf( score.qid ) ];
        if ( score.aid === question.correctAnswerId )
        {
            correctQuestions += 1;
        }
    } );

    return correctQuestions;
}


function ShowScore()
{
    const { data: { currentQuestion, randomizedQuestions, scores } } = useGame();


    return (
        <div>
            Question: { currentQuestion + 1 }/{ randomizedQuestions.length } &nbsp; { getTotalCorrectQuestion( scores, randomizedQuestions ) }
        </div>
    );
}

function DisplayQuestion( { question, handler } )
{
    const answers = shuffle( question.answers );
    return (
        <div className="question">
            { question.text }
            <hr />
            {
                answers.map( ans => <DisplayAnswer q={ question } key={ ans.id } handler={ handler } answer={ ans } /> )
            }
        </div>
    );
}

function isCorrect( aid, caid )
{
    return aid === caid;
}

function DisplayAnswer( { answer, handler, q } )
{
    const { userData, updateUserScore, next, dispatch, data } = useGame();
    async function handleClick()
    {
        const correct = isCorrect( answer.id, q.id );
        await updateUserScore( userData.id, q.id, answer.id, data.accScores + ( isCorrect ? 1 : 0 ) );
        dispatch( {
            type: "SET_ACC_SCORES",
            payload: isCorrect ? data.accScores + 1 : data.accScores
        } );
        next();
    }
    return (
        <div className="answer">
            <button onClick={ handleClick }>{ answer.text }</button>
        </div>
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
