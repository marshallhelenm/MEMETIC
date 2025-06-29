import "../App.css";
import { useGuessy } from "../contexts/useGuessy";
import Switch from "@mui/material/Switch";
import { styled, alpha } from "@mui/material";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

import { colorC, colorF } from "../assets/styles";
import { DrawerButton, DrawerItem } from "./DrawerComponents";

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
    <div onClick={toggleStaticGifs} style={{ display: "block", padding: 0 }}>
      <DrawerButton drawerOpen={drawerOpen}>
        <ListItemIcon
          sx={[
            { minWidth: 0, justifyContent: "center" },
            drawerOpen ? { mr: 3 } : { mr: "auto" },
          ]}
        >
          <PurpleSwitch checked={!staticGifs} color="#907AD6" />
          <ListItemText primary="Gifs" sx={[opacity]} />
        </ListItemIcon>
      </DrawerButton>
    </div>
  );
}

export default GifPauseButton;
