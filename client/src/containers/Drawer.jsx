import { useState } from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItemText from "@mui/material/ListItemText";

import Logo from "../components/Logo";
import PlayerCardModal from "./PlayerCardModal";
import GifPauseButton from "../components/GifPauseButton";
import QuestionsModal from "../components/QuestionsModal";
import ClearGame from "../components/ClearGame";
import CopyAlert from "../components/CopyAlert";
import { colorB, colorE } from "../assets/styles";
import {
  DrawerButton,
  DrawerIcon,
  DrawerItem,
} from "../components/DrawerComponents";
import Players from "../components/Players";
import { Tooltip } from "@mui/material";
import { useSearchParams } from "react-router-dom";

const drawerWidth = 200;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  variants: [
    {
      props: ({ open }) => open,
      style: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(["width", "margin"], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
    },
  ],
  backgroundColor: `${colorB} !important`,
  color: colorE,
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  variants: [
    {
      props: ({ open }) => open,
      style: {
        ...openedMixin(theme),
        "& .MuiDrawer-paper": openedMixin(theme),
      },
    },
    {
      props: ({ open }) => !open,
      style: {
        ...closedMixin(theme),
        "& .MuiDrawer-paper": closedMixin(theme),
      },
    },
  ],
  backgroundColor: colorE,
}));

export default function MiniDrawer({ children }) {
  const [searchParams] = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [alert, setAlert] = useState(false);
  const theme = useTheme();
  const roomKey = searchParams.get("roomKey");
  const opacity = drawerOpen ? { opacity: 1 } : { opacity: 0 };

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(roomKey);
    setAlert(true);
    if (drawerOpen) {
      setTimeout(() => {
        setAlert(false);
      }, 1500);
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      {/* top bar */}
      <AppBar
        position="fixed"
        open={drawerOpen}
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={[{ marginRight: 5 }, drawerOpen && { display: "none" }]}
          >
            <i className={`fa-solid fa-bars fa-lg`}></i>
          </IconButton>
          <Logo spin={false} header={true} />
          <h1 className="heading">Guessy</h1>
        </Toolbar>
        <GifPauseButton />
      </AppBar>
      {/* drawer */}
      <Drawer variant="permanent" open={drawerOpen}>
        <DrawerHeader>
          {alert && (
            <CopyAlert
              severity="success"
              sx={{ position: "absolute", zIndex: 99 }}
            >
              Room Key Copied!
            </CopyAlert>
          )}
          <IconButton onClick={handleDrawerClose}>
            <i
              className={`fa-solid fa-chevron-${
                theme.direction === "rtl" ? "right" : "left"
              } fa-lg`}
            ></i>
          </IconButton>
        </DrawerHeader>
        <Divider />
        <>
          <DrawerItem onClick={handleCopyKey}>
            {/* Room Key */}
            <DrawerButton drawerOpen={drawerOpen}>
              <Tooltip title="Copy Room Key" placement="right-end">
                <div>
                  <DrawerIcon drawerOpen={drawerOpen} icon="key" />
                </div>
              </Tooltip>
              <ListItemText primary={roomKey} sx={[opacity]} />
              {drawerOpen && (
                <i
                  className={`fa-regular fa-copy fa-md`}
                  style={{ opacity: 0.8 }}
                ></i>
              )}
            </DrawerButton>
          </DrawerItem>
          {/* Player Meme */}
          <PlayerCardModal drawerOpen={drawerOpen} opacity={opacity} />
          {/* Clear Game */}
          <ClearGame opacity={opacity} drawerOpen={drawerOpen} />
          <QuestionsModal opacity={opacity} drawerOpen={drawerOpen} />
          <DrawerItem
            onClick={() => {
              if (!drawerOpen) setDrawerOpen(true);
            }}
          >
            {/* users */}
            <DrawerButton drawerOpen={drawerOpen}>
              <Tooltip title="View Players" placement="right-end">
                <div>
                  <DrawerIcon drawerOpen={drawerOpen} icon="users" />
                </div>
              </Tooltip>
              <ListItemText primary={"Players"} sx={[opacity]} />
            </DrawerButton>
          </DrawerItem>
          {drawerOpen && <Players />}
        </>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />
        {children}
      </Box>
    </Box>
  );
}
