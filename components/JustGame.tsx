import React, { useEffect, useState } from 'react';
import { useGame } from '../pages/game/[id]/index';
import { firestore } from '../util/db';
import isCorrect from '../util/isCorrect';
import shuffle from '../util/shuffle';
import { Question as QuestionType, Result } from '../util/types';
import BottomStuff from './BottomStuff';
import Question from './Question';

function JustGame() {
    const { kuib, player, setPlayer, data, user, next, end } = useGame();
    // shuffle on initial load only
    const [questions] = useState<QuestionType[]>(() => (shuffle(kuib.questions)));
    // const [ cq, setCq ] = useState( () => ( { ...questions[ player.currentQuestion ], answers: shuffle( questions[ player.currentQuestion ].answers ) } ) );
    const [cq, setCq] = useState(() => questions[player.currentQuestion]);
    const [showStatus, setShowStatus] = useState(false);
    const [status, setStatus] = useState('INCORRECT');
    const [timerId, setTimerID] = useState(null);

    // useEffect( () => { console.log( questions ); }, [ questions ] );
    useEffect(() => { console.log(cq); }, [cq]);
    // useEffect( () => { console.log( player.currentQuestion ); }, [ player.currentQuestion ] );

    useEffect(() => {
        const currentQuestion = player.currentQuestion;
        console.log(currentQuestion);
        if (currentQuestion < questions.length) {
            setCq(questions[currentQuestion]);
        }
        else
            end();

        return () => {
            setCq(null);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [player.currentQuestion]);

    function updateCurrentUserScore(qid, aid) {
        const correct = isCorrect(aid, cq.correctAnswerId);
        const result = data.result;
        const usi = result.map(e => e.id).indexOf(user.id);
        const us = result[usi];
        let accScores = us.accScores;
        if (correct)
            accScores += 1;

        us.accScores = accScores;
        us.scores = [...us.scores, {
            qid, aid, accScores
        }];

        result[usi] = us;

        firestore.collection('games').doc(data.id).update({
            result
        }).then(() => {
            setStatus(correct ? 'CORRECT' : 'INCORRECT');
            setShowStatus(true);
            const nextQuestionTimeout = setTimeout(() => {
                next();
                setShowStatus(false);
            }, 10000);
            setTimerID(nextQuestionTimeout);
        });
    }

    function goToNext() {
        timerId && clearTimeout(timerId);

        next();
        setShowStatus(false);
    }

    function isFinish() {
        return player.currentQuestion >= data.result.length - 1;
    }

    return (
        <div>
            {/* <button onClick={() => setPlayer({ ...player, currentQuestion: player.currentQuestion + 1 })}>Inc cq</button> */}
            {cq && <Question question={cq} {...{ handler: updateCurrentUserScore, currentQuestion: player.currentQuestion, showStatus }} />}
            <BottomStuff {...{ showStatus, goToNext, status }} />
        </div>
    );
}



export default JustGame;