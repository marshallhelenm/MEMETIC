# MEMETIC

A web-based multiplayer game inspired by the classic **“Guess Who?”**, but with **memes** instead of faces! Players ask yes/no questions to guess their opponent’s secret meme. Built with **Vite + React**, **react-use-websocket** for real-time communication, and **Material UI** for sleek styling.

---

## ✨ Features

* 🎨 Meme-based “Guess Who” boards
* 🧑‍🤝‍🧑 Real-time multiplayer via websockets
* 📐 Dynamic grid layout that auto-sorts images into best-fit columns by height
* 💅 Modern UI using Material UI components
* ⚡️ Fast development with Vite
* 🎞️ Toggle to play GIFs only when hovered
* 🔗 Link to meme source shown on hover

---

## ⚙️ Dynamic Grid Algorithm

This project includes a custom algorithm to **dynamically arrange meme images** into columns with approximately equal height. This provides a **Pinterest-style responsive grid**, ensuring the meme board is balanced and visually appealing even with images of varying aspect ratios.

> ✅ Automatically calculates optimal column assignment
>
> ✅ Supports responsive resizing

---

## 📌 TODO

* ⏳ Dockerize for deployment
* ⏳ Implement “guess opponent’s card” feature (with confirmation / win logic)
* ⏳ Limit rooms to two players + observers (spectator mode)
* ⏳ Chat between players
* ⏳ User authentication
* ⏳ Meme uploading / custom boards
* ⏳ Mobile-responsive UI improvements
* ⏳ Specific alternate still images for gifs

---

## 🛠️ Tech Stack

* **Frontend:** React (with Vite), Material UI, CSS/Styled Components
* **Real-time:** [react-use-websocket](https://github.com/robtaussig/react-use-websocket)
* **Backend:** Node.js (WebSocket server)
* **Styling/Layout:** Material UI theming, CSS styling, custom image-sorting algorithm for responsive boards

---

## 🧩 Plugins / Packages Used

* [`react-use-websocket`](https://github.com/robtaussig/react-use-websocket) – easy WebSocket integration for React
* [`react-card-flip`](https://github.com/AaronCCWong/react-card-flip) – smooth flipping animation for cards
* [`react-freezeframe`](https://github.com/ctrl-freaks/freezeframe-react) – freeze and control animated GIFs
* [`usebreakpoint`](https://www.npmjs.com/package/usebreakpoint) – React hook for handling responsive breakpoints
* [`@faker-js/faker`](https://github.com/faker-js/faker) – generate fake data for random usernames

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repository

```bash
git clone https://github.com/marshallhelenm/MEMETIC.git
cd guessy-2025
```

### 2️⃣ Install dependencies

```bash
# Frontend
cd client
npm install

# Backend
cd ../server
npm install
```

### 3️⃣ Run locally

```bash
# Start backend
cd server
node server.js

# Start frontend (Vite dev server)
cd ../client
npm run dev
```

---

## 🌐 How to Play

1. Join a game lobby.
2. View your dynamically arranged meme board.
3. Choose your secret meme.
4. Take turns asking yes/no questions.
5. Use logic to narrow down and guess your opponent’s meme!

---

## 🙏 Acknowledgments

* Classic *Guess Who?* board game for the concept
* This [TikTok that inspired the idea](https://ve.media.tumblr.com/tumblr_q8otm9qrlU1w0qmsw.mp4) — “Guess Who? but with memes” is a timeless concept
* Meme creators everywhere
* [Know Your Meme](https://knowyourmeme.com) for meme research and context
* [en.meming.world](https://en.meming.world) for meme templates and ideas
* [Material UI](https://mui.com/) for UI components

---

## 🚀 Demo

> *Coming Soon*

---

## 📸 Screenshots

<img src="./client/src/assets/demo/landing_page.png" alt="landing page" height="400"/>
<img src="./client/src/assets/demo/join_page.png" alt="join page" height="400"/>
<img src="./client/src/assets/demo/name_form.png" alt="username form" height="400"/>

<img src="./client/src/assets/demo/full_board.png" alt="full board" height="500"/>
<img src="./client/src/assets/demo/smaller_board.png" alt="smaller board" height="500"/>

<img src="./client/src/assets/demo/overlay.png" alt="overlay" height="300"/>
<img src="./client/src/assets/demo/your_meme.png" alt="your_meme" height="300"/>
<img src="./client/src/assets/demo/sidebar.png" alt="sidebar" height="300"/>

---
