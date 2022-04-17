import React from 'react'
import { FontAwesomeIcon, FontAwesomeIconProps } from '@fortawesome/react-fontawesome'


// short form of Font Awesome Icon

function FAI(props: FontAwesomeIconProps) {
    return (
        <FontAwesomeIcon {...props} />
    )
}

export default FAI