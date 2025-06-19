import "../App.css";
import { Button, Input } from "semantic-ui-react";
import Logo from "../components/Logo";
import { useState } from "react";
import { useGuessy } from "../contexts/GuessyContext";

function Login() {
  const {onLogin} = useGuessy()
  const [username, setUsername] = useState("");

    return (
      <div>
        <Logo />
        <h1>Guessy</h1>
        <h2 className="heading">What should we call you?</h2>
        <form onSubmit={e => {
                e.preventDefault()
                onLogin(username)
            }}>
            <div>
                <Input
                placeholder="Your Name"
                type="text"
                onChange={(e) => {
                    setUsername(e.target.value);
                }}
                maxLength={16}
                minLength={2}
                />
            </div>
            <Button type="submit">
                Continue
            </Button>
          </form>
      </div>
    )
}

export default Login;
