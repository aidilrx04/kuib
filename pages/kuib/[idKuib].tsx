import axios from 'axios';
import React from 'react';
import GamesList from '../../components/GamesList';
import KuibDetail from '../../components/KuibDetail';
import server from '../../config/server';



function Kuib({ valid, kuib, games }) {
    if (!valid) return "Not found mf";

    return (
        <>
            <KuibDetail kuib={kuib} />
            <GamesList games={games} title={`Public Games`} />
        </>
    );
}

export async function getServerSideProps(ctx) {
    const { idKuib } = ctx.params;

    try {
        const kuib = await axios.get(`${server}/api/kuib/${idKuib}`);
        let games = [];
        // const games = await axios.get(`${server}/api/game/?idKuib=${kuib.data.id}`);
        try {
            const gamesReq = await axios.get(`${server}/api/game/?idKuib=${kuib.data.id}`);
            if (gamesReq) {
                games = gamesReq.data
            }

        } catch (e) { }

        console.log('hey')

        if (kuib.status === 200) {
            return {
                props: {
                    valid: true,
                    kuib: kuib.data,
                    games: games
                }
            };
        }
        else {
            return {
                props: {
                    valid: false
                }
            };
        }
    }
    catch (e) {
        console.log('hey')
        return {
            props: {
                valid: false
            }
        };
    }
}

export default Kuib;