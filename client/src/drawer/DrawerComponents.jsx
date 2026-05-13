import React from "react";
import { lazy } from "react";
import PropTypes from "prop-types";

import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import { colorC } from "../assets/styles";

function DrawerButton({ children, draweropen }) {
  // Destructure draweropen so it is not passed to ListItemButton
  return (
    <ListItemButton
      sx={[
        { minHeight: 48, px: 2.5 },
        draweropen
          ? { justifyContent: "initial" }
          : { justifyContent: "center" },
      ]}
    >
      {children}
    </ListItemButton>
  );
}

DrawerButton.propTypes = {
  children: PropTypes.any,
  draweropen: PropTypes.bool,
};

function DrawerIcon({ draweropen, icon, classes = "", ...props }) {
  // Remove draweropen from props so it is not forwarded
  return (
    <ListItemIcon
      sx={[
        { minWidth: 0, justifyContent: "center" },
        draweropen ? { mr: 3 } : { mr: "auto" },
      ]}
    >
      <i className={`fa-solid fa-${icon} fa-lg ${classes}`}></i>
    </ListItemIcon>
  );
}

DrawerIcon.propTypes = {
  classes: PropTypes.string,
  draweropen: PropTypes.bool,
  icon: PropTypes.string,
};

function DrawerItem({ children, onClick }) {
  return (
    <ListItem disablePadding sx={{ display: "block" }} onClick={onClick}>
      {children}
    </ListItem>
  );
}

DrawerItem.propTypes = {
  children: PropTypes.any,
  onClick: PropTypes.func,
};

export { DrawerButton, DrawerIcon, DrawerItem };
