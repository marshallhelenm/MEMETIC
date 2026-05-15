import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

import * as useContextHooks from "../src/hooks/useContextHooks";
import * as memeCollection from "../src/assets/memeCollection";

jest.mock("../src/components/ObserverStar", () => (props: any) => {
  // Remove draweropen so it is not passed to the DOM
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { draweropen, ...rest } = props;
  return <div data-testid="ObserverStar" {...rest} />;
});

jest.mock("../src/components/StyledDialog", () => (props: any) => (
  <div data-testid="StyledDialog">{props.children}</div>
));

jest.mock("../src/drawer/YourMemeImage", () => (props: any) => (
  <div data-testid="YourMemeImage" data-item={props.item?.title} />
));

jest.mock("../src/drawer/DrawerComponents", () => ({
  DrawerButton: ({ children, ...props }: { children: React.ReactNode }) => (
    <button data-testid="DrawerButton" {...props}>
      {children}
    </button>
  ),
  DrawerIcon: ({ icon, ...props }: { icon: any }) => (
    <span data-testid="DrawerIcon" data-icon={icon} {...props} />
  ),
  DrawerItem: ({ children, ...props }: { children: React.ReactNode }) => (
    <div data-testid="DrawerItem" {...props}>
      {children}
    </div>
  ),
}));

import PlayerCardModal from "../src/containers/PlayerCardModal";

describe("PlayerCardModal", () => {
  let assignNewMyPlayerCardMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    assignNewMyPlayerCardMock = jest.fn();

    jest.spyOn(useContextHooks, "useGame").mockReturnValue({
      dialogWidth: "sm",
    });

    // Default memeData
    // @ts-expect-error: Overriding for test
    memeCollection.memeData = {
      testKey: { title: "Test Meme" },
    };
  });

  it("renders ObserverStar when isObserver is true", () => {
    jest.spyOn(useContextHooks, "usePlayers").mockReturnValue({
      isObserver: true,
    });

    render(<PlayerCardModal draweropen={true} opacity={{ opacity: 0.8 }} />);
    expect(screen.getByTestId("ObserverStar")).toBeInTheDocument();
  });

  it("renders DrawerButton and DrawerIcon when not observer", () => {
    jest.spyOn(useContextHooks, "usePlayers").mockReturnValue({
      isObserver: false,
      myPlayerCard: "testKey",
      assignNewMyPlayerCard: assignNewMyPlayerCardMock,
    });

    render(<PlayerCardModal draweropen={true} opacity={{ opacity: 0.8 }} />);
    expect(screen.getByTestId("DrawerItem")).toBeInTheDocument();
    expect(screen.getByTestId("DrawerButton")).toBeInTheDocument();
    expect(screen.getByTestId("DrawerIcon")).toHaveAttribute(
      "data-icon",
      "star"
    );
    expect(screen.getByText("Your Meme")).toBeInTheDocument();
  });

  it("opens modal on click and renders meme title", () => {
    jest.spyOn(useContextHooks, "usePlayers").mockReturnValue({
      isObserver: false,
      myPlayerCard: "testKey",
      assignNewMyPlayerCard: assignNewMyPlayerCardMock,
    });

    render(<PlayerCardModal draweropen={true} opacity={{ opacity: 0.8 }} />);
    fireEvent.click(screen.getByTestId("DrawerItem"));

    expect(screen.getByTestId("StyledDialog")).toBeInTheDocument();
    expect(screen.getByText("Test Meme")).toBeInTheDocument();
    expect(screen.getByTestId("YourMemeImage")).toHaveAttribute(
      "data-item",
      "Test Meme"
    );
  });

  it("calls assignNewMyPlayerCard when assign icon is clicked in modal", () => {
    jest.spyOn(useContextHooks, "usePlayers").mockReturnValue({
      isObserver: false,
      myPlayerCard: "testKey",
      assignNewMyPlayerCard: assignNewMyPlayerCardMock,
    });

    render(<PlayerCardModal draweropen={true} opacity={{ opacity: 0.8 }} />);
    fireEvent.click(screen.getByTestId("DrawerItem"));
    // ...existing code...
  });
  });
