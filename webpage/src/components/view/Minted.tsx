import { useEffect, useState, ChangeEvent, } from "react"
//import { IPFSEntry } from "ipfs-core-types/dist/src/root";
import { ViewData, Metadata, OriginalMetadata } from "../../interfaces/Interfaces";
import { useNavigate } from "react-router";
import { Dropdown } from "@sb-labs/basic-components/dist"
//import all from "it-all"
//import { concat } from "uint8arrays/concat"
//import { CID } from "multiformats/cid"
//import { HeliaIPFS } from "@sb-labs/web3-data/networks/IpfsConnect.js"

import "../../App.css"
import "./View.css"

interface MintedProps{
    connected: boolean;
    ricks: any;
    //ipfs: HeliaIPFS;
    metadata: Array<Metadata | OriginalMetadata>;
    images: Array<String>
    minted: number;
    error: string;
    copywrite: any;
}

export const Minted = (props: MintedProps) =>{

    const [state, setState] = useState({connected: false, minted: 0,  viewdata : [] as Array<ViewData>, options: [] as Array<JSX.Element>})

    const navigate = useNavigate()

    const sort = (e: ChangeEvent<HTMLOptionElement>) =>{
        //console.log(e.target.value)
        switch(e.target.value){
            case "random": sort_random(); break;
            case "high" : sort_high(); break;
            case "low": sort_low(); break;
            case "low-percentage": sort_low_percentage(); break;
            case "high-percentage": sort_high_percentage();
        }
    }

    const sort_random = () =>{
        let viewdata = state.viewdata;
        for(let i = 0; i < viewdata.length; i++){
            let rand = Math.floor(viewdata.length * Math.random());
            let d = viewdata[i];
            viewdata[i] = viewdata[rand];
            viewdata[rand] = d;
        }
        setState({...state, viewdata});
    }

    const sort_high = () =>{
        let viewdata = state.viewdata;
        viewdata.sort((a, b) => b.id - a.id )
        setState({...state, viewdata})
    }

    const sort_low = () =>{
        let viewdata = state.viewdata;
        viewdata.sort((a, b) => a.id - b.id )
        //console.log(viewdata)
        setState({...state, viewdata})
    }

    const sort_low_percentage = () =>{
        let viewdata = state.viewdata;
        viewdata.sort((a, b) => a.percentage - b.percentage )
        //console.log(viewdata)
        setState({...state, viewdata})
    }

    const sort_high_percentage = () =>{
        let viewdata = state.viewdata;
        viewdata.sort((a, b) => b.percentage - a.percentage )
        //console.log(viewdata)
        setState({...state, viewdata})
    }

    useEffect(() =>{
        const init = async () =>{
            try{
                let minted = props.minted
                let viewdata = [] as Array<ViewData>
                //let ipfs = props.ipfs
                let metadata = props.metadata
                for(let i = 0 ; i < Number(minted); i++){
                    //let data = await concat(await all(ipfs.fs.cat(metadataFiles[i].cid)))
                    let data =  metadata[i]//JSON.parse(new TextDecoder().decode(data).toString()) as Metadata;
                    //let image = await all(ipfs.fs.cat(CID.parse(metadata.image.replace("ipfs://",""))));
                    let imageURL = props.images[i]//URL.createObjectURL(new Blob(image, {type: "image/png"}))
                    let id = data.id
                    let percentage = data.attributes[data.attributes.length-1].value
                    let view = {imageURL, id, percentage} as ViewData
                    //console.log(view)
                    viewdata.push(view)
                }
    
                let options = [] as Array<JSX.Element>
                options.push(<option className="dropdown-option" value="low" key={0}>Lowest-Highest</option>)
                options.push(<option className="dropdown-option" value="high" key={1}>Highest-Lowest</option>)
                options.push(<option className="dropdown-option" value="random" key={2}>Random</option>)
                options.push(<option className="dropdown-option" value="low-percentage" key={3}>Low Percentage</option>)
                options.push(<option className="dropdown-option" value="high-percentage" key={4}>High Percentage</option>)
    
                setState({connected: true, minted, viewdata,  options})
            }
            catch(e){
                console.log(e)
            }
        }
        if((props.connected && !state.connected) || props.minted !== state.minted){
            init();
        }
        
    })

    return <>
                {!props.connected && <div className="error"><h4>Connect Walllet to View NFTs!</h4></div> }
                <div className="error"><h4>{props.error}</h4></div>
                {state.minted !== 0 && <h3 id="view-title">Ricks That Have Been Minted</h3>}
                <div id="view-dropdown-section">{state.connected && <Dropdown id="sort-dropdown" options={state.options} type="dark" size="medium" onChange={sort}/>}</div>
                <div className="view-nft-container">
                {
                    state.viewdata.map((d, index) =>{
                        return  <div className="small-nft-container" key={d.imageURL + index}>
                                    <div className="small-nft">
                                        <img src={d.imageURL} className="small-nft-image" onClick={() =>navigate(`/view/${d.id}`)} alt=""/>
                                        <div className="small-nft-id">{d.id}</div>
                                        <div className="small-nft-percentage">{d.percentage}</div>
                                    </div>
                                </div>
                    })
                }
                </div>
                {/*props.copywrite*/}
            </>
            
}