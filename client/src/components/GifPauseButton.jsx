import "../App.css";
import { useGuessy } from "../contexts/useGuessy";
import Switch from "@mui/material/Switch";
import { styled, alpha } from "@mui/material";
import ListItemIcon from "@mui/material/ListItemIcon";

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

function GifPauseButton({ drawerOpen }) {
  const { staticGifs, guessyManager } = useGuessy();

  function toggleStaticGifs() {
    guessyManager("setStaticGifs", { staticGifs: !staticGifs });
  }

  return (
    <ListItemIcon
      sx={[
        { minWidth: 0, justifyContent: "center" },
        drawerOpen ? { mr: 3 } : { mr: "auto" },
      ]}
    >
      <PurpleSwitch
        checked={!staticGifs}
        onChange={toggleStaticGifs}
        color="#907AD6"
      />
    </ListItemIcon>
  );
}

export default GifPauseButton;
