import { IPFSHTTPClient } from "ipfs-http-client"
import { useEffect, useState } from "react"
import { useParams } from "react-router"
import { IPFSEntry } from "ipfs-core-types/dist/src/root";
import all from "it-all";
import { concat } from "uint8arrays/concat"
import { Meta, Metadata } from "../../interfaces/Interfaces";
import { CID } from "multiformats/cid"
import Web3 from "web3";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256/dist/keccak256.js"
import * as Block from "multiformats/block"
import * as json from 'multiformats/codecs/json';
import { sha256 } from 'multiformats/hashes/sha2';
import "../../App.css"
import "./View.css"

interface NFTProps{
    connected: boolean;
    ipfs: IPFSHTTPClient;
    ricks: any;
    metadataFiles : Array<IPFSEntry>;
    minted: string;
    account: string;
}

export const NFT = (props: NFTProps) =>{

    const [state, setState] = useState({init: true, connected: false, imageURL: "", error: "", metadata: {} as Metadata, owner: "", mint: true, verified: false})

    let {tokenId} = useParams()

    const init = async () =>{
        if(props.connected){
            if(Number.isNaN(tokenId) || Number(tokenId) < 0 || Number(tokenId) > 999){
                setState({...state, error: "Invalid Token ID Given."})
                return;
            }
            
            try{
                let ipfs = props.ipfs;
                let metadataFiles = props.metadataFiles;
                let ricks = props.ricks;
                //console.log(metadataFiles)
                //console.log(tokenId)
                let file = metadataFiles[Number(tokenId)]
                console.log(file)
                let data = concat(await all(await ipfs.cat(file.cid)))
                let metadata = JSON.parse(new TextDecoder().decode(data).toString()) as Metadata;
                //console.log(metadata)
                let image = await all(ipfs.cat(CID.parse(metadata.image.replace("ipfs://","")), {timeout: 2000}));
                let imageURL = URL.createObjectURL(new Blob(image, {type: "image/png"}))
                let mint = true;
                let owner = ""
                try{
                    owner = await ricks.ownerOf(metadata.id);
                    console.log(owner)
                }catch{
                    console.log("no owner for nft")
                    mint = false
                }
                let metafile = metadataFiles[metadataFiles.length-1];
                data = concat(await all(await ipfs.cat(metafile.cid)))
                let meta = JSON.parse(new TextDecoder().decode(data).toString()) as Meta
                console.log(meta)
                let block = await Block.encode({value: metadata, codec: json, hasher: sha256})
                console.log(block.cid.toString(), file.cid)
                let leaf = Web3.utils.soliditySha3(block.cid.toString(), metadata.vrf_message_hex, metadata.vrf_proof)
                console.log("leaf",leaf)
                let tree = new MerkleTree(meta.leaves, keccak256, {sort: true});
                //console.log("tree root:",tree.getHexRoot())
                let merkle_proof = tree.getHexProof(leaf as string)
                
                let verified = await ricks.verify(merkle_proof, block.cid.toString(), metadata.vrf_message_hex, metadata.vrf_proof, {from: props.account})
                setState({...state, init: false,  error: "", imageURL, metadata, owner, mint, verified})
                return
            }catch(e){
                console.log(e)
            }
            
        }

        setState({...state, init: true,  error: "Connect Wallet to View NFT!"})
        /*console.log(`tokenId: `);
        console.log(tokenId)*/
        
    }

    const update = () =>{
        if(props.connected !== state.connected){
            console.log(`update ${state.imageURL}`)
            setState({...state, connected: props.connected, error: ""})
        }
    }

    useEffect(()=>{
        //console.log(`nft ${props.connected} `)
        if(state.init){
            init()
        }
        else{
            update()
        }
    }, [props.connected, state.error])

    return <>
            <div className="error">{state.error}</div>
            <div id="nft-container">
                <div>
                    <div id="nft-name"><h3>{state.metadata.name}</h3></div>
                    <div className="main-image-container">
                        {state.imageURL !== "" && <img src={state.imageURL} className="nft-image active" key={state.imageURL}/>}
                    </div>
                </div>
                <div>
                    
                    {
                        state.metadata.name !== undefined &&
                        <div id="nft-metadata">
                            <h3>Attributes</h3>
                            <div className="nft-attributes">
                                <div id="nft-hair">Hair: {state.metadata.attributes[0].value}</div>
                                <div id="nft-hair">Coat: {state.metadata.attributes[1].value}</div>
                                <div id="nft-hair">Shirt: {state.metadata.attributes[2].value}</div>
                                <div id="nft-hair">Head: {state.metadata.attributes[3].value}</div>
                            </div>
                            <br />
                            <div className="nft-attributes">
                                <div id="nft-hair">Face: {state.metadata.attributes[4].value}</div>
                                <div id="nft-hair">Eyebrow: {state.metadata.attributes[5].value}</div>
                                <div id="nft-hair">Eyes: {state.metadata.attributes[6].value}</div>
                                <div id="nft-hair">Drool: {state.metadata.attributes[7].value}</div>
                            </div>
                            <br/>
                            <div id="nft-percentage"> Original Percentage: {state.metadata.attributes[8].value}%</div>
                        </div>
                    }
                    {
                        state.owner !== "" &&
                        <>
                            <h3>Owner</h3>
                            <div id="nft-owner">{state.owner}</div>
                        </>
                    }
                    {
                        !state.mint &&
                        <h3 id="nft-not-minted"> This Rick has not been Minted. </h3>
                    }
                    {
                        state.verified &&   <div id="nft-verified"> 
                                                <h3>Formally Verified</h3>&nbsp;
                                                <h1> &#x2713;</h1>
                                            </div>
                    }
                    <br/>
                </div>
            </div>
        </>
}