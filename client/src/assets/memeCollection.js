const memeData = {
  a_smoothie: {
    img: "a_smoothie.jpg",
    origin: "https://knowyourmeme.com/memes/whatcha-got-there-a-smoothie",
    alt: "",
  },
  arthur_fist: {
    img: "arthur_fist.jpg",
    origin: "https://knowyourmeme.com/memes/arthurs-fist",
    alt: "",
  },
  because_reasons: {
    img: "because_reasons.jpg",
    origin: "",
    alt: "A Panel from the comic Three Word Phrase, by Ryan Pequin, depicting a man with a tophat, monacle and mustache and a speech bubble that says 'I want this because of reasons.' ",
  },
  distracted_boyfriend: {
    img: "distracted_boyfriend.jpg",
    origin: "https://knowyourmeme.com/memes/distracted-boyfriend",
    alt: "Distracted Boyfriend Template of the original stock photo that went viral and became a meme",
  },
  doubt: {
    img: "doubt.jpg",
    origin: "https://knowyourmeme.com/memes/la-noire-doubt-press-x-to-doubt",
    alt: "Distracted Boyfriend Template of the original stock photo that went viral and became a meme",
  },
  evil_kermit: {
    img: "evil_kermit.jpg",
    origin: "https://knowyourmeme.com/memes/evil-kermit",
    alt: "",
  },
  expensive_worse: {
    img: "expensive_worse.jpg",
    origin:
      "https://knowyourmeme.com/memes/sometimes-things-that-are-expensive-are-worse",
    alt: "Sometimes... Things That Are Expensive... Are Worse",
  },
  good_for_her: {
    img: "good_for_her.png",
    origin: "",
    alt: "",
  },
  i_cant_read: {
    img: "i_cant_read.png",
    origin:
      "https://knowyourmeme.com/memes/that-sign-cant-stop-me-because-i-cant-read",
    alt: "",
  },
  i_guess_guy: {
    img: "i_guess_guy.png",
    origin: "https://knowyourmeme.com/memes/i-guess-guy",
    alt: "",
  },
  is_this_a_pigeon: {
    img: "is_this_a_pigeon.jpg",
    origin: "https://knowyourmeme.com/memes/is-this-a-pigeon",
    alt: "",
  },
  kermit_tea: {
    img: "kermit_tea.png",
    origin: "https://knowyourmeme.com/memes/but-thats-none-of-my-business",
    alt: "",
  },
  knife_cat: {
    img: "knife_cat.png",
    origin: "https://knowyourmeme.com/memes/knife-cat",
    alt: "A white cat making a smug expression as a cooking knife is pointed at it",
  },
  let_me_in: {
    img: "let_me_in.png",
    origin: "https://knowyourmeme.com/memes/let-me-in",
    alt: "LET ME IN LET ME INNNNNN!!! (adult swim)",
  },
  marge_potato: {
    img: "marge_potato.png",
    origin: "https://knowyourmeme.com/memes/marge-simpsons-neat-potato",
    alt: "Marge Simpson holding up a potato with the subtitles 'I just think they're neat' ",
  },
  mordor: {
    img: "mordor.jpg",
    origin:
      "https://knowyourmeme.com/memes/one-does-not-simply-walk-into-mordor",
    alt: "",
  },
  no_take: {
    img: "no_take.png",
    origin: "https://knowyourmeme.com/memes/no-take-only-throw",
    alt: "A simple black and white comic of a dog by Tumblr user cupcakelogic. First panel it asks 'pls throw?', but when a hand appears to try to take the toy, it says 'no take! only throw'",
  },
  old_spice: {
    img: "old_spice.jpg",
    origin: "https://knowyourmeme.com/memes/events/isaiah-mustafa-old-spice",
    alt: "A shirtless black man riding a white horse and holding up a bottle of old spice",
  },
  one_fear: {
    img: "one_fear.jpg",
    origin: "https://knowyourmeme.com/memes/events/teen-comix-no-fear-one-fear",
    alt: "TEEN COMIX. NO FEAR. WHAT IF THEY MADE SIMPSONS PORN ILLEGAL? ONE FEAR",
  },
  pointing_spider_man: {
    img: "pointing_spider_man.jpg",
    origin: "https://knowyourmeme.com/memes/spider-man-pointing-at-spider-man",
    alt: "",
  },
  free_real_estate: {
    img: "free_real_estate.jpg",
    origin: "https://knowyourmeme.com/memes/its-free-real-estate",
    alt: "",
  },
  road_work_ahead: {
    img: "road_work_ahead.jpg",
    origin: "https://knowyourmeme.com/memes/road-work-ahead",
    alt: "",
  },
  shocked_pikachu: {
    img: "shocked_pikachu.png",
    origin: "https://knowyourmeme.com/memes/surprised-pikachu",
    alt: "",
  },
  sickos: {
    img: "sickos.jpg",
    origin: "https://knowyourmeme.com/memes/sickos-haha-yes",
    alt: "",
  },
  steel_feathers: {
    img: "steel_feathers.png",
    origin: "https://knowyourmeme.com/memes/steel-is-heavier-than-feathers",
    alt: "",
  },
  thanks_satan: {
    img: "thanks_satan.gif",
    origin: "https://knowyourmeme.com/memes/thanks-satan",
    alt: "",
  },
  then_perish: {
    img: "then_perish.jpg",
    origin: "https://knowyourmeme.com/memes/then-perish",
    alt: "",
  },
  this_is_fine: {
    img: "this_is_fine.png",
    origin: "https://knowyourmeme.com/memes/this-is-fine",
    alt: "",
  },
  woman_yelling_cat: {
    img: "woman_yelling_cat.jpg",
    origin: "https://knowyourmeme.com/memes/woman-yelling-at-a-cat",
    alt: "",
  },
};

const memes = Object.keys(memeData);

function memeSampler() {
  let memesArray = memes.slice(0);
  let bucket = [];
  let randomIndex;

  for (let i = 0; i < 24; i++) {
    randomIndex = Math.floor(Math.random() * (memesArray.length - 1));
    bucket.push(memesArray.splice(randomIndex, 1)[0]);
  }
  return bucket;
}

export { memeSampler, memeData };
