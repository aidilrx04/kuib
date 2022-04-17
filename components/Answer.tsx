import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { Answer, Question } from '../util/types';

type AnswerPropTypes = {
    answer: Answer,
    question: Question,
    handler: Function,
    disabled: boolean,
    [key: string]: any
}

function Answer({ answer, question, handler, disabled }: AnswerPropTypes) {
    const [clickVisible, setClickVisible] = useState(false)
    return (
        // <div id={answer.id}>
        <Button
            variant={`${disabled
                ? answer.id === question.correctAnswerId
                    ? 'success'
                    : 'danger'
                : 'secondary'
                }`}
            className={`
                m-2 
                rounded
                d-block
                p-3
                ${disabled ? answer.id === question.correctAnswerId
                    ? 'bg-success'
                    : 'bg-danger' : 'bg-secondary'
                }
            `}
            style={{
                flex: 1,
                minWidth: '40%',
                visibility: disabled ? clickVisible || answer.id === question.correctAnswerId ? 'visible' : 'hidden' : 'visible'
            }}
            onClick={() => {
                handler(question.id, answer.id);
                setClickVisible(true)
            }}
            disabled={disabled}
        >
            {answer.text}
        </Button>
        // </div>
    );
}

export default Answer;