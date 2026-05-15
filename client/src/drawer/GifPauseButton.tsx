import React from "react";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import { styled, alpha } from "@mui/material";
import { colorC, colorF } from "../assets/styles";
import { useGame } from "../hooks/useContextHooks";

interface GifPauseButtonProps {
  draweropen?: boolean;
}

const GifPauseButton: React.FC<GifPauseButtonProps> = ({ draweropen }) => {
  const { staticGifs, setStaticGifs } = useGame();

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
    mr: draweropen ? 3 : "auto",
  }));

  function toggleStaticGifs() {
    sessionStorage.setItem("guessy-gifs", String(!staticGifs));
    setStaticGifs(!staticGifs);
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
};

export default GifPauseButton;
