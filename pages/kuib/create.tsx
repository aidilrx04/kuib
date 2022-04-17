import axios from 'axios';
import React, { createContext, Dispatch, useCallback, useContext, useEffect, useReducer, useState } from 'react';
import { v4 } from 'uuid';
import server from '../../config/server';
import { fireauth } from '../../util/db';
import { fireauth as fireauthAdmin } from '../../util/db-admin';
import nookies from 'nookies';
import { useAuth } from '../../components/AuthProvider';
import { Answer, Kuib, Question } from '../../util/types';
import { useRouter } from 'next/router';
import { Button, Card, Fade, Form, InputGroup, Tab } from 'react-bootstrap';
import StretchTabs from '../../components/StretchTabs';
import FAI from '../../components/FAI';

export async function getServerSideProps(ctx) {
    try {
        const cookies = nookies.get(ctx);
        const token = await fireauthAdmin.verifyIdToken(cookies.token);

        return {
            props: {

            }
        };
    } catch (error) {
        ctx.res.writeHead(302, { Location: '/auth/signin?next=/kuib/create' });
        ctx.res.end();

        return {
            props: {}
        };
    }
}

enum CreateActionTypes {
    SET_ID = "SET_ID",
    SET_TITLE = "SET_TITLE",
    SET_QUESTION_TEXT = "SET_QUESTION_TEXT",
    SET_ANSWER_TEXT = "SET_ANSWER_TEXT",
    ADD_QUESTION = "ADD_QUESTION",
    SET_QUESTION_ANSWERS = "SET_QUESTION_ANSWERS",
    SET_CORRECT_ANSWER = "SET_CORRECT_ANSWER",
    DELETE_QUESTION = "DELETE_QUESTION",
    DELETE_QUESTION_ANSWER = "DELETE_QUESTION_ANSWER",
}

interface ExQuestion extends Question {
    answers: (Answer & { isCorrect: boolean })[]
}

interface CreateProps extends Kuib {
    id: string,
    title: string;
    creator: string;
    questions: ExQuestion[];
}

interface CreateAction {
    payload?: any;
    type: CreateActionTypes
}
const initState: CreateProps = {
    id: null,
    title: '',
    creator: null,
    questions: [
        {
            id: 'question-1',
            text: '',
            correctAnswerId: '',
            answers: [
                { id: v4(), text: '', isCorrect: true },
                // { id: v4(), text: '', isCorrect: false },
                // { id: v4(), text: '', isCorrect: false },
            ]
        }
    ]
};

function reducer(state: CreateProps, action: CreateAction) {
    switch (action.type) {
        case "SET_ID":
            return { ...state, id: action.payload };
        case "SET_TITLE":
            return { ...state, title: action.payload };
        case "SET_QUESTION_TEXT": {
            const { id, value } = action.payload;

            const questionIndex = state.questions.map(e => e.id).indexOf(id);
            const mutQuestions = state.questions;
            mutQuestions[questionIndex].text = value;

            return {
                ...state,
                questions: mutQuestions
            };
        }

        case "SET_ANSWER_TEXT": {
            const { qid, id, value } = action.payload;

            const questionIndex = state.questions.map(e => e.id).indexOf(qid);
            const answerIndex = state.questions[questionIndex].answers.map(e => e.id).indexOf(id);
            state.questions[questionIndex].answers[answerIndex].text = value;

            return {
                ...state
            };
        }

        case "ADD_QUESTION":
            return {
                ...state,
                questions: [
                    ...state.questions,
                    {
                        id: v4(),
                        text: '',
                        correctAnswerId: null,
                        answers: [{
                            id: v4(),
                            text: '',
                            isCorrect: true
                        }]
                    }
                ]
            };



        case "SET_QUESTION_ANSWERS": {
            const questionIndex = state.questions.map(e => e.id).indexOf(action.payload.id);

            state.questions[questionIndex].answers = action.payload.value;

            return {
                ...state
            };
        }

        case "SET_CORRECT_ANSWER": {
            const { qid, id } = action.payload;

            const questionIndex = state.questions.map(e => e.id).indexOf(qid);
            const answerIndex = state.questions[questionIndex].answers.map(e => e.id).indexOf(id);

            const currentQuestion = state.questions[questionIndex];
            const currentAnswer = currentQuestion.answers[answerIndex];

            if (!currentAnswer.isCorrect) {
                console.log("UPDATING CURRENT QUESTION CORRECT ANSWER");
                const newAnswers = currentQuestion.answers.map((answer) => {
                    if (answer.id !== id)
                        return { ...answer, isCorrect: false };
                    else
                        return { ...answer, isCorrect: true };
                });

                currentQuestion.answers = newAnswers;
            }

            state.questions[questionIndex] = currentQuestion;

            return { ...state };

        }

        case "DELETE_QUESTION": {
            // const questionIndex = state.questions.map( e => e.id ).indexOf( action.payload );
            if (state.questions.length === 1) return state;

            state.questions = state.questions.filter(question => question.id !== action.payload);
            return { ...state };
        }

        case "DELETE_QUESTION_ANSWER": {
            const { qid, id } = action.payload;
            const questionIndex = state.questions.map(e => e.id).indexOf(qid);
            const currentQuestion = state.questions[questionIndex];

            if (currentQuestion.answers.length === 1) return state;

            currentQuestion.answers = currentQuestion.answers.filter(answer => answer.id !== id);

            state.questions[questionIndex] = currentQuestion;

            return {
                ...state
            };

        }

        default:
            throw Error("BRUH");
    }
}

interface CreateContextProps {
    kuib: CreateProps,
    dispatch?: Function,
    handleSubmit?: Function,
    disabled?: boolean
}

const CreateContext = createContext<CreateContextProps>(null)
export function useCreateKuib() {
    return useContext(CreateContext)
}

export default function CreateContextProvider() {
    const [kuib, dispatch] = useReducer(reducer, initState);
    const { userData } = useAuth();
    const router = useRouter()
    const [disabled, setDisabled] = useState(false);

    // useEffect( () =>
    // {
    //     console.log( kuib );
    // }, [] );
    useEffect(() => {
        console.log(kuib);
        if (!kuib.id)
            dispatch({
                type: CreateActionTypes.SET_ID,
                payload: v4()
            });

    }, [kuib]);

    function handleSubmit(e) {
        e.preventDefault();
        setDisabled(true)

        if (fireauth.currentUser)
            fireauth.currentUser.getIdToken(true)
                .then(idToken => {
                    kuib.creator = userData.id;
                    console.log("currently logged in");
                    axios.post(`${server}/api/kuib`, { ...kuib, idToken }).then(res => {
                        console.log(res.data);
                        if (res.status === 200) {
                            router.push(`/kuib/${res.data.kuibId}`)
                        }
                    })
                        .catch(err => {
                            console.log(err);
                            setDisabled(false)
                        });
                })
                .catch(err => {
                    setDisabled(false)
                    console.log(err);
                });
        else
            alert("you are currently not logged in");
    }

    return (
        <CreateContext.Provider value={{
            kuib,
            dispatch,
            handleSubmit,
            disabled
        }}>
            <CreateKuib />
        </CreateContext.Provider>
    )
}


function CreateKuib() {

    const { kuib, dispatch, handleSubmit, disabled } = useCreateKuib()

    // const dcb = useCallback((props) => dispatch({ ...props }), [kuib])

    return (
        <div className="container py-2">
            <h4>Create New Kuib</h4>

            <Form className='my-3' onSubmit={e => handleSubmit(e)}>
                <Card className='mb-3'>
                    <Card.Header className='bg-secondary text-light'>
                        Kuib Detail
                    </Card.Header>
                    <div className="my-3 px-3">
                        <Form.Group className='mb-3' controlId='123'>
                            <Form.FloatingLabel label='Title' controlId='floatingTitle'>
                                <Form.Control type="t ext" placeholder='Kuib Title' defaultValue={kuib.title} onChange={e => {
                                    dispatch({
                                        type: CreateActionTypes.SET_TITLE,
                                        payload: e.target.value
                                    })
                                }} disabled={disabled} required />
                            </Form.FloatingLabel>
                        </Form.Group>
                        <Form.Group className='mb-3'>
                            <Form.FloatingLabel label='Description' controlId='floatingTitle'>
                                <Form.Control as="textarea" style={{ height: 100 }} type="text" placeholder='Description' disabled={disabled} />
                            </Form.FloatingLabel>
                        </Form.Group>
                    </div>
                </Card>

                <Card>
                    <Card.Header className='sticky-top bg-secondary text-light d-flex justify-content-between align-items-center flex-wrap' style={{
                    }}>
                        <span>Questions</span>
                        <Button
                            disabled={disabled}
                            onClick={(e) => {
                                e.preventDefault();
                                dispatch({
                                    type: CreateActionTypes.ADD_QUESTION
                                });
                            }}>
                            <FAI icon={'plus'} />
                            <span> Question</span>
                        </Button>
                    </Card.Header>
                    <Card.Body>
                        {
                            kuib.questions.map((question, i) => (
                                <QuestionForm question={question} key={question.id} handler={dispatch} index={i} disabled={disabled} />
                            ))
                        }
                    </Card.Body>
                    <Card.Footer>
                        <div className='float-end'>
                            <Button variant='success' type="submit" disabled={disabled} >
                                <FAI icon='paper-plane' />
                                <span> Create</span>
                            </Button>
                        </div>
                    </Card.Footer>
                </Card>
            </Form>
        </div >
    );
}

function QuestionForm({ question, handler, index, disabled }: { question: ExQuestion, handler: Function, index?: number, disabled: boolean }) {
    return (
        <>
            <Fade appear={true} in={true} unmountOnExit={true}>
                <>
                    <Card className='px-2 py-3 my-3' style={{
                        borderTopWidth: '7px',
                        borderTopColor: '#6c757d'
                    }}>
                        <Form.Group className='mb-3' >
                            {
                                <div className='py-2 mb-2 fs-5 border-bottom border-5 border-secondary d-flex justify-content-between align-items-center'>
                                    <div>
                                        {Number.isInteger(index) && <span>Question {index + 1}</span>}
                                    </div>
                                    <Button disabled={disabled} variant="danger" onClick={(e) => {
                                        e.preventDefault();
                                        handler({
                                            type: "DELETE_QUESTION",
                                            payload: question.id
                                        });
                                    }}>
                                        <FAI icon={'trash-alt'} />
                                        <span> Remove</span>
                                    </Button>
                                </div>
                            }

                            <Form.FloatingLabel label="Question Text" className='mb-3' >
                                <Form.Control
                                    as="textarea"
                                    style={{ height: '100px' }}
                                    placeholder='Question Text'
                                    value={question.text}
                                    onChange={e => handler({ type: "SET_QUESTION_TEXT", payload: { id: question.id, value: e.target.value } })}
                                    disabled={disabled}
                                    required />
                            </Form.FloatingLabel>

                            <Form.Text className='fs-6 d-flex justify-content-between align-items-center' as={'div'}>
                                <span>Answers</span>
                            </Form.Text>
                            <Form.Group className='mt-1'>
                                {
                                    question.answers.map((ans) => {
                                        return (
                                            <AnswerForm answer={ans} key={ans.id} qid={question.id} handler={handler} disabled={disabled} />
                                        )
                                    })
                                }
                                <div className="float-end">
                                    <Button variant='primary' onClick={(e) => {
                                        e.preventDefault();
                                        // debugger;
                                        handler({
                                            type: "SET_QUESTION_ANSWERS",
                                            payload: {
                                                id: question.id,
                                                value: [...question.answers, {
                                                    id: v4(),
                                                    text: '',
                                                    isCorrect: false
                                                }]
                                            }
                                        });
                                    }} disabled={disabled}>
                                        <FAI icon={'plus'} />
                                        <span> Answer</span>
                                    </Button>
                                </div>
                            </Form.Group>
                        </Form.Group>
                    </Card>
                    <hr />
                </>
            </Fade>
        </>
    )
}

function AnswerForm({ answer, qid, handler, disabled }: { answer: Answer & { isCorrect: boolean }, qid: string, handler: Function, disabled: boolean }) {
    return (
        <Form.Group className='mb-2'>
            <InputGroup>
                <Form.FloatingLabel label="Answer Text" className='flex-fill'>
                    <Form.Control type="text" placeholder='Answer Text' disabled={disabled} value={answer.text} onChange={e => handler({
                        type: "SET_ANSWER_TEXT",
                        payload: {
                            qid,
                            id: answer.id,
                            value: e.target.value
                        }
                    })}
                        required />
                </Form.FloatingLabel>
                <InputGroup.Checkbox className='123' checked={answer.isCorrect} name={`a-${qid}`} onChange={() => handler({
                    type: "SET_CORRECT_ANSWER",
                    payload: {
                        qid,
                        id: answer.id
                    }
                })}
                    disabled={disabled}
                />
                <Button variant="danger" id="button-addon2" disabled={disabled}
                    onClick={(e) => {
                        e.preventDefault();
                        handler({
                            type: "DELETE_QUESTION_ANSWER",
                            payload: {
                                qid: qid,
                                id: answer.id
                            }
                        });
                    }}
                >
                    <FAI icon={'minus'} />
                    {/* <span> Remove</span> */}
                </Button>
            </InputGroup>
        </Form.Group>
    )
}

// const { dispatch } = useCreateKuib()
function KuibDetailForm({ kuib, handler }: { kuib: CreateProps, handler: Function }) {
    return (
        <>

        </>
    )
}

// <div>
//     <h1>Create Kuib</h1>

//     <form onSubmit={handleSubmit}>
//         <input type="text" placeholder="Enter kuiz name" value={kuib.title} onChange={e => dispatch({ type: CreateActionTypes.SET_TITLE, payload: e.target.value })} />

//         <div className="questions">
//             {
//                 kuib.questions.map(question => <QuestionInput key={question.id} handler={dispatch} question={question} />)
//             }
//         </div>
//         <button onClick={(e) => {
//             e.preventDefault();
//             dispatch({
//                 type: CreateActionTypes.ADD_QUESTION
//             });
//         }}>
//             Add Question
//         </button>
//         <button type="submit">
//             Create
//         </button>
//     </form>
// </div>

function QuestionInput({ question, handler }) {
    return (
        <div className="question">
            <input id={question.id} type="text" placeholder="Question text" value={question.text} onChange={e => handler({ type: "SET_QUESTION_TEXT", payload: { id: question.id, value: e.target.value } })} />
            <button onClick={(e) => {
                e.preventDefault();
                // debugger;
                handler({
                    type: "SET_QUESTION_ANSWERS",
                    payload: {
                        id: question.id,
                        value: [...question.answers, {
                            id: v4(),
                            text: '',
                            isCorrect: false
                        }]
                    }
                });
            }}>
                Add Answer
            </button>
            <button
                onClick={(e) => {
                    e.preventDefault();
                    handler({
                        type: "DELETE_QUESTION",
                        payload: question.id
                    });
                }}
            >Delete Question</button>
            <div className="answers">
                {
                    question.answers.map(answer => <AnswerInput key={answer.id} answer={answer} qid={question.id} handler={handler} />)
                }
            </div>


        </div>
    );
}

function AnswerInput({ answer, handler, qid }) {
    // useEffect( () =>
    // {
    //     console.log( answer );
    // }, [ answer ] );
    return (
        <div className="answer">
            <input type="text" placeholder="Answer Text" value={answer.text} onChange={e => handler({
                type: "SET_ANSWER_TEXT",
                payload: {
                    qid,
                    id: answer.id,
                    value: e.target.value
                }
            })} />

            <input type="radio" name={`Q${qid}`} checked={answer.isCorrect} onChange={e => handler({
                type: "SET_CORRECT_ANSWER",
                payload: {
                    qid,
                    id: answer.id
                }
            })} />
            <button
                onClick={(e) => {
                    e.preventDefault();
                    handler({
                        type: "DELETE_ANSWER",
                        payload: {
                            qid: qid,
                            id: answer.id
                        }
                    });
                }}
            >Delete answer</button>
        </div>
    );
}


// bs
   // case "ADD_ANSWER": {
        //     // ! WEIRD SHIT
        //     // ! Unexpected behaviour: Added 2 answers instead of 1
        //     // ! use SET_ANSWERS instead
        //     //
        //     //  debugger;
        //     const questionIndex = state.questions.map(e => e.id).indexOf(action.payload);

        //     const newAnswer = {
        //         id: v4(),
        //         text: '',
        //         isCorrect: false
        //     };

        //     const mutQuestions = state.questions;
        //     mutQuestions[questionIndex].answers.push(newAnswer);


        //     return {
        //         ...state,
        //         questions: mutQuestions
        //     };
        // }