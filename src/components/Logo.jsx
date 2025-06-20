import { Link } from "react-router-dom";
import "../App.css";
import question from "../assets/question.png"
import gnome_barf from "../../public/memes/gnome_barf.gif"
import { useState } from "react";

function Logo({spin = true, header = false}) {
    const [spinTime, setSpinTime] = useState(20)
    const [image, setImage] = useState(question)
    const [corners, setCorners] = useState()

    function spinTimeUp(){
        if (spinTime > 5){
            setSpinTime(5)
        } else if (spinTime > 1){
            setSpinTime(spinTime / 2)
        } else if ((spinTime.toFixed(1)) > 0.1) {
            setSpinTime(spinTime - 0.1)
        } else {
            setSpinTime(0)
            setCorners('.28571429rem')
            setImage(gnome_barf)
        }
    }

    if (header){
        return (
            <div className="header-logo">
                <Link to="/">
                    <img
                    src={question}
                    alt={`a ${ spin ? "spinning " : ""}question mark`}
                    className={`${spin ? `guessy-logo-spin`: ""}`}
                    />
                </Link>
            </div>
        );
    } else {
        return (
            <div onClick={spinTimeUp}>
                <img
                src={image}
                alt={`a ${ spin ? "spinning " : ""}question mark`}
                className={`${spin ? `guessy-logo-spin`: ""}`}
                style={{
                    animationDuration: `${spinTime}s`,
                    borderRadius: corners
                }}
                />
            </div>
        );

    }

}

export default Logo;
