import { faker } from "@faker-js/faker";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { colorA, colorD, corners } from "../assets/styles";
import Logo from "../components/Logo";
import GuessyButton from "../components/GuessyButton";
import TextField from "@mui/material/TextField";
import { useEffect } from "react";

//The first page you see. Holds options to join a game or start a new game.
function NameForm() {
  const [searchParams] = useSearchParams();
  let navigate = useNavigate();
  const [proposedUsername, setProposedUsername] = useState("");

  function polishFakerOutput(fakerOutput) {
    let arr = fakerOutput.split(" ");
    arr.forEach((word, i) => {
      arr[i] = word.charAt(0).toUpperCase() + word.slice(1);
    });
    return arr.join("");
  }

  function generateRandomName() {
    setProposedUsername(
      polishFakerOutput(faker.color.human()) +
        polishFakerOutput(faker.animal.type())
    );
  }

  useEffect(() => {
    if (!searchParams.get("roomKey")) navigate("/home");
  }, [searchParams, navigate]);

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
          autoFocus={true}
        />
        <Link
          to={`/play?roomKey=${searchParams.get(
            "roomKey"
          )}&username=${proposedUsername}`}
        >
          <GuessyButton>Continue</GuessyButton>
        </Link>
      </div>
    </div>
  );
}

export default NameForm;
