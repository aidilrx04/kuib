import Link from 'next/link'
import React from 'react'
import { Game } from '../util/types'

interface GamesListPropTypes {
    games: Game[],
    title: string
}

function GamesList({ games, title }: GamesListPropTypes) {
    return (
        <div className="card m-3">
            <div className="card-header">
                {title}
            </div>
            <ul className="list-group list-group-flush">
                {
                    games.map(game => (
                        <li key={game.id} className="list-group-item">
                            <Link href={`/game/${game.id}`} passHref>
                                <a className='text-decoration-none'>
                                    Game - {game.id.slice(0, 6)}
                                </a>
                            </Link>
                        </li>
                    ))
                }
            </ul>
        </div>
    )
}

export default GamesList