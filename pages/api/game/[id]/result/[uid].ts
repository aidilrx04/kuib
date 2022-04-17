import { NextApiRequest, NextApiResponse } from "next";
import { firestore } from "../../../../../util/db-admin";
import { fetchUserAdmin } from "../../../../../util/fetchUsersAdmin";
import { Game } from '../../../../../util/types'
enum V {
    GET = "GET",
    POST = "POST"
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id, uid } = req.query
    console.log(req.method)
    switch (req.method) {
        case V.GET: {

            const gameDoc = await getGameData(id);

            if (gameDoc) {
                const usi = gameDoc.result.map(e => e.id).indexOf(uid as string)
                if (usi >= 0) {
                    const user = gameDoc.result[usi];
                    const userData = await fetchUserAdmin(uid as string);
                    let u = {}

                    if (userData)
                        u = userData;

                    res.status(200).json({
                        ...user,
                        ...u
                    })
                }
                else {
                    res.status(404).json({
                        message: "USER NOT FOUND!"
                    })
                }
            }
            break;
        }
        default:
            res.status(500).json({
                message: "OI"
            })
    }
}

export async function getGameData(gid) {
    const gameReq = await firestore.collection('games').doc(gid).get();

    if (gameReq.exists)
        return gameReq.data() as Game;
    else return null
}