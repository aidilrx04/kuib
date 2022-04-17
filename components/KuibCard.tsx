import Link from 'next/link'
import React from 'react'
import FAI from './FAI'
import { KuibWCreatorData } from '../util/types'
import { Card } from 'react-bootstrap'

// style={{ maxWidth: '40%', minWidth: '200px', 'flex': '100%' }}
function KuibCard({ kuib }: { kuib: KuibWCreatorData }) {
    return (
        <Card className='m-2' style={{ width: '18em' }} >
            <Card.Header className='fw-bold fs-5 bg-white'>
                <Link href={`/kuib/${kuib.id}`} passHref>
                    <a className="
                      text-decoration-none text-danger text-opacity-75 d-block
                     "
                    >{kuib.title}</a>
                </Link>
            </Card.Header>
            <Card.Footer className=' d-flex justify-content-between bg-white'>
                <span className="user text-success">
                    <FAI icon={`user`} />
                    &nbsp;
                    {kuib.creatorData.username}
                </span>

                <span className='text-info'>
                    <FAI icon={'question'} />
                    &nbsp;
                    {kuib.questions.length}
                </span>
            </Card.Footer>
        </Card >
    )
}

//<div key={kuib.id} className="card m-2" style={{ width: '18em' }} >
//            <div className="
//                    card-header 
//                    fw-bold fs-5 
//                   bg-white
//                  "
//        >
//          <Link href={`/kuib/${kuib.id}`} passHref>
//            <a className="
//                        text-decoration-none text-danger text-opacity-75 d-block
//                      "
//                >{kuib.title}</a>
//          </Link>
//    </div>
//  {/* <div className="card-body">
//    <p className="card-text">
//      Ayy yo... Whats up bro :)
//                </p>
//          </div> */}
//        <div className="
//          card-footer 
//        d-flex justify-content-between
//      bg-whitew
//                "
//          >
//            <span className="user text-success">
//              <FAI icon={`user`} />
//            &nbsp;
//          {kuib.creatorData.username}
//    </span>
//
//              <span className='text-info'>
//                <FAI icon={'question'} />
//              &nbsp;
//            {kuib.questions.length}
//      </span>
//            </div>
//      </div>

export default KuibCard