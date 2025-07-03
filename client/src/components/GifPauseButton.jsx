import Switch from "@mui/material/Switch";
import { styled, alpha } from "@mui/material";
import FormControlLabel from "@mui/material/FormControlLabel";

import { colorC, colorF } from "../assets/styles";

function GifPauseButton({ drawerOpen }) {
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

  const staticGifs = sessionStorage.getItem("guessy-gifs") === "true";

  function toggleStaticGifs() {
    sessionStorage.setItem("guessy-gifs", !staticGifs);
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
