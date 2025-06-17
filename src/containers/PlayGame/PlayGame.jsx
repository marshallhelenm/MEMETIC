// import { useState, useEffect } from "react";
// import queryString from "query-string";
import "../../App.css";
import "./PlayGame.css";
import Board from "../Board/Board";
import QuestionsModal from "../../components/QuestionsModal";
// import Chat from "../../components/Chat/Chat";
import ClearGame from "../../components/ClearGame/ClearGame";

// const BASE_URL = "http://localhost:5173";
const tempMemes = [
  {
    stub: "road_work",
    title: "Road Work Ahead",
    img:
      "https://res.cloudinary.com/dwfqeeh5f/image/upload/v1588045049/Guessy/memes/i_sure_hope.jpg",
    origin: "https://knowyourmeme.com/memes/road-work-ahead",
    "alt":""
  },
  {
    stub: "is_pigeon",
    title: "Is this a pigeon?",
    img:
      "https://res.cloudinary.com/dwfqeeh5f/image/upload/v1588044932/Guessy/memes/is_this_a_pigeon.jpg",
    origin: "https://knowyourmeme.com/memes/is-this-a-pigeon",
    "alt":""
  },
  {
    stub: "pikachu",
    title: "Shocked Pikachu",
    img:
      "https://res.cloudinary.com/dwfqeeh5f/image/upload/v1588959076/Guessy/memes/image0.png",
    origin: "https://knowyourmeme.com/memes/surprised-pikachu",
    "alt":""
  },
  {
    stub: "then_perish",
    title: "Then Perish",
    img:
      "https://res.cloudinary.com/dwfqeeh5f/image/upload/v1589822516/Guessy/memes/perish.jpg",
    origin: "https://knowyourmeme.com/memes/then-perish",
    "alt":""
  },
  {
    stub: "real_estate",
    title: "It's Free Real Estate",
    img:
      "https://res.cloudinary.com/dwfqeeh5f/image/upload/v1589828289/Guessy/memes/download_1.jpg",
    origin: "https://knowyourmeme.com/memes/its-free-real-estate",
    "alt":""
  },
  {
    stub: "woman_yelling_cat",
    title: "Woman Yelling At Cat",
    img:
      "https://res.cloudinary.com/dwfqeeh5f/image/upload/v1589844095/Guessy/memes/womanyellingcat.jpg",
    origin: "https://knowyourmeme.com/memes/woman-yelling-at-a-cat",
    "alt":""
  },
  {
    stub: "this_is_fine",
    title: "This Is Fine",
    img:
      "https://res.cloudinary.com/dwfqeeh5f/image/upload/v1589850523/Guessy/memes/Screen_Shot_2020-05-18_at_6.09.39_PM.png",
    origin: "https://knowyourmeme.com/memes/this-is-fine",
    "alt":""
  },
  {
    stub: "evil_kermit",
    title: "Evil Kermit",
    img:
      "https://res.cloudinary.com/dwfqeeh5f/image/upload/v1589852447/Guessy/memes/evil_kermit.jpg",
    origin: "https://knowyourmeme.com/memes/evil-kermit",
    "alt":""
  },
  {
    stub: "steel_feathers",
    title: "But Steel is Heavier Than Feathers...",
    img:
      "https://res.cloudinary.com/dwfqeeh5f/image/upload/v1589852807/Guessy/memes/steel_feathers.png",
    origin: "https://knowyourmeme.com/memes/steel-is-heavier-than-feathers",
    "alt":""
  },
  {
    stub: "kermit_tea",
    title: "But That's None of My Business",
    img:
      "https://res.cloudinary.com/dwfqeeh5f/image/upload/v1589934935/Guessy/memes/kermit_tea.png",
    origin: "https://knowyourmeme.com/memes/but-thats-none-of-my-business",
    "alt":""
  },
  {
    stub: "old_spice",
    title: "I'm On A Horse",
    img:
      "https://res.cloudinary.com/dwfqeeh5f/image/upload/v1589935138/Guessy/memes/old_spice.jpg",
    origin: "https://knowyourmeme.com/memes/events/isaiah-mustafa-old-spice",
    "alt": "A shirtless black man riding a white horse and holding up a bottle of old spice",
  },
  {
    stub: "mordor",
    title: "One Does Not Simply Walk Into Mordor",
    img:
      "https://res.cloudinary.com/dwfqeeh5f/image/upload/v1589935255/Guessy/memes/mordor.jpg",
    "origin":
      "https://knowyourmeme.com/memes/one-does-not-simply-walk-into-mordor",
    alt: ""
  },
  {
    stub: "pointing_spider-man",
    title: "Spider-Man Pointing At Spider-Man",
    img:
      "https://res.cloudinary.com/dwfqeeh5f/image/upload/v1589935584/Guessy/memes/spider-man.jpg",
    origin: "https://knowyourmeme.com/memes/spider-man-pointing-at-spider-man",
    "alt":""
  },
  {
    stub: "good_for_her",
    title: "Good For Her",
    img:
      "https://res.cloudinary.com/dwfqeeh5f/image/upload/v1589935959/Guessy/memes/Screen_Shot_2020-05-19_at_5.53.14_PM.png",
    origin: "",
    "alt":""
  },
  {
    stub: "arthur_fist",
    title: "Arthur's Fist",
    img:
      "https://res.cloudinary.com/dwfqeeh5f/image/upload/v1589936087/Guessy/memes/arthur_fist.jpg",
    origin: "https://knowyourmeme.com/memes/arthurs-fist",
    "alt":""
  },
  {
    stub: "expensive_worse",
    title: "Sometimes... Things That Are Expensive... Are Worse",
    img:
      "https://res.cloudinary.com/dwfqeeh5f/image/upload/v1590772419/Guessy/memes/Expensive_Worse.jpg",
    "origin":
      "https://knowyourmeme.com/memes/sometimes-things-that-are-expensive-are-worse",
    alt: "Sometimes... Things That Are Expensive... Are Worse"
  },
  {
    stub: "distracted_boyfriend",
    title: "Distracted Boyfriend",
    img:
      "https://res.cloudinary.com/dwfqeeh5f/image/upload/v1590772549/Guessy/memes/distracted_boyfriend.jpg",
    origin: "https://knowyourmeme.com/memes/distracted-boyfriend",
    "alt":
      "Distracted Boyfriend Template of the original stock photo that went viral and became a meme"
  },
  {
    stub: "marge_potato",
    title: "I Just Think They're Neat!",
    img:
      "https://res.cloudinary.com/dwfqeeh5f/image/upload/v1590772934/Guessy/memes/marge_potato.png",
    origin: "https://knowyourmeme.com/memes/marge-simpsons-neat-potato",
    "alt":
      "Marge Simpson holding up a potato with the subtitles 'I just think they're neat' "
  },
  {
    stub: "knife_cat",
    title: "Knife Cat",
    img:
      "https://res.cloudinary.com/dwfqeeh5f/image/upload/v1590773078/Guessy/memes/knife_cat.png",
    origin: "https://knowyourmeme.com/memes/knife-cat",
    "alt":
      "A white cat making a smug expression as a cooking knife is pointed at it"
  },
  {
    stub: "no_take",
    title: "No Take, Only Throw",
    img:
      "https://res.cloudinary.com/dwfqeeh5f/image/upload/v1590773287/Guessy/memes/no_take.png",
    origin: "https://knowyourmeme.com/memes/no-take-only-throw",
    "alt":
      "A simple black and white comic of a dog by Tumblr user cupcakelogic. First panel it asks 'pls throw?', but when a hand appears to try to take the toy, it says 'no take! only throw'"
  },
  {
    stub: "because_reasons",
    title: "I Want This Because of Reasons",
    img:
      "https://res.cloudinary.com/dwfqeeh5f/image/upload/v1590773639/Guessy/memes/because_reasons.jpg",
    origin: "",
    "alt":
      "A Panel from the comic Three Word Phrase, by Ryan Pequin, depicting a man with a tophat, monacle and mustache and a speech bubble that says 'I want this because of reasons.' "
  }
]

//the page you see while actually playing the game
function PlayGame() {
  // const [memeCollection, setMemeCollection] = useState({});

  // const { name, room } = queryString.parse(location.search);
  const room = "el"

  function sampler(arr){
    let bucket = [];
    let randomIndex;

    for (let i = 0; i < 24; i++) {
      randomIndex = Math.floor(Math.random() * (arr.length - 1));
      bucket.push(arr.splice(randomIndex, 1)[0]);
    }
    return bucket;
  }

  
  // async function fetchMemes() {
  //   let prevMemes = JSON.parse(localStorage.getItem("memes"));
  //   if (prevMemes) {
  //     setMemeCollection(prevMemes);
  //   } else {
  //     try {
  //       // const res = await fetch(`${BASE_URL}/memeCollection`);
  //       // const memes = await res.json();
  //       const memes = tempMemes
  //       let sample = sampler(memes);
  //       setMemeCollection({ room, memes: sample })
  //       console.log("memeCollection: ", memeCollection);
        
  //     } catch {
  //       console.log('caught');
  //     }
  //   }
  // }

  // useEffect(() => {
  //   fetchMemes();
  // }, []);

  // useEffect(() => {
  //   localStorage.setItem("memes", JSON.stringify(memeCollection));
  // }, [memeCollection]);

  return (
    <div className="playGame">
      <div className="gameBoard">
        <h3>Room Name: {room}</h3>
        <div className="flex row">
          <div className="column-md-6">
            <QuestionsModal />
          </div>
          <div className="column-md-6">
            {/* <ClearGame room={room} fetchMemes={fetchMemes} /> */}
            <ClearGame room={room} fetchMemes={()=>{}} />
          </div>
        </div>
        <Board items={tempMemes} />
      </div>
      <div>
        {/* <Chat /> */}
      </div>
    </div>
  );
}

export default PlayGame;
