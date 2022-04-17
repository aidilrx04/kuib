import axios from 'axios';
import { NextPageContext } from 'next';
import React from 'react'
import server from '../../../../config/server';
import { Game, Kuib, Result, Score, User } from '../../../../util/types'
import { v4 } from 'uuid';
import QuestionReviewCard from '../../../../components/QuestionReviewCard';
import { Accordion, Card, ProgressBar } from 'react-bootstrap';
import getPercentage from '../../../../util/getPercentage';


type GameResultProps = {
    result: User & Result,
    kuib: Kuib
}


function GameResult({ result, kuib }: GameResultProps) {
    const percentage = getPercentage(result.scores, kuib.questions)

    const barStyles = {
        background: 'grey',
        height: 20,
        display: 'inline-block',
        position: 'absolute',
        top: 0
    }

    console.log(percentage)

    if (result.scores.length === 0) {
        return 'No user result yet'
    }


    return (
        <div className="container">
            <Card className='my-3 mx-2'>
                <Card.Header>
                    <span className="fs-4">Game Result</span>
                </Card.Header>

                <Card.Body>
                    <Card.Title className='fs-5'>
                        Result for: {result.username}
                    </Card.Title>
                    <Card.Subtitle>
                        Scores: {result.accScores}
                    </Card.Subtitle>
                    <div className='my-3'>
                        Progress
                        <ProgressBar className='mt-1'>
                            <ProgressBar now={percentage.correctPercentage} variant="success" label={`${percentage.correctPercentage}%`} />
                            <ProgressBar now={percentage.wrongPercentage} variant="danger" label={`${percentage.wrongPercentage}%`} />
                        </ProgressBar>
                    </div>

                </Card.Body>
                <hr />
                <span className='fs-5 mx-3 mb-2'>Review</span>

                <div className="questions">
                    <Accordion flush defaultActiveKey={result.scores[0].qid}>
                        {
                            result.scores.map((score, i) => {
                                const qi = kuib.questions.map(e => e.id).indexOf(score.qid);
                                const question = kuib.questions[qi]
                                return <QuestionReviewCard key={v4()} question={question} score={score} index={i} />
                            })
                        }
                    </Accordion>
                </div>
            </Card>
        </div>

    )
}


export async function getServerSideProps(ctx: NextPageContext) {
    const { id, uid } = ctx.query

    const resultData = await axios.get(`${server}/api/game/${id}/result/${uid}`);
    const kuibData = await axios.get<Game>(`${server}/api/game/${id}`)
    const kuib = kuibData.data.kuibData

    if (resultData.status === 200)


        return {
            props: {
                result: resultData.data,
                kuib: kuib
            }
        }
    else {
        return {
            props: {}
        }
    }
}

export default GameResult;

