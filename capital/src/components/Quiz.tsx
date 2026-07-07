import React, { useState, useEffect } from 'react';
import { Capital, getCapitals } from '../data/capitals';
import { ArrowRight, SkipForward } from 'lucide-react';

interface QuizProps {
  difficulty: number;
  onGameOver: (score: number, lastQuestion: { country: string; correctAnswer: string }) => void;
}

export const Quiz: React.FC<QuizProps> = ({ difficulty, onGameOver }) => {
  const [currentQuestion, setCurrentQuestion] = useState<Capital | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [skipsLeft, setSkipsLeft] = useState(5);
  const [input, setInput] = useState('');
  const [questionNumber, setQuestionNumber] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const buttonColors = [
    'bg-rose-100 hover:bg-rose-200 text-rose-800 border-rose-200',
    'bg-orange-100 hover:bg-orange-200 text-orange-800 border-orange-200',
    'bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-200',
    'bg-green-100 hover:bg-green-200 text-green-800 border-green-200',
    'bg-teal-100 hover:bg-teal-200 text-teal-800 border-teal-200',
    'bg-cyan-100 hover:bg-cyan-200 text-cyan-800 border-cyan-200',
    'bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-200',
    'bg-indigo-100 hover:bg-indigo-200 text-indigo-800 border-indigo-200',
    'bg-purple-100 hover:bg-purple-200 text-purple-800 border-purple-200',
    'bg-pink-100 hover:bg-pink-200 text-pink-800 border-pink-200',  
  ];

  const getRandomCapitals = (count: number) => {
    const capitalsList = getCapitals(difficulty);
    const shuffled = [...capitalsList].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const generateQuestion = () => {
    setSelectedAnswer(null);
    setShowFeedback(false);
    const numOptions = difficulty === 9 ? 1 : (difficulty === 1 ? 2 : difficulty === 2 ? 4 : 10);
    const questionCapitals = getRandomCapitals(numOptions);
    const correctAnswer = questionCapitals[0];
    setCurrentQuestion(correctAnswer);
    
    if (difficulty !== 9) {
      const shuffledOptions = questionCapitals.map(c => c.city).sort(() => 0.5 - Math.random());
      setOptions(shuffledOptions);
    }
  };

  useEffect(() => {
    generateQuestion();
  }, []);

  const handleAnswer = (answer: string) => {
    if (!currentQuestion || showFeedback) return;

    setSelectedAnswer(answer);
    setShowFeedback(true);

    if (answer.toLowerCase() === currentQuestion.city.toLowerCase()) {
      setTimeout(() => {
        setScore(score + difficulty);
        setQuestionNumber(questionNumber + 1);
        generateQuestion();
        setInput('');
      }, 1000);
    } else {
      setTimeout(() => {
        onGameOver(score, {
          country: currentQuestion.country,
          correctAnswer: currentQuestion.city
        });
      }, 1000);
    }
  };

  const handleSkip = () => {
    if (skipsLeft > 0) {
      setSkipsLeft(skipsLeft - 1);
      setQuestionNumber(questionNumber + 1);
      generateQuestion();
      setInput('');
    }
  };

  const getButtonColor = (option: string) => {
    if (!showFeedback) return buttonColors[options.indexOf(option)];
    
    if (currentQuestion?.city === option) {
      return 'bg-green-500 text-white border-green-600';
    }
    if (selectedAnswer === option) {
      return 'bg-red-500 text-white border-red-600';
    }
    return buttonColors[options.indexOf(option)];
  };

  if (!currentQuestion) return null;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <div className="text-lg font-semibold">スコア: {score}点</div>
        <div className="text-lg font-semibold">問題 #{questionNumber}</div>
        {difficulty === 9 && (
          <div className="text-sm text-gray-600">
            スキップ残り: {skipsLeft}回
          </div>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-center mb-2">
          {currentQuestion.country}の首都は？
        </h2>
        {difficulty === 9 && (
          <p className="text-sm text-gray-600 text-center">
            仕様上表記揺れは不正解になります
          </p>
        )}
      </div>

      {difficulty === 9 ? (
        <div className="space-y-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="首都名を入力してください..."
          />
          <div className="flex gap-2">
            <button
              onClick={() => handleAnswer(input)}
              disabled={showFeedback}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              回答 <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleSkip}
              disabled={skipsLeft === 0 || showFeedback}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                skipsLeft > 0 && !showFeedback
                  ? 'bg-gray-200 hover:bg-gray-300'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <SkipForward className="w-4 h-4" />
              スキップ
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              disabled={showFeedback}
              className={`p-6 text-left rounded-lg transition-all duration-200 border-2 font-medium shadow-sm hover:shadow-md transform hover:-translate-y-0.5 ${getButtonColor(option)}`}
            >
              <span className="text-lg">{option}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};