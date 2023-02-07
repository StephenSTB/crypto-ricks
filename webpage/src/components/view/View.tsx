import "../../App.css"
import "./View.css"
import { useState, useEffect } from "react"
import { Outlet, useLocation, useNavigate } from "react-router"

interface ViewProps{

}
export const View = (props:ViewProps) =>{
    const [active, setActive] = useState("")
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(()=>{
        //console.log("view update")
        let active = location.pathname.includes("minted") ? "minted" :
                     location.pathname.includes("owned") ? "owned" : "";
        setActive(active)
    }, [location])
    return <div className="main">
                <div id="view-bar">
                    <div/> 
                    <div id="view-links">
                        <div className={`view-link ${active === "minted" ? "active-link" : ""}`} onClick={()=>navigate("/view/minted")}>Minted</div><div/> 
                        <div className={`view-link ${active === "owned" ? "active-link" : ""}`} onClick={()=>navigate("/view/owned")} >Owned</div></div>
                    <div/>
                </div>
                <Outlet />
            </div>
}