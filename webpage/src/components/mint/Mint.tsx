
import { useEffect, useState } from "react"
import all from "it-all"
import { CID } from "multiformats/cid"
import { IPFSHTTPClient } from "ipfs-http-client"
import { IPFSEntry } from "ipfs-core-types/dist/src/root";
import "../../App.css"
import "./Mint.css"
import rickImage1 from "../../images/bafkreiajvd65slcpt77wprbnsrpnmlz4xmrj3znjpbosi34jhqjvc62upq.png";
import rickImage2 from "../../images/bafkreibnmx3mw2akhenbkmd3rzmlbdjwkpav2bpow746cxkusg7nxqeogy.png";
import rickImage3 from "../../images/bafkreibo225sck5kod6hjao5hajskj26pqijyi2xfdfwnhp65tgdockbra.png";
import { useNavigate } from "react-router";
import Web3 from "web3";

const images = importAll(require.context('../../images', false, /\.png$/))
function importAll(r: any) {
    return r.keys().map(r);
  }

interface MintProps{
    connected: boolean
    ricks: any;
    account: string;
    baseURI: string;
    mintValue: string;
    maxSupply: string;
    minted: string;
    ipfs: IPFSHTTPClient;
    cid: CID;
    metadataFiles: Array<IPFSEntry>;
    imageFiles: Array<IPFSEntry>;
    updateState(update: any) : void
}



export const Mint = (props: MintProps) =>{

    const [state, setState] = useState({init: true, active: 0, count: 0, 
                                        connected: false, ricks: "" as any, baseURI: "", maxSupply: "", mintValue: "", minted: "", 
                                        ipfs: {} as IPFSHTTPClient, cid: {} as CID, images: images as Array<string>,
                                        error: "" });
    const navigate = useNavigate();

    const init = async () =>{
        
        setState(() =>({...state, init: false, connected: props.connected, baseURI: props.baseURI, maxSupply:props.maxSupply, minted: props.minted, mintValue: props.mintValue}))
        animateImages()
    }

    const animateImages = () =>{
        
        const animate = window.setInterval(()=>{
            let count = state.count++
            //console.log(count)
            //console.log(state.images)
            let active = (count % 6);
        
            setState(state => ({...state, init: false, active, count}))
        }, 5000)
        return () =>{
            window.clearInterval(animate)
        }
    }

    const getImages = async (ipfs: IPFSHTTPClient) =>{
        let imageFiles = props.imageFiles

        let imageNums = [] as Array<number>
        console.log(imageFiles)
        let images = [] as Array<string>
        console.log(imageFiles.length)
        for(let i = 0; i < 6; i){
            let rand = Math.floor( (imageFiles.length -1 ) * Math.random())
            if(!imageNums.includes(rand))
                imageNums.push(rand)
            else
                continue;
            
            let image = await all(ipfs.cat(imageFiles[rand].cid, {timeout: 2000}))
            let imageURL = URL.createObjectURL(new Blob(image, {type: "image/png"}))
            images.push(imageURL)
            i++;
        }
        
        //console.log(images)

        return images
    }

    const update = async () =>{
        //console.log("update")
        if(props.connected !== state.connected){
            console.log("mint update")
            let images = await getImages(props.ipfs)
            setState(() =>({...state, connected: props.connected, baseURI: props.baseURI, maxSupply: props.maxSupply, minted: props.minted, mintValue: props.mintValue, ipfs: props.ipfs, cid: props.cid, images, error: "" }))
        }
    }

    useEffect(() =>{
        if(state.init){
            init();
        }
        else{
            //console.log(state.images)
            update();
        }
    },[props, state.images])

    const mint = async () =>
    {
        if(!state.connected){
            setState({...state, error: "Connect Wallet to Mint a Rick."})
            return
        }
        console.log("mint")
        let mint = await props.ricks.mint(props.account, {from: props.account, value: Web3.utils.toWei(state.mintValue)});
        console.log(mint.logs[0].args["tokenId"].toString())

        props.updateState({minted: (Number(state.minted) + 1).toString()})
        navigate(`/view/${mint.logs[0].args["tokenId"].toString()}`);
    }

    return <div className="main">
                <div id="mint-prompt">Mint a verifiably unique piece of crypto art!</div>
                <div className="error">{state.error}</div>
                <div className="main-image-container">
                    {
                        state.images.map((image, index) =>{
                            return <img src={image} className={`nft-image  ${index === state.active ? 'active' : ''}`}  key={image.toString() + index.toString()}/>
                        })
                    }
                </div>
                {
                    state.connected && <>
                        <div id="mint-info">
                            <div id="mint-remaining">Minted: {state.minted}/ {state.maxSupply}</div>
                            <div id="mint-value">Price: {state.mintValue} Ether</div>
                        </div>
                        
                    </>
                }

                <button className="rick-button" id="mint-button" onClick={() => mint()}>Mint</button>
                
            </div>
}