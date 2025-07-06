import Tooltip from "@mui/material/Tooltip";
import ListItemText from "@mui/material/ListItemText";

import {
  DrawerButton,
  DrawerIcon,
  DrawerItem,
} from "../drawer/DrawerComponents";

const ObserverStar = ({ drawerOpen, opacity }) => {
  return (
    <Tooltip
      title="This room is full! You're just an observer here."
      placement="right-end"
    >
      <div>
        <DrawerItem>
          <DrawerButton drawerOpen={drawerOpen}>
            <DrawerIcon icon="star" drawerOpen={drawerOpen} />
            <ListItemText primary={"Observer"} sx={[opacity]} />
          </DrawerButton>
        </DrawerItem>
      </div>
    </Tooltip>
  );
};

export default ObserverStar;
