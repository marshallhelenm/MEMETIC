import { useSearchParams } from "react-router-dom";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

import { usePlayers } from "../contexts/useContextHooks";

function Players() {
  const [searchParams] = useSearchParams();
  const myUsername = searchParams.get("username");
  const { otherPlayers } = usePlayers();

  function generateOtherPlayers() {
    let otherPlayersItems = [];
    otherPlayers.forEach((p) => {
      otherPlayersItems.push(
        <ListItem key={"player-" + p}>
          <i
            className={`fa-regular fa-user fa-md`}
            style={{
              marginRight: "5%",
              colorScheme: "light dark",
              opacity: 0.8,
            }}
          ></i>
          <ListItemText primary={p} />
        </ListItem>
      );
    });
    return otherPlayersItems;
  }

  return (
    <>
      <Divider />
      <div style={{ marginLeft: "5%" }}>
        <List component="div" disablePadding>
          <ListItem>
            <i
              className={`fa-regular fa-user fa-md`}
              style={{
                marginRight: "5%",
                colorScheme: "light dark",
                opacity: 0.8,
              }}
            ></i>
            <ListItemText primary={myUsername} />
          </ListItem>

          {generateOtherPlayers()}
        </List>
      </div>
    </>
  );
}

export default Players;
