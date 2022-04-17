import React, { useState } from 'react'
import { Button, Offcanvas } from 'react-bootstrap';
import Navigation from './Navigation';

function GameNavigation(props) {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    // console.log(props)
    return (
        <>
            <Button variant="primary" onClick={handleShow}>
                Navi
            </Button>

            <Offcanvas show={show} onHide={handleClose}>
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Navigation</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Navigation />
                </Offcanvas.Body>
            </Offcanvas>
        </>
    );
}

export default GameNavigation