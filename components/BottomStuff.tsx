import React from 'react'
import { Button } from 'react-bootstrap';
import { useGame } from '../pages/game/[id]';
import FAI from './FAI';

function BottomStuff({ showStatus, status, goToNext }) {

    const { player, kuib } = useGame()

    return (
        <div
            className=' fixed-bottom'
            style={{ zIndex: 100 }}
        >
            <div className='position-absolute bottom-100 w-100 start-0'>
                {showStatus && (
                    <>
                        <Status status={status} />
                    </>
                )}
            </div>

            <div
                className='bg-dark text-light py-4 px-4 d-flex justify-content-between align-items-center'
            >
                <div className="left">
                    <div className="">
                        <b>Question: </b>
                        {player.currentQuestion + 1}
                        /
                        {kuib.questions.length}
                    </div>
                </div>
                <div className="right float-end">
                    <Button disabled={!showStatus} onClick={() => goToNext()}>
                        <FAI icon={'arrow-right'} className='me-2' />
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}

function Status({ status }) {
    return (
        <div
            className={`
        status
        text-white
        text-center
        py-3
        fs-4

        ${status === 'CORRECT' ? 'bg-success' : 'bg-danger'}
         `}>
            {status}
        </div>
    );
}

export default BottomStuff