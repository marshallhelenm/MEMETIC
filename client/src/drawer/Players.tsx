import { useSearchParams } from "react-router-dom";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import { usePlayers } from "../hooks/useContextHooks";
import Player2Star from "./Player2Star";

interface Player {
  username: string;
  // Add other player fields if needed
}

const Players: React.FC = () => {
  const [searchParams] = useSearchParams();
  const myUsername = searchParams.get("username");
  const { players, player1Uuid, player2Uuid } = usePlayers();
  const myUuid = sessionStorage.getItem("guessy-uuid");
  const isPlayer1 = myUuid === player1Uuid;

  function star(uuid: string) {
    if (player1Uuid === uuid) {
      return (
        <Tooltip placement="right-end" title="Player 1">
          <i className={`fa-regular fa-sun fa-md`} style={{ opacity: 0.8, marginRight: "5%" }}></i>
        </Tooltip>
      );
    } else if (player2Uuid === uuid) {
      return (
        <Player2Star
          canDemote={isPlayer1 && Object.keys(players).length > 2}
          uuid={uuid}
        />
      );
    } else {
      return <i
              className={`fa-regular fa-user fa-md`}
              style={{
                marginRight: "5%",
                colorScheme: "light dark",
                opacity: 0.8,
              }}
            ></i>
    }
  }

  function generateOtherPlayers(): JSX.Element[] {
    let playersItems: JSX.Element[] = [];
    Object.keys(players).forEach((uuid) => {
      if (uuid !== myUuid) {
        playersItems.push(
          <ListItem key={"player-" + players[uuid].username}>
            {star(uuid)}
            <ListItemText primary={players[uuid].username} />
          </ListItem>
        );
      }
    });
    return playersItems;
  }

  return (
    <>
      <Divider />
      <div style={{ marginLeft: "5%" }}>
        <List component="div" disablePadding>
          <ListItem>
            {star(myUuid as string)}
            <ListItemText primary={myUsername} />
          </ListItem>
          {generateOtherPlayers()}
        </List>
      </div>
    </>
  );
};

export default Players;
