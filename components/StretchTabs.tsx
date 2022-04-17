import { Tab, Nav } from "react-bootstrap";
import { v4 } from 'uuid'
import { TabContainerProps } from 'react-bootstrap'


export default function StretchTabs({ children, ...rest }: TabContainerProps) {
    // console.log(children)
    const _children = (Array.isArray(children) ? children : [children]);
    return (

        <Tab.Container id="left-tabs-example" defaultActiveKey={_children[0] ? _children[0].props.eventKey : ''} {...rest}>
            <Nav as={'ul'} variant="tabs" fill className='px-2'>
                {/* <Nav.Item className='flex-stretch'>
                    <Nav.Link eventKey="first">Tab 1</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="second">Tab 2</Nav.Link>
                </Nav.Item> */}

                {
                    _children.map((child) => {
                        const props = child.props
                        return (
                            <Nav.Item as='li' key={props.eventKey}>
                                <Nav.Link eventKey={props.eventKey} as='button'>
                                    {props.title}
                                </Nav.Link>
                            </Nav.Item>
                        )
                    })
                }
            </Nav>
            <Tab.Content>
                {
                    _children.map((child) => {
                        return (
                            <Tab.Pane key={child.props.eventkey ?? v4()} {...child.props} className='px-3 py-2'>
                                {child.props.children}
                            </Tab.Pane>
                        )
                    })
                }
                {/* {children} */}
                {/* <Tab eventKey="ada" title="Home">
                    adasd
                </Tab>
                <Tab.Pane eventKey="first">
                    abc
                </Tab.Pane>
                <Tab.Pane eventKey="second">
                    dce
                </Tab.Pane> */}
            </Tab.Content>
        </Tab.Container>
    )
}

