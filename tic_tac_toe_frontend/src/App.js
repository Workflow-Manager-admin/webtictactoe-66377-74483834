import React, { useState, useEffect } from 'react';
import './App.css';
import SnakeGame from './SnakeGame';

/**
 * Color & Theme (per requirements):
 *  - primary:   #2196F3 (blue)
 *  - secondary: #607D8B (grey-blue)
 *  - accent:    #FFCB05 (yellow)
 *  - Style: modern, minimalistic, light theme
 */

// Square component for Tic Tac Toe grid
// PUBLIC_INTERFACE
function Square({ value, onClick, isHighlighted }) {
  return (
    <button
      className={`ttt-square${isHighlighted ? ' highlight' : ''}`}
      onClick={onClick}
      aria-label={`Tic Tac Toe square ${value ? value : 'empty'}`}
    >
      {value}
    </button>
  );
}

// Returns [winner, winningSquaresArray] or [null, []]
function calculateWinner(squares) {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8], // rows
    [0,3,6],[1,4,7],[2,5,8], // columns
    [0,4,8],[2,4,6]          // diagonals
  ];
  for (let line of lines) {
    const [a, b, c] = line;
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return [squares[a], line];
    }
  }
  return [null, []];
}

function App() {
  // Navigation between games
  const [page, setPage] = useState('ttt'); // 'ttt' | 'snake'

  // --- TTT state and logic (same as before) ---
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [winningSquares, setWinningSquares] = useState([]);
  const [isDraw, setIsDraw] = useState(false);

  const handleRestart = () => {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setWinner(null);
    setIsDraw(false);
    setWinningSquares([]);
  };

  const handleSquareClick = idx => {
    if (winner || squares[idx] || isDraw) return;
    const nextSquares = squares.slice();
    nextSquares[idx] = xIsNext ? "X" : "O";
    setSquares(nextSquares);
    setXIsNext(!xIsNext);
  };

  useEffect(() => {
    const [win, winSquares] = calculateWinner(squares);
    setWinner(win);
    setWinningSquares(winSquares);
    if (!win && squares.every(v => v)) {
      setIsDraw(true);
    } else {
      setIsDraw(false);
    }
  }, [squares]);

  let status;
  if (winner) {
    status = (
      <span>
        <span className="ttt-player" style={{color: "var(--accent)"}}>{winner}</span>
        {" wins!"}
      </span>
    );
  } else if (isDraw) {
    status = "It's a draw!";
  } else {
    status = (
      <span>
        Next:{" "}
        <span
          className="ttt-player"
          style={{color: "var(--primary)"}}
        >
          {xIsNext ? "X" : "O"}
        </span>
      </span>
    );
  }

  /** Minimal top nav bar */
  const TopNav = (
    <header className="app-navbar" style={{
      width: "100%",
      background: "var(--bg-secondary)",
      borderBottom: "1.8px solid var(--border-color)",
      boxShadow: "0 2px 8px rgba(72,90,100,0.05)",
      display: "flex", flexDirection: "row",
      alignItems: "center", justifyContent: "center",
      minHeight: 61,
      zIndex: 51
    }}>
      <nav style={{
        display: "flex", gap: 12, alignItems: "center", margin: "0 auto"
      }}>
        <button
          style={{
            fontSize: "1.08rem",
            fontWeight: 600,
            color: page === "ttt" ? "var(--primary)" : "var(--secondary)",
            background: "none",
            border: "none",
            borderBottom: page === "ttt" ? "2.5px solid var(--primary)" : "2.5px solid transparent",
            padding: "13px 28px 9px 28px",
            cursor: "pointer",
            outline: "none",
            transition: "color .18s, border .18s"
          }}
          disabled={page === "ttt"}
          onClick={() => setPage('ttt')}
          aria-current={page === "ttt" ? "page" : undefined}
        >
          Tic Tac Toe
        </button>
        <button
          style={{
            fontSize: "1.08rem",
            fontWeight: 600,
            color: page === "snake" ? "var(--primary)" : "var(--secondary)",
            background: "none",
            border: "none",
            borderBottom: page === "snake" ? "2.5px solid var(--primary)" : "2.5px solid transparent",
            padding: "13px 24px 9px 24px",
            cursor: "pointer",
            outline: "none",
            transition: "color .18s, border .18s"
          }}
          disabled={page === "snake"}
          onClick={() => setPage('snake')}
          aria-current={page === "snake" ? "page" : undefined}
        >
          Snake Game
        </button>
      </nav>
    </header>
  );

  // --- Render ---
  return (
    <div className="App" style={{ minHeight: "100vh", minWidth: "100vw", background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      {TopNav}
      {page === 'ttt' && (
        <div className="ttt-app-root">
          <main className="ttt-main-container">
            <h1 className="ttt-title">Tic Tac Toe</h1>
            <div className="ttt-status">{status}</div>
            <div className="ttt-board-container">
              <div className="ttt-board">
                {squares.map((sq, idx) => (
                  <Square
                    key={idx}
                    value={sq}
                    isHighlighted={winningSquares.includes(idx)}
                    onClick={() => handleSquareClick(idx)}
                  />
                ))}
              </div>
            </div>
            <div className="ttt-controls">
              <button className="ttt-restart-btn" onClick={handleRestart}>
                Restart Game
              </button>
            </div>
            <footer className="ttt-footer">
              <span>
                <span style={{color: "var(--primary)"}}>X</span> / <span style={{color: "var(--secondary)"}}>O</span> = two players <span style={{fontSize: "1.2em"}} role="img" aria-label="handshake">🤝</span>
              </span>
            </footer>
          </main>
        </div>
      )}
      {page === 'snake' && (
        <SnakeGame />
      )}
    </div>
  );
}

export default App;
