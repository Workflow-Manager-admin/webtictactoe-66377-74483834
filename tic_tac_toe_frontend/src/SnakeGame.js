import React, { useEffect, useRef, useState, useCallback } from 'react';
import './App.css';

/**
 * Modern, minimalistic Snake game.
 * - Uses the same color variables and style sensibility as the Tic Tac Toe app.
 */

/* Core constants for Snake */
const GRID_SIZE = 16; // 16x16 grid
const INITIAL_SNAKE = [
  { x: 8, y: 8 },
  { x: 8, y: 9 }
];
const INTERVAL = 85; // ms per frame, higher = slower (default ~80)
const DIRECTIONS = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 }
};

const SNAKE_COL = 'var(--primary)';
const FOOD_COL = 'var(--accent)';
const BG_COL = 'var(--bg-secondary)';
const BORDER_COL = 'var(--border-color)';

// Prevent diagonal reverse/180 moves
function isOpposite(dirA, dirB) {
  return dirA && dirB && dirA.x === -dirB.x && dirA.y === -dirB.y;
}

// Utility: Generate a random position not occupied by snake
function randomFreeCell(snake) {
  let position;
  do {
    position = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
  } while (snake.some(s => s.x === position.x && s.y === position.y));
  return position;
}

// PUBLIC_INTERFACE
function SnakeGame() {
  /**
   * State: snake, direction, food, score, isGameOver, speed, etc.
   */
  const [snake, setSnake] = useState([...INITIAL_SNAKE]);
  const [direction, setDirection] = useState(DIRECTIONS.ArrowUp);
  const [nextDir, setNextDir] = useState(DIRECTIONS.ArrowUp);
  const [food, setFood] = useState(randomFreeCell(INITIAL_SNAKE));
  const [score, setScore] = useState(0);
  const [isGameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);

  // For precise control updates
  const moving = useRef(false);

  // Handle keyboard events
  useEffect(() => {
    function handleKeyDown(e) {
      if (!started && ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
        setStarted(true);
      }
      if (DIRECTIONS[e.key]) {
        setNextDir(prev => {
          if (!isOpposite(DIRECTIONS[e.key], direction)) return DIRECTIONS[e.key];
          return prev;
        });
      }
      if (isGameOver && (e.key === ' ' || e.key === 'Enter')) {
        handleRestart();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGameOver, direction, started]);

  // Main movement interval
  useEffect(() => {
    if (isGameOver || !started) return;
    const tick = () => {
      setSnake(prev => {
        let newDir = nextDir;
        // Move new head
        const newHead = {
          x: (prev[0].x + newDir.x + GRID_SIZE) % GRID_SIZE,
          y: (prev[0].y + newDir.y + GRID_SIZE) % GRID_SIZE
        };
        // Check for collision with self
        if (prev.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          setStarted(false);
          return prev;
        }
        let eating = newHead.x === food.x && newHead.y === food.y;
        let newSnake = [newHead, ...prev];
        if (!eating) {
          newSnake.pop();
        } else {
          setScore(s => s + 1);
          setFood(randomFreeCell(newSnake));
        }
        return newSnake;
      });
      setDirection(nextDir);
    };
    const timer = setInterval(tick, INTERVAL);
    return () => clearInterval(timer);
    // eslint-disable-next-line
  }, [isGameOver, nextDir, food, started]);

  // PUBLIC_INTERFACE
  const handleRestart = useCallback(() => {
    setSnake([...INITIAL_SNAKE]);
    setDirection(DIRECTIONS.ArrowUp);
    setNextDir(DIRECTIONS.ArrowUp);
    setFood(randomFreeCell(INITIAL_SNAKE));
    setScore(0);
    setGameOver(false);
    setStarted(false);
  }, []);

  // Keyboard on mobile fallback (show manually)
  // Could allow tap/onscreen controls if needed.

  // Render the grid minimalistically, avoid borders, but highlight snake and food
  return (
    <div className="App snake-app-root" style={{ minHeight: '100vh', minWidth: '100vw'}}>
      <main className="snake-main-container" style={{
        margin: 'auto', maxWidth: 420, minHeight: 540, display: "flex", flexDirection: "column", alignItems: "center", gap: 20
      }}>
        <h1 className="snake-title" style={{
          fontSize: '2.3rem',
          fontWeight: 700,
          color: "var(--primary)",
          margin: "28px 0 10px"
        }}>Snake Game</h1>
        <div className="snake-status" style={{
          fontSize: '1.05rem',
          color: "var(--secondary)",
          marginBottom: 12,
          fontWeight: 500
        }}>
          {isGameOver ? <span style={{ color: "var(--accent)", fontWeight: 700 }}>Game Over</span> :
            started ?
              <span>Score: <span style={{ color: "var(--primary)", fontWeight: 600 }}>{score}</span></span>
              :
              <span>
                Press <kbd>Arrow</kbd> keys to start<br />
                (or swipe focus and use arrows)
              </span>
          }
        </div>
        <div
          className="snake-board-container"
          tabIndex={0}
          style={{
            background: BG_COL,
            border: `2px solid ${BORDER_COL}`,
            borderRadius: 20,
            boxShadow: "0 2px 12px 0 rgba(60,72,90,0.06)",
            padding: 10,
            outline: "none"
          }}
          aria-label="Snake game area"
          role="region"
        >
          <div
            className="snake-grid"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${GRID_SIZE}, 18px)`,
              gridTemplateRows: `repeat(${GRID_SIZE}, 18px)`,
              gap: 2,
              background: "transparent"
            }}
          >
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, idx) => {
              const x = idx % GRID_SIZE;
              const y = Math.floor(idx / GRID_SIZE);
              const isFood = food.x === x && food.y === y;
              const sIdx = snake.findIndex(seg => seg.x === x && seg.y === y);
              // Head, body, food, or empty
              return (
                <div
                  key={idx}
                  className="snake-cell"
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: sIdx === 0 ? 6 : 4,
                    background: isFood
                      ? FOOD_COL
                      : sIdx >= 0
                        ? SNAKE_COL
                        : BG_COL,
                    boxShadow: isFood
                      ? "0 0 0 2px var(--accent),0 0 6px 0 var(--accent)55"
                      : sIdx === 0
                        ? "0 0 0 1.5px var(--primary), 0 1px 6px rgba(33,150,243,0.15)"
                        : undefined,
                    opacity: sIdx === 0 ? 1 : 0.95,
                    border: sIdx >= 0
                      ? '1.5px solid var(--primary)'
                      : isFood
                        ? '1.5px solid var(--accent)'
                        : '1px solid transparent',
                    transition: "background 0.15s, border 0.12s"
                  }}
                  aria-label={
                    isFood
                      ? 'Food'
                      : sIdx === 0
                        ? 'Snake head'
                        : sIdx > 0
                          ? 'Snake body'
                          : undefined
                  }
                />
              );
            })}
          </div>
        </div>
        <div className="snake-controls" style={{ margin: 16, display: 'flex', justifyContent: "center" }}>
          <button
            className="snake-restart-btn"
            style={{
              background: "var(--primary)",
              color: "var(--button-text)",
              border: 'none',
              borderRadius: 8,
              padding: "11px 34px",
              fontSize: "1rem",
              fontWeight: 600,
              letterSpacing: "0.04em",
              cursor: "pointer",
              transition: "background .22s, color .22s, box-shadow .22s",
              boxShadow: "0 2px 8px rgba(33,150,243,0.08)"
            }}
            onClick={handleRestart}
            tabIndex={0}
            aria-label="Restart Snake Game"
          >
            Restart
          </button>
        </div>
        <footer className="snake-footer" style={{
          fontSize: '1.08rem',
          color: 'var(--secondary)',
          marginTop: 18, opacity: .91
        }}>
          <span>
            Use <kbd>Arrow</kbd> keys to move. Score: <b>{score}</b>
            <span style={{ marginLeft: 10, fontSize: "19px" }} role="img" aria-label="snake">🐍</span>
          </span>
        </footer>
      </main>
    </div>
  );
}

export default SnakeGame;
