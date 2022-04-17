import { fireauth, firestore } from "../../../util/db-admin";
import { fetchUserAdmin } from '../../../util/fetchUsersAdmin';
import { Kuib } from "../../../util/types";


export default async function handler(req, res) {

    const kuibRef = firestore.collection("kuib");

    switch (req.method) {
        case 'GET': {
            const kuib = await kuibRef.get();
            let kuibList = [];

            if (!kuib.empty) {
                kuibList = kuib.docs.map((doc) => doc.data());

                for (let i = 0; i < kuibList.length; i++) {
                    const user = await fetchUserAdmin(kuibList[i].creator);
                    kuibList[i]['creatorData'] = user;
                }

                res.status(200).json(kuibList);

            }

            break;
        }
        case 'POST': {
            {
                const { idToken, ...kuib } = req.body;


                // console.log( idToken );

                fireauth.verifyIdToken(idToken)
                    .then(decodedToken => {
                        const kuibId = kuibRef.doc().id;

                        kuibRef.doc(kuibId)
                            .set({
                                id: kuibId,
                                creator: kuib.creator,
                                title: kuib.title
                            }).then(() => {
                                // console.log( success );
                                // start upload questions
                                const questionsRef = kuibRef.doc(kuibId).collection('questions');
                                const fQuestions = kuib.questions.map(q => {
                                    const qid = kuibRef.doc().id;
                                    const caid = kuibRef.doc().id;
                                    return {
                                        text: q.text,
                                        id: qid,
                                        answers: q.answers.map(a => {
                                            console.log(a)
                                            const aid = kuibRef.doc().id;
                                            return {
                                                id: a.isCorrect ? caid : aid,
                                                text: a.text
                                            };
                                        }),
                                        correctAnswerId: caid
                                    };
                                });
                                kuibRef.doc(kuibId).update({
                                    questions: fQuestions
                                }).then(() => {
                                    res.status(200).json({
                                        kuibId
                                    });
                                })
                                    .catch(err => console.log(err));


                                // } );
                            })
                            .catch(err => {
                                res.status(400).json("FAILED to submit the kuib");
                                console.log(err);
                            });

                    })
                    .catch(error => {
                        res.status(403).json("Invalid token");
                        console.log(error);
                    });

            }

            break;

        }

        default: res.status(400).end();
    }

}

 // kuib.questions.forEach( ( question, questionIndex ) =>
                                // {
                                //     const questionId = questionsRef.doc().id;
                                //     const correctAnswerId = questionsRef.doc( questionId ).collection( "answers" ).doc().id;
                                //     questionsRef.doc( questionId ).set( {
                                //         id: questionId,
                                //         correctAnswerId,
                                //         text: question.text
                                //     } )
                                //         .then( () =>
                                //         {
                                //             // start upload answers
                                //             const answersRef = questionsRef.doc( questionId ).collection( "answers" );
                                //             question.answers.forEach( ( answer, answerIndex ) =>
                                //             {
                                //                 let answerId = answersRef.doc().id;
                                //                 if ( answer.isCorrect )
                                //                     answerId = correctAnswerId;

                                //                 answersRef.doc( answerId )
                                //                     .set( {
                                //                         text: answer.text
                                //                     } )
                                //                     .then( () =>
                                //                     {
                                //                         if ( kuib.questions.length - 1 === questionIndex && question.answers.length - 1 === answerIndex )
                                //                         {
                                //                             // send back response
                                //                             res.status( 200 ).json( {
                                //                                 kuibId: kuibId
                                //                             } );
                                //                         }
                                //                     } )
                                //                     .catch( err =>
                                //                     {
                                //                         console.log( "ERRO OCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCURED", err );
                                //                         res.status( 400 ).json( "FAILED to submit an answer" );
                                //                     } );

                                //             } );

                                //         } )
                                //         .catch( err =>
                                //         {
                                //             console.log( "ERROR OCCCCCCCCURED: ", err );
                                //             res.status( 400 ).json( "FAILED to submit a question" );
                                //         } );