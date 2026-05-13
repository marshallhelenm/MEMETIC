import Tooltip from "@mui/material/Tooltip";
import ListItemText from "@mui/material/ListItemText";
import { DrawerButton, DrawerIcon, DrawerItem } from "../drawer/DrawerComponents";
import React from "react";

interface ObserverStarProps {
  draweropen?: boolean;
  opacity?: { opacity: number };
}

const ObserverStar: React.FC<ObserverStarProps> = ({ draweropen, opacity }) => {
  return (
    <Tooltip
      title="This room is full! You're just an observer here."
      placement="right-end"
    >
      <div>
        <DrawerItem>
          <DrawerButton draweropen={draweropen}>
            <DrawerIcon icon="star" draweropen={draweropen} />
            <ListItemText primary={"Observer"} sx={opacity ?? {}} />
          </DrawerButton>
        </DrawerItem>
      </div>
    </Tooltip>
  );
};

export default ObserverStar;
