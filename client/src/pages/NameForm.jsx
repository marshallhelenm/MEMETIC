import { faker } from "@faker-js/faker";
import { useState } from "react";
import Logo from "../components/Logo";
import GuessyButton from "../components/GuessyButton";
import TextField from "@mui/material/TextField";
import { useGuessy } from "../contexts/useGuessy";
import { colorA, colorC, colorD, corners } from "../assets/styles";

//The first page you see. Holds options to join a game or start a new game.
function NameForm() {
  const [proposedUsername, setProposedUsername] = useState("");
  const { sendUsername, assignUsername } = useGuessy();

  function polish(fakerOutput) {
    let arr = fakerOutput.split(" ");
    arr.forEach((word, i) => {
      arr[i] = word.charAt(0).toUpperCase() + word.slice(1);
    });
    return arr.join("");
  }

  function generateRandomName() {
    setProposedUsername(
      polish(faker.color.human()) + polish(faker.animal.type())
    );
  }

  return (
    <div>
      <Logo />
      <h1 className="heading">What should we call you?</h1>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "2%",
          marginBottom: "2%",
        }}
      >
        <i
          className={`fa-solid fa-dice fa-2xl`}
          style={{ color: colorD, marginRight: "2%" }}
          onClick={generateRandomName}
        ></i>
        <TextField
          placeholder="Name"
          onChange={(e) => {
            setProposedUsername(e.target.value);
          }}
          value={proposedUsername}
          maxLength={16}
          minLength={2}
          variant="outlined"
          sx={{
            backgroundColor: colorD,
            fontColor: colorA,
            borderRadius: corners,
            justifySelf: "center",
            marginRight: "2%",
          }}
        />
        <GuessyButton onClick={() => assignUsername(proposedUsername)}>
          Continue
        </GuessyButton>
      </div>
    </div>
  );
}

export default NameForm;
