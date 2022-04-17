import axios from 'axios';
import { Router, useRouter } from 'next/router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../../../components/AuthProvider';
import GameComponent from '../../../components/Game';
import GameNavigation from '../../../components/GameNavigation';
import GameNotFound from '../../../components/GameNotFound';
import LoginCard from '../../../components/LoginCard';
import Navigation from '../../../components/Navigation';
import server from '../../../config/server';
import { firestore } from '../../../util/db';
import { fetchUsers } from '../../../util/fetchUsers';
import isChanged from '../../../util/isChanged';
import { Game, GameData, Kuib, Result, Score, User } from '../../../util/types';
import nookies from 'nookies'
import { fireauth } from '../../../util/db-admin';
import { NextPageContext } from 'next';

interface GameDataContext extends GameData {
    start: Function,
    next: Function,
    end: Function,
    setPlayer: Function
}

const GameContext = createContext<GameDataContext>(null);

export function useGame() {
    return useContext(GameContext);
}

// function gameDataReducer(state, action) {
//     switch (action.type) {
//         case 'SET_GAME_DATA':
//             return action.payload;
//         default: return state;
//     }
// }

type GameProviderPropTypes = {
    gameData: Game,
    valid: Boolean,
    kuib: Kuib
}

interface UsersObjectProperty {
    [key: string]: User
}

type Player = {
    accScores: number;
    currentQuestion: number;
    scores: Score[]
}

export default function GameProvider({ gameData, valid, kuib: _kuib }: GameProviderPropTypes) {
    const [data, setGameData] = useState(() => gameData);
    const [users, setUsers] = useState<User[]>([]);
    const [player, setPlayer] = useState<Player>({
        accScores: 0,
        currentQuestion: 0,
        scores: []
    }  /* null */);

    const [initialLoad, setInitialLoad] = useState(true);
    const { userData: user, loading } = useAuth();
    const [kuib] = useState(_kuib);
    const router = useRouter();

    // console.log( router );

    // useEffect( () => { console.log( data ); }, [ data ] );

    // initial data fetch
    useEffect(() => {
        let detacher = () => null;

        if (valid) {
            if (data.result.length > 0) {
                const uids = data.result.map(u => u.id);
                fetchUsers(uids).then((res) => {
                    setUsers(res);
                    setInitialLoad(false);
                });
            }
            else setInitialLoad(false);

            // attach listener
            detacher = firestore.collection('games').doc(data.id).onSnapshot(d => {
                const doc = d.data();

                if (isChanged(doc.result.length, data.result.length)) {
                    updateUsers(doc.result, users);
                }

                setGameData(doc as Game);
            });
        }
        return () => {
            detacher();
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function updateUsers(result: Result[], prev: User[]) {
        const updatedUsers = await fetchUsers(result.map(u => u.id), prev);

        setUsers(updatedUsers);
    }

    // util
    function start() {
        firestore.collection('games').doc(data.id).update({
            status: "PLAYING"
        });
    }

    function next() {
        setPlayer({ ...player, currentQuestion: player.currentQuestion + 1 });
    }

    function end() {
        console.log('hey');
        router.push(`${router.asPath}/result/${user.id}`);
    }


    if (!valid) return <GameNotFound id={router.query.id as string} />;
    if (initialLoad || loading) return <div className='d-flex align-items-center justify-content-center' style={{ minHeight: 500 }}>
        <Spinner animation='border' variant='info'>
        </Spinner>

        <span className='mx-3'>Loading data...</span>
    </div>;
    if (!user) return <div className='container'>
        <div className='my-3'>
            <Alert variant='danger' className='text-center mb-2'>You are currently not logged in! Please log in to proceed</Alert>
            <LoginCard handleNext={false} />
        </div>
    </div>;



    return (
        <GameContext.Provider value={{
            data,
            users,
            player,
            user,
            kuib,

            //utils,
            start,
            next,
            end,

            //setters,
            setPlayer
        }}>
            <GameComponent />
        </GameContext.Provider>
    );
}

// custom game layout
GameProvider.getLayout = (page) => {
    return (
        <div style={{
            position: 'relative',
            width: '100vw',
            height: '100vh'
        }}
        >
            {/* <div className='sticky-top'>
                <GameNavigation {...page.props} />
            </div> */}
            {page}
        </div>
    )
}

export async function getServerSideProps(ctx: NextPageContext) {
    const { id } = ctx.query;

    const cookies = nookies.get(ctx)
    try {
        await fireauth.verifyIdToken(cookies?.token)

        const userData = JSON.parse(cookies['user-data']);

        try {
            const gameData = await axios.get<Game>(`${server}/api/game/${id}`);

            if (gameData.data.result.map(u => u.id).indexOf(userData?.id) >= 0) {
                ctx.res.writeHead(
                    303, {
                    Location: `${ctx.req.url}/result/${userData?.id}`
                }
                )
                ctx.res.end();
            }

            const kuidReq = await axios.get(`${server}/api/kuib/${gameData.data.kid}`);
            return {
                props: {
                    valid: true,
                    gameData: gameData.data,
                    kuib: kuidReq.data
                }
            };
        }
        catch (e) {
            ctx.res.statusCode = 404;
            return {
                props: {
                    valid: false
                }
            };
        }
    }
    catch (e) {
        ctx.res.writeHead(
            303,
            {
                Location: `/auth/signin?next=${ctx.req.url}`
            })
        ctx.res.end();
        ctx.res.statusCode = 403;
        return {
            props: {
                valid: false
            }
        };
    }



}