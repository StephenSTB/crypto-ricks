import {useState, useEffect} from "react"
import { IPFSEntry } from "ipfs-core-types/dist/src/root";
import all from "it-all"
import { concat } from "uint8arrays/concat"
import "../../App.css";
import "./About.css";
import { OriginalMetadata, Metadata } from "../../interfaces/Interfaces";
import githubImg  from "../../images/github/github.png"
import { rick_images } from "../rick-images/RickImages";
import { HeliaIPFS } from '@sb-labs/web3-data/networks/IpfsConnect.js'

interface AboutProps{
    connected: boolean
    ricks: any;
    network: string;
    //ipfs: HeliaIPFS;
    metadata: Array<Metadata | OriginalMetadata>;
    baseURI: string;
    distributor: string;
    explorer: string;
    copywrite: any;
}

export const About = (props: AboutProps) =>{

    const [state, setState] = useState({iterations: 0, contract_address: "", distributor_address: ""})

    useEffect(() =>{
        const initialize = async () =>{
            //let ipfs = props.ipfs
            let metadata = props.metadata[0] as OriginalMetadata;
            //console.log(metadataFiles)
            //let data = await concat(await all(ipfs.fs.cat(metadataFiles[0].cid)))
            //let metadata = JSON.parse(new TextDecoder().decode(data).toString()) as OriginalMetadata
            //console.log(metadata)
            let iterations = metadata.iterations 
            
            let contract_address = props.ricks.address.slice(0,5) + "..." + props.ricks.address.slice(38);
            let distributor_address = props.distributor.slice(0,5) + "..." + props.distributor.slice(38);
            setState(() =>({ iterations, contract_address, distributor_address}))
        }
        if(props.connected){
            initialize();
        }

    }, [props])

    return <div className="main about">
                <div id="about">
                    <div id="introduction"><h2>Introduction</h2> <div>Crypto Ricks is a Crypto Art NFT project built on Ethereum and IPFS utilizing VRF randomization to create 1000 unique NFTs!</div> </div>
                    <div id="attributes">
                        <h2>Attributes</h2>
                        <div id="attributes-introduction">
                        Crypto Ricks images are composed of <span className="highlight">eight traits</span> described below.
                        </div>
                        <div id="table-outer">
                            <div id="table-top">
                                <div id="table-spacer"/>
                                <div id="top-label">
                                    <div id="value-label"><span className="highlight">Value:</span></div>
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
                                    <div id="side-label"><p id="traits-label"><span className="highlight">Traits:</span></p></div>
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
                                        <div className="table-col"><img className="table-image table-hair" src={rick_images.hair["teal"]} alt=""/></div>
                                        <div className="table-col"><img className="table-image table-hair" src={rick_images.hair["green"]} alt=""/></div>
                                        <div className="table-col"><img className="table-image table-hair" src={rick_images.hair["orange"]} alt=""/></div>
                                        <div className="table-col"><img className="table-image table-hair" src={rick_images.hair["purple"]} alt=""/></div>
                                        <div className="table-col-last"><img className="table-image table-hair" src={rick_images.hair["yellow"]} alt=""/></div>
                                    </div>
                                    <div className="table-row"> {/*coat*/}
                                        <div className="table-col"><img className="table-image table-coat" src={rick_images.coat["white"]} alt=""/></div>
                                        <div className="table-col"><img className="table-image table-coat" src={rick_images.coat["green"]} alt=""/></div>
                                        <div className="table-col"><img className="table-image table-coat" src={rick_images.coat["purple"]} alt=""/></div>
                                        <div className="table-col"><img className="table-image table-coat" src={rick_images.coat["red"]} alt=""/></div>
                                        <div className="table-col-last"><img className="table-image table-coat" src={rick_images.coat["teal"]} alt=""/></div>
                                    </div>
                                    <div className="table-row"> {/*shirt*/}
                                        <div className="table-col"><img className="table-image table-shirt" src={rick_images.shirt["teal"]} alt=""/></div>
                                        <div className="table-col"><img className="table-image table-shirt" src={rick_images.shirt["green"]} alt=""/></div>
                                        <div className="table-col"><img className="table-image table-shirt" src={rick_images.shirt["orange"]} alt=""/></div>
                                        <div className="table-col"><img className="table-image table-shirt" src={rick_images.shirt["purple"]} alt=""/></div>
                                        <div className="table-col-last"></div>
                                    </div>
                                    <div className="table-row"> {/*head*/}
                                        <div className="table-col"><img className="table-image table-head" src={rick_images.head["beige"]} alt=""/></div>
                                        <div className="table-col"><img className="table-image table-head" src={rick_images.head["brown"]} alt=""/></div>
                                        <div className="table-col"><img className="table-image table-head" src={rick_images.head["dark"]} alt=""/></div>
                                        <div className="table-col"><img className="table-image table-head" src={rick_images.head["gray"]} alt=""/></div>
                                        <div className="table-col-last"></div>
                                    </div>
                                    <div className="table-row"> {/*face*/}
                                        <div className="table-col"><img className="table-image table-face" src={rick_images.face["normal"]} alt=""/></div>
                                        <div className="table-col small-font"><img className="table-image table-face" src={rick_images.face["baggy eyelids"]} alt=""/></div>
                                        <div className="table-col small-font"><img className="table-image table-face" src={rick_images.face["large wrinkle"]} alt=""/></div>
                                        <div className="table-col small-font"><img className="table-image table-face" src={rick_images.face["small wrinkle"]} alt=""/></div>
                                        <div className="table-col-last"></div>
                                    </div>
                                    <div className="table-row"> {/*eyebrow*/}
                                        <div className="table-col"><img className="table-image table-eyebrow" src={rick_images.eyebrow["teal"]} alt=""/></div>
                                        <div className="table-col"><img className="table-image table-eyebrow" src={rick_images.eyebrow["green"]} alt=""/></div>
                                        <div className="table-col"><img className="table-image table-eyebrow" src={rick_images.eyebrow["orange"]} alt=""/></div>
                                        <div className="table-col"><img className="table-image table-eyebrow" src={rick_images.eyebrow["purple"]} alt=""/></div>
                                        <div className="table-col-last"><img className="table-image table-eyebrow" src={rick_images.eyebrow["yellow"]} alt=""/></div>
                                    </div>
                                    <div className="table-row"> {/*eyes*/}
                                        <div className="table-col"><img className="table-image table-eyes" src={rick_images.eyes["white"]} alt=""/></div>
                                        <div className="table-col"><img className="table-image table-eyes" src={rick_images.eyes["green"]} alt=""/></div>
                                        <div className="table-col"><img className="table-image table-eyes" src={rick_images.eyes["orange"]} alt=""/></div>
                                        <div className="table-col"><img className="table-image table-eyes" src={rick_images.eyes["red"]} alt=""/></div>
                                        <div className="table-col-last"></div>
                                    </div>
                                    <div className="table-row-last"> {/*drool*/}
                                        <div className="table-col"><img className="table-image table-drool" src={rick_images.drool["green"]} alt=""/></div>
                                        <div className="table-col"><img className="table-image table-drool" src={rick_images.drool["orange"]} alt=""/></div>
                                        <div className="table-col"><img className="table-image table-drool" src={rick_images.drool["purple"]} alt=""/></div>
                                        <div className="table-col"><img className="table-image table-drool" src={rick_images.drool["teal"]} alt=""/></div>
                                        <div className="table-col-last"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p id="attribute-percentage">
                            &nbsp;&nbsp;&nbsp;&nbsp;Each Rick can be evaluated versus the
                            original by their <span className="highlight">original percentage</span> attribute. 
                            The original percentage varies by values of 12.5 giving nine possible percentages: <span className="highlight">0, 12.5, 25, 37.5, 50, 62.5, 75, 87.5, 100. </span>
                        </p>
                    </div>    
                    <div id="generation">
                        <h2>Generation Process</h2>
                        <p id="generation-introduction">
                        &nbsp;&nbsp;&nbsp;&nbsp;The process utilized to create the unique Ricks relied on the usage of key resources including &nbsp;
                        <a className="about-link" href="https://github.com/witnet/vrf-rs">vrf-rs, </a> 
                            <a className="about-link" href="https://github.com/multiformats/js-multiformats">multiformats</a> and <a className="about-link"  href="https://github.com/merkletreejs/merkletreejs">merkletreejs.</a> 
                            Each Rick created is based on the result of a <span className="highlight">VRF (Verifiable Random Function)</span> operation. 
                            The VRF uses the distributor private key and a message to generate a random hash and proof of the hash. 
                            The public key point, message and VRF proof can be utilized to verify correctness of the hash. 
                            The hash generated by the VRF is a random number and thus is perfect to generate random traits for our Ricks!
                            To begin generating unique Crypto Rick NFT's first the original Rick (containing original traits) had to be found using the VRF. 
                            The smart contract address of the NFT collection was used as the seed message to begin generating hashes to find the original Rick.
                            Each resulting hash was used as the next message until the original Rick was found. &nbsp;
                            <span className="highlight">{state.iterations} iterations</span> were taken to find the orignial Rick from the contract seed. Once the original Rick was found appropriate metadata is created. 
                            The JSON CID (Content Identifier) from the original Ricks metadata was then used to seed the VRF for the first unique Rick. 
                            Subsequent Ricks were generated from VRF seeded from the previous Ricks CID of their metadata.
                            The VRF hash is a 66 character hex (base 16) string of which the last eight characters are used to determine the attributes of the Rick. 
                            The order of attributes from the greatest 66th to least 59th characters are: hair, coat, shirt, head, face, eyebrow, eyes and drool,.
                            Each character is taken modulo 4 or 5 depending on the trait to determine its value for the Rick.(See <a className="about-link"  href="#table-outer">Attributes chart</a> above)
                            Once the metadata from a Rick is generated a hash (Merkle tree leaf) is generated from the Ricks CID, VRF message and VRF proof. 
                            After completion of generating the Ricks a Merkle tree is created from the Merkle tree leaves for on chain verification of the NFT collection.
                        </p>
                    </div>
                    <div id="about-contract">
                        <h2>Smart Contract </h2>
                        <div id="contract-introduction">
                        &nbsp;&nbsp;&nbsp;&nbsp;The Crypto Ricks smart contract can be analyzed at:<a className="about-link" href={props.explorer + props.ricks.addres}>{state.contract_address}</a>&nbsp;
                        The contract conforms to the ERC 721 standard and utilizes <a className="about-link"  href="https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/cryptography/MerkleProof.sol">merkleprool</a> and <a className="about-link" href="https://github.com/witnet/vrf-solidity">vrf-solidity</a>
                        to verify correctness of the NFT's generated. 
                        The contract contains an immutable distributor address:&nbsp;<a className="about-link"  href={props.explorer + props.distributor}>{state.distributor_address}</a> which was used to sign each NFT's metadata and generate VRFs proving authenticity.
                        </div>
                    </div>
                    <div id="about-metadata">
                        <h2>Metadata </h2>
                        <div id="metadata-introduction">
                        &nbsp;&nbsp;&nbsp;&nbsp;The complete metadata for the NFT's can be found <a className="about-link"  href={props.baseURI}>here.</a>&nbsp;
                            To ensure authenticity of the NFTs' each JSON Metadata object was signed in the form `name-id-external_url-iterations-vrf_message_hex-metadata-vrf_proof-image-attributes-network-chain_id-distributor-contract` (each metadata variable separated by a dash).
                            The complete metadata directory contains a metadata json file which contains the Merkle root, Merkle leaves and contract. This is signed by the distributor in the form `root-leaves-contract` as well and is utilized for NFT verification.
                        </div>
                    </div>
                    <div id="about-protocol">
                        <h2>Protocol</h2>
                        <div id="protocol-introduction">
                        &nbsp;&nbsp;&nbsp;&nbsp;To guarantee <span className="highlight">authenticity</span> of the NFT's created, a specific distribution process was utilized. 
                        First the Crypto Ricks smart contract was deployed containing an <span className="highlight">immutable Distributor</span> address and <span className="highlight"> immutable VRF public key points x and y.</span>
                        It can be independently verified that the public key points used to prove the VRF operations belong to the Distributor address.
                        Once the smart contract was deployed metadata generation procedures could then begin. First the original Rick NFT had to be found using the contract seed. 
                        (iteration results from this process were recorded for verification in iterations.json.)
                        Next the Ricks metadata were generated and <span className="highlight">signed</span> utilizing the distributor address. (Ricks metadata are in the form 0.json 1.json ... etc)
                        After that a Merkle tree was created and metadata associated was signed with the distributor address. ( NFT verification metadata recorded in metadata.json)
                        Once the metadata directory was completed a non distributed CID was created.
                        Next the SetProofVariables function was called on the contract. So, the baseURI (containing metadata directory CID) and Merkle root were posted on chain. 
                        (A non distributed baseURI was posted to prevent front running.)
                        Finally, the NFT metadata was distributed on IPFS! Let there be <a className="about-link"  href="https://CryptoRicks.eth.limo">Crypto Ricks! </a>(Note all ricks can be viewed before minting this was not overlooked.)
                        </div>
                    </div>
                    {/*
                    <div id="about-webpage">
                        <h2>Webpage</h2>
                        <div id="webpage-introduction">
                        &nbsp;&nbsp;&nbsp;&nbsp;The CryptoRicks webpage is hosted on and retrieves all data via Helia IPFS and EVM compatible networks (Goerli, Ethereum, Hyperspace). 
                        </div>
                            </div>*/}
                    <h2>Github</h2>
                    To view the project in depth click below.
                    <a  href="https://github.com/stephenstb/crypto-ricks"><img id="github-image" src={githubImg} alt=""/></a>
                    {/*props.copywrite*/}
                </div>
            </div>
}
