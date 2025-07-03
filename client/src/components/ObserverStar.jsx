import Tooltip from "@mui/material/Tooltip";
import ListItemText from "@mui/material/ListItemText";

import {
  DrawerButton,
  DrawerIcon,
  DrawerItem,
} from "../components/DrawerComponents";

const ObserverStar = ({ handleOpen, drawerOpen, opacity }) => {
  return (
    <Tooltip title="This room is full! You're just an observer here.">
      <div>
        <DrawerItem onClick={handleOpen}>
          <DrawerButton drawerOpen={drawerOpen}>
            <div>
              <DrawerIcon icon="star" />
            </div>
            <ListItemText primary={"Your Meme"} sx={[opacity]} />
          </DrawerButton>
        </DrawerItem>
        Observer
      </div>
    </Tooltip>
  );
};

export default ObserverStar;
