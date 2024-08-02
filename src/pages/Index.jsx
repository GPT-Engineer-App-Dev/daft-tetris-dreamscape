import { useState, useEffect, useCallback } from 'react';
import { useInterval } from '../hooks/useInterval';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const INITIAL_SPEED = 1000;

const createEmptyBoard = () =>
  Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0));

const TETROMINOS = {
  I: { shape: [[1, 1, 1, 1]], color: 'bg-blue-500' },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: 'bg-orange-500' },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: 'bg-yellow-500' },
  O: { shape: [[1, 1], [1, 1]], color: 'bg-green-500' },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: 'bg-red-500' },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: 'bg-purple-500' },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: 'bg-pink-500' },
};

const Index = () => {
  const [board, setBoard] = useState(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);

  const getRandomTetromino = () => {
    const tetrominos = Object.keys(TETROMINOS);
    const randTetromino = tetrominos[Math.floor(Math.random() * tetrominos.length)];
    return {
      pos: { x: BOARD_WIDTH / 2 - 1, y: 0 },
      tetromino: TETROMINOS[randTetromino],
    };
  };

  const isColliding = (piece, board) => {
    for (let y = 0; y < piece.tetromino.shape.length; y++) {
      for (let x = 0; x < piece.tetromino.shape[y].length; x++) {
        if (piece.tetromino.shape[y][x]) {
          if (
            board[y + piece.pos.y] === undefined ||
            board[y + piece.pos.y][x + piece.pos.x] === undefined ||
            board[y + piece.pos.y][x + piece.pos.x] !== 0
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const rotate = (piece) => {
    const rotatedPiece = JSON.parse(JSON.stringify(piece));
    rotatedPiece.tetromino.shape = rotatedPiece.tetromino.shape[0].map((_, index) =>
      rotatedPiece.tetromino.shape.map((row) => row[index])
    ).reverse();
    return rotatedPiece;
  };

  const movePlayer = useCallback((dir) => {
    if (!isColliding({ ...currentPiece, pos: { x: currentPiece.pos.x + dir, y: currentPiece.pos.y } }, board)) {
      setCurrentPiece((prev) => ({ ...prev, pos: { x: prev.pos.x + dir, y: prev.pos.y } }));
    }
  }, [currentPiece, board]);

  const drop = useCallback(() => {
    if (!isColliding({ ...currentPiece, pos: { x: currentPiece.pos.x, y: currentPiece.pos.y + 1 } }, board)) {
      setCurrentPiece((prev) => ({ ...prev, pos: { x: prev.pos.x, y: prev.pos.y + 1 } }));
    } else {
      if (currentPiece.pos.y < 1) {
        setGameOver(true);
        return;
      }
      updateBoard();
    }
  }, [currentPiece, board]);

  const updateBoard = () => {
    const newBoard = [...board];
    currentPiece.tetromino.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          newBoard[y + currentPiece.pos.y][x + currentPiece.pos.x] = currentPiece.tetromino.color;
        }
      });
    });

    const newRows = newBoard.reduce((acc, row) => {
      if (row.every((cell) => cell !== 0)) {
        setScore((prev) => prev + 10);
        acc.unshift(new Array(newBoard[0].length).fill(0));
      } else {
        acc.push(row);
      }
      return acc;
    }, []);

    setBoard(newRows);
    setCurrentPiece(getRandomTetromino());
  };

  const handleKeyPress = useCallback((event) => {
    if (gameOver) return;

    if (event.keyCode === 37) movePlayer(-1);
    if (event.keyCode === 39) movePlayer(1);
    if (event.keyCode === 40) drop();
    if (event.keyCode === 38) {
      const rotatedPiece = rotate(currentPiece);
      if (!isColliding(rotatedPiece, board)) {
        setCurrentPiece(rotatedPiece);
      }
    }
  }, [movePlayer, drop, currentPiece, board, gameOver]);

  useEffect(() => {
    setCurrentPiece(getRandomTetromino());
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  useInterval(() => {
    drop();
  }, gameOver ? null : speed);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-4">Daft Punk Tetris</h1>
      <div className="border-4 border-blue-500 p-2">
        {board.map((row, y) => (
          <div key={y} className="flex">
            {row.map((cell, x) => (
              <div
                key={x}
                className={`w-6 h-6 border border-gray-700 ${
                  cell || (currentPiece &&
                    currentPiece.tetromino.shape[y - currentPiece.pos.y] &&
                    currentPiece.tetromino.shape[y - currentPiece.pos.y][x - currentPiece.pos.x])
                    ? cell || currentPiece.tetromino.color
                    : 'bg-gray-800'
                }`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-4 text-xl">Score: {score}</div>
      {gameOver && <div className="mt-4 text-2xl text-red-500">Game Over</div>}
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={() => {
          setBoard(createEmptyBoard());
          setCurrentPiece(getRandomTetromino());
          setGameOver(false);
          setScore(0);
          setSpeed(INITIAL_SPEED);
        }}
      >
        {gameOver ? 'Play Again' : 'Reset Game'}
      </button>
    </div>
  );
};

export default Index;
