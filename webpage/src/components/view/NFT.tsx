import { useEffect, useState } from "react"
import { useParams } from "react-router"
//import { IPFSEntry } from "ipfs-core-types/dist/src/root";
//import all from "it-all";
//import { concat } from "uint8arrays/concat"
import { Meta, Metadata, OriginalMetadata} from "../../interfaces/Interfaces";
//import { CID } from "multiformats/cid"
import Web3 from "web3";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256/dist/keccak256.js"
import * as Block from "multiformats/block"
import * as json from 'multiformats/codecs/json';
import { sha256 } from 'multiformats/hashes/sha2';
import { rick_images } from "../rick-images/RickImages";
//import { HeliaIPFS } from "@sb-labs/web3-data/networks/IpfsConnect.js";
import "../../App.css"
import "./View.css"
import openseaLogo from "../../images/opensea/OpenseaLogo.png"


interface NFTProps{
    connected: boolean;
    //ipfs: HeliaIPFS;
    ricks: any;
    metadata : Array<Metadata | OriginalMetadata>,
    images: Array<string>,
    meta: Meta,
    baseURI: string
    minted: number;
    maxSupply: number;
    account: string;
    explorer: string;
    opensea: string;
    error: string;
}

export const NFT = (props: NFTProps) =>{

    const [state, setState] = useState({connected: false, imageURL: "", error: "Connect Wallet to View NFT!", metadata: {} as Metadata | OriginalMetadata, owner: "", mint: true, verified: false})

    let {tokenId} = useParams()

    useEffect(()=>{
        const init = async () =>{

            if(Number.isNaN(tokenId) || Number(tokenId) < 0 || Number(tokenId) > props.maxSupply){
                setState({...state, error: "Invalid Token ID Given."})
                return;
            }
            
            try{
                //let ipfs = props.ipfs;
                let metadata = props.metadata[Number(tokenId)];
                let ricks = props.ricks;
                //console.log(metadataFiles)
                //console.log(tokenId)
                //let file = metadata[Number(tokenId)]
                //console.log(file)
                //let data = concat(await all(await ipfs.fs.cat(file.cid)))
                //let data =  //JSON.parse(new TextDecoder().decode(data).toString()) as Metadata;
                //console.log(metadata)
                //let image = await all(ipfs.fs.cat(CID.parse(metadata.image.replace("ipfs://",""))));
                let imageURL = props.images[Number(tokenId)]//URL.createObjectURL(new Blob(image, {type: "image/png"}))
                
                let mint = true;
                let owner = ""
                try{
                    owner = await ricks.ownerOf(metadata.id);
                    //console.log(owner)
                }catch{
                    console.log("no owner for nft")
                    mint = false
                }
                let meta = props.meta //props.metadata[props.metadata.length-1] as Meta;
                //data = concat(await all(await ipfs.fs.cat(metafile.cid)))
                //let meta = JSON.parse(new TextDecoder().decode(data).toString()) as Meta
                //console.log(meta)
                let block = await Block.encode({value: metadata, codec: json, hasher: sha256})
                //console.log(block.cid.toString(), file.cid)
                let leaf = Web3.utils.soliditySha3(block.cid.toString(), metadata.vrf_message_hex, metadata.vrf_proof)
                //console.log("leaf",leaf)
                let tree = new MerkleTree(meta.leaves, keccak256, {sort: true});
                //console.log("tree root:",tree.getHexRoot())
                let merkle_proof = tree.getHexProof(leaf as string)
                
                let verified = await ricks.verify(merkle_proof, block.cid.toString(), metadata.vrf_message_hex, metadata.vrf_proof, {from: props.account})
                setState({...state, connected: props.connected, error: "", imageURL, metadata, owner, mint, verified})
                return
            }catch(e){
                console.log(e)
            }
            /*console.log(`tokenId: `);
            console.log(tokenId)*/
        }
        //console.log(`nft ${props.connected} `)
        if(props.connected && !state.connected){
            init()
        }
        
    })

    return <div>
            <div className="error"><h4>{state.error}</h4></div>
            <div className="error"><h4>{props.error}</h4></div>
            {state.connected &&
            <div id="nft-container">
                <div>
                    <div id="nft-name"><h3>{state.metadata.name}</h3></div>
                    <div className="main-image-container">
                        {state.imageURL !== "" && <img src={state.imageURL} className="nft-image active" key={state.imageURL} alt=""/>}
                    </div>
                </div>
                <div id="nft-at-container">
                    {
                        state.metadata.name !== undefined &&
                        <div id="nft-metadata">
                            <h2 className="nft-header">Attributes</h2>
                            <div id="attribute-spacer"/>
                            <div className="nft-attributes">
                                <div className="nft-attribute"><div className="attribute-name">Hair:</div> <img className="nft-attribute-image nft-hair" src={rick_images.hair[state.metadata.attributes[0].value]} alt=""/> </div>
                                <div className="nft-attribute"><div className="attribute-name">Coat:</div> <img className="nft-attribute-image nft-coat" src={rick_images.coat[state.metadata.attributes[1].value]} alt=""/></div>
                                <div className="nft-attribute"><div className="attribute-name">Shirt:</div> <img className="nft-attribute-image nft-shirt" src={rick_images.shirt[state.metadata.attributes[2].value]} alt=""/></div>
                                <div className="nft-attribute"><div className="attribute-name">Head:</div> <img className="nft-attribute-image nft-head" src={rick_images.head[state.metadata.attributes[3].value]} alt=""/></div>
                            </div>

                            <div className="nft-attributes">
                                <div className="nft-attribute"><div className="attribute-name">Face:</div> <img className="nft-attribute-image nft-face" src={rick_images.face[state.metadata.attributes[4].value]} alt=""/></div>
                                <div className="nft-attribute"><div className="attribute-name">Eyebrow:</div> <img className="nft-attribute-image nft-eyebrow" src={rick_images.eyebrow[state.metadata.attributes[5].value]} alt=""/></div>
                                <div className="nft-attribute"><div className="attribute-name">Eyes:</div> <img className="nft-attribute-image nft-eyes" src={rick_images.eyes[state.metadata.attributes[6].value]} alt=""/></div>
                                <div className="nft-attribute"><div className="attribute-name">Drool:</div> <img className="nft-attribute-image nft-drool" src={rick_images.drool[state.metadata.attributes[7].value]} alt=""/></div>
                            </div>
                            
                            <div id="nft-percentage"> Original Percentage: &nbsp;&nbsp;<h2 className="highlight no-margin">{state.metadata.attributes[8].value}%</h2></div>
                        </div>
                    }
                    {
                        state.owner !== "" &&
                        <>
                            <h2 className="nft-header owner-header">Owner</h2>
                            <a className="nft-data-link" href={props.explorer + state.owner}>{state.owner.slice(0,5) + "..." + state.owner.slice(38)}</a>
                        </>
                    }
                    {
                        !state.mint &&
                        <h3 id="nft-not-minted"> This Rick has not been Minted. </h3>
                    }
                    {
                        state.verified &&   
                        <div id="nft-verified" className="highlight"> 
                            <h3 className="no-margin">Formally Verified</h3>&nbsp;
                            <h1> &#x2713;</h1>
                        </div>
                    }
                    {
                        state.mint &&
                        <>
                        <a className="nft-data-link" href={props.opensea + props.ricks.address + "/" + state.metadata.id}><img id="opensea-logo" src={openseaLogo} alt=""/>{/*<h3>Opensea</h3>*/}</a>
                        </>
                    }
                    {
                        state.metadata.id !== undefined &&
                        <>
                        <a className="nft-data-link" href={props.baseURI + state.metadata.id + ".json"}><h3>Metadata</h3></a>
                        </>
                    }
                    <br/>
                </div>
            </div>
            }
        </div>
}