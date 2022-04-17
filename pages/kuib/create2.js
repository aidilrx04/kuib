import React, { useState, useEffect } from 'react';
import { firestore } from '../../util/db';

function Create()
{

    const [ kuibName, setKuibName ] = useState( '' );
    const [ questions, setQuestions ] = useState( [ {
        text: "Your mom",
        answers: [ {
            text: '',
            isCorrect: false
        } ]
    } ] );

    useEffect( () =>
    {
        console.log( questions );
    }, [ questions ] );

    function handleSubmit( e )
    {
        e.preventDefault();

    }

    function updateQuestion( index, question )
    {
        questions[ index ] = question;

        setQuestions( [ ...questions ] );
    }

    useEffect;
    return (
        <form onSubmit={ handleSubmit }>
            <input type="text" placeholder="KUib name" value={ kuibName } onChange={ e => setKuibName( e.target.value ) } />

            <hr />

            <div className="questions">
                {
                    questions.map( ( question, index ) => <QuestionInput key={ index } question={ question } index={ index } handler={ updateQuestion } /> )
                }
            </div>
        </form>
    );
}

function QuestionInput( { question, index, handler } )
{
    function updateQuestion( question )
    {
        handler( index, question );
    }
    function updateAnswer( index, answer )
    {
        question.answers[ index ] = answer;

        if ( answer.isCorrect )
        {
            console.log( "OII" );
            // question.answers.forEach( ( _answer, _index ) =>
            // {
            //     if ( _index !== index )
            //     {
            //         _answer.isCorrect = false;
            //     }
            // } );
        }

        handler( index, { ...question, answers: [ ...question.answers ] } );
    }

    return (
        <div className="question">
            <input type="text" placeholder='Question text' value={ question.text } onChange={ e => updateQuestion( { ...question, text: e.target.value } ) } />

            {
                question.answers.map( ( answer, index ) => <AnswerInput key={ index } index={ index } answer={ answer } handler={ updateAnswer } /> )
            }
            <button onClick={ () => updateQuestion( { ...question, answers: [ ...question.answers, { text: '', isCorrect: false } ] } ) }>
                Add answer
            </button>
            <hr />
            <hr />
        </div>
    );
}

function AnswerInput( { index, answer, handler } )
{
    function updateAnswer( answer )
    {
        handler( index, answer );
    }

    return (
        <div className="answer">
            <input type="text" placeholder="answer text" value={ answer.text } onChange={ e => updateAnswer( { ...answer, text: e.target.value } ) } />
            {/* <input type="radio" checked={ answer.isCorrect } onClick={ updateAnswer( { ...answer, isCorrect: true } ) } /> */ }
            {/* <input type="radio" checked={ answer.isCorrect } onChange={ updateAnswer( { ...answer, isCorrect: true } ) } /> */ }
        </div>
    );
}

export default Create;