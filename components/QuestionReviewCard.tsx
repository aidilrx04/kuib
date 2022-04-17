import React from 'react'
import { Accordion, Form } from 'react-bootstrap'
import { Question, Score } from '../util/types'

type QuestionReviewCardPropTypes = {
    question: Question,
    score: Score
    index?: number
}

function QuestionReviewCard({ question, score, index }: QuestionReviewCardPropTypes) {
    console.log(index)
    return (
        <Accordion.Item eventKey={score.qid}>
            <Accordion.Header>
                <span className='fw-bold'>
                    Question {typeof index === 'number' ? `${index + 1}` : null}
                </span>
                <span className={`badge pill ${question.correctAnswerId === score.aid ? 'bg-success' : 'bg-danger'} mx-2`}>
                    {question.correctAnswerId === score.aid ? 'Correct' : 'Wrong'}
                </span>
            </Accordion.Header>
            <Accordion.Body>
                <div className="question-text mb-2">
                    <b className='me-2 text'>
                        {typeof index === 'number' ? `${index + 1}.` : ''}
                    </b>
                    <span className="text">
                        {question.text}
                    </span>
                </div>
                <div className="answers mt-3">
                    {question.answers.map(ans => {
                        const isUserAnswer = score.aid === ans.id;
                        const isUserAnswerCorrect = question.correctAnswerId === score.aid;
                        const isAnswer = ans.id === question.correctAnswerId;
                        const bg =
                            isUserAnswer
                                ? isUserAnswerCorrect
                                    ? 'bg-success'
                                    : 'bg-danger'
                                : isAnswer
                                    ? 'bg-success'
                                    : ''


                        return (
                            <div key={ans.id} className={`${bg} px-2 py-1 rounded ${bg !== '' ? 'text-light' : 'text-dark text-muted'} d-flex align-items-center `} >
                                {/* <input type="radio" defaultChecked={isUserAnswer || isAnswer} onClick={e => e.preventDefault()} /> */}
                                <Form.Check
                                    type='radio'
                                    id={ans.id}
                                    label={ans.text}
                                    defaultChecked={isUserAnswer}
                                    onClick={e => e.preventDefault()}
                                />
                                {/* <label>{ans.text}</label> */}
                            </div>
                        )
                    })}
                </div>
            </Accordion.Body>
        </Accordion.Item>
    )
}

{/* <div>
            <b>{question.text}</b>
            <div className="answers">
                {question.answers.map(ans => {
                    const isUserAnswer = score.aid === ans.id;
                    const isUserAnswerCorrect = question.correctAnswerId === score.aid;
                    const isAnswer = ans.id === question.correctAnswerId;

                    const style = {
                        backgroundColor: isUserAnswer
                            ? isUserAnswerCorrect
                                ? 'green'
                                : 'red'
                            : isAnswer
                                ? 'green'
                                : 'grey'
                    }

                    return (
                        <div key={ans.id} style={style} >
                            <input type="radio" defaultChecked={isUserAnswer} />
                            <label>{ans.text}</label>
                        </div>
                    )
                })}
            </div>
        </div > */}
export default QuestionReviewCard