import question from "../assets/question.png";

function MissingStub() {
  return (
    <div className="stub" style={{ height: `200px` }}>
      <p style={{ fontSize: "medium" }}>{"Dude where's my meme?"}</p>
      <p style={{ fontSize: "medium" }}>{"Something's gone wrong."}</p>
      <img
        src={question}
        alt={`a question mark`}
        className="stub-image back"
        style={{ height: "50px" }}
      />
    </div>
  );
}

export default MissingStub;
