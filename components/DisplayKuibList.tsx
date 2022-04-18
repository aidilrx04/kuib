/* eslint-disable @next/next/link-passhref */
import Link from "next/link";
import { Kuib, KuibWCreatorData } from "../util/types";
import KuibCard from "./KuibCard";


type DisplayKuibListPropTypes = {
    kuib: KuibWCreatorData[]
}

function DisplayKuibList({ kuib: kuibList }: DisplayKuibListPropTypes) {
    return (
        <div
            className="
            kuib-list 
            card
            container 
            d-flex flex-row flex-wrap
            justify-content-start
            align-items-start"
            style={{
                minHeight: '70vh'
            }}
        >
            {kuibList.map((kuib) => (
                <KuibCard key={kuib.id} kuib={kuib} />
            ))}
        </div>
    );
}


export default DisplayKuibList