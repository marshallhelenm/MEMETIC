import "../App.css";
import { useGuessy } from "../contexts/useGuessy";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { styled, alpha } from "@mui/material";
import { colorC, colorF } from "../assets/styles";

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
}));

function GifPauseButton() {
  const { staticGifs, guessyActor } = useGuessy();

  function toggleStaticGifs() {
    guessyActor("setStaticGifs", { staticGifs: !staticGifs });
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
