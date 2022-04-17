import { firestore } from "./db";
import { User } from "./types";

async function fetchUsers(uids: string[], prev: User[] = null) {
    const users = prev ?? [];
    const fuids = users.map(u => u.id);

    for (let i = 0; i < uids.length; i++) {
        // if ( typeof users[ uids[ i ] ] === 'undefined' )
        if (fuids.indexOf(uids[i]) < 0) {
            const user = await fetchUser(uids[i]);
            users.push(user);
        }
    }

    return users;
}
async function fetchUser(uid: string): Promise<User | null> {
    const user = await firestore.collection('users').doc(uid).get();

    if (user.exists)
        return user.data() as User;
    else
        return null;
}
export {
    fetchUsers,
    fetchUser
};