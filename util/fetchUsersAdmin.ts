import { firestore } from "./db-admin";
import { User } from "./types";


export async function fetchUsersAdmin(uids: string[]) {
    const users: User[] = [];
    for (let i = 0; i < uids.length; i++) {
        const user = await fetchUserAdmin(uids[i]);

        users.push(user as User);
    }

    return users;
}

export async function fetchUserAdmin(uid: string) {
    const user = await firestore.collection('users').doc(uid).get();
    if (user.exists)
        return user.data() as User;
    else return null;
}