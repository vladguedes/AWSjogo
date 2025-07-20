import React, { useState, useEffect, useCallback } from 'react';
import appleImage from '../assets/maca.png';
import eatSoundFile from '../assets/sounds/som-comer.mp3';
import gameOverSoundFile from '../assets/sounds/som-gameover.mp3';

// --- Configurações do Jogo ---
const BOARD_SIZE = 20; // A grade continua 20x20
const INITIAL_SNAKE_POSITION = [{ x: 10, y: 10 }];
const INITIAL_FOOD_POSITION = { x: 15, y: 15 };
const INITIAL_DIRECTION = 'RIGHT';
const GAME_SPEED = 200;

const eatAudio = new Audio(eatSoundFile);
const gameOverAudio = new Audio(gameOverSoundFile);

// --- Componente Principal ---
const SnakeGame = () => {
  const [snake, setSnake] = useState(INITIAL_SNAKE_POSITION);
  const [food, setFood] = useState(INITIAL_FOOD_POSITION);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [score, setScore] = useState(0);

  // --- 1. CÁLCULO DINÂMICO DO TAMANHO ---
  // O tabuleiro usará 90% da largura da tela, com um máximo de 400px.
  const boardWidth = Math.min(window.innerWidth * 0.9, 400);
  const cellSize = boardWidth / BOARD_SIZE;

  // Função central para mudar a direção, usada pelo teclado e pelos botões de toque.
  const handleDirectionChange = (newDirection) => {
    if (newDirection === 'UP' && direction !== 'DOWN') setDirection('UP');
    if (newDirection === 'DOWN' && direction !== 'UP') setDirection('DOWN');
    if (newDirection === 'LEFT' && direction !== 'RIGHT') setDirection('LEFT');
    if (newDirection === 'RIGHT' && direction !== 'LEFT') setDirection('RIGHT');
  };

  const generateFood = () => {
    while (true) {
      const newFood = {
        x: Math.floor(Math.random() * BOARD_SIZE),
        y: Math.floor(Math.random() * BOARD_SIZE),
      };
      if (!snake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
        setFood(newFood);
        return;
      }
    }
  };

  const resetGame = () => {
    setSnake(INITIAL_SNAKE_POSITION);
    setFood(INITIAL_FOOD_POSITION);
    setDirection(INITIAL_DIRECTION);
    setIsGameOver(false);
    setScore(0);
    setIsRunning(true);
  };
  
  // O handleKeyDown agora usa a função central
  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case 'ArrowUp': handleDirectionChange('UP'); break;
      case 'ArrowDown': handleDirectionChange('DOWN'); break;
      case 'ArrowLeft': handleDirectionChange('LEFT'); break;
      case 'ArrowRight': handleDirectionChange('RIGHT'); break;
      default: break;
    }
  }, [direction]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // A lógica principal do jogo (game loop) não precisa de alterações
  useEffect(() => {
    if (!isRunning || isGameOver) return;
    const gameInterval = setInterval(() => {
      setSnake(prevSnake => {
        const newSnake = [...prevSnake];
        const head = { ...newSnake[0] };
        switch (direction) {
          case 'UP': head.y -= 1; break;
          case 'DOWN': head.y += 1; break;
          case 'LEFT': head.x -= 1; break;
          case 'RIGHT': head.x += 1; break;
          default: break;
        }
        if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE || newSnake.some(s => s.x === head.x && s.y === head.y)) {
          gameOverAudio.play();
          setIsGameOver(true);
          setIsRunning(false);
          return prevSnake;
        }
        newSnake.unshift(head);
        if (head.x === food.x && head.y === food.y) {
          eatAudio.play();
          setScore(prevScore => prevScore + 10);
          generateFood();
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, GAME_SPEED);
    return () => clearInterval(gameInterval);
  }, [snake, direction, isGameOver, isRunning]);


  return (
    <div className="bg-gray-900 min-h-screen w-full flex flex-col items-center justify-center text-white font-mono p-4 overflow-hidden">
      <div className="text-center mb-4">
        <h1 className="text-4xl md:text-5xl font-bold text-green-400 mb-2">Snake ODS</h1>
        <p className="text-gray-400 max-w-lg text-sm md:text-base">
          Este jogo representa o <span className="font-bold text-yellow-400">ODS 2 (Fome Zero)</span> e <span className="font-bold text-blue-400">ODS 3 (Saúde e Bem-Estar)</span>.
        </p>
      </div>

      <div className="w-full flex justify-between items-center mb-4" style={{ maxWidth: `${boardWidth}px` }}>
         <div className="text-xl md:text-2xl">Pontuação: <span className="font-bold text-green-400">{score}</span></div>
         {!isRunning && !isGameOver && (
            <button onClick={() => setIsRunning(true)} className="px-3 py-2 text-sm md:text-base bg-green-500 hover:bg-green-600 rounded-lg font-bold">
                Iniciar
            </button>
         )}
      </div>

      {/* --- 2. O TABULEIRO AGORA USA O TAMANHO RESPONSIVO --- */}
      <div
        className="bg-gray-800 border-4 border-green-500 relative"
        style={{
          width: `${boardWidth}px`,
          height: `${boardWidth}px`,
        }}
      >
        {isGameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col justify-center items-center z-10">
            <h2 className="text-4xl font-bold text-red-500">Fim de Jogo!</h2>
            <button onClick={resetGame} className="mt-4 px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg font-bold text-lg">
              Tentar Novamente
            </button>
          </div>
        )}

        {/* Renderização da cobra com o tamanho de célula dinâmico */}
        {snake.map((segment, index) => (
          <div
            key={index}
            className={`absolute rounded ${index === 0 ? 'bg-green-400' : 'bg-green-600'}`}
            style={{
              left: `${segment.x * cellSize}px`,
              top: `${segment.y * cellSize}px`,
              width: `${cellSize}px`,
              height: `${cellSize}px`,
            }}
          />
        ))}

        {/* Renderização da maçã com o tamanho de célula dinâmico */}
        <img
          src={appleImage}
          alt="Maçã"
          className="absolute"
          style={{
            left: `${food.x * cellSize}px`,
            top: `${food.y * cellSize}px`,
            width: `${cellSize}px`,
            height: `${cellSize}px`,
          }}
        />
      </div>

      {/* --- 3. CONTROLES DE TOQUE PARA MOBILE --- */}
      <div className="mt-8 flex flex-col items-center">
        <button onClick={() => handleDirectionChange('UP')} className="p-4 bg-gray-700 active:bg-gray-600 rounded-lg mb-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5L12 19M12 5L6 11M12 5L18 11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div className="flex gap-12">
            <button onClick={() => handleDirectionChange('LEFT')} className="p-4 bg-gray-700 active:bg-gray-600 rounded-lg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 12L5 12M5 12L11 18M5 12L11 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button onClick={() => handleDirectionChange('RIGHT')} className="p-4 bg-gray-700 active:bg-gray-600 rounded-lg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
        </div>
        <button onClick={() => handleDirectionChange('DOWN')} className="p-4 bg-gray-700 active:bg-gray-600 rounded-lg mt-2">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5V19M12 19L18 13M12 19L6 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
    </div>
  );
};

export default SnakeGame;