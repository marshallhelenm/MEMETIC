import { colorC } from "../assets/styles";
import { useGuessy } from "../contexts/useGuessy";

function Users({ username }) {
  const { roomObject } = useGuessy();
  const users = roomObject?.users;

  function userTags() {
    if (!users) return;
    let tags = [];
    Object.keys(users).forEach((key) => {
      let name = users[key].username;
      if (name != username) {
        let tag = (
          <span key={name}>
            <i
              className={`fa-solid fa-lg fa-user`}
              style={{ marginRight: "2%", color: `${colorC} !important` }}
            ></i>
            {name}
          </span>
        );
        tags.push(tag);
      }
    });
    return tags;
  }

  return (
    <>
      <h4 className="header-box">
        <i
          className={`fa-solid fa-xl fa-user`}
          style={{ marginRight: "2%" }}
        ></i>
        {username}
      </h4>
      <h4 className="header-box">{userTags()}</h4>
    </>
  );
}

export default Users;
