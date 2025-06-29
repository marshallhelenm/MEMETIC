import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";

function DrawerButton({ children, drawerOpen }) {
  const listItemButtonSX = [
    { minHeight: 48, px: 2.5 },
    drawerOpen ? { justifyContent: "initial" } : { justifyContent: "center" },
  ];
  return <ListItemButton sx={listItemButtonSX}>{children}</ListItemButton>;
}

function DrawerIcon({ drawerOpen, icon, classes = "" }) {
  return (
    <ListItemIcon
      sx={[
        { minWidth: 0, justifyContent: "center" },
        drawerOpen ? { mr: 3 } : { mr: "auto" },
      ]}
    >
      <i className={`fa-solid fa-${icon} fa-lg ${classes}`}></i>
    </ListItemIcon>
  );
}

function DrawerItem({ children, onClick }) {
  return (
    <ListItem disablePadding sx={{ display: "block" }} onClick={onClick}>
      {children}
    </ListItem>
  );
}

export { DrawerButton, DrawerIcon, DrawerItem };
