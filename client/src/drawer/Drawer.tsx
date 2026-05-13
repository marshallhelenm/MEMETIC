import React, { useState, ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import Logo from "../components/Logo";
import PlayerCardModal from "../containers/PlayerCardModal";
import GifPauseButton from "./GifPauseButton";
import QuestionsModal from "./QuestionsModal";
import ClearGame from "./ClearGame";
import Players from "./Players";
import { colorB, colorE } from "../assets/styles";
import { DrawerButton, DrawerIcon, DrawerItem } from "./DrawerComponents";
import { GuessySuspense } from "../components/GuessySuspense";
import { usePlayers } from "../hooks/useContextHooks";

const drawerWidth = 200;

const openedMixin = (theme: any) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: any) => ({
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
      props: ({ open }: { open: boolean }) => open,
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

interface DrawerStyledProps {
  open: boolean;
}

const DrawerStyled = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})<DrawerStyledProps>(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  variants: [
    {
      props: ({ open }: { open: boolean }) => open,
      style: {
        ...openedMixin(theme),
        "& .MuiDrawer-paper": openedMixin(theme),
      },
    },
    {
      props: ({ open }: { open: boolean }) => !open,
      style: {
        ...closedMixin(theme),
        "& .MuiDrawer-paper": closedMixin(theme),
      },
    },
  ],
  backgroundColor: colorE,
}));

interface MiniDrawerProps {
  children: ReactNode;
}

const MiniDrawer: React.FC<MiniDrawerProps> = ({ children }) => {
  const theme = useTheme();
  const [searchParams] = useSearchParams();
  const [draweropen, setDrawerOpen] = useState<boolean>(false);
  const { player1Uuid } = usePlayers();
  const roomKey = searchParams.get("roomKey");
  const opacity = draweropen ? { opacity: 1 } : { opacity: 0 };
  const isPlayer1 = sessionStorage.getItem("guessy-uuid") === player1Uuid;

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const handleCopyKey = () => {
    if (roomKey) navigator.clipboard.writeText(roomKey);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      {/* top bar */}
      <AppBar
        position="fixed"
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
            sx={[{ marginRight: 5 }, draweropen && { display: "none" }]}
          >
            <i className={`fa-solid fa-bars fa-lg`}></i>
          </IconButton>
          <Logo spin={false} header={true} />
          <h1 className="heading">MEMETIC</h1>
        </Toolbar>
        <GifPauseButton draweropen={draweropen} />
      </AppBar>
      {/* drawer */}
      <DrawerStyled variant="permanent" open={draweropen}>
        <DrawerHeader>
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
            <DrawerButton draweropen={draweropen}>
              <Tooltip title="Copy Room Key" placement="right-end">
                <div>
                  <DrawerIcon draweropen={draweropen} icon="key" />
                </div>
              </Tooltip>
              <ListItemText primary={roomKey} sx={[opacity]} />
              {draweropen && (
                <i
                  className={`fa-regular fa-copy fa-md`}
                  style={{ opacity: 0.8 }}
                ></i>
              )}
            </DrawerButton>
          </DrawerItem>
          {/* Player Meme */}
          <PlayerCardModal draweropen={draweropen} opacity={opacity} />
          {/* Clear Game */}
          {isPlayer1 && <ClearGame opacity={opacity} draweropen={draweropen} />}
          <QuestionsModal opacity={opacity} draweropen={draweropen} />
          <DrawerItem
            onClick={() => {
              if (!draweropen) setDrawerOpen(true);
            }}
          >
            {/* users */}
            <DrawerButton draweropen={draweropen}>
              <Tooltip title="View Players" placement="right-end">
                <div>
                  <DrawerIcon draweropen={draweropen} icon="users" />
                </div>
              </Tooltip>
              <ListItemText primary={"Players"} sx={[opacity]} />
            </DrawerButton>
          </DrawerItem>
          {draweropen && (
            <GuessySuspense>
              <Players />
            </GuessySuspense>
          )}
        </>
      </DrawerStyled>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />
        {children}
      </Box>
    </Box>
  );
};

export default MiniDrawer;
