import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ClearGame from "../src/drawer/ClearGame";
import * as useContextHooks from "../src/hooks/useContextHooks";

jest.mock("../src/components/GuessyButton", () => {
  const React = require("react");

  return {
    __esModule: true,
    default: (props) => (
      <button onClick={props.onClick} data-testid={props.id}>
        {props.children}
      </button>
    ),
  };
});

describe("ClearGame", () => {
  let createGameMock;

  function renderClearGame(drawerOpen) {
    createGameMock = jest.fn();
    jest.spyOn(useContextHooks, "useGame").mockReturnValue({
      createGame: createGameMock,
    });

    return render(
      <ClearGame opacity={{ opacity: 0.8 }} drawerOpen={drawerOpen} />
    );
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders clickable icon with drawer closed", () => {
    renderClearGame(false);

    expect(screen.getByTestId("clearGameIcon")).toBeInTheDocument();
  });

  it("renders clickable icon with drawer open", () => {
    renderClearGame(true);

    expect(screen.getByTestId("clearGameIcon")).toBeInTheDocument();
  });

  it("opens dialog on click when drawer closed", () => {
    renderClearGame(false);

    // Click to open
    fireEvent.click(screen.getByTestId("clearGameIcon"));

    // See dialog content
    expect(screen.getByText("Clear current game?")).toBeInTheDocument();
    expect(screen.getByTestId("cancelClearGame")).toBeInTheDocument();
    expect(screen.getByTestId("confirmClearGame")).toBeInTheDocument();
  });

  it("opens dialog on click when drawer open", () => {
    renderClearGame(true);

    // Click to open
    fireEvent.click(screen.getByTestId("clearGameIcon"));

    // See dialog content
    expect(screen.getByText("Clear current game?")).toBeInTheDocument();
    expect(screen.getByTestId("cancelClearGame")).toBeInTheDocument();
    expect(screen.getByTestId("confirmClearGame")).toBeInTheDocument();
  });

  it("closes the dialog when clicking Cancel with the drawer closed", () => {
    renderClearGame(false);

    // Open dialog
    fireEvent.click(screen.getByTestId("clearGameIcon"));

    // Click Cancel
    fireEvent.click(screen.getByTestId("cancelClearGame"));
    expect(screen.queryByText("Clear current game?")).not.toBeInTheDocument();
  });

  it("closes the dialog when clicking Cancel with the drawer open", () => {
    renderClearGame(true);

    // Open dialog
    fireEvent.click(screen.getByTestId("clearGameIcon"));

    // Click Cancel
    fireEvent.click(screen.getByTestId("cancelClearGame"));
    expect(screen.queryByText("Clear current game?")).not.toBeInTheDocument();
  });

  it("closes the modal and calls createGame when clicking Ok with drawer closed", () => {
    renderClearGame(false);

    fireEvent.click(screen.getByTestId("clearGameIcon"));
    fireEvent.click(screen.getByTestId("confirmClearGame"));

    expect(screen.queryByText("Clear current game?")).not.toBeInTheDocument();
    expect(createGameMock).toHaveBeenCalled();
  });

  it("closes the modal and calls createGame when clicking Ok with drawer open", () => {
    renderClearGame(true);

    fireEvent.click(screen.getByTestId("clearGameIcon"));
    fireEvent.click(screen.getByTestId("confirmClearGame"));

    expect(screen.queryByText("Clear current game?")).not.toBeInTheDocument();
    expect(createGameMock).toHaveBeenCalled();
  });
});
