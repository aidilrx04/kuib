// imitate implementation  from the https://colinhacks.com/essays/nextjs-firebase-authentication

// TODO: implement consistent user data

import React, { createContext, useReducer, useEffect, useContext } from 'react';
import { fireauth, firestore, firebase } from '../util/db';
import nookies, { parseCookies } from 'nookies';
import { User } from '../util/types';
import isEqual from 'lodash.isequal'

enum UserActionTypes {
    SET_USER = "SET_USER",
    SET_USER_DATA = 'SET_USER_DATA',
    SET_LOADING = "SET_LOADING"
}
interface UserAction {
    payload: any,
    type: UserActionTypes
}



interface UserStateTypes {
    isSignedIn: boolean,
    user: firebase.User,
    userData: User,
    loading: boolean
}



const initialState: UserStateTypes = {
    isSignedIn: false,
    user: null,
    userData: null,
    loading: true
};

function reducer(state: UserStateTypes, action: UserAction) {
    switch (action.type) {
        case UserActionTypes.SET_USER:
            return {
                ...state, user: action.payload
            };
        case UserActionTypes.SET_USER_DATA:
            return {
                ...state,
                userData: action.payload,
            };

        case UserActionTypes.SET_LOADING:
            return {
                ...state,
                loading: action.payload
            }
        default: return state;
    }
}


const AuthContext = createContext<UserStateTypes>(null);


function AuthProvider({ children }) {
    const [user, dispatch] = useReducer(reducer, initialState);
    // useEffect(() => {
    //     console.log(user.userData);
    // }, [user.userData]);

    useEffect(() => {
        const unsubscribeTokenChange = fireauth.onIdTokenChanged(async (authUser) => {
            if (!authUser) {
                dispatch({ type: UserActionTypes.SET_USER, payload: null });
                dispatch({ type: UserActionTypes.SET_USER_DATA, payload: null });
                dispatch({ type: UserActionTypes.SET_LOADING, payload: false })
                nookies.set(undefined, 'user-data', '', { path: '/' });
                nookies.set(undefined, 'token', '', { path: '/' });
            }
            else {
                const token = await authUser.getIdToken();
                const cookies = parseCookies();
                const uid = authUser.uid;

                dispatch({ type: UserActionTypes.SET_USER, payload: authUser });
                nookies.set(undefined, 'token', token, { path: '/' }); // reset auth token

                if (typeof cookies['user-data'] !== 'undefined' && cookies['user-data'] !== '') {
                    const parsed = JSON.parse(cookies['user-data']) ?? null;
                    if (parsed?.uid === uid)
                        dispatch({
                            type: UserActionTypes.SET_USER_DATA,
                            payload: parsed
                        })
                    else {
                        dispatch({
                            type: UserActionTypes.SET_LOADING,
                            payload: true
                        })
                    }
                }
                else {
                    dispatch({
                        type: UserActionTypes.SET_LOADING,
                        payload: true
                    })
                }

                // attach listener to user data
                const doc = await firestore.collection("users").where("uid", "==", uid).get();
                if (!doc.empty) {
                    const docId = await doc.docs[0].data().id;
                    firestore.collection("users").doc(docId).onSnapshot((doc) => {
                        const userData = doc.data()

                        nookies.set(undefined, 'user-data', JSON.stringify(userData), { path: '/' });

                        // if data is exists on token
                        if (user.userData) {
                            if (!isEqual(user.userData, userData)) {
                                dispatch({
                                    type: UserActionTypes.SET_USER_DATA,
                                    payload: userData
                                });
                            }
                            dispatch({
                                type: UserActionTypes.SET_LOADING,
                                payload: false
                            });
                        }
                        else {
                            dispatch({
                                type: UserActionTypes.SET_USER_DATA,
                                payload: userData
                            });
                            dispatch({
                                type: UserActionTypes.SET_LOADING,
                                payload: false
                            });
                        }
                    });
                }
            }
        });

        return () => {
            unsubscribeTokenChange()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <AuthContext.Provider value={{ ...user }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}

export default AuthProvider;