import  mergeImages from "merge-images";
import {Canvas, Image} from "canvas";
import promptImport from "prompt-sync";
import { MnemonicManager, encryptedMnemonic } from "@sb-labs/mnemonic-manager";
import fs from "fs"
import * as Block from 'multiformats/block';
import * as json from 'multiformats/codecs/json';
import * as raw from "multiformats/codecs/raw"
import { sha256 } from 'multiformats/hashes/sha2';
import { generate_public_key, generate_vrf } from "@sb-labs/vrf-js";
import bip39 from "bip39";
import Web3 from "web3";
import { providers } from "@sb-labs/web3-data"
import HDKey from "hdkey"
import { contractFactory } from "@sb-labs/contract-factory";
import deployedContracts from "./DeployedContracts.json" assert {type: "json"}
import { URL } from 'url';
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256/dist/keccak256.js"
import { DeployedContracts } from "@sb-labs/web3-data";

const __dirname = new URL('.', import.meta.url).pathname;

const deployed = deployedContracts as DeployedContracts

interface OriginalMetadata{
    name: string;
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

// Attributes
const types = {
    hair: ["teal", "green", "orange", "purple", "yellow"], // .25
    coat: ["white", "green", "purple", "red", "teal"], // .25
    shirt: ["teal", "green", "orange", "purple"],// .3125
    head: ["beige", "brown", "dark", "gray"], //.3132
    face: ["normal", "baggy eyelids", "large wrinkle", "small wrinkle"], // .3132
    eyebrow: ["teal", "green", "orange", "purple", "yellow"], //.25
    eyes: ["white", "green", "orange", "red"], // .3125
    drool: ["green", "orange", "purple", "teal"] // .3125
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

let vrfHelper = contractFactory.VRFHelper;

let cryptoRicks = contractFactory.CryptoRicks;

let helper : any;

let ricks: any;

let leaves = [] as any;

let nft_num = 10;

/*
* Distribution workflow
* Deploy Contract ( With Randomization Public Key Hash ) X
* Create Metadata With VRF Using Public Key X
* Create Merkle Tree of VRF Proofs for viewable nft verification. X
* Set Proof Variables ( BaseURI, Public Key used for Randomization, Merkle Root used for Randomization Verification. ) X
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
    
    while(network === undefined){
        switch(args[2]){
            case "Ganache": web3 = new Web3(providers["Ganache"].url); break;
            case "Goerli" : web3 = new Web3(providers["Goerli"].url); break;
            case "Ethereum" : web3 = new Web3(providers["Ethereum"].url); break;
            default: break;
        }
        try{
            chain_id = await web3.eth.getChainId();
            console.log('\x1b[32m%s\x1b[0m', `Chain ID: ${chain_id}`)
            network = args[2];
        }catch{
            console.log('\x1b[31m%s\x1b[0m', `Error Connecting to network: ${args[2]}`)
            let response = prompt("Retry connection? Y/n: ")
            if(response !== "Y"){
                process.exit(1)
            }
        }
    }

    await initWallet();

    await initCryptoRicks();

    switch(args[3]){
        case "Deploy" : await deploy(); break;
        case "GenerateMetadata" : await generate_metadata(); break;
        case "SetProofVariables": await set_proof_variables(args[4]); break;
        case "VerifyNFTs": await verify_nfts(); break;
        case "Mint": await mint_nft(args[4]); break;
        case "Balance" : await balance(); break;
        case "Claim" : await claim(); break;
        case "TokenURI": await token_uri(Number(args[4])); break;
        case "TestImages": await test_images(); break;
        default: break;
    }

    process.exit(0)
}

const token_uri = async (token_id: number) =>{
    let token_uri = await ricks.tokenURI(token_id)
    console.log(`URI for token id ${token_id}: ${token_uri}`)
}

const balance = async () =>{

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
        let data = JSON.parse(fs.readFileSync(`./complete/${network}/metadata.json`).toString())
        //console.log(data.leaves)
        let tree = new MerkleTree(data.leaves, keccak256, {sort: true});
        //console.log(tree.getRoot().toString('hex'))
        let root = await ricks.Root();
        //console.log(root)
        let signatures = true;
        let verification = true
        for(let i = 0; i < nft_num; i++){
            
            let metadata = JSON.parse(fs.readFileSync(`./complete/${network}/${i}.json`).toString()) as Metadata
            let verified_signature = verify_signature(metadata)
            if(!verified_signature){
                signatures = verified_signature
                break;
            }
            
            let verified_nft = await verify_nft(metadata, tree)
            //console.log(verified_nft)
            if(!verified_nft){
                verification = verified_nft;
                break;
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

const verify_nft = async (metadata: Metadata, tree: MerkleTree) : Promise<boolean> => {
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

const verify_signature = (metadata: Metadata) : boolean =>{

    let message = `${metadata.name}-${metadata.id}-${metadata.external_url}-${metadata.previous_cid}-${metadata.vrf_message_hex}-${metadata.vrf_hash}-${metadata.vrf_proof}-${metadata.image}-${JSON.stringify(metadata.attributes)}-${metadata.network}-${metadata.chain_id}-${metadata.distributor}-${metadata.contract}`

    let signer = web3.eth.accounts.recover(message, metadata.signature);

    return signer === account.address;
}

const set_proof_variables = async (cid : string) =>{

    let base_uri = "ipfs://" + cid + "/";

    let public_key = generate_public_key(private_key).publicKey;

    let metadata = JSON.parse(fs.readFileSync(`./complete/${network}/metadata.json`).toString())
    
    console.log('\x1b[33m%s\x1b[0m', `BaseURI: ${base_uri}, Public Key: ${public_key}, Root: ${metadata.root}`)

    let response = prompt("Would you like to continue setting proof variables? Y/n: ")
    
    if(response !== "Y"){
        console.log('\x1b[31m%s\x1b[0m', "Canceled Setting Proof.")
        return
    }

    let gas = await ricks.setProofVariables.estimateGas(base_uri, public_key, metadata.root, {from: account.address})

    //console.log(gas)

    let gasPrice = Number(await web3.eth.getGasPrice())
    //console.log(gasPrice)
    let totalEther = utils.fromWei((gas * gasPrice).toString())
    //console.log(totalEther)
    gasPrice = Number(utils.fromWei(gasPrice.toString(), "gwei"))
    if(gasPrice > 30){
        console.log('\x1b[31m%s\x1b[0m', `Gas price of ${gasPrice} is to high for deployment.`)
        return
    }

    console.log('\x1b[33m%s\x1b[0m', `gas estimate: ${gas}, gas price in gwei: ${gasPrice}, total cost estimate: ${totalEther} `)

    await ricks.setProofVariables(base_uri, public_key, metadata.root, {from: account.address})

    let root = await ricks.Root()

    console.log('\x1b[32m%s\x1b[0m',`Crypto Ricks Root: ${root}`)
}


const generate_metadata = async () =>{

    // find vrf proof from for orignial
    console.log('\x1b[33m%s\x1b[0m',"Finding the Original Crypto Rick...")
    console.time("Time to find Rick")
    let original_message = ricks.address.replace("0x", "")
    let original_vrf = generate_vrf(private_key, original_message);
    let iterations = 0;
    let found = false;
    
    while(iterations < 200000){
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
        iterations++;
    }
    console.timeEnd("Time to find Rick")
    if(!found)
    {
        console.log('\x1b[31m%s\x1b[0m', `the original rick could not be found`)
        return;
    }

    console.log('\x1b[32m%s\x1b[0m', `${iterations} iterations were taken to find the orginial rick!`)

    let original = await mergeImages(["./images/hair/Hair_Teal.png", "./images/coat/Coat_White.png", "./images/shirt/Shirt_Teal.png", "./images/head/Head_Beige.png", 
                                "./images/face/Face_Normal.png", "./images/eyebrow/Eyebrow_Teal.png", "./images/eyes/Eyes_White.png", "./images/drool/Drool_Green.png"], {Canvas, Image});
    let data = Buffer.from(original.replace(/^data:image\/\w+;base64,/, ""), "base64");
    fs.writeFileSync("./images/original/OriginalRick.png", data)
    /*
    let buf = fs.readFileSync("./complete/0.png");

    console.log(buf);*/

    let image_block = await Block.encode({value: data, codec: raw, hasher: sha256});

    fs.writeFileSync(`./complete/${network}/${image_block.cid.toString()}.png`, data);

    console.log(` original image cid: ${image_block.cid.toString()}`)

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

    console.log(leaves);

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
    
    let metadata = {name : `Crypto Rick ${id}`, id, external_url: "CryptoRicks.eth", iterations, vrf_message_hex, vrf_hash, vrf_proof, image, attributes: atts, network, chain_id, 
                    distributor: account.address, contract: ricks.address, signature: ""} as OriginalMetadata
    let signature = account.sign(`${metadata.name}-${metadata.id}-${metadata.external_url}-${metadata.iterations}-${vrf_message_hex}-${metadata.vrf_hash}-${metadata.vrf_proof}-${metadata.image}-${JSON.stringify(metadata.attributes)}-${metadata.network}-${metadata.chain_id}-${metadata.distributor}-${metadata.contract}`).signature
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
    
    let metadata = {name : `Crypto Rick ${id}`, id, external_url: "CryptoRicks.eth", previous_cid, vrf_message_hex, vrf_hash, vrf_proof, image, attributes: atts, network, chain_id, 
                    distributor: account.address, contract: ricks.address, signature: ""} as Metadata
    let signature = account.sign(`${metadata.name}-${metadata.id}-${metadata.external_url}-${metadata.previous_cid}-${vrf_message_hex}-${metadata.vrf_hash}-${metadata.vrf_proof}-${metadata.image}-${JSON.stringify(metadata.attributes)}-${metadata.network}-${metadata.chain_id}-${metadata.distributor}-${metadata.contract}`).signature
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
            deployed[network]["VRFHelper"] = helper.address;
            console.log('\x1b[32m%s\x1b[0m', `VRF Helper Deployed to: ${network} at: ${helper.address}`)
        }
        if(deployed[network]["CryptoRicks"] !== undefined){
            let response = prompt(`Would you like to overwrite the contract ${deployed[network]["CryptoRicks"]} for ${network} network Y/n ? `)
    
            if(response !== "Y"){
                console.log('\x1b[31m%s\x1b[0m', "Canceled Deployment.")
                return
            }
        }
        
        let result = generate_public_key(private_key)
        
        let public_key_hash = utils.soliditySha3(result.publicKey)
        
        let gas = await cryptoRicks.new.estimateGas(nft_num, utils.toWei("0.005", "ether") , public_key_hash, helper.address, {from: account.address})

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

        ricks = await cryptoRicks.new(nft_num, utils.toWei("0.005"), public_key_hash, helper.address, {from: account.address});
        deployed[network]["CryptoRicks"] = ricks.address;
        console.log('\x1b[32m%s\x1b[0m', `Crypto Ricks Deployed to: ${network} at: ${ricks.address}`)

        fs.writeFileSync(__dirname + "DeployedContracts.json", JSON.stringify(deployed, null, 4))
        fs.writeFileSync(__dirname + "../webpage/src/DeployedContracts.json", JSON.stringify(deployed, null, 4))
        //fs.writeFileSync(__dirname + "../../web3-data/networks/DeployedContracts.json", JSON.stringify(deployed, null, 4))
    }
    catch(e){
        console.log("Deployment threw error", e)
    }
}

const initCryptoRicks = async () =>{

    cryptoRicks.setProvider(web3.eth.currentProvider);
    cryptoRicks.setWallet(wallet)

    vrfHelper.setProvider(web3.eth.currentProvider);
    vrfHelper.setWallet(wallet);
    //vrfHelper.defaults({from: account.address})

    if(deployed[network] === undefined){
        deployed[network] = {}
    }
    if(deployed[network]["VRFHelper"] === undefined){
        console.log('\x1b[33m%s\x1b[0m', `VRF Helper has not been deployed on ${network}.`)
        return;
    }

    if(deployed[network]["CryptoRicks"] === undefined){
        console.log('\x1b[33m%s\x1b[0m', `Crypto Ricks has not been deployed on ${network}.`)
        return;
    }

    ricks = await cryptoRicks.at(deployed[network]["CryptoRicks"])
    console.log(`Utilizing CryptoRicks at: ${ricks.address}`)

    helper = await vrfHelper.at(deployed[network]["VRFHelper"])
    console.log(`Utilizing VRFHelper at: ${helper.address}`)
}

const initWallet = async () => {
    if(!bip39.validateMnemonic(mnemonic)){
        
        console.log('\x1b[31m%s\x1b[0m', "Invalid mnemonic given decrypt to execute dapp methods.");
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

main();