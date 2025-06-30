import Logo from "../components/Logo";
import { memeData } from "../assets/memeCollection";

function ErrorPage({ type }) {
  let message = "";
  if (type == "connection") {
    message = "Error connecting to the server. Please try again soon!";
  } else if (type == "server") {
    message =
      "Something's gone wrong communicating with the server. Try again soon, and if refreshing still doesn't work, try out a new room key.";
  } else {
    message = "Huh, something's gone wrong.";
  }
  return (
    <div>
      <img
        src="/memes/let_me_in.png"
        alt={memeData["let_me_in"]["alt"]}
        className="corners"
        style={{ height: "35vh" }}
      />
      <div className="row">
        <Logo size={"small"} spin={false} />
        <h3 className="heading">{message}</h3>
      </div>
    </div>
  );
}

export default ErrorPage;
