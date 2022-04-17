// const fireConfig = require( "../config/db/firestore.json" );
import fireConfig from '../config/db/firestore.json';

import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

// initialize firebase
try
{
    firebase.initializeApp( fireConfig );

} catch ( error )
{
    // skip error cuz an app already exist
    if ( !/already exists/.test( error.message ) )
    {
        console.log( "Firebase initialization Error", error.stack );
    }
}

const firestore = firebase.firestore();
const fireauth = firebase.auth();

const arrayUnion = firebase.firestore.FieldValue.arrayUnion;
// if ( typeof window !== 'undefined' && firebase.apps.length )
// {
//     fireauth.setPersistence( firebase.auth.Auth.Persistence.SESSION );
// }
export
{
    firestore,
    fireauth,
    arrayUnion,
    firebase
};