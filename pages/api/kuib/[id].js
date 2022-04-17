import { firestore } from "../../../util/db-admin";

export default async function handler( req, res )
{
    const { id } = req.query;
    if ( req.method === "GET" )
    {

        const kuib = await getKuib( id );
        const creator = await getUser( kuib.creator );
        // const questions = await getQuestions( id );

        // console.log( questions );
        kuib.creatorData = creator;
        // kuib.questions = questions;



        res.status( 200 ).json( kuib );
    }
    else
    {
        res.status( 500 ).json( {
            message: 'fuck u'
        } );
    }
}

async function getKuib( id )
{
    return await ( await firestore.collection( "kuib" ).doc( id ).get() ).data();
}

async function getUser( id )
{
    return await ( await firestore.collection( 'users' ).doc( id ).get() ).data();
}

async function getQuestions( kuibId )
{
    const questions = await firestore.collection( 'kuib' ).doc( kuibId ).collection( 'questions' ).get();

    if ( !questions.empty )
    {
        const formattedQuestions = questions.docs.map( question => question.data() );

        return formattedQuestions;
    }
    else
        return undefined;

}