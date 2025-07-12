import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import GuessCard from "../src/components/GuessCard";
import * as useContextHooks from "../src/hooks/useContextHooks";

// Mock Confetti and GuessyButton
jest.mock("../src/components/Confetti", () => () => (
  <div data-testid="Confetti" />
));
jest.mock("../src/components/GuessyButton", () => (props) => (
  <button onClick={props.onClick} data-testid={props.id}>
    {props.children}
  </button>
));

describe("GuessCard", () => {
  let setModalOpenMock;

  beforeEach(() => {
    setModalOpenMock = jest.fn();
    jest.clearAllMocks();

    // Mock sessionStorage.getItem for player UUID
    jest
      .spyOn(window.sessionStorage.__proto__, "getItem")
      .mockImplementation((key) => {
        if (key === "guessy-uuid") return "my-uuid";
        return null;
      });
  });

  function renderGuessCard(playerProps, itemKey = "card123") {
    jest.spyOn(useContextHooks, "usePlayers").mockReturnValue(playerProps);

    return render(
      <GuessCard
        setModalOpen={setModalOpenMock}
        itemKey={itemKey}
        testId={`${itemKey}-guessCardIconButton`}
      />
    );
  }

  it("renders clickable icon", () => {
    renderGuessCard(
      {
        player1Uuid: "p1",
        player2Uuid: "p2",
        player1Card: "cardA",
        player2Card: "cardB",
        players: {
          p1: { username: "BlueGorilla" },
          p2: { username: "PinkLizard" },
        },
      },
      "cardZ"
    );

    expect(screen.getByTestId("cardZ-guessCardIconButton")).toBeInTheDocument();
  });

  it("opens dialog on click", () => {
    renderGuessCard(
      {
        player1Uuid: "my-uuid", // This user is player1
        player2Uuid: "p2",
        player1Card: "cardA",
        player2Card: "cardB",
        players: {
          p1: { username: "BlueGorilla" },
          p2: { username: "PinkLizard" },
        },
      },
      "cardY"
    );

    // Click to open
    fireEvent.click(screen.getByTestId("cardY-guessCardIconButton"));

    // See dialog content
    expect(screen.getByText("Make A Guess?")).toBeInTheDocument();
    expect(screen.getByTestId("cancelGuessButton")).toBeInTheDocument();
    expect(screen.getByTestId("confirmGuessButton")).toBeInTheDocument();

    // Shows correct player name
    expect(
      screen.getByText("Do you think this is PinkLizard's card?")
    ).toBeInTheDocument();
  });

  it("clicking No closes the dialog and calls setModalOpen", () => {
    renderGuessCard(
      {
        player1Uuid: "my-uuid",
        player2Uuid: "p2",
        player1Card: "cardA",
        player2Card: "cardB",
        players: {
          p1: { username: "BlueGorilla" },
          p2: { username: "PinkLizard" },
        },
      },
      "cardX"
    );

    // Open dialog
    fireEvent.click(screen.getByTestId("cardX-guessCardIconButton"));

    // Click No
    fireEvent.click(screen.getByTestId("cancelGuessButton"));
    expect(setModalOpenMock).toHaveBeenCalledWith(false);
  });

  it("clicking Yes with wrong guess shows Nope message", () => {
    renderGuessCard(
      {
        player1Uuid: "my-uuid",
        player2Uuid: "p2",
        player1Card: "cardA",
        player2Card: "cardB",
        players: {
          p1: { username: "BlueGorilla" },
          p2: { username: "PinkLizard" },
        },
      },
      "wrongCardKey"
    );

    fireEvent.click(screen.getByTestId("wrongCardKey-guessCardIconButton"));

    // Click Yes
    fireEvent.click(screen.getByTestId("confirmGuessButton"));

    // Should see "Nope!" dialog
    expect(screen.getByText("Nope!")).toBeInTheDocument();
    expect(screen.getByText("Looks like that wasn't it!")).toBeInTheDocument();
  });

  it("clicking Yes with correct guess shows Confetti", () => {
    renderGuessCard(
      {
        player1Uuid: "my-uuid",
        player2Uuid: "p2",
        player1Card: "cardA",
        player2Card: "correctKey",
        players: {
          p1: { username: "BlueGorilla" },
          p2: { username: "PinkLizard" },
        },
      },
      "correctKey"
    );

    fireEvent.click(screen.getByTestId("correctKey-guessCardIconButton"));
    fireEvent.click(screen.getByTestId("confirmGuessButton"));

    // Should see success dialog
    expect(screen.getByText("You did it!")).toBeInTheDocument();
    expect(screen.getByTestId("Confetti")).toBeInTheDocument();
  });
});
