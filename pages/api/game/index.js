import { firestore } from "../../../util/db-admin";

export default async function handler( req, res )
{
    switch ( req.method )
    {
        case 'GET': {
            const { idKuib } = req.query;

            let r = firestore.collection( 'games' );

            if ( idKuib )
                r = r.where( 'kid', '==', idKuib );

            const gameList = await r.get();

            if ( !gameList.empty )
            {
                const fgl = gameList.docs.map( doc => doc.data() );

                // console.log( fgl );
                res.status( 200 ).json( fgl );
            }
            else
            {
                res.status( 404 ).json( { message: 'NOT FOUND' } );
            }

            break;
        }

        default: res.status( 400 ).json( {} );
    }
}