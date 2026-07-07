import React from 'react';
import { RefreshCw } from 'lucide-react';

interface GameOverProps {
  score: number;
  lastQuestion: {
    country: string;
    correctAnswer: string;
  };
  onRestart: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({ score, lastQuestion, onRestart }) => {
  return (
    <div className="text-center space-y-6">
      <h2 className="text-3xl font-bold">ゲームオーバー！</h2>
      <div className="space-y-2">
        <p className="text-xl">最終スコア: {score}点</p>
        <p className="text-lg text-gray-700">
          {lastQuestion.country}の首都は{lastQuestion.correctAnswer}だぞ！
        </p>
      </div>
      <button
        onClick={onRestart}
        className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
      >
        <RefreshCw className="w-5 h-5" />
        もう一度プレイ
      </button>
    </div>
  );
};