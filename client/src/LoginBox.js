import React, { useState } from 'react'

export default function LoginBox({ setStoragePlayerId }) {

  const [playerId, setPlayerId] = useState("");

  const loginPlay = () => {
    console.log(playerId, playerId.length);
    if (!playerId || playerId.length < 6) {
      alert("Geçerli id giriniz");
      return;
    }
    localStorage.setItem("playerId", playerId);
    setStoragePlayerId(playerId);
  }

  return (
    <div className="login-box">
      <input value={playerId} onChange={(e) => setPlayerId(e.target.value)} placeholder="PlayerID (6171d5c887a6cee60cfe7595)" />
      <small><a href="http://localhost:3001/players/leaders/200" target="_blank" rel="noreferrer" title="dummy players">players (json 200)</a></small>
      <button onClick={(e) => loginPlay()}>PLAY</button>
    </div>
  )
}
