import { useState, useEffect } from "react";
import { Card, Button, Dimmer, Header, Icon, DimmerDimmable, CardContent, CardHeader, Image } from "semantic-ui-react";
import "../App.css";

function Stub ({item}) {
  const [dimmer, setDimmer] = useState(false);

  function stubStatus(id, status) {
    // status of true means dimmed, false means not dimmed
    localStorage.setItem(id, status);
    status === "dimmed" ? setDimmer(true) : setDimmer(false);
  }

  function flip(e){
    e.preventDefault();
    stubStatus(item.id, dimmer ? "dimmed" : "visible");
    setDimmer(!dimmer)
  }
  useEffect(() => {
    if (localStorage.getItem(item.id) === "dimmed") {
      setDimmer(true);
    } else {
      setDimmer(false);
    }
  }, [item.id]);

  function confirmGuess() {
    //TODO: a function to prompt the user on whether or not they really want to guess that card
    // brings up a modal
    console.log("pick me!");
    
  }
  
  let url = item.img;
  let title = item.title;

  return (
    <Card raised id={item.id}>
      <div className="ui image stub-image">
        <DimmerDimmable dimmed={dimmer}>
          <img src={url} alt={item.alt} onClick={flip} />
          <Dimmer active={dimmer} onClickOutside={flip}/>
        </DimmerDimmable>
      </div>
      <CardContent className="stub-bar">
        <CardHeader>
          <a href={item.origin} target="_blank" rel="noopener noreferrer" className="origin-link">
            <h3>{title}</h3>
            <Button color="green" onClick={confirmGuess} size="small">
              Pick Me!
            </Button> 
          </a>
        </CardHeader>
      </CardContent>
    </Card>
  );
}

export default Stub;
