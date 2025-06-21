import { Link } from "react-router-dom";
import "../App.css";
import question from "../assets/question.png"
import { useState } from "react";
import $ from 'jquery'

function Logo({spin = true, header = false}) {
    const [image, setImage] = useState(question)

    function spinTimeUp(){
        const spinner = $(".guessy-logo-spin")
        let spinTime = spinner.css('animation-duration')
        spinTime = Number(spinTime.replace("s", ""))
        if (spinTime > 5){
            spinner.css('animation-duration', "5s")
        } else if (spinTime > 1){
            spinner.css('animation-duration', `${spinTime / 2}s`)
        } else if ((spinTime.toFixed(1)) > 0.1) {
            spinner.css('animation-duration', `${spinTime - 0.1}s`)
        } else {
            spinner.css('animation-duration', "0s")
            setImage('gnome')
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
                    id="logo-image"
                    />
                </Link>
            </div>
        );
    } else if (image == "gnome"){
        return (
            <div>
                <img
                src='/memes/gnome_barf.gif'
                alt={'a gif of a gnome from the cartoon Gravity Falls barfing up a rainbow continuously'}
                className="corners"
                />
            </div>
        );
    } else {
        return (
            <div onClick={spinTimeUp}>
                <img
                src={image}
                alt={`a ${ spin ? "spinning " : ""}question mark`}
                className={`${spin ? `guessy-logo-spin`: ""}`}
                />
            </div>
        );

    }

}

export default Logo;
