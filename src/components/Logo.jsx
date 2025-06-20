import { Link } from "react-router-dom";
import "../App.css";
import question from "../assets/question.png"

function Logo({spin = true, header = false}) {
        return (
            <div className={header ? "header-logo" : ""}>
                <Link to="/">
                    <img
                    src={question}
                    alt={`a ${ spin ? "spinning " : ""}question mark`}
                    className={`${spin ? 'guessy-logo-spin': ""}`}
                    />
                </Link>
            </div>
        );
}

export default Logo;
