import Divider from "@mui/material/Divider";
import { colorC } from "../assets/styles";
import { useGuessy } from "../contexts/useGuessy";
import { List, ListItem, ListItemText } from "@mui/material";
import { DrawerButton, DrawerIcon, DrawerItem } from "./DrawerComponents";

function Users() {
  const { partnerUsername, username } = useGuessy();

  return (
    <>
      <Divider />
      <div style={{ marginLeft: "10%" }}>
        <List component="div" disablePadding>
          <ListItem drawerOpen={true}>
            <i
              className={`fa-regular fa-user fa-md`}
              style={{
                marginRight: "5%",
                colorScheme: "light dark",
                opacity: 0.8,
              }}
            ></i>
            <ListItemText primary={username} />
          </ListItem>
          <ListItem drawerOpen={true}>
            <i
              className={`fa-regular fa-user fa-md`}
              style={{
                marginRight: "5%",
                colorScheme: "light dark",
                opacity: 0.8,
              }}
            ></i>
            <ListItemText primary={partnerUsername} />
          </ListItem>
        </List>
      </div>
    </>
  );
}
// <h4 className="header-box">
//   <i
//     className={`fa-solid fa-xl fa-user`}
//     style={{ marginRight: "2%" }}
//   ></i>
//   {username}
// </h4>
// <h4 className="header-box">
//   <i
//     className={`fa-solid fa-lg fa-user`}
//     style={{ marginRight: "2%", color: `${colorC} !important` }}
//   ></i>
//   {partnerUsername}
// </h4>

export default Users;
