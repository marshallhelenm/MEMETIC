import { colorC } from "../assets/styles";
import { useGuessy } from "../contexts/useGuessy";

function Users() {
  const { partnerUsername, username } = useGuessy();

  return (
    <>
      <h4 className="header-box">
        <i
          className={`fa-solid fa-xl fa-user`}
          style={{ marginRight: "2%" }}
        ></i>
        {username}
      </h4>
      <h4 className="header-box">
        <i
          className={`fa-solid fa-lg fa-user`}
          style={{ marginRight: "2%", color: `${colorC} !important` }}
        ></i>
        {partnerUsername}
      </h4>
    </>
  );
}

export default Users;
