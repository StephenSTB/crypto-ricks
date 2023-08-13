import { useEffect, useState } from "react"
//import { IPFSEntry } from "ipfs-core-types/dist/src/root";
import { ViewData, Metadata, OriginalMetadata } from "../../interfaces/Interfaces";
import { useNavigate } from "react-router";
//import all from "it-all"
//import { concat } from "uint8arrays/concat"
//import { CID } from "multiformats/cid"
//import { HeliaIPFS } from '@sb-labs/web3-data/networks/IpfsConnect.js'
import "../../App.css"
import "./View.css"

interface OwnedProps{
    connected: boolean
    ricks: any;
    //ipfs: HeliaIPFS;
    metadata: Array<Metadata | OriginalMetadata>;
    images: Array<string>;
    account: string;
    error: string;
    copywrite: any;
}

export const Owned = (props: OwnedProps) =>{
    const [state, setState] = useState({ connected: false, account: "", ownerIndex: 0, viewdata : [] as Array<ViewData>})

    const navigate = useNavigate()

    useEffect(() =>{
        const retreive = async () =>{
            try{
                let viewdata = [] as Array<ViewData>
                //let ipfs = props.ipfs
                let metadata = props.metadata;
                let account = props.account;
                let ricks = props.ricks;
                let ownerIndex = Number((await ricks.balanceOf(account)).toString());
                
                for(let i = 0; i < ownerIndex; i++){
                    let tokenId = (await ricks.tokenOfOwnerByIndex(account, i)).toNumber()
                    //let data = await concat(await all(ipfs.fs.cat(metadataFiles[tokenId].cid)))
                    let data =  metadata[tokenId]//JSON.parse(new TextDecoder().decode(data).toString()) as Metadata;
                    //let image = await all(ipfs.fs.cat(CID.parse(metadata.image.replace("ipfs://",""))));
                    let imageURL = props.images[tokenId]//URL.createObjectURL(new Blob(image, {type: "image/png"}))
                    let id = data.id;
                    let percentage = data.attributes[data.attributes.length - 1].value
                    let view = {imageURL, id, percentage} as ViewData
                    //console.log(view)
                    viewdata.push(view)
                }
                setState({ connected: true, account, ownerIndex, viewdata })
            }
            catch(e){
                console.log(e)
            }
        }
        const ownerIndex = async () =>{
            let ownerIndex = Number((await props.ricks.balanceOf(props.account)).toString());
            if(ownerIndex !== state.ownerIndex){
                retreive()
            }
        }
        if( (props.connected && !state.connected) || (props.account !== state.account) ){
            retreive()
        }else if(state.connected){
            ownerIndex()
        }
    }, [props, state.account, state.connected, state.ownerIndex])

    return  <>
                {!props.connected && <div className="error"><h4>Connect Walllet to View NFTs!</h4></div> }
                <div className="error"><h4>{props.error}</h4></div>
                {state.account !== "" && <h3 id="view-title">Ricks You Own</h3>}
                <div className="view-nft-container"> 
                {
                    state.viewdata.map((d, index) =>{
                        return  <div className="small-nft-container" key={d.imageURL + index}>
                                    <div className="small-nft">
                                        <img src={d.imageURL} className="small-nft-image" onClick={() =>navigate(`/view/${d.id}`)} alt=""/>
                                        <div className="small-nft-id">{d.id}</div>
                                        <div className="small-nft-percentage">{d.percentage}</div>
                                    </div>
                                </div>
                    })
                }
                </div>
                {/*props.copywrite*/}
            </>
    
}