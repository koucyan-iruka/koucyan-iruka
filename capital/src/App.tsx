import React, { useState } from 'react';
import { DifficultySelector } from './components/DifficultySelector';
import { Quiz } from './components/Quiz';
import { GameOver } from './components/GameOver';
import { Globe } from 'lucide-react';

function App() {
  const [difficulty, setDifficulty] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [lastQuestion, setLastQuestion] = useState<{ country: string; correctAnswer: string }>({
    country: '',
    correctAnswer: ''
  });

  const handleGameOver = (score: number, lastQ: { country: string; correctAnswer: string }) => {
    setFinalScore(score);
    setLastQuestion(lastQ);
    setGameOver(true);
  };

  const handleRestart = () => {
    setDifficulty(null);
    setGameOver(false);
    setFinalScore(0);
    setLastQuestion({ country: '', correctAnswer: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Globe className="w-10 h-10 text-blue-500" />
            <h1 className="text-4xl font-bold">首都クイズ</h1>
          </div>
          <p className="text-gray-600">世界の首都、幾つわかりますか？</p>
        </div>

        {!difficulty && !gameOver && (
          <DifficultySelector onSelect={setDifficulty} />
        )}

        {difficulty && !gameOver && (
          <Quiz
            difficulty={difficulty}
            onGameOver={handleGameOver}
          />
        )}

        {gameOver && (
          <GameOver
            score={finalScore}
            lastQuestion={lastQuestion}
            onRestart={handleRestart}
          />
        )}
      </div>
    </div>
  );
}

export default App;