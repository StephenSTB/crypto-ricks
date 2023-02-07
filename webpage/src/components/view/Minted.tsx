import { useEffect, useState } from "react"
import { IPFSHTTPClient } from "ipfs-http-client";
import { IPFSEntry } from "ipfs-core-types/dist/src/root";
import { ViewData, Metadata } from "../../interfaces/Interfaces";
import { useNavigate } from "react-router";
import all from "it-all"
import { concat } from "uint8arrays/concat"
import { CID } from "multiformats/cid"
import "../../App.css"
import "./View.css"

interface MintedProps{
    connected: boolean
    ricks: any;
    ipfs: IPFSHTTPClient;
    metadataFiles: Array<IPFSEntry>
    minted: string
}


export const Minted = (props: MintedProps) =>{

    const [state, setState] = useState({init: true, minted: "",  viewdata : [] as Array<ViewData>})

    const navigate = useNavigate()

    const init = async () =>{
        if(props.connected){
            try{
                let minted = props.minted
                let viewdata = [] as Array<ViewData>
                let ipfs = props.ipfs
                let metadataFiles = props.metadataFiles
                for(let i = 0 ; i < Number(minted); i++){
                    let data = await concat(await all(ipfs.cat(metadataFiles[i].cid)))
                    let metadata = JSON.parse(new TextDecoder().decode(data).toString()) as Metadata;
                    let image = await all(ipfs.cat(CID.parse(metadata.image.replace("ipfs://","")), {timeout: 2000}));
                    let imageURL = URL.createObjectURL(new Blob(image, {type: "image/png"}))
                    let id = metadata.id
                    let view = {imageURL, id}
                    //console.log(view)
                    viewdata.push(view)
                }
    
                setState({init: false, viewdata, minted})
            }
            catch(e){
                console.log(e)
            }
        }
       
    }
    const update = () =>{
        if(props.minted !== state.minted){
            
            init();
        }
    }

    useEffect(() =>{
        if(state.init){
            init()
        }
        else{
            //console.log("minted-update")
            update()
        }
    }, [props.minted, props.connected])

    return <>
                {!props.connected && <div className="error">Connect Walllet to View NFTs</div> }
                {state.minted !== "" && <h4 id="view-title">Ricks That Have Been Minted</h4>}
                <div className="view-nft-container">
                {
                    state.viewdata.map((d, index) =>{
                        return  <div className="small-nft-container" key={d.imageURL + index}>
                                    <img src={d.imageURL} className="small-nft" onClick={() =>navigate(`/view/${d.id}`)} />
                                </div>
                    })
                }
                </div>
            </>
            
}