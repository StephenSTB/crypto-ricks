import {useState, useEffect} from "react"
import { IPFSHTTPClient } from "ipfs-http-client";
import { IPFSEntry } from "ipfs-core-types/dist/src/root";
import all from "it-all"
import { concat } from "uint8arrays/concat"
import "../../App.css";
import "./About.css";
import { OriginalMetadata } from "../../interfaces/Interfaces";
import githubImg  from "../../images/github.png"

interface AboutProps{
    connected: boolean
    ricks: any;
    network: string;
    ipfs: IPFSHTTPClient;
    metadataFiles: Array<IPFSEntry>;
    baseURI: string;
    distributor: string;
}

export const About = (props: AboutProps) =>{

    const [state, setState] = useState({init: true, url: "", iterations: 0, contract_address: "", distributor_address: ""})

    const init = async () =>{
            let ipfs = props.ipfs
            let metadataFiles = props.metadataFiles;
            console.log(metadataFiles)
            let data = await concat(await all(ipfs.cat(metadataFiles[0].cid)))
            let metadata = JSON.parse(new TextDecoder().decode(data).toString()) as OriginalMetadata
            console.log(metadata)
            let iterations = metadata.iterations
            let url = props.network === "Ethereum" ? "https://etherscan.io/address/"  : props.network === "Goerli" ? "https://goerli.etherscan.io/address/" : ""
            let contract_address = props.ricks.address.slice(0,5) + "..." + props.ricks.address.slice(38);
            let distributor_address = props.distributor.slice(0,5) + "..." + props.distributor.slice(38);
            setState({init: false, url, iterations, contract_address, distributor_address})
    }

    useEffect(() =>{
        if(state.init && props.connected){
            init();
        }

    }, [props.connected])

    return <div className="main">
                <div id="about">
                    <div id="introduction"><h2>Introduction</h2> <div>Crypto Ricks is a Crypto Art NFT project built on Ethereum and IPFS utilizing VRF randomization to create 1000 unique NFTs!</div> </div>
                    <div id="attributes">
                        <h2>Attributes</h2>
                        <div id="attributes-intro">
                            &nbsp;&nbsp;&nbsp;&nbsp;Crypto Ricks images are composed of eight traits described below.
                        </div>
                        <div id="table-outer">
                            <div id="table-top">
                                <div id="table-spacer"/>
                                <div id="top-label">
                                    <div id="value-label">Value:</div>
                                    <div id="top-values">
                                        <div className="attribute-value">0</div>
                                        <div className="attribute-value">1</div>
                                        <div className="attribute-value">2</div>
                                        <div className="attribute-value">3</div>
                                        <div className="attribute-value-last">4</div>

                                    </div>
                                </div>
                            </div>
                            <div id="table-main">
                                <div id="table-side">
                                    <div id="side-label"><p id="traits-label">Traits:</p></div>
                                    <div id="side-traits">
                                        <div className="side-trait">Hair:</div>
                                        <div className="side-trait">Coat:</div>
                                        <div className="side-trait">Shirt:</div>
                                        <div className="side-trait">Head:</div>
                                        <div className="side-trait">Face:</div>
                                        <div className="side-trait">Eyebrow:</div>
                                        <div className="side-trait">Eyes:</div>
                                        <div className="side-trait-last">Drool:</div>
                                    </div>
                                </div>
                                {
                                    // Attributes
                                    /*
                                    const types = {
                                        hair: ["teal", "green", "orange", "purple", "yellow"], // .25
                                        coat: ["white", "green", "purple", "red", "teal"], // .25
                                        shirt: ["teal", "green", "orange", "purple"],// .3125
                                        head: ["beige", "brown", "dark", "gray"], //.3132
                                        face: ["normal", "baggy eyelids", large wrinkle", "small wrinkle"], // .375
                                        eyebrow: ["teal", "green", "orange", "purple", "yellow"], //.25
                                        eyes: ["white", "green", "orange", "red"], // .3125
                                        drool: ["green", "orange", "purple", "teal"] // .3125
                                    }*/
                                }
                                <div id="table">
                                    <div className="table-row"> {/*hair*/}
                                        <div className="table-col">teal</div>
                                        <div className="table-col">green</div>
                                        <div className="table-col">orange</div>
                                        <div className="table-col">purple</div>
                                        <div className="table-col-last">yellow</div>
                                    </div>
                                    <div className="table-row"> {/*coat*/}
                                        <div className="table-col">white</div>
                                        <div className="table-col">green</div>
                                        <div className="table-col">purple</div>
                                        <div className="table-col">red</div>
                                        <div className="table-col-last">teal</div>
                                    </div>
                                    <div className="table-row"> {/*shirt*/}
                                        <div className="table-col">teal</div>
                                        <div className="table-col">green</div>
                                        <div className="table-col">orange</div>
                                        <div className="table-col">purple</div>
                                        <div className="table-col-last"></div>
                                    </div>
                                    <div className="table-row"> {/*head*/}
                                        <div className="table-col">beige</div>
                                        <div className="table-col">brown</div>
                                        <div className="table-col">dark</div>
                                        <div className="table-col">gray</div>
                                        <div className="table-col-last"></div>
                                    </div>
                                    <div className="table-row"> {/*face*/}
                                        <div className="table-col">normal</div>
                                        <div className="table-col small-font">baggy eyelids</div>
                                        <div className="table-col small-font">large wrinkle</div>
                                        <div className="table-col small-font">small wrinkle</div>
                                        <div className="table-col-last"></div>
                                    </div>
                                    <div className="table-row"> {/*eyebrow*/}
                                        <div className="table-col">green</div>
                                        <div className="table-col">green</div>
                                        <div className="table-col">orange</div>
                                        <div className="table-col">purple</div>
                                        <div className="table-col-last">yellow</div>
                                    </div>
                                    <div className="table-row"> {/*eyes*/}
                                        <div className="table-col">white</div>
                                        <div className="table-col">green</div>
                                        <div className="table-col">orange</div>
                                        <div className="table-col">red</div>
                                        <div className="table-col-last"></div>
                                    </div>
                                    <div className="table-row-last"> {/*drool*/}
                                        <div className="table-col">green</div>
                                        <div className="table-col">orange</div>
                                        <div className="table-col">purple</div>
                                        <div className="table-col">teal</div>
                                        <div className="table-col-last"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="attribute-percentage">
                            &nbsp;&nbsp;&nbsp;&nbsp;Each Rick can be evalutated versus the original by their original percentage attribute. 
                            The original percentage varies by values of 12.5 giving nine possible percentages (0, 12.5, 25, 37.5, 50, 62.5, 75, 87.5, 100). 
                        </div>
                    </div>    
                    <div id="generation">
                        <h2>Generation Process</h2>
                        <p id="generation-introduction">
                        &nbsp;&nbsp;&nbsp;&nbsp;The process utilized to create the unique Ricks relied on the usage of key resources including &nbsp;
                        <a className="about-link" href="https://github.com/witnet/vrf-rs">vrf-rs, </a> 
                            <a className="about-link" href="https://github.com/multiformats/js-multiformats">multiformats</a> and <a href="https://github.com/merkletreejs/merkletreejs">merkletreejs.</a> 
                            Each Rick created is based on the result of a VRF (Verifiable Random Function) operation. 
                            The VRF uses a private key and message to generate a random hash and proof of the hash. 
                            The public key, message and vrf proof can be utilized to verify correctness of the hash. 
                            The hash generated by the VRF is a random number and thus is perfect to generate random traits for our Ricks!
                            To begin generating unique Crypto Rick NFT's first the original Rick (containing original traits) must be found using the VRF. 
                            The smart contract address of the NFT collection is used as the seed message to begin generating hashes to find the original Rick.
                            Each resulting hash is used as the next message until the original Rick is found.&nbsp;
                            <span id="iterations">{state.iterations}</span> iterations were taken to find the orignial Rick from the contract seed. Once the original Rick is found appropriate metadata is created. 
                            The JSON CID (Content Identifier) from the orignal Ricks metadata was then used to seed the VRF for the first unique Rick. 
                            Subsequent Ricks were generated from VRF seeded from the previous Ricks CID of their metadata.
                            Once the metadata from a Rick is generated a hash (merkle tree leaf) is generated from the Ricks CID, VRF message and VRF proof. 
                            After completion of generating the Ricks a merkle tree is created from the merkle tree leaves for on chain verification of the NFT collection.
                        </p>
                    </div>
                    <div id="about-contract">
                        <h2>Smart Contract </h2>
                        <div id="contract-introduction">
                        &nbsp;&nbsp;&nbsp;&nbsp;The Crypto Ricks smart contract can be analyzied at:<a className="about-link" href={state.url + props.ricks.addres}>{state.contract_address}</a>&nbsp;
                        The contract conforms to the ERC 721 standard and utilizes <a href="https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/cryptography/MerkleProof.sol">merkleprool</a> and <a className="about-link" href="https://github.com/witnet/vrf-solidity">vrf-solidity</a>
                        to verfiy correctness of the NFT's generated. 
                        The contract contains an immutable distributor address:&nbsp;<a href={state.url + props.distributor}>{state.distributor_address}</a> which was used to sign each NFT's metadata prooving authenticity.
                        </div>
                    </div>
                    <div id="about-metadata">
                        <h2>Metadata </h2>
                        <div id="metadata-introduction">
                        &nbsp;&nbsp;&nbsp;&nbsp;The complete metadata for the NFT's can be found <a href={props.baseURI}>here.</a>&nbsp;
                            To ensure authenticiy of the NFTs' each JSON Metadata object was signed in the form `name-id-external_url-iterations-vrf_message_hex-metadata-vrf_proof-image-attributes-network-chain_id-distributor-contract` (each metadata variable separated by a dash).
                            The complete metadata directory contains a metadata json file which contains the merkle root, merkle leaves and contract. This is signed by the distributor in the form `root-leaves-contract` as well and is utilized for NFT verification.
                        </div>
                    </div>
                    <div id="about-protocol">
                        <h2>Protocol</h2>
                        <div id="protocol-introduction">
                        &nbsp;&nbsp;&nbsp;&nbsp;To gaurentee authenticity of the NFT's created a specific distribution process was utilized. 
                        First the Crypto Ricks smart contract was deployed containing an immutable distributor address and immutable vrf public key hash. 
                        Next the Ricks were generated and signed utilizing tha distributor address. 
                        After that a Merkle tree was created and metadata associated was signed with the distributor address. 
                        Once the metadata directory was completed a non distributed CID was created.
                        Next the SetProofVariables function was called on the contract. So, the baseURI (containing metadata directory CID), VRF public key and Merkle root were posted on chain. 
                        (VRF public key was verified with with public key hash, non distributed uri posted to prevent front running).
                        Finally, the NFT metadata was distributed on IPFS! Let there be <a href="https://CryptoRicks.eth.limo">Crypto Ricks! </a>(Note all ricks can be viewed before minting this was not overlooked.)
                        </div>
                    </div>
                    <a href="https://github.com/stephenstb/crypto-ricks"><img src={githubImg}/></a>
                </div>
            </div>
}
