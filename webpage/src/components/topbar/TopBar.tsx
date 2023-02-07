import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router"
import "../../App.css"
import "./TopBar.css"

interface TopBarProps{
    selectedAccount: string;
    connect() : void
}

export const TopBar = (props:TopBarProps) =>{

    const [active, setActive] = useState("")

    const location = useLocation()

    const navigate = useNavigate()

    useEffect(() =>{
        let active = location.pathname.includes("view") ? "view" : 
                     location.pathname.includes("mint") ? "mint" :
                     location.pathname.includes("about") ? "about" : "";
        setActive(active)
    },[location])

    return <div id="topbar">
                <div id="topbar-logo" onClick={() => navigate("/")}>Crypto Ricks</div>
                <div id="topbar-links">
                    <div className={`topbar-link ${active === "mint" ? "active-link" : ""}`} onClick={() => navigate("/mint")}>Mint</div>
                    <div className={`topbar-link ${active === "view" ? "active-link" : ""}`} onClick={() => navigate("/view/minted")}>View</div>
                    <div className={`topbar-link ${active === "about" ? "active-link" : ""}`} onClick={() => navigate("/about")}>About</div>
                </div>
                <div id="topbar-wallet" onClick={()=> props.connect()}>{props.selectedAccount}</div>
            </div>;
}