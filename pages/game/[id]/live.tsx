import axios from 'axios';
import React, { forwardRef, useEffect, useState } from 'react';
import { Button, Card, ProgressBar } from 'react-bootstrap';
import FlipMove from 'react-flip-move';
import server from '../../../config/server';
import { firestore, firestore as firestoreClient } from '../../../util/db';
import { fetchUser } from '../../../util/fetchUsers';
import { fetchUsersAdmin } from '../../../util/fetchUsersAdmin';
import getPercentage, { Percentage } from '../../../util/getPercentage';
import { Game, Kuib, Result, User } from '../../../util/types';


type LiveResultProps = {
    game: Game,
    users: User[],
    kuib: Kuib
}

function LiveResult({ game: _game, users: _users, kuib }: LiveResultProps) {

    const [game, setGame] = useState(() => _game);
    const [users, setUsers] = useState(() => _users)
    const [result, setResult] = useState(() => _game.result)


    // useEffect(() => console.log(users), [users])
    useEffect(() => console.log(game), [game])

    useEffect(() => {
        const detacher = firestoreClient.collection('games').doc(game.id).onSnapshot(d => {
            const ugame = d.data() as Game;

            if (ugame.result.length !== game.result.length) {
                updateUsers(ugame.result.map(e => e.id)).then(() => {
                    setGame({ ...game, ...ugame })

                });
            }
            else {
                setGame({ ...game, ...ugame })

            }

        })

        return () => {
            detacher();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        setResult(game.result)
    }, [game])
    async function updateUsers(uids: string[]) {
        const fuids = users.map(e => e.id);

        for (let i = 0; i < uids.length; i++) {
            if (fuids.indexOf(uids[i]) < 0) {
                const user = await fetchUser(uids[i]) as User;

                if (user)
                    users.push(user)
            }
        }

        setUsers([...users])
    }


    function sortResult(result: Result[], type = "DESC") {
        const sortedResult = result.map(r => ({ ...r, percentage: getPercentage(r.scores, kuib.questions) })).sort((a, b) => {
            return b.percentage.cppq - a.percentage.cppq
        })
        return sortedResult;
    }

    return (
        <div className="container">
            <Card className='my-3 mx-2'>
                <Card.Header>
                    Live Result
                </Card.Header>
                <Card.Body>
                    <FlipMove
                        duration={750}
                        easing="ease-out"
                        enterAnimation="accordionVertical"
                        leaveAnimation="accordionVertical"
                        style={{ overflowAnchor: 'none' }}
                    >
                        {
                            sortResult(result).map((res, i) => {
                                const __user = users[users.map(u => u.id).indexOf(res.id)]
                                return (
                                    <UserProgressResultWRef key={res.id} user={__user} percentage={res.percentage} score={{ ...res, position: i + 1, kuib }} />
                                )
                            })
                        }
                    </FlipMove>
                </Card.Body>
            </Card>
        </div>
    );
}

interface UserProgressResultProps {
    user: User,
    score: Result & { position: number, kuib: Kuib }
    percentage: Percentage
}

export const UserProgressResultWRef = forwardRef((props: any, ref: any) => (
    <div key={props.score.id} ref={ref}>
        <UserProgressResult {...props} />
    </div>
))

UserProgressResultWRef.displayName = 'UserProgressResultWRef'

export function UserProgressResult({ user, score, percentage }: UserProgressResultProps) {
    // const percentage = getPercentage(score.scores, score.kuib.questions)
    // const [now, setNow] = useState(0)
    const isFinish = score.scores.length >= percentage.totalQuestion
    return (
        <div className="user-progress d-flex justify-content-center align-items-center my-2 mb-4">
            {/* <div className="postion px-2">
                {score.position}
            </div>
            <div className="username px-2 ">
                {user.username}
            </div> */}
            <div className='pb flex-fill px-2 position-relative' style={{ height: 35 }}>
                <div className="position-absolute top-0 left-0 h-100 translate-middle-y bg-dark text-light rounded px-3 mx-2  d-flex align-items-center justify-content-start" style={{
                }}>
                    <b>{score?.position}</b>  <span className="mx-2">{user.username}</span>
                </div>
                <ProgressBar variant='secondary' style={{ height: '100%' }} >
                    <ProgressBar
                        animated={!isFinish}
                        striped={!isFinish}
                        variant='success'
                        className='fs-6'
                        label={`${percentage.cppq}%`}
                        now={percentage.cppq} />
                    <ProgressBar
                        animated={!isFinish}
                        striped={!isFinish}
                        variant='danger'
                        className='fs-6'
                        label={`${percentage.cwpq}%`}
                        now={percentage.cwpq} />
                </ProgressBar>

            </div>
            {/* <div className="div">
                <Button onClick={() => setNow(now + 10)}>Inc</Button>

            </div> */}
            <Button variant='primary' className="btn-outline-none" as='div'>
                {score.scores.length === 0 ? 1 : score.scores.length} / {percentage.totalQuestion}
            </Button>
        </div>
    )
}

// <div>
//     <h2>LiveResult</h2>
//     <ul>
//         {
//             sortResult(result).map(res => {
//                 const ui = users.map(e => e.id).indexOf(res.id);
//                 const u = users[ui];
//                 return (
//                     <li key={res.id}>
//                         {u.username} | Scores: {res.accScores} | cq: ( {res.scores.length === 0 ? 1 : res.scores.length} / {game.kuibData.questions.length} )
//                     </li>
//                 )
//             })
//         }
//     </ul>
// </div>
export async function getServerSideProps(ctx) {
    const { id } = ctx.query;

    const gameReq = await axios.get<Game>(`${server}/api/game/${id}`);
    if (gameReq.status === 200) {
        const game = gameReq.data;

        let users = [];
        let kuib = null;

        if (game.result.length > 0) {
            users = await fetchUsersAdmin(game.result.map(e => e.id))
            kuib = await (await firestore.collection('kuib').doc(game.kid).get()).data()
        }

        return {
            props: {
                game,
                users,
                kuib
            }
        };
    }
    else {
        return {
            props: {}
        }
    }

}



export default LiveResult;