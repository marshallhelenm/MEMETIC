import { Box, TextField } from "@mui/material";
import { useState } from "react";

import type { MemeLibrary } from "../types/memeTypes";
import { colorA, colorD, corners } from "../assets/styles";
import GuessyButton from "../components/GuessyButton.js";


const inputStyle = {
            backgroundColor: colorD,
            color: colorA,
            borderRadius: corners,
            justifySelf: "center",
            marginBottom: "2%",
          }

function MemeUploader() {
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [title, setTitle] = useState("");
  const [imgSrc, setImgSrc] = useState("");
  const [originSrc, setOriginSrc] = useState("");
  const [imgValid, setImgValid] = useState(false);
  const [heightMultiplier, setHeightMultiplier] = useState(1);
  const [memeJson, setMemeJson] = useState("");

  function processMeme() {
    const memeKey = title
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
    const newMeme: MemeLibrary = {
      [memeKey]: {
        title,
        img: imgSrc,
        origin: originSrc,
        height_multiplier: heightMultiplier,
      }
    };
    setMemeJson(JSON.stringify(newMeme, null, 2));
    console.log(memeKey, newMeme);
    // code to write newMeme to memes.json goes here
  }

  function processImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      console.log("Processing image:", url);
      img.src = url;
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = reject;
    }).then(({ width, height }) => {
      const heightMultiplier = 1 / (width / height);
      setHeightMultiplier(heightMultiplier);
      setImgValid(true);
    }).catch((error) => {
      setImgValid(false);
      console.error("Error loading image:", error);
    });
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      processImage(imgSrc);
    }
  }

  function handleImgSrcChange(e) {
    setImgSrc(e.target.value);
    processImage(e.target.value);
  }

  function imagePreview() {
    if (imgValid) {
      return (
        <div>
          <img src={imgSrc} alt="Meme Preview" />
        </div>
      )
    } else {
      return (
        <div style={{backgroundColor: colorD, borderRadius: corners}}>
          <p>Broken image link!</p>
        </div>
      )
    }
  }

  function jsonDisplay() {
    return (
      <Box sx={{ backgroundColor: colorD, color: colorA, borderRadius: corners, padding: 2, marginTop: 2, maxHeight: "30vh", overflowY: "auto" }}>
        <pre>{JSON.stringify({ title, img: imgSrc, origin: originSrc, height_multiplier: heightMultiplier }, null, 2)}</pre>
      </Box>
    );
  }

  return (
    <div style={{display: "flex", flexDirection: "row", justifyContent: "space-around", alignItems: "center", height: "100vh"}}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", backgroundColor: colorD, padding: "2%", borderRadius: corners, height: "50vh", margin: "0 auto" }}>
        <h2 style={{ color: colorA }}>
          Meme Uploader
        </h2>
        <TextField
          placeholder="Meme Title"
          onChange={(e) => {
            setTitle(e.target.value);
          }}
          value={title}
          variant="outlined"
          sx={inputStyle}
          />
        <TextField
          placeholder="Origin Src"
          id="origin_src_input"
          sx={inputStyle}
          value={originSrc}
          onChange={(e) => setOriginSrc(e.target.value)}
          />
        <TextField
          placeholder="Image Src"
          id="img_src_input"
          sx={inputStyle}
          value={imgSrc}
          onChange={handleImgSrcChange}
          onBlur={(e) => setImgSrc(e.target.value)}
          onKeyDown={handleKeyDown}
          />
        <GuessyButton onClick={processMeme} dark={true} disabled={!imgValid || title.length < 2}>
          Submit
        </GuessyButton>
      </div>
      {imgSrc ? imagePreview() : null}
      {memeJson ? jsonDisplay() : null}
    </div>
  );
}

export default MemeUploader;
