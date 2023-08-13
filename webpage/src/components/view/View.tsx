import "../../App.css"
import "./View.css"
import { useState, useEffect, } from "react"
import { Outlet, useLocation, useNavigate } from "react-router"
import { Button, Icon } from "@sb-labs/basic-components/dist"
import { up_arrow } from "@sb-labs/images"


export const View = () =>{
    const [active, setActive] = useState("")
    const navigate = useNavigate();
    const location = useLocation();
    const [scroll, setScroll] = useState(false);
    

    useEffect(()=>{
        //console.log("view update")
        let active = location.pathname.includes("minted") ? "minted" :
                     location.pathname.includes("owned") ? "owned" : "";
        setActive(active)
    }, [location])

    

    useEffect(()=>{
        //console.log("scroll effect")
        let timer : NodeJS.Timeout;
        const handleScroll = () =>{
            //console.log(timer)
            if(timer !== null || timer !== undefined)
            {
                clearInterval(timer)
            }
            setScroll(true)
            timer = setTimeout(()=>{
                setScroll(false)
            }, 5000)
        }
        let view_outlet = document.getElementById("view-outlet");
        view_outlet?.addEventListener("scroll", handleScroll, true);
    }, [])

    

    const toTop = () =>{
        //console.log("to top")
        if(scroll){
            let view_outlet = document.querySelector("#view-outlet");
            view_outlet?.scrollTo({top:0})
        }
    }

    return <div className="main view">
                <div id="view-bar">
                    <div/> 
                    <div id="view-links">
                        <div className={`view-link ${active === "minted" ? "active-link" : ""}`} onClick={()=>navigate("/view/minted")}>Minted</div><div/> 
                        <div className={`view-link ${active === "owned" ? "active-link" : ""}`} onClick={()=>navigate("/view/owned")} >Owned</div></div>
                    <div/>
                </div>
                <div id="view-outlet">
                    <Outlet />
                    <div className={scroll ? "view-top-button-show" : "view-top-button-hide"}><Button id="view-top-button" size="icon" icon={<Icon src={up_arrow} round={true}/>} onClick={() => toTop()}/></div>
                </div>
            </div>
}