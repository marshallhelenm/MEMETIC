import Logo from "../components/Logo";

function RoomLoading() {
  return (
    <div>
      <Logo spin={true} />
      <h3 className="heading">Loading...</h3>
    </div>
  );
}

export default RoomLoading;
