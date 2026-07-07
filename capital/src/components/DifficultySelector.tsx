import React from 'react';
import { Trophy, Target, Skull } from 'lucide-react';

interface DifficultySelectorProps {
  onSelect: (level: number) => void;
}

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({ onSelect }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center mb-6">難易度を選択してください</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => onSelect(1)}
          className="flex flex-col items-center p-6 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
        >
          <Trophy className="w-8 h-8 text-green-600 mb-2" />
          <span className="font-semibold">かんたん</span>
          <span className="text-sm text-gray-600">選択肢2個</span>
        </button>

        <button
          onClick={() => onSelect(2)}
          className="flex flex-col items-center p-6 bg-yellow-100 rounded-lg hover:bg-yellow-200 transition-colors"
        >
          <Target className="w-8 h-8 text-yellow-600 mb-2" />
          <span className="font-semibold">ふつう</span>
          <span className="text-sm text-gray-600">選択肢4個</span>
        </button>

        <button
          onClick={() => onSelect(5)}
          className="flex flex-col items-center p-6 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
        >
          <Skull className="w-8 h-8 text-red-600 mb-2" />
          <span className="font-semibold">難しい</span>
          <span className="text-sm text-gray-600">選択肢10個</span>
        </button>

        <button
          onClick={() => onSelect(9)}
          className="flex flex-col items-center p-6 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors"
        >
          <Skull className="w-8 h-8 text-purple-600 mb-2" />
          <span className="font-semibold">IMPOSSIBLE</span>
          <span className="text-sm text-gray-600">回答を入力</span>
        </button>
      </div>
    </div>
  );
};