import { firestore } from '../../../../util/db-admin';

export default async function handler( req, res )
{
    if ( req.method === 'GET' )
    {
        const { id } = req.query;
        const gameRef = firestore.collection( 'games' );
        const kuibRef = firestore.collection( 'kuib' );

        const gameDoc = await gameRef.doc( id ).get();

        if ( gameDoc.exists )
        {
            const { kid, ...gameData } = gameDoc.data();
            const kuibData = await ( await kuibRef.doc( kid ).get() ).data();

            gameData.kid = kid;
            gameData.kuibData = kuibData;
            gameData.ref = gameDoc.ref;

            // console.log( gameData );

            res.status( 200 ).json( gameData );
        }
        else
        {
            res.status( 400 ).json( {
                message: 'Cant find shit'
            } );
        }
    }
    else
    {
        res.status( 500 ).json( {
            'message': 'bruh'
        } );
    }
}