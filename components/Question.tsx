import React, { useEffect, useState } from 'react';
import shuffle from '../util/shuffle';
import { Answer as AnswerType, Question } from '../util/types';
import Answer from './Answer';

type QuestionPropTypes = {
    question: Question,
    [key: string]: any
}

function Question({ question, ...rest }: QuestionPropTypes) {
    // const [ answers, setAnswer ] = useState( () => shuffle( question.answers ) );
    const [answers, setAnswer] = useState<AnswerType[]>(null);

    useEffect(() => {
        if (question)
            setAnswer(shuffle(question.answers));
        console.log('question changed. reshuffle answers');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [question]);
    return (
        <div className="container pt-5 px-3 pb-2" style={{ width: '100vw', height: '100vh', zIndex: 2 }}>
            <div className='d-flex justify-content-center align-items-center' style={{
                minHeight: '40%'
            }}>
                <div
                    className="
                    question-text 
                    bg-dark 
                    text-light 
                    text-center 
                    fs-4
                    px-2
                    py-4
                    rounded
                    d-flex
                    align-items-center
                    justify-content-center
                    my-auto
                    "
                    style={{
                        height: 200,
                        flex: 1
                    }}
                >
                    <div>
                        {question.text}
                    </div>
                </div>
            </div>
            <hr />
            <div className="answers d-flex flex-wrap justify-content-between">
                {
                    answers && answers.map(ans => (
                        <Answer key={ans.id} answer={ans} question={question} handler={rest.handler} disabled={rest.showStatus} />
                    ))
                }
            </div>
        </div>
    );
}

{/* <div>
            <h4>Question</h4>
            <b>{rest.currentQuestion + 1}.</b> {question.text}
            <div className="answers">
                {
                    answers && answers.map(ans => (
                        <Answer key={ans.id} answer={ans} qid={question.id} handler={rest.handler} />
                    ))
                }
            </div>
        </div> */}

export default Question;