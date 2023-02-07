
import { useState, useEffect} from "react";
import {BrowserRouter, Routes, Route } from "react-router-dom"
import {TopBar , Mint, View, About, NFT, Minted, Owned} from "./components/"
import './App.css';
import Web3 from 'web3';
import { contractFactory } from "@sb-labs/contract-factory";
import { networkData } from "@sb-labs/web3-data/networks/NetworkData" 
import { ipfsHttp } from "@sb-labs/web3-data";
import deployedContracts from "./DeployedContracts.json" 
import { DeployedContracts } from "@sb-labs/web3-data";
import { create } from "ipfs-http-client";
import { IPFSHTTPClient } from "ipfs-http-client"
import { CID } from 'multiformats/cid';
import all from "it-all";
import { SwitchError } from "./interfaces/Interfaces";
import { IPFSEntry } from "ipfs-core-types/dist/src/root";

let ipfsHTTP = "";

let test = true;

function App() {

  	const [state, setState] = useState({connect: false, web3: {} as any, network: "", account: "" as any, connected: false, selectedAccount: "Connect Wallet",
  									  ricks: "" as any, baseURI: "", distributor: "", root: "", maxSupply: "", mintValue: "", minted: "",
									  ipfs: {} as IPFSHTTPClient, cid: {} as CID, metadataFiles: [] as Array<IPFSEntry>, imageFiles: [] as Array<IPFSEntry>})

  	useEffect(() =>{
    //console.log(state.networkHex)
	if(state.connect){
		updateWeb3();
	}
	})

	const connect = () =>{
		//console.log("connect")
		setState({...state, connect: true})
	}
	
	const updateWeb3 = async () =>{
		if (window.ethereum) {

		if(!state.connect){
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

		const chainID = await web3.eth.getChainId();

		let connected = chainID === 1337 ? true : chainID === 1 ? true : chainID === 5 ? true :  false;

		//console.log(connected)

		if(!connected){
			try{
			await window.ethereum.request({
				method: 'wallet_switchEthereumChain',
				params: [{ chainId: "0x1" }],
			});
			}
			catch(swtichError){
				let error = swtichError as SwitchError
				if(error.code === 4902){
					try{
					window.ethereum.request({
						method: "wallet_addEthereumChain",
						params: networkData["1"],
					});
					}
					catch(error){
					console.log(error)
					}
				}
			}
			return;
		}else{

			const accounts = await web3.eth.getAccounts();

			const account = accounts[0];

			//console.log(account)

			const selectedAccount = account.slice(0,5) + "..." + account.slice(38);

			const crypotoRicks = contractFactory.CryptoRicks;

			crypotoRicks.setProvider(web3.eth.currentProvider);
			crypotoRicks.setWallet(web3.eth.accounts.wallet);


			let network = chainID === 1 ? "Ethereum" : chainID ===  5 ? "Goerli" : "Ganache"
			
			let deployed = deployedContracts as DeployedContracts

			let ricksAddress = deployed[network]["CryptoRicks"]

			try{
				const ricks = await crypotoRicks.at(ricksAddress);
			
				let baseURI =  await ricks.BaseURI()//(await ricks.BaseURI()).replace("ipfs://", "https://ipfs.io/ipfs");

				let distributor = await ricks.Distributor();

				//console.log(baseURI)

				let root = await ricks.Root()

				let maxSupply = (await ricks.MaxSupply()).toString();

				let mintValue = Web3.utils.fromWei(await ricks.MintValue());

				let minted = (Number(await ricks.TokenIds()) + 1).toString() ;

				let url = test ? ipfsHttp.IpfsHttp : ipfsHTTP;

				let ipfs = await create({url})

				let cid = CID.parse((baseURI.replace("ipfs://", "")).replace("/", ""))

				let data = await all(ipfs.ls(cid))
				
				let metadataFiles = [] as Array<IPFSEntry>

				let imageFiles = [] as Array<IPFSEntry>

				for(let file of data){
					if(file.name.includes(".json")){
						metadataFiles.push(file)
					}
					else{
						imageFiles.push(file)
					}
				}

				console.log(metadataFiles)
				console.log(data)
				
				setState((state) =>({ ...state, web3, network, account, connect:false, selectedAccount,
					connected, ricks, baseURI, distributor, root, maxSupply, mintValue, minted, ipfs, cid, metadataFiles, imageFiles }))
				
			}catch(e){
				console.log(e)
			}
		}
		
		/*console.log({ ...state, web3, account, selectedAccount, update:false, 
			contractLink, connected, contractAddress, dappCID, donatorPositions,
			maxDonators, donation, donated, contentCID })*/
		
		window.ethereum.on('accountsChanged', (accounts: string[]) => {
			// Handle the new accounts, or lack thereof.
			// "accounts" will always be an array, but it can be empty.
			//window.location.reload()
			setState({...state, connect: true})
		});

		window.ethereum.on('chainChanged', (chainId : number) => {
			// Handle the new chain.
			// Correctly handling chain changes can be complicated.
			// We recommend reloading the page unless you have good reason not to.
			//window.location.reload();

			setState({...state, connect: true})
		});
		
		}
	}

	function updateState(update: any): void {
		setState({ ...state, ...update })
	}

	return (
		<div className="App">
			<BrowserRouter>
				<TopBar {...state} connect={connect}/>
				<Routes>
					<Route path="/">
						<Route index element={<Mint {...state} updateState={updateState} />} />
						<Route path="mint" element={<Mint {...state} updateState={updateState} />} />
						<Route path="view" element={<View {...state}/>}>
							<Route path=":tokenId" element={<NFT {...state}/>}/>
							<Route path="minted" element={<Minted {...state}/>}/>
							<Route path="owned" element={<Owned {...state}/>}/>
						</Route>
						<Route path="About" element={<About {...state}/>}/>
					</Route>
				</Routes>
			</BrowserRouter>
		</div>
	);
}

export default App;
