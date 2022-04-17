import { fireauth, firestore } from "../../../util/db-admin";


export default async function handler( req, res )
{
    let { id: userId, useUid } = req.query;

    if ( useUid !== undefined ) useUid = true;

    if ( req.method === "DELETE" )
        fireauth
            .deleteUser( userId )
            .then( () =>
            {
                res.status( 200 ).json( { message: "Successfully deleted user" } );
            } )
            .catch( ( error ) =>
            {
                res.status( 400 ).json( { message: 'Error deleting user:' + error } );
            } );

    else if ( req.method === "GET" )
    {
        const user = await ( await firestore.collection( 'users' ).doc( userId ).get() ).data();

        res.status( 200 ).json( user );
    }
    else
    {
        res.status( 500 );
        res.end();
    }
}