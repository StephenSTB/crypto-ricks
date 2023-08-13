
import { useState, useEffect} from "react";
import {BrowserRouter, Routes, Route } from "react-router-dom"
import {TopBar , Mint, View, About, NFT, Minted, Owned} from "./components/"
import './App.css';
import Web3 from 'web3';
import { contractFactoryV1 } from "@sb-labs/contract-factory-v1";
import { networkData as NetData} from "@sb-labs/web3-data/networks/NetworkData.js";
//import { ipfsConnect } from "@sb-labs/web3-data/networks/IpfsConnect.js";
//import { create, IPFSHTTPClient } from "ipfs-http-client"
import {  DeployedContracts } from "@sb-labs/web3-data" 
import deployedContracts from "./DeployedContracts.json" 
import { CID } from 'multiformats/cid';
//import all from "it-all";
import { OriginalMetadata, SwitchError, Metadata, Meta } from "./interfaces/Interfaces";
//import { IPFSEntry } from "ipfs-core-types/dist/src/root";
//import { concat } from "uint8arrays"
//import { multiaddr } from '@multiformats/multiaddr'
//import { peerIdFromString } from '@libp2p/peer-id'

//const ipfs_helia = "/ip4//tcp/4006/ws/p2p/12D3KooWF3wAyjWAQtn4TKdZLxVQACctnatZ2p65JnfVBU2PUcYy"

const networkData : any = NetData;

const default_images = importAll(require.context('./images/default', false, /\.png$/)) as Array<string>
function importAll(r: any) {
    return r.keys().map(r);
}

const copywrite = <div className="copywrite"><p>SB Labs &copy; {new Date().getFullYear()}</p></div>;

//let test = true;

function App() {

  	/*const [state, setState] = useState({ network: "", asset: "", explorer: "", opensea: "", account: "" as any, connected: false, selectedAccount: "Connect Wallet",
  									  ricks: "" as any, baseURI: "", distributor: "", root: "", maxSupply: 0, mintValue: 0, minted: 0,
									  ipfs: {} as HeliaIPFS , cid: {} as CID,ipfs_gateway_url: "",  metadata: [] as Array<Metadata | OriginalMetadata>, images: [] as Array<string>, meta : {} as Meta,
									  error: "", copywrite: <div className="copywrite"><p>SB Labs &copy; {new Date().getFullYear()}</p></div>
									})*/

	const [network, setNetwork] = useState("")
	const [asset, setAsset] =  useState("");
	const [explorer, setExplorer] = useState("")
	const [opensea, setOpensea] = useState("")
	const [account, setAccount] =  useState("" as any)
	const [connected, setConnected] = useState(false)
	const [selectedAccount, setSelectedAccount] = useState("Connect Wallet");
	const [ricks, setRicks] = useState("")
	const [baseURI, setBaseURI] = useState("")
	const [distributor, setDistributor] = useState("")
	const [maxSupply, setMaxSupply] = useState(0);
	const [mintValue, setMintValue] = useState(0);
	const [minted, setMinted] = useState(0);
	const [metadata, setMetadata] = useState([] as Array<Metadata | OriginalMetadata>)
	const [images, setImages] = useState(default_images)
	const [meta, setMeta] = useState({} as Meta);
	const [error, setError] = useState("")

	
	
	const [connect, setConnect] = useState(false)

  	useEffect(() =>{
		//console.log("connect web3 effect", connect)
		const updateWeb3 = async () =>{
			//console.log("updateWeb3")
			if (window.ethereum) {
				
				if(!connect){
					return;
				}
	
				//console.log("update web3")
		
				try{
				
					await window.ethereum.request({ method: 'eth_requestAccounts' });
				}
				catch(error){
					console.error("error", error);
					return;
				}
				
				const web3  = new Web3(window.ethereum);
		
				const chainID = Number(await web3.eth.getChainId());
		
				let connected = chainID === 8453 ? true : chainID === 1337 ? true : chainID === 5 ? true : false// chainID === 3141 ? true : chainID === 1337 ? true : chainID === 5 ? true :  false; //chainID === 1 ? true :
		
				//console.log(connected)
		
				if(!connected){
					
					try{
						await window.ethereum.request({
							"method": "wallet_switchEthereumChain",
							"params": [{ "chainId": "0x2105" }],
						});
					}
					catch(swtichError){
						let error = swtichError as SwitchError
						if(error.code === 4902){
							try{
							window.ethereum.request({
								method: "wallet_addEthereumChain",
								params: networkData["8453"],
							});
							}
							catch(error){
							console.log(error)
							}
						}
					}
					setConnect(false)
					return;
				}else{
		
					//setState(state =>({...state, selectedAccount: "loading...", error: "retrieving metadata..."}))

					setSelectedAccount("loading...")
					setError("retrieving metadata...")
		
					const accounts = await web3.eth.getAccounts();
		
					const account = accounts[0];
		
					//console.log(account)
		
					const selectedAccount = account.slice(0,5) + "..." + account.slice(38);
		
					const crypotoRicks = contractFactoryV1.CryptoRicks;

		
					crypotoRicks.setProvider(web3.eth.currentProvider);
					crypotoRicks.setWallet(web3.eth.accounts.wallet);

					console.log(chainID)
		
					let network = chainID === 3141 ? "Hyperspace" : chainID === 1 ? "Ethereum" : chainID ===  5 ? "Goerli" : chainID === 8453 ? "Base" : "Ganache";
					console.log(network)
					
					let asset = networkData[chainID].nativeCurrency.symbol
					
					let deployed = deployedContracts as DeployedContracts
		
					let ricksAddress = deployed[network]["CryptoRicks"].address
		
					try{
						const ricks = await crypotoRicks.at(ricksAddress);
					
						let baseURI =  await ricks.BaseURI()//(await ricks.BaseURI()).replace("ipfs://", "https://ipfs.io/ipfs");
		
						let distributor = await ricks.Distributor();
		
						//console.log(baseURI)
		
						let maxSupply = Number(await ricks.MaxSupply());
						//console.log(maxSupply)
		
						let mintValue = Number(Web3.utils.fromWei(await ricks.MintValue(), "ether"));
		
						let minted = (Number(await ricks.TokenIds()) + 1) ;

						let explorer = networkData[chainID.toString()].blockExplorerUrls[0] + "address/" //network === "Ethereum" ? "https://etherscan.io/address/"  : network === "Goerli" ? "https://goerli.etherscan.io/address/" : ""

						console.log(minted)

						let opensea = network === "Ethereum" ? "https://opensea.io/" : network === "Base" ? "https://opensea.io/assets/base/" : network === "Goerli" ? "https://testnets.opensea.io/assets/goerli/" : "";

						setNetwork(network);
						setAsset(asset)
						setExplorer(explorer);
						setOpensea(opensea)
						setAccount(account);
						setConnected(connected);
						setSelectedAccount(selectedAccount)
						setRicks(ricks)
						setBaseURI(baseURI)
						setDistributor(distributor)
						setMaxSupply(maxSupply)
						setMintValue(mintValue)
						setMinted(minted)

						//console.log("state set")
						
						//console.log(ipfsConnect.HttpJs)
		
						//let ipfs: IPFS | IPFSHTTPClient = await IpfsWebRTC(webrtc)//await create({url, timeout: 5000})
						/*
						let ipfs: IPFSHTTPClient = await create({url: "http://localhost:45005/"})

						console.log(await ipfs.version())

						let ipfsdata = await all(ipfs.ls(CID.parse("bafybeie6dsuxjck7zzhf2cf4ahgnlgwmthctxgf5uq34ig5xb3ylp5mmqa")))
						console.log(ipfsdata)

						let cid0 = JSON.parse(new TextDecoder().decode(await concat(await all(ipfs.cat(ipfsdata[0].cid)))).toString())
						console.log(cid0)*/
						/*
						try{
							let f = await fetch("ipfs://bafybeie6dsuxjck7zzhf2cf4ahgnlgwmthctxgf5uq34ig5xb3ylp5mmqa/")
						}catch{
							console.log("couldn't fetch")
						}
						/*
						console.log("Creating Helia node")
						console.time("Time:")
						let ipfs = await createHeliaIPFS(false)
						console.timeEnd("Time:")*/
						/*
						let address = test ? ipfsConnect.Helia : ipfs_helia

						let addressSplit = address.split("/")
						
						const peerId = peerIdFromString(addressSplit[addressSplit.length-1])

						const addr = multiaddr(address)
						console.log(address)

						await ipfs.node.libp2p.peerStore.addressBook.set(peerId, [addr])
						
						try{
							await ipfs.node.libp2p.dial(peerId)

							//console.log(connection)
						}catch{
							console.log("Crypto Ricks IPFS node dial failure.")
						}*/
						/*
						const delay =  async () =>{
							await new Promise(reslove => setTimeout(reslove, 5000))
						}
						let peers = ipfs.node.libp2p.getPeers().length

						while(peers === 0){
							console.log("waiting for peers")
							await delay()
							peers = ipfs.node.libp2p.getPeers().length
						}
						console.log("peers:", peers)

						
						console.log("Getting metadata")
						console.time("Metadata recovery time")
						let data = await all((ipfs.fs.ls(cid)))
						console.timeEnd("Metadata recovery time")*/
						//console.log("files retrieved: ", data.length)

						
						let cid = CID.parse((baseURI.replace("ipfs://", "")).replace("/", ""))
						let ipfs_gateway_url = "https://ipfs.io/ipfs/" + cid + "/"


						let metadata = Array(Number(maxSupply) + 1).fill({});
		
						let images = [] as Array<string>

						console.log("Fetching Metadata...")
						console.time("Fetch Meta")

						let data = await (await fetch(ipfs_gateway_url + 0 + ".json")).json() as OriginalMetadata
						let imageURL =  ipfs_gateway_url + data.image.replace("ipfs://", "") + ".png"//await (await fetch(ipfs_gateway_url + data.image.replace("ipfs://", "") + ".png")).arrayBuffer()

						metadata[0] = data
						images.push(imageURL)

						const metadataNum = minted >= 10 ? minted : 10;

						for(let i = 1; i < metadataNum; i++){
							let data = await (await fetch(ipfs_gateway_url + i + ".json")).json() as Metadata
							//let image = await (await fetch(url + data.image.replace("ipfs://", "") + ".png")).arrayBuffer()
							let imageURL = ipfs_gateway_url + data.image.replace("ipfs://", "") + ".png"
							metadata[i] = data;
							images.push(imageURL)
						}

						let meta = await (await fetch(ipfs_gateway_url + "metadata.json")).json() as Meta

						console.timeEnd("Fetch Meta")

						setError("")
						setMetadata(metadata)
						setImages(images)
						setMeta(meta)

						//setState(state =>({ ...state, web3, network, asset, explorer, opensea, account, selectedAccount, connected, ricks, baseURI, distributor, root, maxSupply, mintValue, minted, metadata, images, meta, error:"" }))
						//console.log(metadata)
						//console.log(images)
						/*
						for(let file of data){
							let entry = {cid: file.cid} as IPFSEntry
							if(file.name.includes(".json")){
								let index = Number(file.name.replace(baseURI, "").replace(".json", ""))
								//console.log(index)
								if(!isNaN(index)){
									metadataFiles[index] = entry
								}
								else{
									metadataFiles[maxSupply] = entry
								}
								//metadataFiles.push(file)
							}
							else{
								//console.log(file.path)
								imageFiles.push(entry)
							}
						}*/

						//
						
					}catch(e){
						console.log(e)
					}
				}
				
				window.ethereum.on('accountsChanged', (accounts: string[]) => {
					// Handle the new accounts, or lack thereof.
					// "accounts" will always be an array, but it can be empty.
					window.location.reload()
					//setState(state =>({...state, connect: true}))
					//setConnect(true);
				});
		
				window.ethereum.on('chainChanged', (chainId : number) => {
					// Handle the new chain.
					// Correctly handling chain changes can be complicated.
					// We recommend reloading the page unless you have good reason not to.
					window.location.reload();
					//setState(state => ({...state, connect: true}))
					//setConnect(true)
				});
			
			}
		}
		
		updateWeb3();
		
	}, [connect])

	const connectWeb3 = () =>{
		console.log("connect", connect)
		//setState({...state, connect: true})
		setConnect(true);
	}

	function updateState(update: any): void {
		
	}

	// connected={connected} ricks={ricks} account={account} asset={asset} baseURI={baseURI} mintValue={mintValue} maxSupply={maxSupply} minted={minted} {}

	return (
		<div className="App">
			<BrowserRouter>
				<TopBar selectedAccount={selectedAccount} connectWeb3={connectWeb3}/>
				<Routes>
					<Route path="/">
						<Route index element={<Mint connected={connected} ricks={ricks} account={account} asset={asset} baseURI={baseURI} mintValue={mintValue} maxSupply={maxSupply} minted={minted} images={images} error={error} copywrite={copywrite} updateState={updateState} />} />
						<Route path="mint" element={<Mint connected={connected} ricks={ricks} account={account} asset={asset} baseURI={baseURI} mintValue={mintValue} maxSupply={maxSupply} minted={minted} images={images} error={error} copywrite={copywrite} updateState={updateState} />} />
						<Route path="view" element={<View/>}>
							<Route path=":tokenId" element={<NFT connected={connected} ricks={ricks} account={account} baseURI={baseURI}  maxSupply={maxSupply} minted={minted} images={images} error={error} metadata={metadata} meta={meta} explorer={explorer} opensea={opensea}/>}/>
							<Route path="minted" element={<Minted connected={connected} ricks={ricks} minted={minted} images={images} error={error} metadata={metadata} copywrite={copywrite}/>}/>
							<Route path="owned" element={<Owned connected={connected} ricks={ricks} account={account} images={images} error={error} metadata={metadata} copywrite={copywrite}/>}/>
						</Route>
						<Route path="About" element={<About connected={connected} ricks={ricks} baseURI={baseURI} metadata={metadata} explorer={explorer} network={network} distributor={distributor} copywrite={copywrite}/>}/>
					</Route>
				</Routes>
			</BrowserRouter>
		</div>
	);
}

export default App;
