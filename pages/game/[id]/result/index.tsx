import { NextPageContext } from 'next'
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react'
import { Card, ListGroup } from 'react-bootstrap';
import { fetchUsersAdmin } from '../../../../util/fetchUsersAdmin';
import { Game, Result, User } from '../../../../util/types'
import { getGameData } from '../../../api/game/[id]/result/[uid]';



function GameResults({ result, users }: { result: Result[], users: User[] }) {
    const router = useRouter()
    return (
        <div className="container my-3">
            <Card className=''>
                <Card.Header>
                    Game Result
                </Card.Header>
                <ListGroup variant="flush">
                    {
                        result.sort((a, b) => b.accScores - a.accScores).map((res, i) => {
                            const ui = users.map(e => e.id).indexOf(res.id);
                            const user = users[ui];

                            return (
                                <Link href={`${router.asPath}/${user.id}`} passHref key={user.id}>
                                    <ListGroup.Item as={'a'} action className='p-0 d-flex align-items-center'>
                                        <div className="index px-3 py-2 border-end fw-bold">
                                            {i + 1}
                                        </div>
                                        <div className="detail px-3 py-2 d-flex align-items-center justify-content-between flex-fill ">
                                            <div className="name">
                                                {user.username}
                                            </div>
                                            <div className="score badge pill bg-success px-2">
                                                {res.accScores}
                                            </div>
                                        </div>
                                    </ListGroup.Item>
                                </Link>
                            )
                        })
                    }
                </ListGroup>
            </Card>
        </div >
    )
}

{/* <div>
            <h2>GameResults</h2>
            <hr />
            <ul>
                {
                    result.sort((a, b) => b.accScores - a.accScores).map(res => {
                        const ui = users.map(e => e.id).indexOf(res.id);
                        const user = users[ui];

                        return (
                            <li key={user.id}>
                                <Link href={`${router.asPath}/${user.id}`} passHref>
                                    <span>{user.username} | Scores: {res.accScores}</span>
                                </Link>
                            </li>
                        )
                    })
                }
            </ul>
        </div> */}

export async function getServerSideProps(ctx: NextPageContext) {
    const { id } = ctx.query;

    const game = await getGameData(id) as Game

    if (game) {
        const users = await fetchUsersAdmin(game.result.map(e => e.id))
        return {
            props: {
                result: game.result,
                users
            }
        }
    }
    else {
        return {
            props: {}
        }
    }
}

export default GameResults