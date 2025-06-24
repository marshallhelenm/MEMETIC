import "../App.css";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import { colorB, colorD } from "../assets/styles";

const BolderButton = styled(Button)({
  // fontSize: 16,
  fontWeight: "bold",
  padding: "6px 12px",
  margin: "2px",
  border: "2px solid",
  // lineHeight: 1.5,
  // margin: "1%",
  height: "fit-content",
  fontFamily: ["sans-serif"].join(","),
});

function GuessyButton({ onClick, children, dark, sx, ...props }) {
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
}

export default GuessyButton;
