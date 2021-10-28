import React, { useState } from 'react'

export default function PlayerActions({ socket, playerId, setStoragePlayerId }) {

  const [score, setScore] = useState(1);

  const addScorePlayerId = () => {
    socket.emit('addScoreById', { playerId: playerId, score: score });
  }

  const logout = () => {
    localStorage.clear();
    setStoragePlayerId(null);
  }

  return (
    <>
      <div className="player-actions">
        <small>En çok paraya sahip oyuncular ve skorları</small><br />
        <small className="title-player-id">current player id {playerId}</small>
        <div className="player-actions-inputs">
          <input type="number" value={score} onChange={(e) => setScore(e.target.value)} min="1" />
          <button onClick={() => addScorePlayerId()}>SKOR EKLE</button>
          <button onClick={() => logout()} className="btn-logout">ÇIKIŞ YAP</button>
        </div>
      </div>
    </>
  )
}
