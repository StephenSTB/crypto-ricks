
import { useEffect, useState } from "react"
//import all from "it-all"
//import { CID } from "multiformats/cid"
//import { IPFSEntry } from "ipfs-core-types/dist/src/root";
import "../../App.css"
import "./Mint.css"
import { useNavigate } from "react-router";
import Web3 from "web3";
//import { HeliaIPFS } from '@sb-labs/web3-data/networks/IpfsConnect.js'
//import { Metadata, OriginalMetadata } from "../../interfaces/Interfaces";

const default_images = importAll(require.context('../../images/default', false, /\.png$/)) as Array<string>
function importAll(r: any) {
    return r.keys().map(r);
}

  //console.log(images.length)

interface MintProps{
    connected: boolean
    ricks: any;
    account: string;
    asset: string;
    baseURI: string;
    mintValue: number;
    maxSupply: number;
    minted: number;
    //ipfs: HeliaIPFS;
    //cid: CID;
    //metadata: Array<Metadata | OriginalMetadata>;
    images: Array<string>;
    error: string;
    copywrite: any
    updateState(update: any) : void
}

export const Mint = (props: MintProps) =>{
    const [state, setState] = useState({connected: false, images: default_images})
    const [active, setActive] = useState(0);
    const [error, setError] = useState("")

    const navigate = useNavigate();

    useEffect(() =>{
        const animate = window.setInterval(()=>{
            
            setActive(active => (active + 1) % 10);
            //console.log(active)
            //setState(state => ({...state, init: false, active, count}))
        }, 5000)
        return () =>{
            window.clearInterval(animate)
        }
    }, [])

    useEffect(() =>{
        //console.log("mint", props)
        const getImages = async () =>{
            //let ipfs = props.ipfs
            let imageURLs = props.images
    
            let imageNums = [] as Array<number>
            let images = [] as Array<string>
            //console.log(imageURLs.length)
            
            for(let i = 0; i < 10; i){
                let rand = Math.floor( (imageURLs.length) * Math.random())

                if(!imageNums.includes(rand))
                    imageNums.push(rand)
                else
                {
                    continue;
                }
                //let image =  await (await fetch(images[rand])).arrayBuffer()//await all(ipfs.fs.cat(imageFiles[rand].cid))
                //console.log(image)
                //let imageURL = URL.createObjectURL(new Blob(image, {type: "image/png"}))
                //console.log(imageURLs[rand])
                images.push(imageURLs[rand])
                i++;
            }
            //console.log(images)
            setState({connected: true, images})
        }

        if(props.connected && !state.connected){
            
            getImages()
        }
        
    },[props, state])

    const mint = async () =>
    {
        if(!props.connected){
            setError("Connect Wallet to Mint a Rick.")
            return
        }
        //console.log("mint")
        let mint = await props.ricks.mint(props.account, {from: props.account, value: Web3.utils.toWei(props.mintValue.toString(), "ether")});
        //console.log(mint.logs[0].args["tokenId"].toString())

        props.updateState((Number(props.minted) + 1))
        navigate(`/view/${mint.logs[0].args["tokenId"].toString()}`);
    }

    return <div className="main mint">
                <div id="mint-prompt">Mint a verifiably unique piece of crypto art!</div>
                <div className="error"><h4>{error}{props.error}</h4></div>
                <div id="mint-container">
                    <div className="main-image-container">
                        {
                            state.images.map((image, index) =>{
                                return <img src={image} className={`nft-image  ${index === active ? 'active' : ''}`}  key={image.toString() + index.toString()} alt=""/>
                            })
                        }
                    </div>
                    <div id="mint-info">
                        {
                            (props.connected ? props.minted === props.maxSupply ? false : true : false)  &&  
                            <>
                                
                                    <div id="mint-text">
                                        <div id="mint-remaining">Minted: {props.minted} of {props.maxSupply}</div>
                                        <div id="mint-value">Price: {props.mintValue} {props.asset}</div>
                                    </div>
                            </>
                        }
                        {
                            (props.connected ? props.minted === props.maxSupply ? true : false : false) &&
                            <>
                                <div id="mint-text">
                                        All Ricks have been minted!
                                </div>
                            </>

                        }
                        {
                            <button className="rick-button" id="mint-button" disabled={state.connected ? props.minted === props.maxSupply ? true : false : false} onClick={() => mint()}>Mint</button>
                        }
                    </div>
                </div>
                {/*props.copywrite*/}
            </div>
}