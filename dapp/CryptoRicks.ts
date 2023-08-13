import  mergeImages from 'merge-images';
import {Canvas, Image} from 'canvas';
import promptImport from "prompt-sync";
import { MnemonicManager, encryptedMnemonic } from '@sb-labs/mnemonic-manager';
import * as fs from 'fs'
import * as Block from 'multiformats/block';
import * as json from 'multiformats/codecs/json';
import * as raw from "multiformats/codecs/raw"
import { sha256 } from 'multiformats/hashes/sha2';
import { generate_vrf, verify as verify_vrf } from '@sb-labs/vrf-js';
import bip39 from 'bip39';
import Web3 from 'web3';
import { DeployedContracts  } from '@sb-labs/web3-data/networks/DeployedContracts'
import { providers } from '@sb-labs/web3-data/networks/Providers.js';
import HDKey from 'hdkey'
import { contractFactoryV1 } from '@sb-labs/contract-factory-v1';
import deployedContracts from './DeployedContracts.json' assert {type: "json"}
import { URL } from 'url';
import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256/dist/keccak256.js'
import { create } from 'ipfs-http-client'
import { ipfsConnect } from '@sb-labs/web3-data/networks/IpfsConnect.js';
import { globSource } from 'ipfs';
import all from 'it-all'
import elliptic from 'elliptic'
import { createLibp2p } from "libp2p"
import { createHelia } from 'helia'
import { unixfs } from '@helia/unixfs';
import { MemoryDatastore } from 'datastore-core'
import { MemoryBlockstore } from 'blockstore-core'
import { createFromProtobuf } from '@libp2p/peer-id-factory'
import { noise } from '@chainsafe/libp2p-noise'
import { webSockets } from '@libp2p/websockets'
import { tcp } from '@libp2p/tcp'
import { kadDHT } from '@libp2p/kad-dht'
import { yamux } from '@chainsafe/libp2p-yamux'
import { mplex } from '@libp2p/mplex'
import { bootstrap } from '@libp2p/bootstrap'
//import { importer } from 'ipfs-unixfs-importer';

// import cRick from "@sb-labs/web3-data/contracts/CryptoRicks.json" assert {type: "json"}
// import { AbiItem } from "web3-utils"

const ec = new elliptic.ec('secp256k1')

const __dirname = new URL('.', import.meta.url).pathname;

const deployed = deployedContracts as DeployedContracts

const web3_options = {
    //timeout: 30000, // ms

    // Useful for credentialed urls, e.g: ws://username:password@localhost:8545

    clientConfig: {
      // Useful if requests are large
      //maxReceivedFrameSize: 100000000,   // bytes - default: 1MiB
      //maxReceivedMessageSize: 100000000, // bytes - default: 8MiB

      // Useful to keep a connection alive
      keepalive: true,
      keepaliveInterval: 10000 // ms
    },

    // Enable auto reconnection
    reconnect: {
        auto: true,
        delay: 5000, // ms
        maxAttempts: 5,
        onTimeout: false
    }
};

interface OriginalMetadata{
    name: string;
    description: string
    id: number;
    external_url: string;
    iterations : number;
    vrf_message_hex: string;
    vrf_hash: string;
    vrf_proof: string;
    image: string;
    attributes: Array<Attribute>;
    network: string;
    chain_id: number;
    distributor: string;
    contract: string;
    signature: any;
}

interface Metadata{
    name: string;
    description: string
    id: number;
    external_url: string;
    previous_cid : string;
    vrf_message_hex: string;
    vrf_hash: string;
    vrf_proof: string;
    image: string;
    attributes: Array<Attribute>;
    network: string;
    chain_id: number;
    distributor: string;
    contract: string;
    signature: any;
}

interface Attribute{
    display_type?: string;
    trait_type: string
    value: string | number;
}

interface Attributes{
    [attribute: string] : number
}
// Images
const images = {
    hair : ["./images/hair/Hair_Teal.png", "./images/hair/Hair_Green.png", "./images/hair/Hair_Orange.png", "./images/hair/Hair_Purple.png", "./images/hair/Hair_Yellow.png"],// orange :fc5600ff purple: b839f4ff green: 00b800ff yellow: fff055ff
    coat : ["./images/coat/Coat_White.png", "./images/coat/Coat_Green.png", "./images/coat/Coat_Purple.png", "./images/coat/Coat_Red.png", "./images/coat/Coat_Teal.png"],
    shirt: ["./images/shirt/Shirt_Teal.png", "./images/shirt/Shirt_Green.png", "./images/shirt/Shirt_Orange.png", "./images/shirt/Shirt_Purple.png"],
    head : ["./images/head/Head_Beige.png", "./images/head/Head_Brown.png", "./images/head/Head_Dark.png", "./images/head/Head_Gray.png"],
    face : ["./images/face/Face_Normal.png", "./images/face/Face_Baggy_Eyelids.png","./images/face/Face_Large_Wrinkle.png", "./images/face/Face_Small_Wrinkle.png"],
    eyebrow : ["./images/eyebrow/Eyebrow_Teal.png", "./images/eyebrow/Eyebrow_Green.png", "./images/eyebrow/Eyebrow_Orange.png", "./images/eyebrow/Eyebrow_Purple.png", "./images/eyebrow/Eyebrow_Yellow.png"],
    eyes : ["./images/eyes/Eyes_White.png", "./images/eyes/Eyes_Green.png", "./images/eyes/Eyes_Orange.png", "./images/eyes/Eyes_Red.png"],
    drool : ["./images/drool/Drool_Green.png", "./images/drool/Drool_Orange.png", "./images/drool/Drool_Purple.png", "./images/drool/Drool_Teal.png"]
} as Images

interface Images{
    [part: string] : string[]
}

const description = "A verifiably unique Rick, part of a collection of 1000 Crypto Ricks. Created by SB Labs."

// Attributes
const types = {
    hair: ["teal", "green", "orange", "purple", "yellow"], // .2
    coat: ["white", "green", "purple", "red", "teal"], // .2
    shirt: ["teal", "green", "orange", "purple"],// .25
    head: ["beige", "brown", "dark", "gray"], //.25
    face: ["normal", "baggy eyelids", "large wrinkle", "small wrinkle"], // .25
    eyebrow: ["teal", "green", "orange", "purple", "yellow"], //.2
    eyes: ["white", "green", "orange", "red"], // .25
    drool: ["green", "orange", "purple", "teal"] // .25
}

let prompt : any;

let network : string;

let chain_id = 1337;

let web3 : Web3;

let mnemonic : string;

let private_key : string;

let wallet: any

let account : any

let utils = Web3.utils;

let vrfHelper = contractFactoryV1.VRFHelper;

let cryptoRicks = contractFactoryV1.CryptoRicks;

let helper : any;

let ricks: any;

let leaves = [] as any;

const nft_num = 1000;

const max_iterations = 1000000000;

let found = false;

let exit = true;

/*
* Distribution workflow
* Deploy Contract ( With Randomization Public Key Hash ) X
* Create Metadata With VRF Using Public Key X
* Create Merkle Tree of VRF Proofs for viewable nft verification. X
* Set Proof Variables ( BaseURI and Merkle Root used for Randomization Verification. ) X
* Verify NFTs X
*/

const main = async () =>{

    prompt = await promptImport();

    let args = process.argv;

    //console.log(argv)

    if(args.length < 4){
        console.log('\x1b[31m%s\x1b[0m', `Invalid Number of Arguments Given to Dapp.`)
        process.exit(1);
    }

    console.log("Enter password to access distributor account.")
    let password = (prompt("Password: ", {echo: "*"})).toString();

    mnemonic = await MnemonicManager("decrypt", encryptedMnemonic, password) as string
    //console.log(mnemonic?.length)

    network = args[2]

    await initWeb3()

    await initWallet();

    await initCryptoRicks();

    switch(args[3]){
        case "DeployAll": await deploy_all(); break; //TODO
        case "Deploy" : await deploy(); break;
        case "Node": await node(); break;
        case "SetMnemonic" : await set_mnemonic(args[4]); break
        case "GenerateMetadata" : await generate_metadata(); break;
        case "SetProofVariables": await set_proof_variables(args[4]); break;
        case "VerifyNFTs": await verify_nfts(); break;
        case "VerifyOriginalVRF" : await verify_original_vrf(); break;
        case "Mint": await mint_nft(args[4]); break;
        case "Balance" : await balance(); break;
        case "Account" : await account_balance(); break;
        case "Claim" : await claim(); break;
        case "TokenURI": await token_uri(Number(args[4])); break;
        case "GasPrice": await gas_price(); break;
        case "RetrieveCID": await retrieve_cid(true); break;
        case "MintRicksTest": await mint_ricks_test(Number(args[4])); break;
        case "DuplicateMetadata": await duplicate_metadata(); break;
        case "TestImages": await test_images(); break;
        default: break;
    }
    if(exit)
    {
        process.exit(0)
    }    
}


const set_mnemonic = async (encryptedMnemonic: string) =>{
    console.log("Enter password for encrypted mnemonic.")
    let password = (prompt("Password: ", {echo: "*"})).toString();
    await MnemonicManager("set", encryptedMnemonic, password)
}

const deploy_all = async () =>{
    await deploy()
    await generate_metadata()
    await set_proof_variables(await retrieve_cid(false))
    //await verify_nfts()
    await retrieve_cid(true)
    //await node();
}

const gas_price = async() =>{
    let gasPrice = await web3.eth.getGasPrice();
    console.log(gasPrice)
}

const account_balance = async () =>{
    let balance = await web3.eth.getBalance(account.address)
    console.log(balance)
}

const token_uri = async (token_id: number) =>{
    let token_uri = await ricks.tokenURI(token_id)
    console.log(`URI for token id ${token_id}: ${token_uri}`)
}

const balance = async () =>{
    let balance = utils.fromWei(await web3.eth.getBalance(ricks.address), "ether")
    console.log(`Crypto Ricks Contract Balance: ${balance}`)
}

const mint_nft = async (address: string) =>{
    let mintValue = await ricks.MintValue()
    let minted = await ricks.mint(address, {from: account.address, value: mintValue})
    console.log(`Crypto Rick ${minted.logs[0].args["tokenId"]} minted to ${address}`)
};

const claim = async () =>{
    let balance = await web3.eth.getBalance(ricks.address)
    console.log('\x1b[32m%s\x1b[0m', `balance of ${utils.fromWei(balance.toString(), "ether")}`)

    let response = prompt("Would you like to continue claim from contract? Y/n: ")
    
    if(response !== "Y"){
        console.log('\x1b[31m%s\x1b[0m', "Canceled Claim.")
        return
    }

    await ricks.claim({from: account.address})
}

const verify_nfts = async () =>{
    console.log("Verifying NFTs")
    try{
        let public_key_point_x = await ricks.PublicKeyPointX()
        let public_key_point_y = await ricks.PublicKeyPointY()
    
        let address = "0x" + utils.soliditySha3(public_key_point_x, public_key_point_y)?.slice(-40)
        //console.log(address)
        let distributor_addr =  await ricks.Distributor()
        //console.log(distributor_addr.toString().toLowerCase())
        let verified_public_key = address ===  distributor_addr.toString().toLowerCase();

        if(verified_public_key){
            console.log('\x1b[32m%s\x1b[0m', `Verified Distributor Public Key Point.`)
        }
        else{
            console.log('\x1b[31m%s\x1b[0m', "Invalid Distributor Public Key Point")
            return;
        }

        if(!await verify_original_vrf()){
            return
        }
        
        let data = JSON.parse(fs.readFileSync(`./complete/${network}/metadata.json`).toString())
        //console.log(data.leaves)
        let tree = new MerkleTree(data.leaves, keccak256, {sort: true});
        //console.log(tree.getRoot().toString('hex'))
        let root = await ricks.Root();
        //console.log(root)
        let signatures = true;
        let verification = true
        let verified_nfts = []
        for(let i = 0; i < nft_num; i++){
            
            let metadata = JSON.parse(fs.readFileSync(`./complete/${network}/${i}.json`).toString()) as Metadata
            let verified_signature = verify_signature(metadata)
            if(!verified_signature){
                signatures = verified_signature
                break;
            }
            verified_nfts.push(verify_nft(metadata, tree))
            /*
            let verified_nft = await verify_nft(metadata, tree)
            //console.log(verified_nft)
            if(!verified_nft){
                verification = verified_nft;
                break;
            }*/
        }
        //console.log(verified_nfts.length)
        let settled = await Promise.allSettled(verified_nfts);
        for(let s of settled){
            if(s.status === "fulfilled"){
                verification = s.value
            }   
            else{
                console.log('\x1b[31m%s\x1b[0m', "NFT contract verification error.")
                return
            }
        }
        if(signatures){
            console.log('\x1b[32m%s\x1b[0m', "NFT signatures verified.")
        }
        else{
            console.log('\x1b[31m%s\x1b[0m', "NFT signature verification error.")
            return
        }
        if(verification){
            console.log('\x1b[32m%s\x1b[0m', "NFTs verified by contract.")
        }
        else{
            console.log('\x1b[31m%s\x1b[0m', "NFT contract verification error.")
            return
        }
        
    }
    catch(e){
        console.log("Verification Error: ", e);
    }

}

const verify_nft = async (metadata: Metadata | OriginalMetadata, tree: MerkleTree) : Promise<boolean> => {
    let metadata_block = await Block.encode({value: metadata, codec: json, hasher: sha256})
    let leaf = utils.soliditySha3(metadata_block.cid.toString(), metadata.vrf_message_hex , metadata.vrf_proof);
    //console.log(leaf)
    let merkle_proof = tree.getHexProof(leaf as string)
    //console.log(merkle_proof)
    //let vrfVerified = await ricks.verifyVRF(metadata.vrf_message_hex, metadata.vrf_proof)
    //console.log(vrfVerified)
    /*let merkleVerified = await ricks.verifyLeaf(merkle_proof, leaf)
    console.log(merkleVerified)*/
    return await ricks.verify(merkle_proof, metadata_block.cid.toString(), metadata.vrf_message_hex , metadata.vrf_proof, {from: account.address});
}

const verify_signature = (metadata: Metadata | OriginalMetadata) : boolean =>{
    let cid_iteration = (metadata as any).previous_cid === undefined ? (metadata as any).iterations : (metadata as any).previous_cid 

    let message = `${metadata.name}-${metadata.description}-${metadata.id}-${metadata.external_url}-${cid_iteration}-${metadata.vrf_message_hex}-${metadata.vrf_hash}-${metadata.vrf_proof}-${metadata.image}-${JSON.stringify(metadata.attributes)}-${metadata.network}-${metadata.chain_id}-${metadata.distributor}-${metadata.contract}`

    let signer = web3.eth.accounts.recover(message, metadata.signature);

    return signer === account.address;
}

const verify_original_vrf = async () : Promise<boolean> =>{
 
    let x = await ricks.PublicKeyPointX()
    let y = await ricks.PublicKeyPointY()
    let public_key = ec.keyFromPublic({x, y})
    let public_key_hex = Buffer.from(public_key.getPublic().encodeCompressed()).toString('hex')
    
    //console.log(public_key_hex)
    let iterations_proof = JSON.parse(fs.readFileSync(__dirname + `complete/${network}/iterations.json`).toString()).iterations_proof
    //console.log(iterations_proof)
    // verify first iteration
    if(iterations_proof[0].message !== ricks.address.replace("0x", ""))
    {
        console.log('\x1b[31m%s\x1b[0m', "Invalid root message")
        return false;
    }
    let verify_hash = verify_vrf(public_key_hex, iterations_proof[0].vrf.proof.replace("0x", ""), iterations_proof[0].message)
    if(verify_hash.hash !== iterations_proof[0].vrf.hash){
        console.log('\x1b[31m%s\x1b[0m', "Invalid Initial VRF Proof")
        return false;
    }
    for(let i = 1; i < iterations_proof.length; i++){
        const message = iterations_proof[i].message;
        if(message !== iterations_proof[(i-1)].vrf.hash.replace("0x", "")){
            console.log('\x1b[31m%s\x1b[0m', "Invalid VRF Iteration Message.");
            return false;
        }
        verify_hash = verify_vrf(public_key_hex, iterations_proof[i].vrf.proof.replace("0x", ""), iterations_proof[i].message)
        if(verify_hash.hash !== iterations_proof[i].vrf.hash){
            console.log('\x1b[31m%s\x1b[0m', `Invalid VRF Proof At Iteration: ${i}`)
            return false;
        }
    }
    console.log('\x1b[32m%s\x1b[0m', "Verified Original VRF")
    return true;
}

const set_proof_variables = async (cid : string) =>{
    while(true){
        try{
            let base_uri = "ipfs://" + cid + "/";
    
            let metadata = JSON.parse(fs.readFileSync(`./complete/${network}/metadata.json`).toString())
            
            console.log('\x1b[33m%s\x1b[0m', `BaseURI: ${base_uri}, Root: ${metadata.root}`)
        
            let response = prompt("Would you like to continue setting proof variables? Y/n: ")
            
            if(response !== "Y"){
                console.log('\x1b[31m%s\x1b[0m', "Canceled Setting Proof.")
                return
            }
    
            //console.log(ricks.address)
            
            let gas = await ricks.setProofVariables.estimateGas(base_uri, metadata.root, {from: account.address})
        
            //console.log(gas)
        
            let gasPrice = Number(await web3.eth.getGasPrice())
            //console.log(gasPrice)
            let totalEther = utils.fromWei((gas * gasPrice).toString())
            //console.log(totalEther)
            gasPrice = Number(utils.fromWei(gasPrice.toString(), "gwei"))
            if((gasPrice > 30 && network === "Ethereum")){
                console.log('\x1b[31m%s\x1b[0m', `Gas price of ${gasPrice} is to high for deployment.`)
                return
            }
        
            console.log('\x1b[33m%s\x1b[0m', `gas estimate: ${gas}, gas price in gwei: ${gasPrice}, total cost estimate: ${totalEther} `)
        
            await ricks.setProofVariables(base_uri, metadata.root, {from: account.address})
        
            let root = await ricks.Root()
        
            console.log('\x1b[32m%s\x1b[0m',`Crypto Ricks Root: ${root}`)
            return
        }catch(e){
            console.log("Setting proof variables error... ")
            try{
                let response = prompt("Would you like to reinitialize to set proof variables? Y/n: ")
            
                if(response !== "Y"){
                    console.log('\x1b[31m%s\x1b[0m', "Canceled Setting Proof.")
                    return
                }
                await initWeb3();
                await initWallet()
                await initCryptoRicks()
            }
            catch{
                console.log("Re init failed, closing...");
                return
            }
        }
    }
    
}

const clean_metadata = async () =>{
    let dir = __dirname + `complete/${network}`
    //console.log(dir)
    try{
        fs.rmdirSync(dir, {recursive: true})

        fs.mkdir(dir, () =>{})
    }catch{
        console.log("Remove Metadata Error.")
    }
}

const generate_metadata = async () =>{
    // clean metadata directory
    await clean_metadata()
    // find vrf proof from for orignial
    console.log('\x1b[33m%s\x1b[0m',"Finding the Original Crypto Rick...")
    console.time("Time to find Rick")
    let original_message = ricks.address.replace("0x", "")
    let original_vrf = generate_vrf(private_key, original_message);
    let iterations = 0;
    
    let iterations_proof = [{message: original_message, vrf: original_vrf}];
    while(iterations < max_iterations){
        let hair = parseInt(original_vrf.hash[65], 16) % types["hair"].length
        let coat = parseInt(original_vrf.hash[64], 16) % types["coat"].length
        let shirt = parseInt(original_vrf.hash[63], 16) % types["shirt"].length
        let head = parseInt(original_vrf.hash[62], 16) % types["head"].length
        let face = parseInt(original_vrf.hash[61], 16) % types["face"].length
        let eyebrow = parseInt(original_vrf.hash[60], 16) % types["eyebrow"].length
        let eyes = parseInt(original_vrf.hash[59], 16) % types["eyes"].length
        let drool = parseInt(original_vrf.hash[58], 16) % types["drool"].length
        if(hair === 0 && coat === 0 && shirt === 0 && head === 0 && face === 0 && eyebrow === 0 && eyes === 0 && drool === 0){
            found = true
            break;
        }
        //console.log(`hair: ${hair}, coat: ${coat}, : ${hair}, hair: ${hair}, hair: ${hair}, hair: ${hair}, hair: ${hair}, hair: ${hair}`)
        original_message = original_vrf.hash.replace("0x", "");
        process.stdout.write(`${iterations}: 0x${original_message}` + '\r');
        original_vrf = generate_vrf(private_key, original_message)
        iterations_proof.push({message: original_message, vrf: original_vrf})
        iterations++;
    }
    console.timeEnd("Time to find Rick")
    if(!found)
    {
        console.log('\x1b[31m%s\x1b[0m', `the original rick could not be found`)
        return;
    }
    
    console.log('\x1b[32m%s\x1b[0m', `${iterations} iterations were taken to find the orginial rick!`)

    fs.writeFileSync(`./complete/${network}/iterations.json`, JSON.stringify({iterations_proof}, null, 4))

    let original = await mergeImages(["./images/hair/Hair_Teal.png", "./images/coat/Coat_White.png", "./images/shirt/Shirt_Teal.png", "./images/head/Head_Beige.png", 
                                "./images/face/Face_Normal.png", "./images/eyebrow/Eyebrow_Teal.png", "./images/eyes/Eyes_White.png", "./images/drool/Drool_Green.png"], {Canvas, Image});
    let data = Buffer.from(original.replace(/^data:image\/\w+;base64,/, ""), "base64");
    fs.writeFileSync("./images/original/OriginalRick.png", data)
    /*
    let buf = fs.readFileSync("./complete/0.png");

    console.log(buf);*/

    let image_block = await Block.encode({value: data, codec: raw, hasher: sha256});

    fs.writeFileSync(`./complete/${network}/${image_block.cid.toString()}.png`, data);

    console.log(`original image cid: ${image_block.cid.toString()}`)

    let attributes = {hair: 0 , coat: 0, shirt: 0, head: 0, face: 0, eyebrow: 0, eyes: 0, drool: 0} as Attributes

    let original_metadata = generate_original_metadata_obj(0, iterations, "0x" + Buffer.from(original_message, "utf-8").toString('hex'), original_vrf.hash, original_vrf.proof, "ipfs://" + image_block.cid.toString(), attributes)

    //console.log(original_metadata)

    fs.writeFileSync(`./complete/${network}/0.json`, JSON.stringify(original_metadata, null, 4))

    let metadata_block = await Block.encode({value: original_metadata, codec: json, hasher: sha256});

    console.log(`original metadata cid: ${metadata_block.cid.toString()}`)

    leaves.push(utils.soliditySha3(metadata_block.cid.toString(), "0x" + Buffer.from(original_message, "utf-8").toString('hex'), original_vrf.proof));

    let previous_cid = metadata_block.cid.toString()

    for(let i = 1; i < nft_num; i++){
        // generate vrf from previous vrf hash
        let result = generate_vrf(private_key, previous_cid)

        //console.log(result)
        // generate image from vrf.

        let hair = parseInt(result.hash[65], 16) % types["hair"].length
        let coat = parseInt(result.hash[64], 16) % types["coat"].length
        let shirt = parseInt(result.hash[63], 16) % types["shirt"].length
        let head = parseInt(result.hash[62], 16) % types["head"].length
        let face = parseInt(result.hash[61], 16) % types["face"].length
        let eyebrow = parseInt(result.hash[60], 16) % types["eyebrow"].length
        let eyes = parseInt(result.hash[59], 16) % types["eyes"].length
        let drool = parseInt(result.hash[58], 16) % types["drool"].length

        let attributes = {hair, coat, shirt, head, face, eyebrow, eyes, drool}

        //console.log(attributes)

        let image = await mergeImages([images["hair"][hair], images["coat"][coat], images["shirt"][shirt], images["head"][head],
                                       images["face"][face], images["eyebrow"][eyebrow], images["eyes"][eyes], images["drool"][drool]], {Canvas, Image})
        data = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ""), "base64");

        image_block = await Block.encode({value: data, codec: raw, hasher: sha256});

        fs.writeFileSync(`./complete/${network}/${image_block.cid.toString()}.png`, data);

        // generate metadata.

        //let attributes = {hair, coat, shirt, head, face, eyebrow, eyes, drool}

        let metadata = generate_metadata_obj(i, previous_cid, "0x" + Buffer.from(previous_cid, "utf-8").toString('hex'), result.hash, result.proof, "ipfs://" + image_block.cid.toString(), attributes)
        
        //console.log(metadata)

        fs.writeFileSync(`./complete/${network}/${i}.json`, JSON.stringify(metadata, null, 4))

        metadata_block = await Block.encode({value: metadata, codec: json, hasher: sha256})

        //console.log(metadata_block.cid.toString())

        leaves.push(utils.soliditySha3(metadata_block.cid.toString(), metadata.vrf_message_hex, metadata.vrf_proof))

        previous_cid = metadata_block.cid.toString()
    }
    // Create Merkle Tree

    //console.log(leaves);

    var tree = new MerkleTree(leaves, keccak256, {sort: true});

    var root = tree.getHexRoot();

    console.log(root)

    // Create metadata.json
    let signature = account.sign(`${root}-${JSON.stringify(leaves)}-${ricks.address}`)
    let metadata = {root, leaves, contract: ricks.address, signature: signature.signature}

    console.log(metadata)

    fs.writeFileSync(`./complete/${network}/metadata.json`, JSON.stringify(metadata, null, 4));

}

const generate_original_metadata_obj = (id: number, iterations: number, vrf_message_hex : string, vrf_hash: string, vrf_proof: string, image: string, attributes: Attributes) : OriginalMetadata =>{
    let atts = [] as Array<Attribute>
    let percentage = 0;
    for(let a in attributes){
        if(attributes[a] === 0){
            percentage += 12.5
        }
        switch(a){
            case "hair" : atts.push({"trait_type": "hair", "value" : types["hair"][attributes[a]]}); break;
            case "coat" : atts.push({"trait_type": "coat", "value" : types["coat"][attributes[a]]}); break;
            case "shirt" : atts.push({"trait_type": "shirt", "value" : types["shirt"][attributes[a]]}); break;
            case "head" : atts.push({"trait_type": "head", "value" : types["head"][attributes[a]]}); break;
            case "face" : atts.push({"trait_type": "face", "value" : types["face"][attributes[a]]}); break;
            case "eyebrow" : atts.push({"trait_type": "eyebrow", "value" : types["eyebrow"][attributes[a]]}); break;
            case "eyes" : atts.push({"trait_type": "eyes", "value" : types["eyes"][attributes[a]]}); break;
            case "drool" : atts.push({"trait_type": "drool", "value" : types["drool"][attributes[a]]}); break;
        }
    }
    atts.push({display_type: "number", trait_type:"original percentage", value: percentage})
    
    let metadata = {name : `Crypto Rick ${id}`, description, id, external_url: "CryptoRicks.eth", iterations, vrf_message_hex, vrf_hash, vrf_proof, image, attributes: atts, network, chain_id, 
                    distributor: account.address, contract: ricks.address, signature: ""} as OriginalMetadata
    let signature = account.sign(`${metadata.name}-${metadata.description}-${metadata.id}-${metadata.external_url}-${metadata.iterations}-${vrf_message_hex}-${metadata.vrf_hash}-${metadata.vrf_proof}-${metadata.image}-${JSON.stringify(metadata.attributes)}-${metadata.network}-${metadata.chain_id}-${metadata.distributor}-${metadata.contract}`).signature
    metadata["signature"] = signature;
    //console.log(`NFT id: ${id} Metadata:`)
    return metadata;
}

const generate_metadata_obj = (id: number, previous_cid: string, vrf_message_hex : string, vrf_hash: string, vrf_proof: string, image: string, attributes: Attributes) : Metadata =>{
    let atts = [] as Array<Attribute>
    let percentage = 0;
    for(let a in attributes){
        if(attributes[a] === 0){
            percentage += 12.5
        }
        switch(a){
            case "hair" : atts.push({"trait_type": "hair", "value" : types["hair"][attributes[a]]}); break;
            case "coat" : atts.push({"trait_type": "coat", "value" : types["coat"][attributes[a]]}); break;
            case "shirt" : atts.push({"trait_type": "shirt", "value" : types["shirt"][attributes[a]]}); break;
            case "head" : atts.push({"trait_type": "head", "value" : types["head"][attributes[a]]}); break;
            case "face" : atts.push({"trait_type": "face", "value" : types["face"][attributes[a]]}); break;
            case "eyebrow" : atts.push({"trait_type": "eyebrow", "value" : types["eyebrow"][attributes[a]]}); break;
            case "eyes" : atts.push({"trait_type": "eyes", "value" : types["eyes"][attributes[a]]}); break;
            case "drool" : atts.push({"trait_type": "drool", "value" : types["drool"][attributes[a]]}); break;
        }
    }
    atts.push({display_type: "number", trait_type:"original percentage", value: percentage})
    
    let metadata = {name : `Crypto Rick ${id}`, description,id, external_url: "CryptoRicks.eth", previous_cid, vrf_message_hex, vrf_hash, vrf_proof, image, attributes: atts, network, chain_id, 
                    distributor: account.address, contract: ricks.address, signature: ""} as Metadata
    let signature = account.sign(`${metadata.name}-${metadata.description}-${metadata.id}-${metadata.external_url}-${metadata.previous_cid}-${vrf_message_hex}-${metadata.vrf_hash}-${metadata.vrf_proof}-${metadata.image}-${JSON.stringify(metadata.attributes)}-${metadata.network}-${metadata.chain_id}-${metadata.distributor}-${metadata.contract}`).signature
    metadata["signature"] = signature;
    //console.log(`NFT id: ${id} Metadata:`)
    return metadata;
}

const deploy = async () =>{
    try{
        let gasPrice = Number(await web3.eth.getGasPrice())
        let gasPriceG = Number(utils.fromWei(gasPrice.toString(), "gwei"))
        if(gasPriceG > 30){
            console.log('\x1b[31m%s\x1b[0m', `Gas price of ${gasPrice} is to high for deployment.`)
            return
        }
        if(deployed[network]["VRFHelper"] === undefined){
            let gas = await vrfHelper.new.estimateGas({from: account.address});
            //console.log(gasPrice)
            let totalEther = utils.fromWei((gas * gasPrice).toString())

            //console.log('\x1b[33m%s\x1b[0m', `VRF Helper has not yet been deployed to ${network}`)
            console.log('\x1b[33m%s\x1b[0m', `VRF Helper contract gas estimate: ${gas}, gas price in gwei: ${gasPriceG}, total cost estimate: ${totalEther} `)
            let response = prompt(`Would you like to deploy VRF Helper to ${network} network Y/n ? `)
            if(response !== "Y"){
                console.log('\x1b[31m%s\x1b[0m', "Canceled Deployment.")
                return
            }

            helper = await vrfHelper.new({from: account.address})
            deployed[network]["VRFHelper"] = {address: helper.address, block: 0};
            console.log('\x1b[32m%s\x1b[0m', `VRF Helper Deployed to: ${network} at: ${helper.address}`)
        }
        if(deployed[network]["CryptoRicks"] !== undefined){
            let response = prompt(`Would you like to overwrite the contract ${deployed[network]["CryptoRicks"].address} for ${network} network Y/n ? `)
    
            if(response !== "Y"){
                console.log('\x1b[31m%s\x1b[0m', "Canceled Deployment.")
                return
            }
        }
        
        //let result = generate_public_key(private_key)
        
        //let public_key_hash = utils.soliditySha3(result.publicKey)

        let public_key_point = (ec.keyFromPrivate(account.privateKey.replace("0x", ""))).getPublic()//await helper.decodePoint(result.publicKey)

        console.log('\x1b[32m%s\x1b[0m', `public key x: ${public_key_point.getX()}, public key y: ${public_key_point.getY()}`)

        let mintValue = network === 'Hyperspace' ? utils.toWei("1", "ether") : utils.toWei("0.005", "ether")
        
        let gas = await cryptoRicks.new.estimateGas(nft_num, mintValue , [public_key_point.getX(), public_key_point.getY()], helper.address, {from: account.address})

        //console.log(gas)
        //console.log(gasPrice)
        let totalEther = utils.fromWei((gas * gasPrice).toString())
        //console.log(totalEther)

        console.log('\x1b[33m%s\x1b[0m', `Crypto Ricks contract gas estimate: ${gas}, gas price in gwei: ${gasPriceG}, total cost estimate: ${totalEther} `)

        let response = prompt("Would you like to continue deployment? Y/n: ")
    
        if(response !== "Y"){
            console.log('\x1b[31m%s\x1b[0m', "Canceled Deployment.")
            return
        }

        ricks = await cryptoRicks.new(nft_num, mintValue, [public_key_point.getX(), public_key_point.getY()], helper.address, {from: account.address});
        deployed[network]["CryptoRicks"] = {address: ricks.address, block: 0};
        console.log('\x1b[32m%s\x1b[0m', `Crypto Ricks Deployed to: ${network} at: ${ricks.address}`)

        fs.writeFileSync(__dirname + "DeployedContracts.json", JSON.stringify(deployed, null, 4))
        fs.writeFileSync(__dirname + "../webpage/src/DeployedContracts.json", JSON.stringify(deployed, null, 4))
        //fs.writeFileSync(__dirname + "../../web3-data/networks/DeployedContracts.json", JSON.stringify(deployed, null, 4))
        //await initCryptoRicks()
    }
    catch(e){
        console.log("Deployment threw error", e)
    }
}

const initCryptoRicks = async () =>{

    //console.log(vrfHelper)

    cryptoRicks.setProvider(web3.eth.currentProvider);
    cryptoRicks.setWallet(wallet)

    vrfHelper.setProvider(web3.eth.currentProvider);
    vrfHelper.setWallet(wallet);


    if(deployed[network] === undefined){
        deployed[network] = {}
    }
    if(deployed[network]["VRFHelper"] === undefined){
        console.log('\x1b[33m%s\x1b[0m', `VRF Helper has not been deployed on ${network}.`)
        return;
    }

    helper = await vrfHelper.at(deployed[network]["VRFHelper"].address)
    console.log(`Utilizing VRFHelper at: ${helper.address}`)

    if(deployed[network]["CryptoRicks"] === undefined){
        console.log('\x1b[33m%s\x1b[0m', `Crypto Ricks has not been deployed on ${network}.`)
        return;
    }

    ricks = await cryptoRicks.at(deployed[network]["CryptoRicks"].address)
    console.log(`Utilizing CryptoRicks at: ${ricks.address}`)
}

const initWallet = async () => {
    if(!bip39.validateMnemonic(mnemonic)){
        console.log('\x1b[31m%s\x1b[0m', `Invalid mnemonic given decrypt to execute dapp methods.'${mnemonic}'`);
        process.exit(1)
    }
    let seed = bip39.mnemonicToSeedSync(mnemonic);
    let hdkey = HDKey.fromMasterSeed(seed);

    let key = hdkey.derive("m/44'/60'/0'/0/0");
    let privateKey = "0x" + key.privateKey.toString('hex')
    await web3.eth.accounts.wallet.add(privateKey);

    wallet = web3.eth.accounts.wallet;
  
    account = wallet[0]

    private_key = BigInt(wallet[0].privateKey).toString()

    let balance = utils.fromWei((await web3.eth.getBalance(account.address)).toString(), "ether");

    console.log(`Account Address: ${account.address}, Balance: ${balance}`);
}

const initWeb3 = async () =>{
    while(true){
        switch(network){
            case "Ganache": web3 = new Web3(providers["Ganache"].url, web3_options as any); break;
            case "Goerli" : web3 = new Web3(providers["Goerli"].url, web3_options as any); break;
            case "Ethereum" : web3 = new Web3(providers["Ethereum"].url, web3_options as any); break;
            case "Hyperspace": web3 = new Web3(providers["Hyperspace"].url, web3_options as any); web3.eth.transactionBlockTimeout = 150; break;
            case "Filecoin": web3 = new Web3(providers["Filecoin"].url, web3_options as any); web3.eth.transactionBlockTimeout = 150; break;
            case "Base" : web3 = new Web3(providers["Base"].url, web3_options as any); break;
            case "BaseGoerli" : web3 = new Web3(providers["BaseGoerli"].url, web3_options as any); break;
            default: console.log('\x1b[31m%s\x1b[0m', "Invalid Network") ; process.exit(1);
        }
        try{
            chain_id = await web3.eth.getChainId();
            console.log('\x1b[32m%s\x1b[0m', `Chain ID: ${chain_id}`)
            return;
        }catch{
            console.log('\x1b[31m%s\x1b[0m', `Error Connecting to network: ${network}`)
            let response = prompt("Retry connection? Y/n: ")
            if(response !== "Y"){
                process.exit(1)
            }
        }
    }
}

interface Duper{
    [key : string] : string
}

const duplicate_metadata = async () =>{
    const duplicate = {} as Duper
    const dir = __dirname + `complete/${network}`
    const files = fs.readdirSync(dir)
    
    for(const filename of files){
        if(filename.includes(".json")){
            if(filename.includes("metadata"))
                continue;
            let metadata : Metadata | OriginalMetadata
            metadata = JSON.parse((fs.readFileSync(dir + `/${filename}`)).toString())
          
            metadata = filename.split(".json")[0] === "0" ? metadata as OriginalMetadata : metadata as Metadata
            if(duplicate[metadata.image] !== undefined){
                console.log(`Duplicate Found ${duplicate[metadata.image]} ${filename}`)
            }
            else{
                duplicate[metadata.image] = filename
            }
        }
    }
}

const mint_ricks_test = async(num: number) =>{
    if(network === "Ethereum"){
        console.log("Cannot run this test on Ethereum.")
    }
    let accounts = ['0xCA76A94C54b461d7230a59f4f78C1Dd3a0eACd63', '0x63aF8a630b84865939656939a69a5Ad5dC671951', '0x5D809456990F326f7C0901D359cb6B628f138991']

    let maxSupply = await ricks.MaxSupply();

    let mintValue = await ricks.MintValue();

    let tokenIds = await ricks.TokenIds()

    //let r = await new web3.eth.Contract(cRick.abi as AbiItem[], ricks.address)

    console.log('\x1b[33m%s\x1b[0m', `MaxSupply: ${maxSupply}, MintValue: ${utils.fromWei(mintValue, "ether")}, TokenIds: ${tokenIds}`);
    try{
        
        let nonce = await web3.eth.getTransactionCount(account.address);
        //console.log(nonce)
        let mints = []
        //let gas = await ricks.mint.estimateGas(account.address, {from:account.address, value: mintValue})
        //let gasPrice = Number(await web3.eth.getGasPrice()) * 3;
        //console.log(gasPrice)
        for(let i = tokenIds + 1; i < (tokenIds + 1 + num); i++){
            let receiver = accounts[Math.floor(Math.random() * 3)]
            mints.push(ricks.mint(receiver, {from: account.address, value: mintValue, nonce}))
            nonce++;
        }
        //console.log(mints)
        console.log("Waiting for transactions to settle...");
        console.time("Settle Time:")
        //let settled = await Promise.allSettled(mints)
        for(const mint of mints){
            const receipt = await mint;
            console.log(`tokenId: ${receipt.logs[0].args["tokenId"]}, receiver: ${receipt.logs[0].args["to"]}`)
        }
        console.timeEnd("Settle Time:");
        /*
        for(let s of settled){
            //console.log(s)
            if(s.status === "fulfilled"){
                console.log(`tokenId: ${s.value.logs[0].args["tokenId"]}, receiver: ${s.value.logs[0].args["to"]}`)
            }
            else{
                console.log(s.reason)
            }
        }*/
    }catch(e)
    {
        console.log(e)
    }
}

const retrieve_cid = async (add: boolean) : Promise<string> =>{
    
    try{
        /*
        const dirname = __dirname + `complete/${network}`
        const directory = fs.readdirSync(dirname)
        const source = [];
        for(const filename of directory){
            const content = fs.readFileSync(dirname + `/${filename}`)
            source.push({path: `${network}/${filename}`, content})
        }
        const blockstore = new MemoryBlockstore();

        const result = await all(importer(source, blockstore, {cidVersion: 1}))
        console.log("Metadata CID: ",result[result.length - 1].cid.toString())
        return result[result.length - 1].cid.toString()*/
        //console.log("Retrieve Cid")
        let ipfsJS = create({url: ipfsConnect.HttpJs, timeout: 5000})
        
        /*
        let pins = await all(await ipfs.pin.ls())
        for(let p of pins){
            await ipfs.pin.rm(p.cid)
        }
        console.log("removed")
        pins = await all(await ipfs.pin.ls())
        for(let p of pins){
            console.log(p)
        }*/
        const dir = __dirname + `complete/${network}`
        //console.log(dir)
        let files = await all(ipfsJS.addAll(globSource((dir), '**/*'), {pin: add, wrapWithDirectory: true, cidVersion: 1, onlyHash: !add,  timeout: 1000}))
        //console.log("js add done")
        if(add){
            let ipfsGO = create({url: ipfsConnect.HttpGo, timeout: 5000})
            //console.log(`ipfs connect: ${ipfsGO.isOnline()}`)
            await all(ipfsGO.addAll(globSource((dir), '**/*'), {pin: add, wrapWithDirectory: true, cidVersion: 1, onlyHash: !add,  timeout: 1000}))
            //console.log("ipfs add")
            console.log("Metadata CID:",files[files.length-1].cid.toString())
        }
        console.log(files[files.length - 1].cid.toString());
        return files[files.length - 1].cid.toString() as string;
        //for await(const file of ipfs.addAll(globSource((dir), '**/*'), {pin: true, wrapWithDirectory: true, cidVersion: 1, onlyHash:true,  timeout: 1000})){
        //    console.log(file)
        //}
    }
    catch{
        console.log("add metadata failed.")
        return ""
    }
    
}

const test_images = async () =>{
    for(let i in images){
        for(let j of images[i]){
            
            try{
                await mergeImages(["./images/hair/Hair_Teal.png", j], {Canvas, Image})
            }
            catch{
                console.log(`${i}: ${j}`)
            }
            
        }
    }
}


const node = async () => {

    const datastore = new MemoryDatastore();
    const blockstore = new MemoryBlockstore();
    const peerId = await createFromProtobuf(fs.readFileSync("PeerId"))
    const libp2p = await createLibp2p({
        datastore,
        peerId,
        addresses: {
            listen: [`/ip4/0.0.0.0/tcp/4005`,`/ip4/0.0.0.0/tcp/4006/ws`, `/ip6/::1/tcp/4007`, `/ip6/::1/tcp/4008/wss`, ]
        },
        transports: [
            webSockets(), tcp()
        ],
        connectionEncryption: [
            noise()
        ],
        streamMuxers: [
            yamux(), mplex()
        ],
        relay: {
            enabled: true,
            hop: {
              enabled: true,
              active: true
            }
        },
        dht: kadDHT(),
        peerDiscovery: [
            bootstrap({
                list: [
                    "/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",
                    "/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
                    "/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb",
                    "/dnsaddr/bootstrap.libp2p.io/p2p/QmZa1sAxajnQjVM8WjWXoMbmPd7NsWhfKsPkErzpm9wGkp",
                    "/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa",
                    "/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt",
                    "/dns4/node0.preload.ipfs.io/tcp/443/wss/p2p/QmZMxNdpMkewiVZLMRxaNxUeZpDUb34pWjZ1kZvsd16Zic",
                    "/dns4/node1.preload.ipfs.io/tcp/443/wss/p2p/Qmbut9Ywz9YEDrz8ySBSgWyJk41Uvm2QJPhwDJzJyGFsD6",
                    "/dns4/node2.preload.ipfs.io/tcp/443/wss/p2p/QmV7gnbW5VTcJ3oyM2Xk1rdFBJ3kTkvxc87UFGsun29STS",
                    "/dns4/node3.preload.ipfs.io/tcp/443/wss/p2p/QmY7JB6MQXhxHvq7dBDh4HpbH29v4yE9JRadAVpndvzySN",
                ]
            })
        ]
    })
    const helia = await createHelia({ datastore, blockstore, libp2p })

    
    const hfs = unixfs(helia)
    
    //console.log(__dirname)

    let complete = fs.readdirSync(__dirname + "complete")
    //console.log(complete)
    const directories = [];
    for(const dir of complete){
        //console.log(dir)
        const directory = fs.readdirSync(__dirname + "complete/" + dir)
        const files = []
        for(const file of directory){
            const path = __dirname + "complete/" + dir + "/" + file
            const content = fs.readFileSync(path)
            files.push({
                path: "/" + dir + "/" + file,
                content
            })
        }
        directories.push(files)
    }
    //console.log(directories)
    let dirname = 0;
    for(const dir of directories){
        const add = await all(hfs.addAll(dir, { cidVersion: 1 }))
        //const add = await all(importer(dir, helia.blockstore, {cidVersion: 1}))
        const pin = await helia.pins.add(add[add.length-1].cid)
        console.log(`${complete[dirname++]} ${pin.cid.toString()}: pinned!`)
    }
    exit = false

    console.log(helia.libp2p.getMultiaddrs())

    console.log(`Running Helia Node At: ${helia.libp2p.getMultiaddrs()[1].toString()}`)
    
    setInterval(() =>{
        process.stdout.write(`Peers: ${helia.libp2p.getPeers().length}` + '\r');
    }, 5000)
    
}

main();