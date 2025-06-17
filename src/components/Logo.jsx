import { Link } from "react-router-dom";
import "../App.css";
import question from "../assets/question.png"

function Logo({spin = true}) {
        return (
            <Link to="/">
                <img
                src={question}
                alt={`a ${ spin ? "spinning " : ""}question mark`}
                className={`${spin ? 'Guessy-logo-spin': "Guessy-logo-static"}`}
                />
            </Link>
        );
}

export default Logo;
