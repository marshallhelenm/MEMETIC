import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { faker } from "@faker-js/faker";

import Logo from "../components/Logo";
import GuessyButton from "../components/GuessyButton";
import TextField from "@mui/material/TextField";
import { colorA, colorD, corners } from "../assets/styles";
import { useGame } from "../hooks/useContextHooks";

//The first page you see. Holds options to join a game or start a new game.
function NameForm() {
  const [searchParams] = useSearchParams();
  let navigate = useNavigate();
  const [proposedUsername, setProposedUsername] = useState("");
  const { mobile } = useGame();
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
        polishFakerOutput(faker.animal.type()),
    );
  }

  function randomNameIcon() {
    return (
      <i
        className={`fa-solid fa-dice fa-2xl`}
        style={{ color: colorD, marginRight: "2%" }}
        onClick={generateRandomName}
      ></i>
    );
  }

  function nameInput() {
    return (
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
    );
  }

  function continueButton() {
    return (
      <Link
        to={`/play?roomKey=${searchParams.get(
          "roomKey",
        )}&username=${proposedUsername}`}
      >
        <GuessyButton>Continue</GuessyButton>
      </Link>
    );
  }

  function desktopNameForm() {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "2%",
          marginBottom: "2%",
        }}
      >
        {randomNameIcon()}
        {nameInput()}
        {continueButton()}
      </div>
    );
  }

  function mobileNameForm() {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "2%",
          marginBottom: "2%",
          flexDirection: "column",
        }}
      >
        {nameInput()}
        <div
          style={{
            display: "flex",
            marginTop: "2%",
            alignItems: "center",
            justifyContent: "space-around",
            flexDirection: "row",
          }}
        >
          {randomNameIcon()}
          {continueButton()}
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (!searchParams.get("roomKey")) navigate("/home");
  }, [searchParams, navigate]);

  return (
    <div>
      <Logo />
      <h1 className="heading">What should we call you?</h1>
      {mobile ? mobileNameForm() : desktopNameForm()}
    </div>
  );
}

export default NameForm;
