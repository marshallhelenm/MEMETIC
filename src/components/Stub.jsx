import { useState, useEffect } from "react";
import { Card, Button, Dimmer, DimmerDimmable, CardContent, CardHeader, Image, Icon } from "semantic-ui-react";
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

  return (
    <Card raised id={item.id}>
      <div className="stub-origin">
        <a href={item.origin} target="_blank" rel="noopener noreferrer" className="origin-link">
          <Icon name='question' />
        </a>
      </div>
      <DimmerDimmable dimmed={dimmer}>
        <Image src={item.img} alt={item.alt} onClick={flip} className="stub-image" />
        <Dimmer active={dimmer} onClickOutside={flip}/>
      </DimmerDimmable>
    </Card>
  );
}

export default Stub;
