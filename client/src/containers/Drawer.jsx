import { useState } from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItemText from "@mui/material/ListItemText";
import Alert from "@mui/material/Alert";

import Logo from "../components/Logo";
import PlayerCardModal from "./PlayerCardModal";
import GifPauseButton from "../components/GifPauseButton";
import QuestionsModal from "../components/QuestionsModal";
import ClearGame from "../components/ClearGame";
import { colorB, colorE } from "../assets/styles";
import {
  DrawerButton,
  DrawerIcon,
  DrawerItem,
} from "../components/DrawerComponents";
import { useGuessy } from "../contexts/useGuessy";

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
  backgroungColor: colorE,
}));

export default function MiniDrawer({ children, setLoadingCards }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [alert, setAlert] = useState(false);
  const theme = useTheme();

  const { roomKey } = useGuessy();
  const opacity = drawerOpen ? { opacity: 1 } : { opacity: 0 };

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/play?roomKey=${roomKey}`
    );
    setAlert(true);
    setTimeout(() => {
      setAlert(false);
    }, 1500);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      {/* top bar */}
      <AppBar position="fixed" open={drawerOpen}>
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
      </AppBar>
      {/* drawer */}
      <Drawer variant="permanent" open={drawerOpen}>
        <DrawerHeader>
          {alert && (
            <Alert severity="success" sx={{ position: "absolute", zIndex: 99 }}>
              Room Key Copied!
            </Alert>
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
        <List>
          <DrawerItem onClick={handleCopyKey}>
            {/* Room Key */}
            <DrawerButton drawerOpen={drawerOpen}>
              <DrawerIcon drawerOpen={drawerOpen} icon="key" />
              <ListItemText primary={roomKey.toUpperCase()} sx={[opacity]} />
            </DrawerButton>
          </DrawerItem>
          <DrawerItem>
            {/* Player Meme */}
            <DrawerButton drawerOpen={drawerOpen}>
              <PlayerCardModal />
              <ListItemText primary={"Your Meme"} sx={[opacity]} />
            </DrawerButton>
          </DrawerItem>
          <DrawerItem>
            {/* users */}
            <DrawerButton drawerOpen={drawerOpen}>
              <DrawerIcon icon="users" />
              <ListItemText primary={"Users"} sx={[opacity]} />
            </DrawerButton>
            {/* div here listing users hidden when closed */}
          </DrawerItem>
        </List>
        <Divider />
        <List>
          <DrawerItem>
            <DrawerButton drawerOpen={drawerOpen}>
              <GifPauseButton />
              <ListItemText primary="Gifs" sx={[opacity]} />
            </DrawerButton>
          </DrawerItem>
          <DrawerItem>
            <ClearGame
              setLoadingCards={setLoadingCards}
              opacity={opacity}
              drawerOpen={drawerOpen}
            />
          </DrawerItem>
          <DrawerItem>
            <QuestionsModal opacity={opacity} drawerOpen={drawerOpen} />
          </DrawerItem>
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />
        {children}
      </Box>
    </Box>
  );
}
