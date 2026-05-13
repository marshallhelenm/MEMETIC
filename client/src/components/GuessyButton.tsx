import React from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import { colorB, colorD } from "../assets/styles";

interface GuessyButtonProps {
  onClick?: (...args: any[]) => void;
  children: React.ReactNode;
  dark?: boolean;
  sx?: object;
  [key: string]: any;
}

const BolderButton = styled(Button)({
  fontWeight: "bold",
  padding: "6px 12px",
  margin: "2px",
  border: "2px solid",
  height: "fit-content",
  fontFamily: ["sans-serif"].join(","),
});

const GuessyButton: React.FC<GuessyButtonProps> = ({ onClick, children, dark, sx = {}, ...props }) => {
  const btnColor = dark ? colorB : colorD;
  return (
    <BolderButton
      variant="outlined"
      color="secondary"
      onClick={onClick}
      {...props}
      sx={{ ...sx, color: btnColor }}
    >
      {children}
    </BolderButton>
  );
};

export default GuessyButton;
