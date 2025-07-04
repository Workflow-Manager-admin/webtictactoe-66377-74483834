import React, { useState, useEffect } from 'react';
import './App.css';

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

// PUBLIC_INTERFACE
function App() {
  // Board state: array of 9 (null | "X" | "O")
  const [squares, setSquares] = useState(Array(9).fill(null));
  // X goes first
  const [xIsNext, setXIsNext] = useState(true);
  // Track winner/draw
  const [winner, setWinner] = useState(null);
  const [winningSquares, setWinningSquares] = useState([]);
  // For draw
  const [isDraw, setIsDraw] = useState(false);

  // Reset board state
  // PUBLIC_INTERFACE
  const handleRestart = () => {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setWinner(null);
    setIsDraw(false);
    setWinningSquares([]);
  };

  // Handle move
  // PUBLIC_INTERFACE
  const handleSquareClick = idx => {
    if (winner || squares[idx] || isDraw) return;
    const nextSquares = squares.slice();
    nextSquares[idx] = xIsNext ? "X" : "O";
    setSquares(nextSquares);
    setXIsNext(!xIsNext);
  };

  // Effects for winner and draw
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

  // Status message
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

  return (
    <div className="App ttt-app-root">
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
  );
}

export default App;
