import { firestore, serverTimestamp } from "../../../util/db-admin";

export default async function handler( req, res )
{
    const { kid, uid, type } = req.body;


    if ( req.method === 'POST' )
    {
        if ( kid )
        {
            const gameRef = firestore.collection( 'games' );
            const gameId = gameRef.doc().id;
            const _type = type ?? 'SINGLE';

            const gameDoc = await gameRef.doc( gameId ).set( {
                id: gameId,
                creator: uid,
                kid,
                type: _type,
                result: [],
                createdAt: serverTimestamp(),
                code: generateUniqueCode(),
                status: 'WAITING'
            } );

            if ( gameDoc )


                res.status( 200 ).send( {
                    gameId
                } );
        }
        else
            res.status( 400 ).json( {
                message: 'Invalid id'
            } );
    }
    else
        res.status( '500' ).end();
}

function generateUniqueCode()
{
    const digits = '0123456789'.split( '' );
    let code = '';

    for ( let i = 0; i < 6; i++ )
    {
        code += digits[ Math.floor( Math.random() * digits.length ) ];
    }

    return code;

}