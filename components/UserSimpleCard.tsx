import React from 'react'
import { User } from '../util/types'
import FAI from './FAI'

interface UserSimpleCardPropTypes extends React.HTMLAttributes<HTMLElement> {
    user: User,
    highlight?: boolean,
    hlColor?: string
    [key: string]: any
}

function UserSimpleCard({ user, highlight, hlColor = '#3da4ab', ...props }: UserSimpleCardPropTypes) {
    const defaultColor = '#0e9aa7'
    return (
        user && <div className={`
        m-2
        p-2 px-4 
        border rounded ${highlight ? 'border-3 border-primary fw-bold btn-outline-primary' : 'border-2 border-dark'}
        bg-secondary text-light`}
            style={{ maxWidth: 'max-content', transition: '* .25s linear', ...props.style }}
            {...props}>
            <FAI icon={'user'} size="1x" className='me-2' />
            {user.username}
        </div>
    )
}

export default UserSimpleCard