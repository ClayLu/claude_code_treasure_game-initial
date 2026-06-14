import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from './components/ui/button';
import AuthScreen from './components/AuthScreen';
import { useAuth } from './auth/AuthContext';
import * as api from './lib/api';
import type { ScoreEntry } from './lib/api';
import closedChest from './assets/treasure_closed.png';
import keyIcon from './assets/key.png';
import treasureChest from './assets/treasure_opened.png';
import skeletonChest from './assets/treasure_opened_skeleton.png';
import chestOpenSound from './audios/chest_open.mp3';
import evilLaughSound from './audios/chest_open_with_evil_laugh.mp3';

interface Box {
  id: number;
  isOpen: boolean;
  hasTreasure: boolean;
}

export default function App() {
  const { user, isGuest, loading, logout, exitGuest } = useAuth();
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [score, setScore] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const [scoreHistory, setScoreHistory] = useState<ScoreEntry[]>([]);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [scoreSaved, setScoreSaved] = useState(false);

  // Load score history when a logged-in user enters the game
  useEffect(() => {
    if (user) {
      api.getScores().then(res => {
        setScoreHistory(res.scores);
        setBestScore(res.best);
      }).catch(() => {});
    }
  }, [user]);

  // Initialize game automatically when component mounts
  useEffect(() => {
    initializeGame();
  }, []);

  // Initialize a new game round — resets boxes, score, gameEnded, and scoreSaved flag
  // Input: none  Output: updates boxes/score/gameEnded/scoreSaved state
  const initializeGame = () => {
    const treasureBoxIndex = Math.floor(Math.random() * 3);
    const newBoxes: Box[] = Array.from({ length: 3 }, (_, index) => ({
      id: index,
      isOpen: false,
      hasTreasure: index === treasureBoxIndex,
    }));
    setBoxes(newBoxes);
    setScore(0);
    setGameEnded(false);
    setScoreSaved(false);
  };

  // Open a box: play sound, update score, end game if done, save score for logged-in users
  // Input: boxId number  Output: updates game state; posts score to backend if logged in
  const openBox = (boxId: number) => {
    if (gameEnded) return;

    setBoxes(prevBoxes => {
      const updatedBoxes = prevBoxes.map(box => {
        if (box.id === boxId && !box.isOpen) {
          new Audio(box.hasTreasure ? chestOpenSound : evilLaughSound).play();
          const newScore = box.hasTreasure ? score + 150 : score - 50;
          setScore(newScore);
          return { ...box, isOpen: true };
        }
        return box;
      });

      // Check if treasure is found or all boxes are opened
      const treasureFound = updatedBoxes.some(box => box.isOpen && box.hasTreasure);
      const allOpened = updatedBoxes.every(box => box.isOpen);
      if (treasureFound || allOpened) {
        setGameEnded(true);
        // Compute final score from updatedBoxes to avoid stale score closure
        const finalScore = updatedBoxes.reduce((acc, box) => {
          if (!box.isOpen) return acc;
          return acc + (box.hasTreasure ? 150 : -50);
        }, 0);
        if (user && !scoreSaved) {
          setScoreSaved(true);
          api.saveScore(finalScore)
            .then(() => api.getScores())
            .then(res => {
              setScoreHistory(res.scores);
              setBestScore(res.best);
            })
            .catch(() => {});
        }
      }

      return updatedBoxes;
    });
  };

  const resetGame = () => {
    initializeGame();
  };

  // Show loading spinner while restoring session on startup
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex items-center justify-center">
        <p className="text-amber-700 text-xl">Loading…</p>
      </div>
    );
  }

  // Show auth screen if not logged in and not in guest mode
  if (!user && !isGuest) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex flex-col items-center justify-center p-8">

      {/* User / Guest header bar */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-6 px-2">
        {user ? (
          <span className="text-amber-800 font-medium">👤 Hi, {user.username}!</span>
        ) : (
          <span className="text-amber-600 italic">🎮 Guest mode — scores won't be saved</span>
        )}
        <Button
          variant="outline"
          className="text-sm border-amber-400 text-amber-700 hover:bg-amber-100"
          onClick={user ? logout : exitGuest}
        >
          {user ? 'Logout' : 'Exit Guest'}
        </Button>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-4xl mb-4 text-amber-900">🏴‍☠️ Treasure Hunt Game 🏴‍☠️</h1>
        <p className="text-amber-800 mb-4">
          Click on the treasure chests to discover what's inside!
        </p>
        <p className="text-amber-700 text-sm">
          💰 Treasure: +$150 | 💀 Skeleton: -$50
        </p>
      </div>

      <div className="mb-8">
        <div className="text-2xl text-center p-4 bg-amber-200/80 backdrop-blur-sm rounded-lg shadow-lg border-2 border-amber-400">
          <div>
            <span className="text-amber-900">Current Score: </span>
            <span className={`${score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${score}
            </span>
          </div>
          {gameEnded && (
            <div className={`mt-1 ${
              score > 0 ? 'text-green-600' : score === 0 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              Result: {score > 0 ? 'Win' : score === 0 ? 'Tie' : 'Loss'}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {boxes.map((box) => (
          <motion.div
            key={box.id}
            className="flex flex-col items-center"
            style={{ cursor: box.isOpen ? 'default' : `url(${keyIcon}) 16 16, pointer` }}
            whileHover={{ scale: box.isOpen ? 1 : 1.05 }}
            whileTap={{ scale: box.isOpen ? 1 : 0.95 }}
            onClick={() => openBox(box.id)}
          >
            <motion.div
              initial={{ rotateY: 0 }}
              animate={{
                rotateY: box.isOpen ? 180 : 0,
                scale: box.isOpen ? 1.1 : 1
              }}
              transition={{
                duration: 0.6,
                ease: "easeInOut"
              }}
              className="relative"
            >
              <img
                src={box.isOpen
                  ? (box.hasTreasure ? treasureChest : skeletonChest)
                  : closedChest
                }
                alt={box.isOpen
                  ? (box.hasTreasure ? "Treasure!" : "Skeleton!")
                  : "Treasure Chest"
                }
                className="w-48 h-48 object-contain drop-shadow-lg"
              />

              {box.isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                >
                  {box.hasTreasure ? (
                    <div className="text-2xl animate-bounce">✨💰✨</div>
                  ) : (
                    <div className="text-2xl animate-pulse">💀👻💀</div>
                  )}
                </motion.div>
              )}
            </motion.div>

            <div className="mt-4 text-center">
              {box.isOpen ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                  className={`text-lg p-2 rounded-lg ${
                    box.hasTreasure
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}
                >
                  {box.hasTreasure ? '+$150' : '-$50'}
                </motion.div>
              ) : (
                <div className="text-amber-700 p-2">
                  Click to open!
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {gameEnded && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="mb-4 p-6 bg-amber-200/80 backdrop-blur-sm rounded-xl shadow-lg border-2 border-amber-400">
            <h2 className="text-2xl mb-2 text-amber-900">Game Over!</h2>
            <p className="text-lg text-amber-800">
              Final Score: <span className={`${score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${score}
              </span>
            </p>
            <p className="text-sm text-amber-600 mt-2">
              {boxes.some(box => box.isOpen && box.hasTreasure)
                ? 'Treasure found! Well done, treasure hunter! 🎉'
                : 'No treasure found this time! Better luck next time! 💀'}
            </p>
            {isGuest && (
              <p className="text-xs text-amber-500 mt-2 italic">Guest mode — this score was not saved.</p>
            )}
          </div>

          <Button
            onClick={resetGame}
            className="text-lg px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white"
          >
            Play Again
          </Button>
        </motion.div>
      )}

      {/* Score history panel — shown only for logged-in users with existing scores */}
      {user && scoreHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-10 w-full max-w-md"
        >
          <div className="bg-amber-100/80 border-2 border-amber-300 rounded-xl p-4 shadow">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg text-amber-900 font-medium">📊 Your Score History</h3>
              {bestScore !== null && (
                <span className="text-sm bg-amber-300 text-amber-900 px-2 py-1 rounded-full font-medium">
                  Best: ${bestScore}
                </span>
              )}
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {scoreHistory.slice(0, 10).map((entry) => (
                <div
                  key={entry.id}
                  className="flex justify-between items-center text-sm px-2 py-1 rounded bg-amber-50"
                >
                  <span className={entry.score >= 0 ? 'text-green-700' : 'text-red-700'}>
                    ${entry.score}
                  </span>
                  <span className="text-amber-500 text-xs">
                    {new Date(entry.played_at + 'Z').toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
