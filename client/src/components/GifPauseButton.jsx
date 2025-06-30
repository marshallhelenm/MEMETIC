import "../App.css";
import { useGuessy } from "../contexts/useGuessy";
import Switch from "@mui/material/Switch";
import { styled, alpha } from "@mui/material";
import FormControlLabel from "@mui/material/FormControlLabel";

import { colorC, colorF } from "../assets/styles";

function GifPauseButton({ drawerOpen, opacity }) {
  const PurpleSwitch = styled(Switch)(({ theme }) => ({
    "& .MuiSwitch-switchBase": {
      color: colorC,
      "&:hover": {
        backgroundColor: alpha(colorC, theme.palette.action.hoverOpacity),
      },
    },
    "& .MuiSwitch-switchBase.Mui-checked": {
      color: colorF,
      "&:hover": {
        backgroundColor: alpha(colorF, theme.palette.action.hoverOpacity),
      },
    },
    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
      backgroundColor: colorF,
    },
    minWidth: 0,
    justifyContent: "center",
    mr: drawerOpen ? 3 : "auto",
  }));
  const { staticGifs, guessyManager } = useGuessy();

  function toggleStaticGifs() {
    guessyManager("setStaticGifs", { staticGifs: !staticGifs });
  }

  return (
    <FormControlLabel
      control={
        <PurpleSwitch
          checked={!staticGifs}
          onChange={toggleStaticGifs}
          color="#907AD6"
        />
      }
      label="Gifs"
      sx={{ color: "#DABFFF" }}
    />
  );
}

export default GifPauseButton;
