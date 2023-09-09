# Crypto Ricks

## Introduction
  Crypto Ricks images are composed of eight traits.
  Each Rick can be evaluated versus the original by their original percentage attribute. The original percentage varies by values of 12.5 giving nine possible percentages: 0, 12.5, 25, 37.5, 50, 62.5, 75, 87.5, 100.

## Generation Process
  The process utilized to create the unique Ricks relied on the usage of key resources including vrf-rs, multiformats and merkletreejs. Each Rick created is based on the result of a VRF (Verifiable Random Function) operation. 
  The VRF uses the distributor private key and a message to generate a random hash and proof of the hash. The public key point, message and VRF proof can be utilized to verify correctness of the hash. 
  The hash generated by the VRF is a random number and thus is perfect to generate random traits for our Ricks! To begin generating unique Crypto Rick NFT's first the original Rick (containing original traits) had to be found using the VRF. 
  The smart contract address of the NFT collection was used as the seed message to begin generating hashes to find the original Rick. Each resulting hash was used as the next message until the original Rick was found. 
  iterations were taken to find the original Rick from the contract seed. Once the original Rick was found appropriate metadata is created. The JSON CID (Content Identifier) from the original Ricks metadata was then used to seed the VRF for the first unique Rick. 
  Subsequent Ricks were generated from VRF seeded from the previous Ricks CID of their metadata. The VRF hash is a 66 character hex (base 16) string of which the last eight characters are used to determine the attributes of the Rick. 
  The order of attributes from the greatest 66th to least 59th characters are: hair, coat, shirt, head, face, eyebrow, eyes and drool,. Each character is taken modulo 4 or 5 depending on the trait to determine it's value for the Rick.(See Attributes chart above) 
  Once the metadata from a Rick is generated a hash (Merkle tree leaf) is generated from the Ricks CID, VRF message and VRF proof. After completion of generating the Ricks a Merkle tree is created from the Merkle tree leaves for on chain verification of the NFT collection.
  
## Smart Contract
    The Crypto Ricks smart contract can be analyzed at:0x94dd01108e8456c8857335da1edfe4095fd8118b The contract conforms to the ERC 721 standard and utilizes merkleprool and vrf-solidity to verify correctness of the NFT's generated. 
    The contract contains an immutable distributor address:  which was used to sign each NFT's metadata and generate VRFs proving authenticity.
    
## Metadata
    The complete metadata for the NFT's can be found here. To ensure authenticity of the NFTs' each JSON Metadata object was signed in the form "name-id-external_url-iterations-vrf_message_hex-metadata-vrf_proof-image-attributes-network-chain_id-distributor-contract"
    (each metadata variable separated by a dash). The complete metadata directory contains a metadata json file which contains the Merkle root, Merkle leaves and contract. 
    This is signed by the distributor in the form 'root-leaves-contract' as well and is utilized for NFT verification.
    
## Protocol
    To guarantee authenticity of the NFT's created, a specific distribution process was utilized. First the Crypto Ricks smart contract was deployed containing an immutable Distributor address and immutable VRF public key points x and y. It can be independently verified that the public key points used to prove the VRF operations belong to the Distributor address. Once the smart contract was deployed metadata generation procedures could then begin. First the original Rick NFT had to be found using the contract seed. (iteration results from this process were recorded for verification in iterations.json.) Next the Ricks metadata were generated and signed utilizing the distributor address. (Ricks metadata are in the form 0.json 1.json ... etc) After that a Merkle tree was created and metadata associated was signed with the distributor address. ( NFT verification metadata recorded in metadata.json) Once the metadata directory was completed a non distributed CID was created. Next the SetProofVariables function was called on the contract. So, the baseURI (containing metadata directory CID) and Merkle root were posted on chain. (A non distributed baseURI was posted to prevent front running.) Finally, the NFT metadata was distributed on IPFS! Let there be Crypto Ricks! (Note all ricks can be viewed before minting this was not overlooked.)
